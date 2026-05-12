import { query } from '@/lib/db';
import { triggers, findTemplate } from '@/lib/config';
import { conditions, type PatientForEval } from './conditions';
import { advancePhase } from './scheduler';
import { findProtocol, computeTitrationSchedule, getNextTitrationDate } from './medications';

// ─── Dedup helpers ────────────────────────────────────────────────────────────

function dedupeKey(triggerKey: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${triggerKey}:${today}`;
}

async function alreadyFiredWithin(
  patientId: string,
  triggerKey: string,
  windowHours: number
): Promise<boolean> {
  const rows = await query<{ count: string }>(
    `select count(*)::text from trigger_firings
     where patient_id = $1 and trigger_key = $2
     and fired_at > now() - ($3 || ' hours')::interval`,
    [patientId, triggerKey, windowHours]
  );
  return Number(rows[0].count) > 0;
}

async function recordFiring(patientId: string, triggerKey: string) {
  await query(
    `insert into trigger_firings (patient_id, trigger_key, dedupe_key)
     values ($1, $2, $3)
     on conflict (patient_id, dedupe_key) do nothing`,
    [patientId, triggerKey, dedupeKey(triggerKey)]
  );
}

// ─── Action helpers ───────────────────────────────────────────────────────────

async function queueTemplateNow(patientId: string, templateKey: string) {
  const tpl = findTemplate(templateKey);
  if (!tpl) {
    console.warn(`[trigger] unknown template: ${templateKey}`);
    return;
  }
  // Fetch patient name for personalisation
  const rows = await query<{ first_name: string | null }>(
    `select first_name from patients where id = $1`,
    [patientId]
  );
  const firstName = rows[0]?.first_name ?? 'there';
  const body = tpl.body.trim().replace(/\{first_name\}/g, firstName);

  await query(
    `insert into messages (patient_id, direction, template_key, body, scheduled_for, status)
     values ($1, 'outbound', $2, $3, now(), 'pending')`,
    [patientId, templateKey, body]
  );
}

async function flagPatient(patientId: string, reason: string) {
  await query(`update patients set status = 'flagged' where id = $1`, [patientId]);
  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'flagged', $2)`,
    [patientId, JSON.stringify({ reason })]
  );
}

/**
 * Injection confirmation action.
 * Creates an injection_events row (pending = 'no_response') and queues
 * the weekly "did you take your dose?" SMS.
 * HIPAA: template body uses generic language only — no medication/dose names.
 */
async function createInjectionConfirmation(patientId: string) {
  // Create the pending injection event
  await query(
    `insert into injection_events (patient_id, expected_at, response)
     values ($1, now(), 'no_response')`,
    [patientId]
  );

  // Queue confirmation SMS
  await queueTemplateNow(patientId, 'trigger.injection_confirmation');

  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'injection_confirmation_sent', $2)`,
    [patientId, JSON.stringify({ sent_at: new Date().toISOString() })]
  );
}

/**
 * Auto-titration action.
 * Reads the stored titration_schedule JSONB, finds the next step, updates
 * current_dose, last_titration_date, and next_titration_date.
 * Writes an event for audit trail.
 */
async function advanceTitration(patientId: string) {
  const rows = await query<{
    medication: string;
    titration_schedule: Array<{ weekOffset: number; dose: string; scheduledDate: string }>;
    next_titration_date: string;
    enrolled_at: string;
  }>(
    `select medication, titration_schedule, next_titration_date, enrolled_at
     from patients where id = $1`,
    [patientId]
  );
  const patient = rows[0];
  if (!patient?.medication || !patient.titration_schedule) return;

  const schedule = patient.titration_schedule;
  const enrolledAt = new Date(patient.enrolled_at);

  // Build full schedule with dates
  const protocol = findProtocol(patient.medication);
  if (!protocol) return;

  const fullSchedule = computeTitrationSchedule(protocol, enrolledAt);

  // Current date being titrated
  const currentTitrationDate = new Date(patient.next_titration_date);

  // Find the current step by matching next_titration_date
  const currentStepIdx = fullSchedule.findIndex(
    s => s.scheduledDate === patient.next_titration_date
  );
  const currentStep = fullSchedule[currentStepIdx];
  const nextStep    = fullSchedule[currentStepIdx + 1] ?? null;

  await query(
    `update patients set
       current_dose         = $1,
       last_titration_date  = $2,
       next_titration_date  = $3
     where id = $4`,
    [
      currentStep?.dose ?? schedule[schedule.length - 1].dose,
      currentTitrationDate.toISOString().slice(0, 10),
      nextStep?.scheduledDate ?? null,
      patientId,
    ]
  );

  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'titration_advanced', $2)`,
    [patientId, JSON.stringify({
      to_dose:            currentStep?.dose,
      next_titration:     nextStep?.scheduledDate ?? 'final_step',
    })]
  );

  console.log(`[trigger] titration advanced for ${patientId} → ${currentStep?.dose}`);
}

/**
 * Mark any injection_events with no_response older than 48h as 'missed',
 * then update the patient's consecutive miss count and streak.
 * Called as a side effect when has_overdue_confirmation fires.
 */
