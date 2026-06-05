import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { AdminDashboard } from './AdminDashboard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ── Types ──────────────────────────────────────────────────────────────────────

export type QueueStats = {
  pending: number;
  sent_24h: number;
  failed_24h: number;
  scheduled_next_24h: number;
};

export type ClinicSnapshot = {
  id: string;
  name: string;
  plan: string;
  active_patients: number;
  flagged_patients: number;
  paused_patients: number;
  retention_pct: number | null;
  phase_0: number;
  phase_1: number;
  phase_2: number;
  phase_3: number;
  phase_4: number;
  phase_5: number;
};

export type PhaseDistribution = {
  phase: number;
  count: number;
};

export type RecentEvent = {
  kind: string;
  created_at: Date;
  first_name: string | null;
  clinic_name: string;
};

export type SignalCounts = {
  phase_advances_today: number;
  newly_flagged_2h: number;
  events_today: number;
};

export type InjectionStats = {
  confirmed_today: number;
  no_response_today: number;
};

export type DriftStat = {
  drift_pattern: string;
  total: number;
  resolved: number;
  escalated: number;
};

export type DeliveryStats = {
  sent: number;
  failed: number;
  inbound_replies: number;
  failed_last_hour: number;
};

export type FailedMessage = {
  error: string | null;
  sent_at: Date | null;
  phone: string;
  clinic_name: string;
};

export type RevenueRow = {
  id: string;
  name: string;
  created_at: Date;
  active_patients: number;
  plan: string;
};

export type Alert = {
  severity: 'critical' | 'warning';
  title: string;
  detail: string;
  link?: string;
};

// ── Fetch helpers ──────────────────────────────────────────────────────────────

