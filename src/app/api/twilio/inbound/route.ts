// Twilio POSTs here when a patient texts our number.
// Validates the X-Twilio-Signature header, logs the message,
// updates last_inbound_at, and returns empty TwiML (engine handles all replies).
//
// Adherence layer: if the patient has a medication set and an open injection_events
// record, parses YES/NO and updates the event + patient adherence counters.
//
// Drift Correction layer: scans every message for uncertainty/friction keywords
// (sets flags read by drift-correction.ts next tick). Handles immediate CALL/HELP
// escalation for uncertainty DC events.
//
// HIPAA: no medication names or doses appear in SMS bodies -- generic language only.

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { query, queryOne } from '@/lib/db';
import { handleReplyGate } from '@/engine/replyGate';
import { scanInbound, isEscalationKeyword } from '@/engine/keyword-scanner';
import { parseWeightReply, hasPendingGaugeCheckin, handleWeightReply } from '@/engine/gauge';

function twiml(body = '') {
  return new NextResponse(`<Response>${body}</Response>`, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}

// --- Reply classification -------------------------------------------------

const STOP_WORDS = new Set(['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'HELP']);

function classifyReply(raw: string): 'yes' | 'no' | 'other' {
  const first = raw.trim().split(/\s+/)[0]?.toUpperCase() ?? '';
  if (!first || STOP_WORDS.has(first)) return 'other';

  if (/^(YES|YEP|YUP|YA|YEAH|DONE|CONFIRMED|TOOK|DID|INJECTED|Y)$/.test(first)) return 'yes';
  if (/^(NO|NOPE|MISSED|SKIP|SKIPPED|DIDNT|DIDN|N)$/.test(first)) return 'no';

  return 'other';
}

// --- Injection confirmation handler ---------------------------------------

async function handleInjectionReply(patientId: string, replyClass: 'yes' | 'no') {
  const openEvent = await queryOne<{ id: string }>(
    `select id from injection_events
     where patient_id = $1
       and response = 'no_response'
       and created_at > now() - interval '8 days'
     order by created_at desc
     limit 1`,
    [patientId]
  );

  if (!openEvent) return;

  if (replyClass === 'yes') {
    await query(
      `update injection_events
       set response = 'confirmed', confirmed_at = now()
       where id = $1`,
      [openEvent.id]
    );
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
    await query(
      `update injection_events
       set response = 'missed', confirmed_at = now()
       where id = $1`,
      [openEvent.id]
    );
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

// --- DC escalation handler -----------------------------------------------
// Called when patient replies CALL or HELP.
// Immediately escalates any open (unresolved, unescalated) DC event.
// Bypasses the normal time-based resolution-tracker threshold.

async function handleDcEscalation(patientId: string) {
  const openDcEvent = await queryOne<{ id: string; drift_pattern: string }>(
    `select id, drift_pattern
     from drift_correction_events
     where patient_id  = $1
       and resolved_at  is null
       and escalated_at is null
     order by fired_at desc
     limit 1`,
    [patientId]
  );

  if (!openDcEvent) return;

  await query(
    `update drift_correction_events set
       escalated_at      = now(),
       resolution_status = 'escalated'
     where id = $1`,
    [openDcEvent.id]
  );

  await query(
    `update patients set
       status               = 'flagged',
       dc_resolution_status = 'escalated'
     where id = $1`,
    [patientId]
  );

  // Queue staff-outreach placeholder (clinic admin fulfils from flagged list)
  await query(
    `insert into messages
       (patient_id, direction, template_key, body, scheduled_for, status)
     values ($1, 'outbound', 'dc_escalation_staff', '', now(), 'pending')`,
    [patientId]
  );

  await query(
    `insert into events (patient_id, kind, payload)
     values ($1, 'dc_escalated_by_patient', $2)`,
    [patientId, JSON.stringify({
      dc_event_id: openDcEvent.id,
      pattern:     openDcEvent.drift_pattern,
      trigger:     'call_keyword',
    })]
  );

  console.log(
    `[inbound] CALL escalation -- DC ${openDcEvent.drift_pattern} ` +
    `escalated for patient ${patientId}`,
  );
}

// --- Route handler --------------------------------------------------------

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const params: Record<string, string> = {};
  form.forEach((val, key) => { params[key] = String(val); });

  const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';
  if (authToken) {
    const signature = req.headers.get('x-twilio-signature') ?? '';
    const url = `${process.env.APP_URL}/api/twilio/inbound`;
    if (!twilio.validateRequest(authToken, signature, url, params)) {
      console.warn('[inbound] invalid Twilio signature -- rejected');
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  const from = params['From'] ?? '';
  const body = params['Body'] ?? '';
  const sid  = params['MessageSid'] ?? '';

  if (!from || !body) return twiml();

  const patient = await queryOne<{
    id:         string;
    status:     string;
    clinic_id:  string;
    medication: string | null;
  }>(
    `select id, status, clinic_id, medication
     from patients where phone = $1 limit 1`,
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
      length:      body.length,
      first_word:  body.trim().split(/\s+/)[0]?.toUpperCase(),
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

  // Injection confirmation: parse YES/NO
  // Only runs if patient has medication set AND injection_events table exists.
  if (patient.medication && (replyClass === 'yes' || replyClass === 'no')) {
    try {
      await handleInjectionReply(patient.id, replyClass);
    } catch (err) {
      console.warn('[inbound] injection reply handler failed (migration pending?):', err);
    }
  }

  // Drift Correction: keyword scan
  // Sets side_effect_flag / dose_missed_flag on patient row for next tick.
  // Wrapped in try/catch -- 0006 migration may not be applied yet.
  try {
    await scanInbound(patient.id, patient.clinic_id, body);
  } catch (err) {
    console.warn('[inbound] keyword scan failed (migration pending?):', err);
  }

  // Drift Correction: immediate CALL/HELP escalation
  // If patient replies CALL or HELP, escalate the open DC event now rather
  // than waiting for the time-based resolution tracker.
  if (isEscalationKeyword(body)) {
    try {
      await handleDcEscalation(patient.id);
    } catch (err) {
      console.warn('[inbound] DC escalation failed (migration pending?):', err);
    }
  }

  // Adherix Gauge: detect weight reply and log it
  // Only fires if there's a pending gauge check-in from the last 48h.
  const weightLbs = parseWeightReply(body);
  if (weightLbs !== null) {
    try {
      const pending = await hasPendingGaugeCheckin(patient.id);
      if (pending) {
        await handleWeightReply(patient.id, weightLbs);
      }
    } catch (err) {
      console.warn('[inbound] gauge weight handler failed (migration pending?):', err);
    }
  }

  // Reply gate: queue any templates waiting on this reply
  await handleReplyGate(patient.id, body);

  // Empty TwiML = no auto-reply. Engine handles all outbound messages.
  return twiml();
}