async function markOverdueConfirmationsAsMissed(patientId: string) {
  const overdue = await query<{ id: string }>(
    `update injection_events
     set response = 'missed', confirmed_at = now()
     where patient_id = $1
       and response = 'no_response'
       and expected_at < now() - interval '48 hours'
     returning id`,
    [patientId]
  );

  if (overdue.length === 0) return;

  await query(
    `update patients set
       missed_injection_count          = COALESCE(missed_injection_count, 0) + $2,
       consecutive_missed_injections   = COALESCE(consecutive_missed_injections, 0) + $2,
       confirmed_injection_streak      = 0
     where id = $1`,
    [patientId, overdue.length]
  );

  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'injection_auto_missed', $2)`,
    [patientId, JSON.stringify({ count: overdue.length })]
  );
}

// ─── Main evaluation loop ─────────────────────────────────────────────────────

export async function evaluateTriggersForAllPatients() {
  let patients: PatientForEval[];

  // Extended query joins injection_events subqueries for adherence tracking.
  // Falls back to the simple query if the 0005 migration hasn't been applied yet.
  try {
    patients = await query<PatientForEval>(
      `select
         p.id,
         p.current_phase,
         p.phase_started_at,
         p.last_inbound_at,
         p.enrolled_at,
         p.status,
         p.medication,
         p.next_titration_date,
         p.last_titration_date,
         p.supply_quantity,
         p.last_confirmed_injection_at,
         COALESCE(p.confirmed_injection_streak,    0) as confirmed_injection_streak,
         COALESCE(p.consecutive_missed_injections, 0) as consecutive_missed_injections,
         COALESCE(p.missed_injection_count,        0) as missed_injection_count,
         -- pending no_response injection event older than 48h
         (select ie.id::text from injection_events ie
          where ie.patient_id = p.id
            and ie.response = 'no_response'
            and ie.expected_at < now() - interval '48 hours'
          limit 1) as pending_overdue_injection_id,
         -- when was the last confirmation sent
         (select ie.created_at from injection_events ie
          where ie.patient_id = p.id
          order by ie.created_at desc limit 1) as last_confirmation_at,
         -- remaining supply (null if supply_quantity not set)
         case when p.supply_quantity is null then null
              else p.supply_quantity - coalesce(
                (select count(*)::int from injection_events ie
                 where ie.patient_id = p.id
                   and ie.response in ('confirmed','missed')), 0)
         end as supply_remaining,
         -- injection confirmation rate in current phase
         coalesce((select count(*)::int from injection_events ie
                   where ie.patient_id = p.id
                     and ie.expected_at >= p.phase_started_at
                     and ie.response = 'confirmed'), 0) as phase_confirmed_count,
         coalesce((select count(*)::int from injection_events ie
                   where ie.patient_id = p.id
                     and ie.expected_at >= p.phase_started_at), 0) as phase_total_count
       from patients p
       where p.status in ('active', 'flagged')`
    );
  } catch {
    // 0005 migration not yet applied — fall back to simple query
    console.warn('[triggers] injection_events table not found — using legacy query');
    const legacy = await query<Omit<PatientForEval,
      'medication' | 'next_titration_date' | 'last_titration_date' | 'supply_quantity' |
      'last_confirmed_injection_at' | 'confirmed_injection_streak' |
      'consecutive_missed_injections' | 'missed_injection_count' |
      'pending_overdue_injection_id' | 'last_confirmation_at' | 'supply_remaining' |
      'phase_confirmed_count' | 'phase_total_count'>>(
      `select id, current_phase, phase_started_at, last_inbound_at, enrolled_at, status
       from patients where status in ('active', 'flagged')`
    );
    patients = legacy.map(p => ({
      ...p,
      medication: null,
      next_titration_date: null,
      last_titration_date: null,
      supply_quantity: null,
      last_confirmed_injection_at: null,
      confirmed_injection_streak: 0,
      consecutive_missed_injections: 0,
      missed_injection_count: 0,
      pending_overdue_injection_id: null,
      last_confirmation_at: null,
      supply_remaining: null,
      phase_confirmed_count: 0,
      phase_total_count: 0,
    }));
  }

  for (const patient of patients) {
    for (const trigger of triggers()) {
      // Phase filter
      if (trigger.only_in_phases && !trigger.only_in_phases.includes(patient.current_phase)) {
        continue;
      }

      // Condition check
      const condFn = conditions[trigger.condition];
      if (!condFn) {
        console.warn(`[trigger] unknown condition: ${trigger.condition}`);
        continue;
      }
      if (!condFn(patient, trigger.args || {})) continue;

      // Dedupe
      if (await alreadyFiredWithin(patient.id, trigger.key, trigger.dedupe_window_hours)) {
        continue;
      }

      // Action
      switch (trigger.action) {
        case 'send_template':
          if (trigger.template) await queueTemplateNow(patient.id, trigger.template);
          // Side effect: mark overdue confirmations as missed when the followup fires
          if (trigger.key === 'missed_injection_noresponse') {
            await markOverdueConfirmationsAsMissed(patient.id);
          }
          break;

        case 'flag_patient':
          await flagPatient(patient.id, trigger.reason || trigger.key);
          break;

        case 'advance_phase':
          await advancePhase(patient.id);
          break;

        case 'injection_confirm':
          await createInjectionConfirmation(patient.id);
          break;

        case 'advance_titration':
          await advanceTitration(patient.id);
          break;
      }

      await recordFiring(patient.id, trigger.key);
      console.log(`[trigger] fired ${trigger.key} for ${patient.id}`);
    }
  }
}