async function fetchQueueStats(): Promise<QueueStats> {
  const rows = await query<QueueStats>(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'sent' AND sent_at >= NOW() - INTERVAL '24 hours')::int AS sent_24h,
      COUNT(*) FILTER (WHERE status = 'failed' AND sent_at >= NOW() - INTERVAL '24 hours')::int AS failed_24h,
      COUNT(*) FILTER (WHERE status = 'pending' AND scheduled_for BETWEEN NOW() AND NOW() + INTERVAL '24 hours')::int AS scheduled_next_24h
    FROM messages
  `);
  return rows[0] ?? { pending: 0, sent_24h: 0, failed_24h: 0, scheduled_next_24h: 0 };
}

async function fetchClinicSnapshots(): Promise<ClinicSnapshot[]> {
  return query<ClinicSnapshot>(`
    SELECT
      c.id,
      c.name,
      c.plan,
      COUNT(p.id) FILTER (WHERE p.status = 'active')::int AS active_patients,
      COUNT(p.id) FILTER (WHERE p.status = 'flagged')::int AS flagged_patients,
      COUNT(p.id) FILTER (WHERE p.status = 'paused')::int AS paused_patients,
      ROUND(
        100.0 * COUNT(p.id) FILTER (WHERE p.status = 'active' AND p.last_inbound_at >= NOW() - INTERVAL '14 days')
        / NULLIF(COUNT(p.id) FILTER (WHERE p.status IN ('active','flagged')), 0)
      , 1)::float AS retention_pct,
      COUNT(p.id) FILTER (WHERE p.current_phase = 0)::int AS phase_0,
      COUNT(p.id) FILTER (WHERE p.current_phase = 1)::int AS phase_1,
      COUNT(p.id) FILTER (WHERE p.current_phase = 2)::int AS phase_2,
      COUNT(p.id) FILTER (WHERE p.current_phase = 3)::int AS phase_3,
      COUNT(p.id) FILTER (WHERE p.current_phase = 4)::int AS phase_4,
      COUNT(p.id) FILTER (WHERE p.current_phase = 5)::int AS phase_5
    FROM clinics c
    LEFT JOIN patients p ON p.clinic_id = c.id
    GROUP BY c.id, c.name, c.plan
    ORDER BY active_patients DESC
  `);
}

async function fetchPhaseDistribution(): Promise<PhaseDistribution[]> {
  return query<PhaseDistribution>(`
    SELECT current_phase AS phase, COUNT(*)::int AS count
    FROM patients
    WHERE status = 'active'
    GROUP BY current_phase
    ORDER BY current_phase
  `);
}

async function fetchRecentEvents(): Promise<RecentEvent[]> {
  return query<RecentEvent>(`
    SELECT
      e.kind,
      e.created_at,
      p.first_name,
      c.name AS clinic_name
    FROM events e
    JOIN patients p ON p.id = e.patient_id
    JOIN clinics c ON c.id = p.clinic_id
    ORDER BY e.created_at DESC
    LIMIT 50
  `);
}

async function fetchSignalCounts(): Promise<SignalCounts> {
  const rows = await query<SignalCounts>(`
    SELECT
      COUNT(*) FILTER (WHERE kind = 'phase_advanced' AND created_at >= NOW() - INTERVAL '24 hours')::int AS phase_advances_today,
      COUNT(*) FILTER (WHERE kind = 'patient_flagged' AND created_at >= NOW() - INTERVAL '2 hours')::int AS newly_flagged_2h,
      COUNT(*)::int AS events_today
    FROM events
    WHERE created_at >= NOW() - INTERVAL '24 hours'
  `);
  return rows[0] ?? { phase_advances_today: 0, newly_flagged_2h: 0, events_today: 0 };
}

async function fetchInjectionStats(): Promise<InjectionStats> {
  try {
    const rows = await query<InjectionStats>(`
      SELECT
        COUNT(*) FILTER (WHERE response = 'confirmed' AND expected_at >= NOW() - INTERVAL '24 hours')::int AS confirmed_today,
        COUNT(*) FILTER (WHERE response = 'no_response' AND expected_at >= NOW() - INTERVAL '24 hours')::int AS no_response_today
      FROM injection_events
    `);
    return rows[0] ?? { confirmed_today: 0, no_response_today: 0 };
  } catch {
    return { confirmed_today: 0, no_response_today: 0 };
  }
}

async function fetchDriftStats(): Promise<DriftStat[]> {
  try {
    return query<DriftStat>(`
      SELECT
        drift_pattern,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE resolution_status = 'auto_resolved')::int AS resolved,
        COUNT(*) FILTER (WHERE resolution_status = 'escalated')::int AS escalated
      FROM drift_correction_events
      WHERE fired_at >= NOW() - INTERVAL '24 hours'
      GROUP BY drift_pattern
    `);
  } catch {
    return [];
  }
}

async function fetchDeliveryStats(): Promise<DeliveryStats> {
  const rows = await query<{
    sent: number;
    failed: number;
    inbound_replies: number;
    failed_last_hour: number;
  }>(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'sent' AND direction = 'outbound' AND sent_at >= NOW() - INTERVAL '24 hours')::int AS sent,
      COUNT(*) FILTER (WHERE status = 'failed' AND direction = 'outbound' AND sent_at >= NOW() - INTERVAL '24 hours')::int AS failed,
      COUNT(*) FILTER (WHERE direction = 'inbound' AND created_at >= NOW() - INTERVAL '24 hours')::int AS inbound_replies,
      COUNT(*) FILTER (WHERE status = 'failed' AND direction = 'outbound' AND sent_at >= NOW() - INTERVAL '1 hour')::int AS failed_last_hour
    FROM messages
  `);
  return rows[0] ?? { sent: 0, failed: 0, inbound_replies: 0, failed_last_hour: 0 };
}

async function fetchFailedMessages(): Promise<FailedMessage[]> {
  return query<FailedMessage>(`
    SELECT
      m.error,
      m.sent_at,
      p.phone,
      c.name AS clinic_name
    FROM messages m
    JOIN patients p ON p.id = m.patient_id
    JOIN clinics c ON c.id = p.clinic_id
    WHERE m.status = 'failed'
      AND m.sent_at >= NOW() - INTERVAL '24 hours'
    ORDER BY m.sent_at DESC
    LIMIT 10
  `);
}

async function fetchRevenueRows(): Promise<RevenueRow[]> {
  return query<RevenueRow>(`
    SELECT
      c.id,
      c.name,
      c.plan,
      c.created_at,
      COUNT(p.id) FILTER (WHERE p.status = 'active')::int AS active_patients
    FROM clinics c
    LEFT JOIN patients p ON p.clinic_id = c.id
    GROUP BY c.id, c.name, c.plan, c.created_at
    ORDER BY c.created_at ASC
  `);
}

// ── Alert computation ──────────────────────────────────────────────────────────

