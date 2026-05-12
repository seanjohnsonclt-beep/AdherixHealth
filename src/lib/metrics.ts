// Shared metric definitions used by the homepage and reports page.
// Keeping these in one place means the "Revenue Protected" number
// on the dashboard matches the one on the boardroom reports page.
//
// These are MODELED numbers for a demo/pilot context — they're designed to
// approximate the business value a clinic would realize, based on public
// GLP-1 program pricing and typical staff-outreach time.

import { query, queryOne } from '@/lib/db';

// ─── Tunable assumptions ──────────────────────────────────────────────────────
// Monthly program revenue per active patient (GLP-1 cash-pay programs
// typically price between $299 and $799/mo; $600 is the defensible midpoint).
export const MONTHLY_PATIENT_VALUE = 600;

// Minutes of staff time a single manual re-engagement outreach would take
// (pull chart, draft text, send, log, wait for reply, re-send if silent).
export const MINUTES_PER_MANUAL_OUTREACH = 4;

// Of patients who drift, how many would churn without intervention.
// Meta-analyses of GLP-1 retention put 1-year discontinuation north of 50%;
// at 30-day behavioral-drift checkpoints, ~35% is a conservative baseline.
export const CHURN_PROBABILITY_WITHOUT_INTERVENTION = 0.35;

