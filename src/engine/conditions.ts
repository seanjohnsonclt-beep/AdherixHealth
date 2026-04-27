// Named conditions referenced from src/lib/config.ts TRIGGERS array.
// Each receives the patient row + trigger args, returns boolean.
//
// To add a new condition: add a function here, reference its name from
// the TRIGGERS array in config.ts. That's it — no other code changes.
//
// NOTE: PatientForEval is extended with injection adherence fields.
// These are precomputed via subqueries in evaluateTriggersForAllPatients()
// so condition functions stay synchronous.

import { findPhase } from '@/lib/config';

export type PatientForEval = {
  // Core
  id: string;
  current_phase: number;
  phase_started_at: Date;
  last_inbound_at: Date | null;
  enrolled_at: Date;
  status: string;

  // Medication / adherence (null for legacy patients enrolled before 0005 migration)
  medication: string | null;
  next_titration_date: Date | null;
  last_titration_date: Date | null;
  supply_quantity: number | null;
  last_confirmed_injection_at: Date | null;
  confirmed_injection_streak: number;
  consecutive_missed_injections: number;
  missed_injection_count: number;

  // Precomputed from injection_events (subqueries in trigger evaluation)
  // null when injection_events table doesn't exist or no data
  pending_overdue_injection_id: string | null; // injection_event.id with no_response > 48h
  last_confirmation_at: Date | null;           // most recent injection_events.created_at
  supply_remaining: number | null;             // supply_quantity - used doses
  phase_confirmed_count: number;               // confirmed injections in current phase
  phase_total_count: number;                   // total injection_events in current phase
};

type ConditionFn = (p: PatientForEval, args: Record<string, any>) => boolean;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS  = 24 * HOUR_MS;

export const conditions: Record<string, ConditionFn> = {

  // ─── Existing conditions ────────────────────────────────────────────────────

  hours_since_last_inbound_gte: (p, args) => {
    const since = p.last_inbound_at ?? p.enrolled_at;
    const hours = (Date.now() - new Date(since).getTime()) / HOUR_MS;
    return hours >= args.hours;
  },

  // Phase advancement with behavioral gate for patients with medication.
  // Gate: ≥ 50% injection confirmation rate in current phase AND < 3 consecutive misses.
  // Legacy patients (no medication set) advance on time alone — backwards compatible.
  phase_duration_elapsed: (p) => {
    const phase = findPhase(p.current_phase);
    if (!phase) return false;
    if (phase.duration_days >= 9999) return false; // maintenance never auto-advances

    const elapsed = (Date.now() - new Date(p.phase_started_at).getTime()) / DAY_MS;
    if (elapsed < phase.duration_days) return false;

    // No medication = legacy patient or unenrolled med → advance on time only
    if (!p.medication) return true;

    // Block if 3+ consecutive missed injections
    if (p.consecutive_missed_injections >= 3) return false;

    // Block if < 50% confirmation rate (require at least 2 data points)
    if (p.phase_total_count >= 2) {
      const rate = p.phase_confirmed_count / p.phase_total_count;
      if (rate < 0.5) return false;
    }

    return true;
  },

  // ─── Injection confirmation loop ────────────────────────────────────────────

  // Patient has a medication set — enables the confirmation loop
  medication_set: (p) => !!p.medication,

  // Ready to send the next weekly injection confirmation.
  // First confirmation: 7 days after enrollment.
  // Subsequent: 6+ days after the last confirmation was sent (buffer against tick timing).
  injection_confirmation_due: (p) => {
    if (!p.medication) return false;

    if (!p.last_confirmation_at) {
      // First confirmation: patient must be at least 7 days in
      const daysSinceEnrolled = (Date.now() - new Date(p.enrolled_at).getTime()) / DAY_MS;
      return daysSinceEnrolled >= 7;
    }

    const daysSinceLast = (Date.now() - new Date(p.last_confirmation_at).getTime()) / DAY_MS;
    return daysSinceLast >= 6;
  },

  // A confirmation was sent > 48h ago and the patient hasn't replied
  has_overdue_confirmation: (p) => !!p.pending_overdue_injection_id,

  // N or more consecutive missed injections
  consecutive_misses_gte: (p, args) =>
    p.consecutive_missed_injections >= (args.count ?? 2),

  // ─── Titration lifecycle ─────────────────────────────────────────────────────

  // next_titration_date is within the next 0–3 days (prep window)
  titration_approaching: (p) => {
    if (!p.next_titration_date) return false;
    const daysUntil = (new Date(p.next_titration_date).getTime() - Date.now()) / DAY_MS;
    return daysUntil >= 0 && daysUntil <= 3;
  },

  // next_titration_date has arrived or passed — time to advance the dose
  titration_due: (p) => {
    if (!p.next_titration_date) return false;
    return new Date(p.next_titration_date) <= new Date();
  },

  // 3–5 days after the last titration date (side-effect check-in window)
  post_titration_window: (p) => {
    if (!p.last_titration_date) return false;
    const daysSince = (Date.now() - new Date(p.last_titration_date).getTime()) / DAY_MS;
    return daysSince >= 3 && daysSince < 5;
  },

  // ─── Supply / refill ─────────────────────────────────────────────────────────

  // Remaining supply at or below threshold doses
  supply_low: (p, args) => {
    if (p.supply_remaining === null) return false;
    return p.supply_remaining <= (args.threshold ?? 2);
  },

  // ─── Streak milestones ───────────────────────────────────────────────────────

  // confirmed_injection_streak exactly equals the target weeks (1 week = 1 injection)
  injection_streak_at: (p, args) =>
    p.confirmed_injection_streak === (args.weeks ?? 4),
};
