// Named conditions referenced from config/triggers.yaml.
// Each receives the patient row + trigger args, returns boolean.
//
// To add a new condition: add a function here, reference its name from
// triggers.yaml. That's it — no other code changes.

import { findPhase } from '@/lib/config';

export type PatientForEval = {
  id: string;
  current_phase: number;
  phase_started_at: Date;
  last_inbound_at: Date | null;
  enrolled_at: Date;
  status: string;
};

type ConditionFn = (p: PatientForEval, args: Record<string, any>) => boolean;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const conditions: Record<string, ConditionFn> = {
  hours_since_last_inbound_gte: (p, args) => {
    const since = p.last_inbound_at ?? p.enrolled_at;
    const hours = (Date.now() - new Date(since).getTime()) / HOUR_MS;
    return hours >= args.hours;
  },

  phase_duration_elapsed: (p) => {
    const phase = findPhase(p.current_phase);
    if (!phase) return false;
    if (phase.duration_days >= 9999) return false; // maintenance never auto-advances
    const elapsed = (Date.now() - new Date(p.phase_started_at).getTime()) / DAY_MS;
    return elapsed >= phase.duration_days;
  },
};