// Each "recovered" patient represents forward program revenue that would
// otherwise have been lost. We project 3.4 months of forward value — the
// weighted-average remaining tenure for a mid-program GLP-1 patient
// re-engaged within 7 days of drift.
export const PROTECTED_MONTHS_PROJECTION = 3.4;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClinicMetrics = {
  // Roster
  total: number;
  active: number;
  flagged: number;
  paused: number;
  churned: number;
  retained: number;            // active + flagged
  retentionRate: number;       // % retained of total

  // Risk tiers (mutually exclusive, over active + flagged only)
  healthy: number;             // replied within 2 days
  monitor: number;             // replied 2-5 days ago
  urgent: number;              // replied 5+ days ago (or never)

  // Behavioral outcomes
  recoveredThisMonth: number;  // flagged/drifted then replied in last 30d
  recoveredThisWeek: number;
  driftingNow: number;         // active, last reply 3-5 days (not yet flagged)
  needStaffOutreach: number;   // flagged + any active with delivery issues

  // Operational
  avgDaysOnProgram: number;
  avgMonthsOnProgram: number;

  // Modeled financial + operational ROI
  revenueProtected30d: number;        // $ — modeled from recoveries
  revenueProtectedIsModeled: boolean; // true if using floor (no real recoveries)
  staffHoursSaved30d: number;         // hours — modeled from automated outreach volume

  // Retention trend (for arrow/sparkline hints on the dashboard)
  retentionRate30dAgo: number;        // retention rate 30 days ago
  retentionDeltaPct: number;          // +/- vs 30 days ago

  // Supporting raw counts (used for sub-labels + charts)
  outboundSent30d: number;
  inboundReceived30d: number;
  responseRatePct: number;
};

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getClinicMetrics(clinicId: string): Promise<ClinicMetrics> {
  // One big roll-up query to keep page load quick.
  const roster = await queryOne<{
    total: string;
    active: string;
    flagged: string;
    paused: string;
    churned: string;
    healthy: string;
    monitor: string;
    urgent: string;
    drifting_now: string;
    avg_days: string;
  }>(
    `select
       count(*)::text                                                          as total,
       count(*) filter (where status = 'active')::text                         as active,
       count(*) filter (where status = 'flagged')::text                        as flagged,
       count(*) filter (where status = 'paused')::text                         as paused,
       count(*) filter (where status = 'churned')::text                        as churned,

       count(*) filter (
         where status in ('active','flagged')
           and last_inbound_at is not null
           and now() - last_inbound_at < interval '2 days'
       )::text                                                                 as healthy,

       count(*) filter (
         where status in ('active','flagged')
           and last_inbound_at is not null
           and now() - last_inbound_at >= interval '2 days'
           and now() - last_inbound_at <  interval '5 days'
       )::text                                                                 as monitor,

       count(*) filter (
         where status in ('active','flagged')
           and (last_inbound_at is null or now() - last_inbound_at >= interval '5 days')
       )::text                                                                 as urgent,

       count(*) filter (
         where status = 'active'
           and last_inbound_at is not null
           and now() - last_inbound_at >= interval '3 days'
           and now() - last_inbound_at <  interval '5 days'
       )::text                                                                 as drifting_now,

       coalesce(round(avg(extract(epoch from (now() - enrolled_at)) / 86400)::numeric, 1), 0)::text
                                                                                as avg_days
     from patients
     where clinic_id = $1`,
    [clinicId]
  );

  // Recoveries: patients currently active with a prior no_response_*
  // trigger that fired BEFORE their most recent inbound reply.
  const recoveryRow = await queryOne<{ month: string; week: string }>(
    `select
       count(distinct p.id) filter (where tf.fired_at > now() - interval '30 days')::text as month,
       count(distinct p.id) filter (where tf.fired_at > now() - interval '7 days')::text  as week
     from patients p
     join trigger_firings tf on tf.patient_id = p.id
     where p.clinic_id = $1
       and p.status = 'active'
       and p.last_inbound_at is not null
       and tf.trigger_key in ('no_response_48h','no_response_5d')
       and tf.fired_at < p.last_inbound_at
       and p.last_inbound_at > now() - interval '30 days'`,
    [clinicId]
  );

  // Staff outreach candidates: flagged + anyone with a failed delivery in the last week
  const staffOutreachRow = await queryOne<{ n: string }>(
    `select count(distinct p.id)::text as n
     from patients p
     left join messages m
       on m.patient_id = p.id
      and m.status = 'failed'
      and m.created_at > now() - interval '7 days'
     where p.clinic_id = $1
       and (p.status = 'flagged' or m.id is not null)`,
    [clinicId]
  );

  // Message volume (last 30d)
  const msgRow = await queryOne<{ sent: string; received: string }>(
    `select
       count(*) filter (where m.direction = 'outbound' and m.status = 'sent' and m.sent_at > now() - interval '30 days')::text as sent,
       count(*) filter (where m.direction = 'inbound' and m.created_at > now() - interval '30 days')::text                       as received
     from messages m
     join patients p on p.id = m.patient_id
     where p.clinic_id = $1`,
    [clinicId]
  );

  // Retention 30 days ago (snapshot) — everyone enrolled >30d ago,
  // minus anyone who churned and did so before 30d ago.
  const retentionPastRow = await queryOne<{ enrolled_then: string; retained_then: string }>(
    `select
       count(*) filter (where enrolled_at < now() - interval '30 days')::text
         as enrolled_then,
       count(*) filter (
         where enrolled_at < now() - interval '30 days'
           and status != 'churned'
       )::text as retained_then
     from patients
     where clinic_id = $1`,
    [clinicId]
  );

  // ── Parse ────────────────────────────────────────────────────────────────
  const total = parseInt(roster?.total ?? '0');
  const active = parseInt(roster?.active ?? '0');
  const flagged = parseInt(roster?.flagged ?? '0');
  const paused = parseInt(roster?.paused ?? '0');
  const churned = parseInt(roster?.churned ?? '0');
  const retained = active + flagged;
  const retentionRate = total > 0 ? Math.round((retained / total) * 100) : 0;

  const healthy = parseInt(roster?.healthy ?? '0');
  const monitor = parseInt(roster?.monitor ?? '0');
  const urgent = parseInt(roster?.urgent ?? '0');
  const drifting = parseInt(roster?.drifting_now ?? '0');

  const recoveredThisMonth = parseInt(recoveryRow?.month ?? '0');
  const recoveredThisWeek = parseInt(recoveryRow?.week ?? '0');
  const needStaffOutreach = parseInt(staffOutreachRow?.n ?? '0');

  const avgDays = parseFloat(roster?.avg_days ?? '0');
  const avgMonths = Math.round((avgDays / 30) * 10) / 10;

  const outboundSent30d = parseInt(msgRow?.sent ?? '0');
  const inboundReceived30d = parseInt(msgRow?.received ?? '0');
  const responseRatePct =
    outboundSent30d > 0
      ? Math.round((inboundReceived30d / outboundSent30d) * 100)
      : 0;

  // Retention trend delta (vs 30 days ago)
  const enrolledThen = parseInt(retentionPastRow?.enrolled_then ?? '0');
  const retainedThen = parseInt(retentionPastRow?.retained_then ?? '0');
  const retentionRate30dAgo =
    enrolledThen > 0 ? Math.round((retainedThen / enrolledThen) * 100) : retentionRate;
  const retentionDeltaPct = retentionRate - retentionRate30dAgo;

  // ── Modeled outcomes ─────────────────────────────────────────────────────
  // Revenue protected (30d):
  //   recoveries × monthly value × churn-probability-without-intervention ×
  //   projected forward months of retained revenue.
  let revenueProtected30d = Math.round(
    recoveredThisMonth *
      MONTHLY_PATIENT_VALUE *
      CHURN_PROBABILITY_WITHOUT_INTERVENTION *
      PROTECTED_MONTHS_PROJECTION
  );
  let revenueProtectedIsModeled = false;

  // Safety floor: a non-empty clinic should never display $0 protected
  // revenue on a demo/pilot dashboard. If real recoveries haven't been
  // measured yet, project from the roster size using the same formula.
  if (revenueProtected30d === 0 && retained >= 10) {
    const modeledMonthlyRecoveries = Math.max(1, Math.round(retained * 0.08));
    revenueProtected30d = Math.round(
      modeledMonthlyRecoveries *
        MONTHLY_PATIENT_VALUE *
        CHURN_PROBABILITY_WITHOUT_INTERVENTION *
        PROTECTED_MONTHS_PROJECTION
    );
    revenueProtectedIsModeled = true;
  }

  // Staff hours saved (30d):
  //   every automated outbound saves a manual touchpoint
  const staffHoursSaved30d =
    Math.round((outboundSent30d * MINUTES_PER_MANUAL_OUTREACH) / 60);

  return {
    total,
    active,
    flagged,
    paused,
    churned,
    retained,
    retentionRate,
    healthy,
    monitor,
    urgent,
    recoveredThisMonth,
    recoveredThisWeek,
    driftingNow: drifting,
    needStaffOutreach,
    avgDaysOnProgram: Math.round(avgDays),
    avgMonthsOnProgram: avgMonths,
    revenueProtected30d,
    revenueProtectedIsModeled,
    staffHoursSaved30d,
    retentionRate30dAgo,
    retentionDeltaPct,
    outboundSent30d,
    inboundReceived30d,
    responseRatePct,
  };
}

// Pretty dollar format for UI.
export function fmtMoney(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 10_000) return `$${Math.round(v / 1000)}k`;
  return `$${v.toLocaleString()}`;
}
