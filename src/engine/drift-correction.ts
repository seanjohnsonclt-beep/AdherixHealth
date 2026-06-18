// Drift correction engine.
//
// Called each tick (after trajectory update + trigger evaluation).
// For each active patient, detects whether a behavioral drift pattern applies
// and queues the appropriate locked-copy correction message.
//
// Four patterns (priority order  -  checked top to bottom):
//   uncertainty   -  side_effect_flag = true (patient signaled a side effect)
//   friction      -  dose_missed_flag = true (patient signaled a missed dose / logistics issue)
//   shame         -  72h+ silence, inconsistent/declining trajectory, ≥ 2 consecutive silences
//   expectation   -  Phase 2-4, 48h+ silence, ≥ 21 days in phase
//
// Guardrails:
//   - 72h cooldown between DC events per patient
//   - Max 2 DC events per current phase per patient
//
// Copy: LOCKED  -  do not edit without updating BIBLE.md §10 and handoff doc.

import { query, queryOne } from '@/lib/db';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS  = 24 * HOUR_MS;

// --- Locked copy -------------------------------------------------------------
// Source of truth: BIBLE.md §10 / handoff doc §10.
// Merge fields: {phase_week}, {next_dose_day}

type DcPattern = 'expectation' | 'shame' | 'uncertainty' | 'friction';

function buildBody(
  pattern:    DcPattern,
  phaseWeek:  number,
  nextDoseDay: string,
): string {
  switch (pattern) {
    case 'expectation':
      return (
        `Around week ${phaseWeek}, most patients hit a window where progress ` +
        `feels like it has stalled. It hasn't. This is a recognized adjustment ` +
        `period  -  your body is recalibrating, not resisting. The patients who ` +
        `push through this window see the clearest results on the other side. ` +
        `Your next dose is ${nextDoseDay}. That's the only step right now.`
      );

    case 'shame':
      return (
        `Around this point in the program, a lot of people find it harder to ` +
        `stay in the rhythm  -  not for any one reason, just the reality of ` +
        `week ${phaseWeek}. Your next dose is ${nextDoseDay}. No catch-up ` +
        `needed. You're still exactly where you should be.`
      );

    case 'uncertainty':
      return (
        `What you're feeling right now is a recognized part of the adjustment ` +
        `period  -  most patients go through some version of it, and it can show ` +
        `up physically or as shifts in mood, sleep, or energy. It doesn't mean ` +
        `the medication isn't working. If it's manageable, your next dose is ` +
        `${nextDoseDay}. If anything feels severe or is getting worse, reply CALL ` +
        `and someone from the clinic will reach out to you today.`
      );

    case 'friction':
      return (
        `Missed a dose  -  don't double up. Just take the next one on schedule: ` +
        `${nextDoseDay}. Missing one dose doesn't affect your overall progress ` +
        `or your protocol. You're still on track.`
      );
  }
}

// --- Patient type --------------------------------------------------------------

type DcPatient = {
  id:                       string;
  clinic_id:                string;
  current_phase:            number;
  phase_started_at:         Date;
  last_inbound_at:          Date | null;
  engagement_trajectory:    string;
  consecutive_silences:     number;
  side_effect_flag:         boolean;
  dose_missed_flag:         boolean;
  next_dose_day:            string | null;
  drift_correction_count:   number;
  last_drift_correction_at: Date | null;
};

// --- Pattern detection --------------------------------------------------------

function detectPattern(p: DcPatient): DcPattern | null {
  const silenceHours = p.last_inbound_at
    ? (Date.now() - new Date(p.last_inbound_at).getTime()) / HOUR_MS
    : Infinity;
  const daysInPhase = (Date.now() - new Date(p.phase_started_at).getTime()) / DAY_MS;

  // Priority 1: uncertainty  -  patient flagged a side effect
  if (p.side_effect_flag) return 'uncertainty';

  // Priority 2: friction  -  patient flagged a missed dose / logistics issue
  if (p.dose_missed_flag) return 'friction';

  // Priority 3: shame  -  72h+ silence, inconsistent/declining, ≥ 2 consecutive silences
  if (
    silenceHours >= 72 &&
    (p.engagement_trajectory === 'inconsistent' || p.engagement_trajectory === 'declining') &&
    p.consecutive_silences >= 2
  ) return 'shame';

  // Priority 4: expectation  -  Phase 2-4, 48h+ silence, ≥ 21 days in phase
  if (
    p.current_phase >= 2 &&
    p.current_phase <= 4 &&
    silenceHours >= 48 &&
    daysInPhase >= 21
  ) return 'expectation';

  return null;
}