function computeAlerts({
  clinicSnapshots,
  deliveryStats,
  injectionStats,
}: {
  clinicSnapshots: ClinicSnapshot[];
  deliveryStats: DeliveryStats;
  injectionStats: InjectionStats;
}): Alert[] {
  const alerts: Alert[] = [];

  // CRIT: any clinic with retention < 80%
  for (const c of clinicSnapshots) {
    if (c.retention_pct !== null && c.retention_pct < 80) {
      alerts.push({
        severity: 'critical',
        title: `${c.name} - retention dropped below 80%`,
        detail: `Retention now ${c.retention_pct}%`,
        link: 'https://vercel.com/seanjohnsonclt-beep/adherix-health',
      });
    }
  }

  // CRIT: failed messages in last hour
  if (deliveryStats.failed_last_hour > 0) {
    alerts.push({
      severity: 'critical',
      title: `${deliveryStats.failed_last_hour} messages failed in last hour`,
      detail: 'Check Twilio console for error details',
      link: 'https://console.twilio.com',
    });
  }

  // WARN: injection no-response patients
  if (injectionStats.no_response_today > 0) {
    alerts.push({
      severity: 'warning',
      title: `${injectionStats.no_response_today} patients with open injection confirmation windows`,
      detail: 'Confirmation windows pending patient reply',
    });
  }

  // WARN: cron auth open
  if (!process.env.CRON_SECRET) {
    alerts.push({
      severity: 'warning',
      title: 'Cron auth is open - CRON_SECRET not set',
      detail: 'Any request can trigger a tick',
      link: 'https://vercel.com/seanjohnsonclt-beep/adherix-health/settings/environment-variables',
    });
  }

  // WARN: DRY_RUN still active
  if (process.env.DRY_RUN === 'true') {
    alerts.push({
      severity: 'warning',
      title: 'DRY_RUN is active - no real SMS are being sent',
      detail: 'Remove DRY_RUN from Vercel env vars before first real patient',
      link: 'https://vercel.com/seanjohnsonclt-beep/adherix-health/settings/environment-variables',
    });
  }

  // WARN: delivery failures > 5% of sends today
  const totalOutbound = deliveryStats.sent + deliveryStats.failed;
  if (totalOutbound > 0 && deliveryStats.failed / totalOutbound > 0.05) {
    alerts.push({
      severity: 'warning',
      title: `Delivery failure rate elevated: ${Math.round((deliveryStats.failed / totalOutbound) * 100)}%`,
      detail: `${deliveryStats.failed} failed out of ${totalOutbound} sent today`,
    });
  }

  return alerts;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { secret?: string };
}) {
  if (!process.env.ADMIN_SECRET || searchParams.secret !== process.env.ADMIN_SECRET) {
    redirect('/');
  }

  const [
    queueStats,
    clinicSnapshots,
    phaseDistribution,
    recentEvents,
    signalCounts,
    injectionStats,
    driftStats,
    deliveryStats,
    failedMessages,
    revenueRows,
  ] = await Promise.all([
    fetchQueueStats(),
    fetchClinicSnapshots(),
    fetchPhaseDistribution(),
    fetchRecentEvents(),
    fetchSignalCounts(),
    fetchInjectionStats(),
    fetchDriftStats(),
    fetchDeliveryStats(),
    fetchFailedMessages(),
    fetchRevenueRows(),
  ]);

  const alerts = computeAlerts({ clinicSnapshots, deliveryStats, injectionStats });

  return (
    <AdminDashboard
      secret={searchParams.secret ?? ''}
      queueStats={queueStats}
      clinicSnapshots={clinicSnapshots}
      phaseDistribution={phaseDistribution}
      recentEvents={recentEvents.map(e => ({ ...e, created_at: e.created_at.toISOString() }))}
      signalCounts={signalCounts}
      injectionStats={injectionStats}
      driftStats={driftStats}
      deliveryStats={deliveryStats}
      failedMessages={failedMessages.map(m => ({
        ...m,
        sent_at: m.sent_at ? m.sent_at.toISOString() : null,
      }))}
      revenueRows={revenueRows.map(r => ({ ...r, created_at: r.created_at.toISOString() }))}
      alerts={alerts}
      dryRun={process.env.DRY_RUN === 'true'}
    />
  );
}
