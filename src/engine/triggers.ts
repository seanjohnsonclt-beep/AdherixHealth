import { query } from '@/lib/db';
import { triggers, findTemplate } from '@/lib/config';
import { conditions, type PatientForEval } from './conditions';
import { advancePhase } from './scheduler';

function dedupeKey(triggerKey: string): string {
  // Bucket by day. The dedupe_window_hours guarantee comes from the unique constraint
  // + a follow-up check below.
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

async function queueTemplateNow(patientId: string, templateKey: string) {
  const tpl = findTemplate(templateKey);
  if (!tpl) {
    console.warn(`[trigger] unknown template: ${templateKey}`);
    return;
  }
  // Trigger messages don't merge first_name to keep them deidentified-safe.
  const body = tpl.body.trim().replace(/\{first_name\}/g, 'there');
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

export async function evaluateTriggersForAllPatients() {
  const patients = await query<PatientForEval>(
    `select id, current_phase, phase_started_at, last_inbound_at, enrolled_at, status
     from patients where status in ('active', 'flagged')`
  );

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
          break;
        case 'flag_patient':
          await flagPatient(patient.id, trigger.reason || trigger.key);
          break;
        case 'advance_phase':
          await advancePhase(patient.id);
          break;
      }

      await recordFiring(patient.id, trigger.key);
      console.log(`[trigger] fired ${trigger.key} for ${patient.id}`);
    }
  }
}
