// Drift Correction resolution tracker.
//
// Polls open drift_correction_events and transitions each one to either
// auto_resolved or escalated based on patient response (or lack of it).
//
// Auto-resolve:
//   Patient replied after the DC message was sent → mark resolved, log time-to-resolution.
//
// Escalate (no response within threshold):
//   uncertainty  → 24h
//   friction     → 48h
//   expectation  → 72h
//   shame        → 72h
//
// Escalation actions:
//   - Marks the DC event as escalated
//   - Sets patient status = 'flagged' (appears in clinic dashboard urgent list)
//   - Queues a staff-outreach placeholder message (clinic admin sends manually)
//
// CALL/HELP immediate escalation is handled in the inbound webhook (route.ts),
// not here — this tracker handles time-based escalation only.

import { query } from '@/lib/db';

const HOUR_MS = 60 * 60 * 1000;

type OpenDcEvent = {
  id:              string;
  patient_id:      string;
  clinic_id:       string;
  drift_pattern:   string;
  fired_at:        Date;
  last_inbound_at: Date | null;
};

// Escalation thresholds per pattern (hours)
const ESCALATION_HOURS: Record<string, number> = {
  uncertainty: 24,
  friction:    48,
  expectation: 72,
  shame:       72,
};

export async function runResolutionTracker(): Promise<void> {
  // Fetch all open (unresolved, unescalated) DC events
  const openEvents = await query<OpenDcEvent>(
    `select
       dce.id,
       dce.patient_id,
       dce.clinic_id,
       dce.drift_pattern,
       dce.fired_at,
       p.last_inbound_at
     from drift_correction_events dce
     join patients p on p.id = dce.patient_id
     where dce.resolved_at  is null
       and dce.escalated_at is null`,
  );

  let resolved = 0;
  let escalated = 0;

  for (const event of openEvents) {
    const firedAt      = new Date(event.fired_at).getTime();
    const lastReply    = event.last_inbound_at
      ? new Date(event.last_inbound_at).getTime()
      : 0;
    const patientReplied = lastReply > firedAt;
    const hoursSinceDc   = (Date.now() - firedAt) / HOUR_MS;

    // ── Auto-resolve: patient replied after the DC message was sent ───────────
    if (patientReplied) {
      const hoursToResolve = (lastReply - firedAt) / HOUR_MS;

      await query(
        `update drift_correction_events set
           resolved_at              = now(),
           resolution_status        = 'auto_resolved',
           time_to_resolution_hours = $2
         where id = $1`,
        [event.id, hoursToResolve.toFixed(1)],
      );

      await query(
        `update patients set
           dc_resolved_at       = now(),
           dc_resolution_status = 'auto_resolved'
         where id = $1`,
        [event.patient_id],
      );

      await query(
        `insert into events (patient_id, kind, payload)
         values ($1, 'dc_auto_resolved', $2)`,
        [event.patient_id, JSON.stringify({
          dc_event_id: event.id,
          pattern:     event.drift_pattern,
          hours:       hoursToResolve.toFixed(1),
        })],
      );

      console.log(
        `[DC] auto-resolved ${event.drift_pattern} ` +
        `for patient ${event.patient_id} in ${hoursToResolve.toFixed(0)}h`,
      );
      resolved++;
      continue;
    }

    // ── Escalate: no response within threshold ─────────────────────────────
    const threshold = ESCALATION_HOURS[event.drift_pattern] ?? 72;

    if (hoursSinceDc >= threshold) {
      await query(
        `update drift_correction_events set
           escalated_at      = now(),
           resolution_status = 'escalated'
         where id = $1`,
        [event.id],
      );

      await query(
        `update patients set
           status               = 'flagged',
           dc_resolution_status = 'escalated'
         where id = $1`,
        [event.patient_id],
      );

      // Queue a staff-outreach placeholder. The clinic admin sees this in
      // the flagged patient list and sends it manually (or the engine sends it
      // once the DC dashboard panel is built — §14 of handoff doc).
      // Body is intentionally empty — the dashboard pre-populates the copy:
      // "Hi [NAME] — just checking in from [CLINIC]. No agenda, just wanted
      //  to make sure you're doing okay."
      await query(
        `insert into messages
           (patient_id, direction, template_key, body, scheduled_for, status)
         values ($1, 'outbound', 'dc_escalation_staff', '', now(), 'pending')`,
        [event.patient_id],
      );

      await query(
        `insert into events (patient_id, kind, payload)
         values ($1, 'dc_escalated', $2)`,
        [event.patient_id, JSON.stringify({
          dc_event_id: event.id,
          pattern:     event.drift_pattern,
          hours:       hoursSinceDc.toFixed(0),
        })],
      );

      console.log(
        `[DC] escalated ${event.drift_pattern} ` +
        `for patient ${event.patient_id} after ${hoursSinceDc.toFixed(0)}h`,
      );
      escalated++;
    }
  }

  if (resolved > 0 || escalated > 0) {
    console.log(
      `[DC] resolution tracker: ${resolved} resolved, ${escalated} escalated`,
    );
  }
}