function phaseWeek(phaseStartedAt: Date): number {
  const days = (Date.now() - new Date(phaseStartedAt).getTime()) / DAY_MS;
  return Math.max(1, Math.ceil(days / 7));
}

// --- Main function ------------------------------------------------------------

export async function runDriftCorrection(): Promise<void> {
  const patients = await query<DcPatient>(
    `select
       p.id,
       p.clinic_id,
       p.current_phase,
       p.phase_started_at,
       p.last_inbound_at,
       COALESCE(p.engagement_trajectory,    'responsive') as engagement_trajectory,
       COALESCE(p.consecutive_silences,     0)            as consecutive_silences,
       COALESCE(p.side_effect_flag,         false)        as side_effect_flag,
       COALESCE(p.dose_missed_flag,         false)        as dose_missed_flag,
       p.next_dose_day,
       COALESCE(p.drift_correction_count,   0)            as drift_correction_count,
       p.last_drift_correction_at
     from patients p
     where p.status = 'active'`,
  );

  let fired = 0;

  for (const p of patients) {
    // -- Cooldown: ≥ 72h since last DC event -----------------------------------
    const hoursSinceLast = p.last_drift_correction_at
      ? (Date.now() - new Date(p.last_drift_correction_at).getTime()) / HOUR_MS
      : Infinity;
    if (hoursSinceLast < 72) continue;

    // -- Phase cap: max 2 DC events in the current phase -----------------------
    const dcThisPhase = await queryOne<{ count: string }>(
      `select count(*)::text as count
       from drift_correction_events dce
       join patients p2 on p2.id = dce.patient_id
       where dce.patient_id = $1
         and dce.fired_at  >= p2.phase_started_at`,
      [p.id],
    );
    if (Number(dcThisPhase?.count ?? 0) >= 2) continue;

    // -- Pattern detection -----------------------------------------------------
    const pattern = detectPattern(p);
    if (!pattern) continue;

    const week       = phaseWeek(p.phase_started_at);
    const nextDoseDay = p.next_dose_day ?? 'as scheduled';
    const body       = buildBody(pattern, week, nextDoseDay);
    const templateKey = `dc_${pattern}`;

    // -- Queue outbound message ------------------------------------------------
    await query(
      `insert into messages
         (patient_id, direction, template_key, body, scheduled_for, status)
       values ($1, 'outbound', $2, $3, now(), 'pending')`,
      [p.id, templateKey, body],
    );

    // -- Write DC event record -------------------------------------------------
    const dcEvent = await queryOne<{ id: string }>(
      `insert into drift_correction_events
         (patient_id, clinic_id, drift_pattern, message_template, message_body,
          fired_at, resolution_status)
       values ($1, $2, $3, $4, $5, now(), 'monitoring')
       returning id`,
      [p.id, p.clinic_id, pattern, templateKey, body],
    );

    // -- Update patient state --------------------------------------------------
    await query(
      `update patients set
         drift_pattern             = $2,
         last_drift_correction_at  = now(),
         drift_correction_count    = COALESCE(drift_correction_count, 0) + 1,
         dc_resolution_status      = 'monitoring',
         -- Clear the flag that triggered this (re-set by next keyword scan if still relevant)
         side_effect_flag = CASE WHEN $2 = 'uncertainty' THEN false ELSE side_effect_flag END,
         dose_missed_flag = CASE WHEN $2 = 'friction'    THEN false ELSE dose_missed_flag END
       where id = $1`,
      [p.id, pattern],
    );

    await query(
      `insert into events (patient_id, kind, payload)
       values ($1, 'drift_correction_sent', $2)`,
      [p.id, JSON.stringify({ pattern, dc_event_id: dcEvent?.id, phase_week: week })],
    );

    console.log(
      `[DC] ${pattern} correction → patient ${p.id} ` +
      `(phase ${p.current_phase}, week ${week})`,
    );

    fired++;
  }

  if (fired > 0) {
    console.log(`[DC] drift correction: ${fired} message(s) queued`);
  }
}
