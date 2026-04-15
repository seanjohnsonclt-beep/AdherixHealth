// Twilio POSTs here when a patient texts our number.
// We log the message, update last_inbound_at, and reply with TwiML (empty = no reply).
//
// Production: validate the X-Twilio-Signature header. Skipped in MVP — add before pilot.

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { handleReplyGate } from '@/engine/replyGate';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const from = String(form.get('From') || '');
  const body = String(form.get('Body') || '');
  const sid = String(form.get('MessageSid') || '');

  if (!from || !body) {
    return new NextResponse('<Response/>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  const patient = await queryOne<{ id: string }>(
    `select id from patients where phone = $1 limit 1`,
    [from]
  );

  if (!patient) {
    console.warn(`[inbound] unknown sender: ${from.slice(-4)}`);
    return new NextResponse('<Response/>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  await query(
    `insert into messages (patient_id, direction, body, twilio_sid, status)
     values ($1, 'inbound', $2, $3, 'received')`,
    [patient.id, body, sid]
  );

  await query(
    `update patients set last_inbound_at = now() where id = $1`,
    [patient.id]
  );

  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'inbound_received', $2)`,
    [patient.id, JSON.stringify({ length: body.length, first_word: body.trim().split(/\s+/)[0]?.toUpperCase() })]
  );

  // If patient was flagged for no response, un-flag them on any reply.
  await query(
    `update patients set status = 'active' where id = $1 and status = 'flagged'`,
    [patient.id]
  );

  // Reply gate: queue any templates waiting on a reply to the last outbound.
  await handleReplyGate(patient.id, body);

  // Empty TwiML = no auto-reply. Engine handles all responses.
  return new NextResponse('<Response/>', {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}
