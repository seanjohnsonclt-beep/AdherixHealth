// Twilio POSTs here when a patient texts our number.
// Validates the X-Twilio-Signature header, logs the message,
// updates last_inbound_at, and returns empty TwiML (engine handles all replies).
//
// Adherence layer: if the patient has a medication set and an open injection_events
// record, parses YES/NO and updates the event + patient adherence counters.
// HIPAA: no medication names or doses appear in SMS bodies — generic language only.

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

// ─── Reply classification ─────────────────────────────────────────────────────

const STOP_WORDS = new Set(['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'HELP']);

function classifyReply(raw: string): 'yes' | 'no' | 'other' {
  const first = raw.trim().split(/\s+/)[0]?.toUpperCase() ?? '';
  if (!first || STOP_WORDS.has(first)) return 'other';

  if (/^(YES|YEP|YUP|YA|YEAH|DONE|CONFIRMED|TOOK|DID|INJECTED|Y)$/.test(first)) return 'yes';
  if (/^(NO|NOPE|MISSED|SKIP|SKIPPED|DIDNT|DIDN|N)$/.test(first)) return 'no';

  return 'other';
}

// ─── Injection confirmation handler ──────────────────────────────────────────

async function handleInjectionReply(patientId: string, replyClass: 'yes' | 'no') {
  // Find the most recent open (no_response) confirmation within the last 8 days
  const openEvent = await queryOne<{ id: string }>(
    `select id from injection_events
     where patient_id = $1
       and response = 'no_response'
       and created_at > now() - interval '8 days'
     order by created_at desc
     limit 1`,
    [patientId]
  );

  if (!openEvent) return; // no pending confirmation window

  if (replyClass === 'yes') {
    // Mark confirmed
    await query(
      `update injection_events
       set response = 'confirmed', confirmed_at = now()
       where id = $1`,
      [openEvent.id]
    );
    // Update patient adherence counters
    await query(
      `update patients set
         last_confirmed_injection_at   = now(),
         confirmed_injection_streak    = COALESCE(confirmed_injection_streak, 0) + 1,
         consecutive_missed_injections = 0
       where id = $1`,
      [patientId]
    );
    await query(
      `insert into events (patient_id, kind, payload) values ($1, 'injection_confirmed', $2)`,
      [patientId, JSON.stringify({ event_id: openEvent.id })]
    );
    console.log(`[inbound] injection confirmed for patient ${patientId}`);

  } else {
    // Mark missed
    await query(
      `update injection_events
       set response = 'missed', confirmed_at = now()
       where id = $1`,
      [openEvent.id]
    );
    // Update patient adherence counters
    await query(
      `update patients set
         missed_injection_count          = COALESCE(missed_injection_count, 0) + 1,
         consecutive_missed_injections   = COALESCE(consecutive_missed_injections, 0) + 1,
         confirmed_injection_streak      = 0
       where id = $1`,
      [patientId]
    );
    await query(
      `insert into events (patient_id, kind, payload) values ($1, 'injection_missed', $2)`,
      [patientId, JSON.stringify({ event_id: openEvent.id, self_reported: true })]
    );
    console.log(`[inbound] injection missed (patient self-reported) for ${patientId}`);
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const params: Record<string, string> = {};
  form.forEach((val, key) => { params[key] = String(val); });

  const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';
  if (authToken) {
    const signature = req.headers.get('x-twilio-signature') ?? '';
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

  const patient = await queryOne<{ id: string; status: string; medication: string | null }>(
    `select id, status, medication from patients where phone = $1 limit 1`,
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
  const replyClass = classifyReply(body);
  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'inbound_received', $2)`,
    [patient.id, JSON.stringify({
      length:     body.length,
      first_word: body.trim().split(/\s+/)[0]?.toUpperCase(),
      reply_class: replyClass,
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

  // Injection confirmation: parse YES/NO and update adherence data.
  // Only runs if: patient has medication set AND injection_events table exists.
  if (patient.medication && (replyClass === 'yes' || replyClass === 'no')) {
    try {
      await handleInjectionReply(patient.id, replyClass);
    } catch (err) {
      // injection_events table may not exist yet (migration pending)
      console.warn('[inbound] injection reply handler failed (migration pending?):', err);
    }
  }

  // Reply gate: queue any templates waiting on this reply
  await handleReplyGate(patient.id, body);

  // Empty TwiML = no auto-reply. Engine handles all outbound messages.
  return twiml();
}
