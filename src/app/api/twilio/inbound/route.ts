// Twilio POSTs here when a patient texts our number.
// Validates the X-Twilio-Signature header, logs the message,
// updates last_inbound_at, and returns empty TwiML (engine handles all replies).

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { query, queryOne } from '@/lib/db';
import { handleReplyGate } from '@/engine/replyGate';

function twiml(body = '') {
  return new NextResponse(`<Response>${body}</Response>`, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const params: Record<string, string> = {};
  form.forEach((val, key) => { params[key] = String(val); });

  const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';
  if (authToken) {
    const signature = req.headers.get('x-twilio-signature') ?? '';
    // Use the public APP_URL so it matches what Twilio signed
    const url = `${process.env.APP_URL}/api/twilio/inbound`;
    if (!twilio.validateRequest(authToken, signature, url, params)) {
      console.warn('[inbound] invalid Twilio signature — rejected');
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  const from = params['From'] ?? '';
  const body = params['Body'] ?? '';
  const sid  = params['MessageSid'] ?? '';

  if (!from || !body) return twiml();

  const patient = await queryOne<{ id: string; status: string }>(
    `select id, status from patients where phone = $1 limit 1`,
    [from]
  );

  if (!patient) {
    console.warn(`[inbound] unknown sender: ...${from.slice(-4)}`);
    return twiml();
  }

  // Log the inbound message
  await query(
    `insert into messages (patient_id, direction, body, twilio_sid, status)
     values ($1, 'inbound', $2, $3, 'received')`,
    [patient.id, body, sid]
  );

  // Update last seen
  await query(
    `update patients set last_inbound_at = now() where id = $1`,
    [patient.id]
  );

  // Log event for trigger deduplication + analytics
  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'inbound_received', $2)`,
    [patient.id, JSON.stringify({
      length: body.length,
      first_word: body.trim().split(/\s+/)[0]?.toUpperCase(),
    })]
  );

  // Auto-unflag: any reply reactivates a flagged patient
  if (patient.status === 'flagged') {
    await query(
      `update patients set status = 'active' where id = $1`,
      [patient.id]
    );
    console.log(`[inbound] patient ${patient.id} unflagged on reply`);
  }

  // Reply gate: queue any templates waiting on this reply
  await handleReplyGate(patient.id, body);

  // Empty TwiML = no auto-reply. Engine handles all outbound messages.
  return twiml();
}
