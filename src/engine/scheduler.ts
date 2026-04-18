// When a patient enters a phase, we queue every scheduled message for that phase.
// The cron worker picks them up at scheduled_for time.
//
// We do NOT pre-schedule trigger messages — those fire reactively from conditions.

import { query, queryOne } from '@/lib/db';
import { templatesForPhase, findPhase, type Template } from '@/lib/config';
import { addMinutes, addHours, addDays, set, parseISO } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

const TZ = process.env.DEFAULT_TIMEZONE || 'America/New_York';

function applyOffset(base: Date, after?: Template['after']): Date {
  if (!after) return base;
  let d = base;
  if (after.minutes) d = addMinutes(d, after.minutes);
  if (after.hours) d = addHours(d, after.hours);
  if (after.days) d = addDays(d, after.days);
  return d;
}

function applyTimeOfDay(d: Date, hhmm?: string): Date {
  if (!hhmm) return d;
  const [h, m] = hhmm.split(':').map(Number);
  // Interpret hh:mm in clinic's local TZ, then convert back to UTC
  const local = toZonedTime(d, TZ);
  const localAtTime = set(local, { hours: h, minutes: m, seconds: 0, milliseconds: 0 });
  // If that time is in the past relative to base, push to next day
  const out = fromZonedTime(localAtTime, TZ);
  return out < d ? addDays(out, 1) : out;
}

function renderBody(body: string, vars: Record<string, string>): string {
  return body.trim().replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}

export async function schedulePhaseMessages(patientId: string, phaseId: number) {
  const phase = findPhase(phaseId);
  if (!phase) throw new Error(`Unknown phase: ${phaseId}`);

  const patient = await queryOne<{ id: string; first_name: string; phase_started_at: Date }>(
    'select id, first_name, phase_started_at from patients where id = $1',
    [patientId]
  );
  if (!patient) throw new Error(`Patient not found: ${patientId}`);

  const tpls = templatesForPhase(phaseId).filter((t) => !t.internal && !t.requires_reply_to);
  console.log(`[scheduler] phase ${phaseId} → ${tpls.length} templates to schedule for patient ${patientId}`);
  const base = new Date(patient.phase_started_at);

  for (const t of tpls) {
    let when = applyOffset(base, t.after);
    when = applyTimeOfDay(when, t.send_at_local);

    const body = renderBody(t.body, { first_name: patient.first_name || 'there' });

    await query(
      `insert into messages (patient_id, direction, template_key, body, scheduled_for, status)
       values ($1, 'outbound', $2, $3, $4, 'pending')`,
      [patientId, t.key, body, when]
    );
  }

  console.log(`[scheduler] scheduled ${tpls.length} messages for patient ${patientId} phase ${phaseId}`);
  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'phase_messages_scheduled', $2)`,
    [patientId, JSON.stringify({ phase: phaseId, count: tpls.length })]
  );
}

export async function advancePhase(patientId: string) {
  const patient = await queryOne<{ current_phase: number }>(
    'select current_phase from patients where id = $1',
    [patientId]
  );
  if (!patient) return;

  const next = patient.current_phase + 1;
  if (!findPhase(next)) return; // already at last phase

  await query(
    `update patients set current_phase = $1, phase_started_at = now() where id = $2`,
    [next, patientId]
  );
  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'phase_advanced', $2)`,
    [patientId, JSON.stringify({ from: patient.current_phase, to: next })]
  );

  await schedulePhaseMessages(patientId, next);
}
