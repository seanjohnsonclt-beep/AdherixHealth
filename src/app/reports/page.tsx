import type { ReactNode } from 'react';
import { requireUser } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { Topbar } from '@/app/_components/Topbar';
import { FilterBar } from './_components/FilterBar';
import { getClinicMetrics, fmtMoney } from '@/lib/metrics';

// ─── Phase metadata ────────────────────────────────────────────────────────────

const PHASE_NAMES: Record<number, string> = {
  0: 'Initiation',
  1: 'Dose Stabilization',
  2: 'Adherence Building',
  3: 'Risk Window',
  4: 'Taper Management',
  5: 'Maintenance',
};

// ─── Filter builder ────────────────────────────────────────────────────────────

type Filters = {
  phase: string;
  status: string;
  from: string;
  to: string;
  response: string;
};

function buildPatientWhere(
  alias: string,
  clinicParam: number,
  filters: Filters
): { clause: string; extraParams: unknown[]; nextIdx: number } {
  const conditions: string[] = [`${alias}.clinic_id = $${clinicParam}`];
  const extraParams: unknown[] = [];
  let idx = clinicParam + 1;

  if (filters.phase !== '') {
    conditions.push(`${alias}.current_phase = $${idx}`);
    extraParams.push(parseInt(filters.phase));
    idx++;
  }
  if (filters.status) {
    conditions.push(`${alias}.status = $${idx}`);
    extraParams.push(filters.status);
    idx++;
  }
  if (filters.from) {
    conditions.push(`${alias}.enrolled_at >= $${idx}`);
    extraParams.push(filters.from);
    idx++;
  }
  if (filters.to) {
    conditions.push(`${alias}.enrolled_at < ($${idx}::date + interval '1 day')`);
    extraParams.push(filters.to);
    idx++;
  }
  if (filters.response === 'active7d') {
    conditions.push(`${alias}.last_inbound_at >= now() - interval '7 days'`);
  } else if (filters.response === 'silent7d') {
    conditions.push(
      `(${alias}.last_inbound_at IS NULL OR ${alias}.last_inbound_at < now() - interval '7 days')`
    );
  } else if (filters.response === 'never') {
    conditions.push(`${alias}.last_inbound_at IS NULL`);
  }

  return { clause: conditions.join(' AND '), extraParams, nextIdx: idx };
}

// ─── Chart helpers ─────────────────────────────────────────────────────────────

function pct(value: number, max: number): string {
  if (!max) return '0%';
  return `${Math.round((value / max) * 100)}%`;
}

function HBar({
  label,
  value,
  max,
  subLabel,
  color = 'var(--fg)',
}: {
  label: string;
  value: number;
  max: number;
  subLabel?: string;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <div
        style={{
          width: 130,
          fontSize: 12,
          color: 'var(--fg-muted)',
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          background: 'var(--line)',
          height: 22,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: pct(value, max),
            height: '100%',
            background: color,
          }}
        />
      </div>
      <div style={{ width: 56, fontSize: 13, fontFamily: 'var(--mono)', flexShrink: 0 }}>
        {value}
        {subLabel && (
          <span style={{ color: 'var(--fg-faint)', fontSize: 11 }}> {subLabel}</span>
        )}
      </div>
    </div>
  );
}

type SparkSeries = { label: string; values: number[]; color: string };

function LineChart({
  series,
  labels,
  height = 140,
}: {
  series: SparkSeries[];
  labels: string[];
  height?: number;
}) {
  if (!labels.length) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--fg-faint)',
          fontSize: 13,
        }}
      >
        No data yet
      </div>
    );
  }
  const allValues = series.flatMap((s) => s.values);
  const maxVal = Math.max(...allValues, 1);
  const W = 560;
  const H = height;
  const PAD = { top: 12, right: 12, bottom: 28, left: 36 };
  const cw = W - PAD.left - PAD.right;
  const ch = H - PAD.top - PAD.bottom;
  const n = labels.length;

  const getX = (i: number) => PAD.left + (n > 1 ? (i / (n - 1)) * cw : cw / 2);
  const getY = (v: number) => PAD.top + ch - (v / maxVal) * ch;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height, display: 'block' }}
      aria-hidden
    >
      {gridLines.map((pctVal) => {
        const y = getY(maxVal * pctVal);
        return (
          <g key={pctVal}>
            <line
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 6}
              y={y + 4}
              textAnchor="end"
              fontSize={9}
              fill="var(--fg-faint)"
              fontFamily="var(--mono)"
            >
              {Math.round(maxVal * pctVal)}
            </text>
          </g>
        );
      })}

      {series.map((s) => {
        const pts = s.values.map((v, i) => `${getX(i)},${getY(v)}`).join(' ');
        return (
          <polyline
            key={s.label}
            points={pts}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        );
      })}

      {labels.map((lbl, i) => (
        <text
          key={i}
          x={getX(i)}
          y={H - 6}
          textAnchor="middle"
          fontSize={9}
          fill="var(--fg-faint)"
          fontFamily="var(--mono)"
        >
          {lbl}
        </text>
      ))}
    </svg>
  );
}

function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
      {items.map((item) => (
        <div
          key={item.label}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-muted)' }}
        >
          <div style={{ width: 12, height: 3, background: item.color, borderRadius: 2 }} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

function BoardMetric({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'good' | 'warn' | 'accent';
}) {
  const color =
    tone === 'good'   ? '#14532d' :
    tone === 'warn'   ? '#b45309' :
    tone === 'accent' ? '#111110' : 'var(--fg)';
  return (
    <div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 36, lineHeight: 1, fontWeight: 500, color, letterSpacing: '-0.01em' }}>
        {value}
      </div>
      <div className="label" style={{ marginTop: 8 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--fg-faint)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        padding: '20px 24px',
        background: 'white',
        border: '1px solid var(--line)',
        flex: 1,
        minWidth: 140,
      }}
    >
      <div className="label" style={{ marginBottom: 8 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 36,
          lineHeight: 1,
          color: accent ? 'var(--accent)' : 'var(--fg)',
          fontWeight: 500,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: 'var(--fg-faint)', marginTop: 6 }}>{sub}</div>
      )}
    </div>
  );
}

function SectionBox({
  title,
  children,
  sub,
}: {
  title: string;
  children: ReactNode;
  sub?: string;
}) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--line)', marginBottom: 24 }}>
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <h3 style={{ fontSize: 15, fontFamily: 'var(--sans)', fontWeight: 500 }}>{title}</h3>
        {sub && <span style={{ fontSize: 12, color: 'var(--fg-faint)' }}>{sub}</span>}
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

function maskPhone(p: string): string {
  return p.length < 4 ? p : `••• ••• ${p.slice(-4)}`;
}

function relTime(d: Date | string | null): string {
  if (!d) return 'never';
  const ms = Date.now() - new Date(d).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

function fmtDate(d: Date | string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type SummaryRow = {
  total: string;
  active: string;
  flagged: string;
  paused: string;
  churned: string;
  avg_days_enrolled: string;
  ever_replied: string;
};

type PhaseRow = {
  current_phase: number;
  patients: string;
  messages_sent: string;
  messages_received: string;
  reply_rate_pct: string;
};

type WeeklyEnrollRow = { week: string; count: string };
type WeeklyMsgRow = { week: string; outbound: string; inbound: string };

type TemplateRow = {
  template_key: string;
  sent: string;
  replies: string;
  reply_rate_pct: string;
};

type PatientRow = {
  id: string;
  first_name: string | null;
  phone: string;
  current_phase: number;
  status: string;
  enrolled_at: Date;
  last_inbound_at: Date | null;
  messages_sent: string;
  messages_received: string;
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const user = await requireUser();
  const metrics = await getClinicMetrics(user.clinicId);

  const filters: Filters = {
    phase: searchParams.phase ?? '',
    status: searchParams.status ?? '',
    from: searchParams.from ?? '',
    to: searchParams.to ?? '',
    response: searchParams.response ?? '',
  };

  const { clause, extraParams, nextIdx: _nIdx } = buildPatientWhere('p', 1, filters);
  const allParams = [user.clinicId, ...extraParams];

  // ── 1. Summary ───────────────────────────────────────────────────────────────
  const summaryRow = await queryOne<SummaryRow>(
    `SELECT
       COUNT(*)::text                                                    AS total,
       COUNT(*) FILTER (WHERE p.status = 'active')::text               AS active,
       COUNT(*) FILTER (WHERE p.status = 'flagged')::text              AS flagged,
       COUNT(*) FILTER (WHERE p.status = 'paused')::text               AS paused,
       COUNT(*) FILTER (WHERE p.status = 'churned')::text              AS churned,
       COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (now() - p.enrolled_at)) / 86400)::numeric, 1), 0)::text
                                                                        AS avg_days_enrolled,
       COUNT(*) FILTER (WHERE p.last_inbound_at IS NOT NULL)::text     AS ever_replied
     FROM patients p
     WHERE ${clause}`,
    allParams
  );

  const msgTotals = await queryOne<{ total_sent: string; total_received: string }>(
    `SELECT
       COUNT(*) FILTER (WHERE m.direction = 'outbound' AND m.status = 'sent')::text AS total_sent,
       COUNT(*) FILTER (WHERE m.direction = 'inbound')::text                        AS total_received
     FROM messages m
     JOIN patients p ON p.id = m.patient_id
     WHERE ${clause}`,
    allParams
  );

  const total = parseInt(summaryRow?.total ?? '0');
  const active = parseInt(summaryRow?.active ?? '0');
  const flagged = parseInt(summaryRow?.flagged ?? '0');
  const churned = parseInt(summaryRow?.churned ?? '0');
  const everReplied = parseInt(summaryRow?.ever_replied ?? '0');
  const avgDays = summaryRow?.avg_days_enrolled ?? '0';
  const totalSent = parseInt(msgTotals?.total_sent ?? '0');
  const totalReceived = parseInt(msgTotals?.total_received ?? '0');
  const overallReplyRate = totalSent > 0 ? Math.round((totalReceived / totalSent) * 100) : 0;
  const patientReplyRate = total > 0 ? Math.round((everReplied / total) * 100) : 0;

  // Derived outcome metrics
  const retentionRate = total > 0 ? Math.round(((active + flagged) / total) * 100) : 0;

  // ── 1b. Recovered patients ────────────────────────────────────────────────────
  const recoveredRow = await queryOne<{ recovered: string }>(
    `SELECT COUNT(DISTINCT p.id)::text AS recovered
     FROM patients p
     WHERE p.clinic_id = $1
       AND p.status = 'active'
       AND p.last_inbound_at > NOW() - INTERVAL '14 days'
       AND EXISTS (
         SELECT 1 FROM trigger_firings tf
         WHERE tf.patient_id = p.id
           AND tf.trigger_key IN ('no_response_48h','no_response_5d')
           AND tf.fired_at < p.last_inbound_at
       )`,
    [user.clinicId]
  );
  const recovered = parseInt(recoveredRow?.recovered ?? '0');

  // ── 1c. Risk distribution ─────────────────────────────────────────────────────
  const riskRow = await queryOne<{ high: string; medium: string; low_ok: string }>(
    `SELECT
       COUNT(*) FILTER (WHERE p.status != 'churned' AND (
         p.last_inbound_at IS NULL OR NOW() - p.last_inbound_at >= INTERVAL '7 days'
       ))::text AS high,
       COUNT(*) FILTER (WHERE p.status != 'churned' AND
         p.last_inbound_at IS NOT NULL AND
         NOW() - p.last_inbound_at >= INTERVAL '5 days' AND
         NOW() - p.last_inbound_at < INTERVAL '7 days'
       )::text AS medium,
       COUNT(*) FILTER (WHERE p.status != 'churned' AND
         p.last_inbound_at IS NOT NULL AND
         NOW() - p.last_inbound_at < INTERVAL '5 days'
       )::text AS low_ok
     FROM patients p
     WHERE p.clinic_id = $1`,
    [user.clinicId]
  );
  const riskHigh = parseInt(riskRow?.high ?? '0');
  const riskMedium = parseInt(riskRow?.medium ?? '0');
  const riskLowOk = parseInt(riskRow?.low_ok ?? '0');

  // ── 2. Phase distribution ────────────────────────────────────────────────────
  const phaseRows = await query<PhaseRow>(
    `SELECT
       p.current_phase,
       COUNT(DISTINCT p.id)::text                                                              AS patients,
       COALESCE(SUM(ms.sent), 0)::text                                                        AS messages_sent,
       COALESCE(SUM(ms.received), 0)::text                                                    AS messages_received,
       CASE WHEN COALESCE(SUM(ms.sent), 0) > 0
         THEN ROUND((COALESCE(SUM(ms.received), 0)::float / SUM(ms.sent)) * 100)::text
         ELSE '0' END                                                                          AS reply_rate_pct
     FROM patients p
     LEFT JOIN LATERAL (
       SELECT
         COUNT(*) FILTER (WHERE direction = 'outbound' AND status = 'sent') AS sent,
         COUNT(*) FILTER (WHERE direction = 'inbound')                      AS received
       FROM messages WHERE patient_id = p.id
     ) ms ON true
     WHERE ${clause}
     GROUP BY p.current_phase
     ORDER BY p.current_phase`,
    allParams
  );

  const maxPhasePatients = Math.max(...phaseRows.map((r) => parseInt(r.patients)), 1);

  // ── 3. Weekly enrollments (clinic-wide) ──────────────────────────────────────
  const enrollRows = await query<WeeklyEnrollRow>(
    `SELECT
       TO_CHAR(DATE_TRUNC('week', enrolled_at), 'MM/DD') AS week,
       COUNT(*)::text                                      AS count
     FROM patients
     WHERE clinic_id = $1 AND enrolled_at >= now() - interval '16 weeks'
     GROUP BY DATE_TRUNC('week', enrolled_at)
     ORDER BY DATE_TRUNC('week', enrolled_at)`,
    [user.clinicId]
  );

  // ── 4. Weekly message volume (clinic-wide) ───────────────────────────────────
  const msgRows = await query<WeeklyMsgRow>(
    `SELECT
       TO_CHAR(DATE_TRUNC('week', m.created_at), 'MM/DD') AS week,
       COUNT(*) FILTER (WHERE m.direction = 'outbound')::text AS outbound,
       COUNT(*) FILTER (WHERE m.direction = 'inbound')::text  AS inbound
     FROM messages m
     JOIN patients p ON p.id = m.patient_id
     WHERE p.clinic_id = $1 AND m.created_at >= now() - interval '16 weeks'
     GROUP BY DATE_TRUNC('week', m.created_at)
     ORDER BY DATE_TRUNC('week', m.created_at)`,
    [user.clinicId]
  );

  // ── 5. Template performance (clinic-wide) ────────────────────────────────────
  const templateRows = await query<TemplateRow>(
    `SELECT
       m_out.template_key,
       COUNT(*)::text                                                       AS sent,
       COUNT(reply.id)::text                                                AS replies,
       CASE WHEN COUNT(*) > 0
         THEN ROUND((COUNT(reply.id)::float / COUNT(*)) * 100)::text
         ELSE '0' END                                                       AS reply_rate_pct
     FROM messages m_out
     JOIN patients p ON p.id = m_out.patient_id
     LEFT JOIN LATERAL (
       SELECT m.id FROM messages m
       WHERE m.patient_id = m_out.patient_id
         AND m.direction = 'inbound'
         AND m.created_at > COALESCE(m_out.sent_at, m_out.created_at)
         AND m.created_at < COALESCE(m_out.sent_at, m_out.created_at) + interval '48 hours'
       LIMIT 1
     ) reply ON true
     WHERE p.clinic_id = $1
       AND m_out.direction = 'outbound'
       AND m_out.status = 'sent'
       AND m_out.template_key IS NOT NULL
       AND m_out.template_key NOT LIKE 'trigger.%'
     GROUP BY m_out.template_key
     ORDER BY COUNT(*) DESC`,
    [user.clinicId]
  );

  // ── 5b. Churn risk by phase ──────────────────────────────────────────────────
  const churnByPhase = await query<{ current_phase: number; at_risk: string; total: string }>(
    `select
       p.current_phase,
       count(*) filter (
         where p.status != 'churned'
           and (p.last_inbound_at is null or now() - p.last_inbound_at >= interval '5 days')
       )::text as at_risk,
       count(*)::text as total
     from patients p
     where p.clinic_id = $1
     group by p.current_phase
     order by p.current_phase`,
    [user.clinicId]
  );

  // ── 5c. Retention trend (last 12 weeks) ──────────────────────────────────────
  const retentionTrend = await query<{ week: string; enrolled: string; retained: string }>(
    `with weeks as (
       select generate_series(
         date_trunc('week', now() - interval '11 weeks'),
         date_trunc('week', now()),
         interval '1 week'
       )::date as wk
     )
     select
       to_char(weeks.wk, 'MM/DD') as week,
       count(p.id) filter (where p.enrolled_at <= weeks.wk + interval '1 week')::text as enrolled,
       count(p.id) filter (
         where p.enrolled_at <= weeks.wk + interval '1 week'
           and (p.status != 'churned' or (p.status = 'churned' and p.enrolled_at > weeks.wk))
       )::text as retained
     from weeks
     left join patients p on p.clinic_id = $1
     group by weeks.wk
     order by weeks.wk`,
    [user.clinicId]
  );

  // ── 5d. Recovery success rate over time ──────────────────────────────────────
  const recoverySuccess = await query<{ week: string; fired: string; recovered: string }>(
    `with weeks as (
       select generate_series(
         date_trunc('week', now() - interval '11 weeks'),
         date_trunc('week', now()),
         interval '1 week'
       )::date as wk
     )
     select
       to_char(weeks.wk, 'MM/DD') as week,
       count(tf.id)::text as fired,
       count(tf.id) filter (
         where exists (
           select 1 from messages m
           where m.patient_id = tf.patient_id
             and m.direction = 'inbound'
             and m.created_at > tf.fired_at
             and m.created_at < tf.fired_at + interval '7 days'
         )
       )::text as recovered
     from weeks
     left join trigger_firings tf
       on date_trunc('week', tf.fired_at) = weeks.wk
       and tf.trigger_key in ('no_response_48h','no_response_5d')
     left join patients p on p.id = tf.patient_id and p.clinic_id = $1
     where tf.id is null or p.clinic_id = $1
     group by weeks.wk
     order by weeks.wk`,
    [user.clinicId]
  );

  // ── 6. Filtered patient list ─────────────────────────────────────────────────
  const patients = await query<PatientRow>(
    `SELECT
       p.id, p.first_name, p.phone, p.current_phase, p.status,
       p.enrolled_at, p.last_inbound_at,
       COALESCE(ms.sent, 0)::text   AS messages_sent,
       COALESCE(ms.received, 0)::text AS messages_received
     FROM patients p
     LEFT JOIN LATERAL (
       SELECT
         COUNT(*) FILTER (WHERE direction = 'outbound' AND status = 'sent') AS sent,
         COUNT(*) FILTER (WHERE direction = 'inbound')                      AS received
       FROM messages WHERE patient_id = p.id
     ) ms ON true
     WHERE ${clause}
     ORDER BY
       CASE p.status WHEN 'flagged' THEN 0 WHEN 'active' THEN 1 ELSE 2 END,
       p.last_inbound_at DESC NULLS LAST
     LIMIT 500`,
    allParams
  );

  // ── Chart data ───────────────────────────────────────────────────────────────
  const enrollLabels = enrollRows.map((r) => r.week);
  const enrollValues = enrollRows.map((r) => parseInt(r.count));

  const msgLabels = msgRows.map((r) => r.week);
  const outboundValues = msgRows.map((r) => parseInt(r.outbound));
  const inboundValues = msgRows.map((r) => parseInt(r.inbound));

  const trendLabels = retentionTrend.map((r) => r.week);
  const retentionPctValues = retentionTrend.map((r) => {
    const e = parseInt(r.enrolled);
    const rr = parseInt(r.retained);
    return e > 0 ? Math.round((rr / e) * 100) : 100;
  });

  const recoveryLabels = recoverySuccess.map((r) => r.week);
  const recoveryRateValues = recoverySuccess.map((r) => {
    const fired = parseInt(r.fired);
    const rec = parseInt(r.recovered);
    return fired > 0 ? Math.round((rec / fired) * 100) : 0;
  });

  const maxChurn = Math.max(
    ...churnByPhase.map((r) => parseInt(r.total) || 0),
    1,
  );

  const activeFilters =
    filters.phase !== '' ||
    filters.status !== '' ||
    filters.from !== '' ||
    filters.to !== '' ||
    filters.response !== '';

  return (
    <div className="shell">
      <Topbar clinicName={user.clinicName} email={user.email} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 32 }}>Reports</h1>
          {activeFilters && (
            <p className="small muted" style={{ marginTop: 4 }}>
              Showing {total} patient{total !== 1 ? 's' : ''} matching active filters
            </p>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <a
              href="/api/export/exec-summary"
              className="btn ghost"
              style={{ fontSize: 13, padding: '6px 12px' }}
              title="One-file CSV of top-line metrics + 12-week retention + recovery trends"
            >
              Exec summary · CSV
            </a>
            <a
              href="/reports/print/exec-summary"
              target="_blank"
              rel="noopener"
              className="btn ghost"
              style={{ fontSize: 13, padding: '6px 12px' }}
              title="Print-ready board deck PDF — opens in a new tab, auto-triggers print dialog"
            >
              PDF
            </a>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <a
              href="/api/export/recovery-ledger"
              className="btn ghost"
              style={{ fontSize: 13, padding: '6px 12px' }}
              title="Itemized list of recovered patients with modeled revenue protected per recovery"
            >
              Recovery ledger · CSV
            </a>
            <a
              href="/reports/print/recovery-ledger"
              target="_blank"
              rel="noopener"
              className="btn ghost"
              style={{ fontSize: 13, padding: '6px 12px' }}
              title="Print-ready recovery ledger PDF — the renewal-justification artifact"
            >
              PDF
            </a>
          </div>
          <span className="small faint mono">{user.clinicName}</span>
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar current={filters} />

      {/* ── Executive strip (4 primary boardroom metrics) ── */}
      <div className="label" style={{ marginBottom: 12 }}>Executive summary · last 30 days</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        {/* Revenue Protected — primary/navy emphasis */}
        <div className="exec-metric exec-metric--primary">
          <div className="exec-metric__label">Revenue protected</div>
          <div className="exec-metric__num exec-metric__num--navy">
            {fmtMoney(metrics.revenueProtected30d)}
            {metrics.revenueProtectedIsModeled && (
              <span className="modeled-badge">Projected</span>
            )}
          </div>
          <div className="exec-metric__sub">
            from {metrics.recoveredThisMonth} recovered patient{metrics.recoveredThisMonth === 1 ? '' : 's'}
          </div>
        </div>

        {/* Retention trend */}
        <div className="exec-metric">
          <div className="exec-metric__label">Retention rate</div>
          <div className="exec-metric__num">
            {metrics.retentionRate}%
            <span
              className={`exec-metric__trend ${
                metrics.retentionDeltaPct > 0
                  ? 'exec-metric__trend--up'
                  : metrics.retentionDeltaPct < 0
                  ? 'exec-metric__trend--down'
                  : 'exec-metric__trend--flat'
              }`}
            >
              {metrics.retentionDeltaPct > 0 ? '↗' : metrics.retentionDeltaPct < 0 ? '↘' : '→'}{' '}
              {metrics.retentionDeltaPct > 0 ? '+' : ''}
              {metrics.retentionDeltaPct}%
            </span>
          </div>
          <div className="exec-metric__sub">vs 30 days ago</div>
          {/* mini sparkline */}
          <div className="exec-metric__spark">
            <LineChart
              series={[{ label: 'Retention', values: retentionPctValues, color: 'var(--navy)' }]}
              labels={trendLabels.map(() => '')}
              height={38}
            />
          </div>
        </div>

        {/* Patients Recovered */}
        <div className="exec-metric">
          <div className="exec-metric__label">Patients recovered</div>
          <div className="exec-metric__num exec-metric__num--good">
            {metrics.recoveredThisMonth}
          </div>
          <div className="exec-metric__sub">
            {metrics.recoveredThisWeek} this week · {metrics.recoveredThisMonth} this month
          </div>
        </div>

        {/* Avg Program Duration */}
        <div className="exec-metric">
          <div className="exec-metric__label">Avg program duration</div>
          <div className="exec-metric__num">
            {metrics.avgMonthsOnProgram}
            <span style={{ fontSize: 20, color: 'var(--fg-muted)', marginLeft: 4 }}>mo</span>
          </div>
          <div className="exec-metric__sub">
            {metrics.avgDaysOnProgram} days avg · roster of {metrics.total}
          </div>
        </div>
      </div>

      {/* Secondary strip — engagement & staff efficiency */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        <div className="exec-metric">
          <div className="exec-metric__label">Response rate</div>
          <div className="exec-metric__num" style={{ fontSize: 28 }}>
            {metrics.responseRatePct}%
          </div>
          <div className="exec-metric__sub">
            {metrics.inboundReceived30d} replies · {metrics.outboundSent30d} sent
          </div>
        </div>
        <div className="exec-metric">
          <div className="exec-metric__label">Staff time saved</div>
          <div className="exec-metric__num" style={{ fontSize: 28 }}>
            {metrics.staffHoursSaved30d}
            <span style={{ fontSize: 16, color: 'var(--fg-muted)', marginLeft: 4 }}>hrs</span>
          </div>
          <div className="exec-metric__sub">auto-outreach vs manual touchpoints</div>
        </div>
        <div className="exec-metric">
          <div className="exec-metric__label">Patient risk distribution</div>
          {metrics.total > 0 ? (
            <>
              <div style={{ display: 'flex', height: 10, borderRadius: 4, overflow: 'hidden', gap: 2, marginTop: 8, marginBottom: 10 }}>
                <div style={{ flex: metrics.healthy || 1, background: 'var(--good)', borderRadius: '4px 0 0 4px' }} title={`Healthy: ${metrics.healthy}`} />
                <div style={{ flex: metrics.monitor || 0.001, background: 'var(--warn)' }} title={`Monitor: ${metrics.monitor}`} />
                <div style={{ flex: metrics.urgent || 0.001, background: 'var(--urgent)', borderRadius: '0 4px 4px 0' }} title={`Urgent: ${metrics.urgent}`} />
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--fg-muted)' }}>
                <span>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--good)', marginRight: 4, verticalAlign: 'middle' }} />
                  Healthy {metrics.healthy}
                </span>
                <span>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--warn)', marginRight: 4, verticalAlign: 'middle' }} />
                  Monitor {metrics.monitor}
                </span>
                <span>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--urgent)', marginRight: 4, verticalAlign: 'middle' }} />
                  Urgent {metrics.urgent}
                </span>
              </div>
            </>
          ) : (
            <div className="exec-metric__sub">No patients yet.</div>
          )}
        </div>
      </div>

      {/* ── Layered analytics section ── */}
      <div style={{ marginTop: 24 }}>
        <div className="analytics-section__title">Analytics</div>
        <div className="analytics-section__sub">Deeper engagement, recovery and program detail</div>
      </div>

      {/* ── Retention Trend ── */}
      <SectionBox title="Retention trend" sub="last 12 weeks · % of enrolled still active">
        <LineChart
          series={[{ label: 'Retention %', values: retentionPctValues, color: '#14532d' }]}
          labels={trendLabels}
        />
        <ChartLegend items={[{ label: 'Retention rate', color: '#14532d' }]} />
      </SectionBox>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* ── Recovery success ── */}
        <SectionBox title="Recovery success rate" sub="% drifting patients re-engaged within 7d">
          <LineChart
            series={[{ label: 'Recovery %', values: recoveryRateValues, color: 'var(--fg)' }]}
            labels={recoveryLabels}
            height={120}
          />
        </SectionBox>

        {/* ── Churn risk by phase ── */}
        <SectionBox title="Churn risk by program phase" sub="at-risk ÷ total, by phase">
          {churnByPhase.length === 0 ? (
            <p className="small muted">No patients yet.</p>
          ) : (
            churnByPhase.map((r) => {
              const total = parseInt(r.total);
              const atRisk = parseInt(r.at_risk);
              return (
                <HBar
                  key={r.current_phase}
                  label={`${r.current_phase}. ${PHASE_NAMES[r.current_phase] ?? '—'}`}
                  value={atRisk}
                  max={maxChurn}
                  subLabel={total > 0 ? `/ ${total}` : ''}
                  color={atRisk > 0 ? '#f59e0b' : '#22c55e'}
                />
              );
            })
          )}
        </SectionBox>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard label="Total Enrolled" value={total} />
        <StatCard
          label="Active"
          value={active}
          sub={total > 0 ? `${Math.round((active / total) * 100)}% of enrolled` : undefined}
        />
        <StatCard
          label="Flagged"
          value={flagged}
          accent={flagged > 0}
          sub={total > 0 ? `${Math.round((flagged / total) * 100)}% of enrolled` : undefined}
        />
        <StatCard
          label="Churned"
          value={churned}
          sub={total > 0 ? `${Math.round((churned / total) * 100)}% of enrolled` : undefined}
        />
        <StatCard
          label="Patient Reply Rate"
          value={`${patientReplyRate}%`}
          sub={`${everReplied} of ${total} ever replied`}
        />
        <StatCard
          label="Msg Reply Rate"
          value={`${overallReplyRate}%`}
          sub={`${totalReceived} replies / ${totalSent} sent`}
        />
        <StatCard
          label="Avg Days Enrolled"
          value={avgDays}
          sub="across filtered patients"
        />
      </div>

      {/* ── Phase distribution + Reply rate by phase ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <SectionBox title="Phase Distribution" sub={activeFilters ? 'filtered' : 'all patients'}>
          {phaseRows.length === 0 ? (
            <p className="small muted">No patients yet.</p>
          ) : (
            phaseRows.map((r) => (
              <HBar
                key={r.current_phase}
                label={`${r.current_phase}. ${PHASE_NAMES[r.current_phase] ?? '—'}`}
                value={parseInt(r.patients)}
                max={maxPhasePatients}
              />
            ))
          )}
        </SectionBox>

        <SectionBox title="Message Reply Rate by Phase" sub="inbound ÷ outbound sent">
          {phaseRows.length === 0 ? (
            <p className="small muted">No data yet.</p>
          ) : (
            phaseRows.map((r) => (
              <HBar
                key={r.current_phase}
                label={`${r.current_phase}. ${PHASE_NAMES[r.current_phase] ?? '—'}`}
                value={parseInt(r.reply_rate_pct)}
                max={100}
                subLabel="%"
                color={
                  parseInt(r.reply_rate_pct) >= 60
                    ? 'var(--ok)'
                    : parseInt(r.reply_rate_pct) >= 30
                    ? 'var(--fg)'
                    : 'var(--accent)'
                }
              />
            ))
          )}
        </SectionBox>
      </div>

      {/* ── Enrollments over time ── */}
      <SectionBox title="Enrollments Over Time" sub="last 16 weeks · clinic-wide">
        <LineChart
          series={[{ label: 'Enrollments', values: enrollValues, color: 'var(--fg)' }]}
          labels={enrollLabels}
        />
        <ChartLegend items={[{ label: 'New enrollments', color: 'var(--fg)' }]} />
      </SectionBox>

      {/* ── Message volume ── */}
      <SectionBox title="Message Volume" sub="last 16 weeks · clinic-wide">
        <LineChart
          series={[
            { label: 'Sent', values: outboundValues, color: 'var(--fg)' },
            { label: 'Received', values: inboundValues, color: '#888' },
          ]}
          labels={msgLabels}
        />
        <ChartLegend
          items={[
            { label: 'Outbound sent', color: 'var(--fg)' },
            { label: 'Inbound replies', color: '#888' },
          ]}
        />
      </SectionBox>

      {/* ── Template performance ── */}
      <SectionBox title="Template Performance" sub="clinic-wide · excludes trigger messages">
        {templateRows.length === 0 ? (
          <p className="small muted">No messages sent yet.</p>
        ) : (
          <table className="table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Template</th>
                <th style={{ textAlign: 'right' }}>Sent</th>
                <th style={{ textAlign: 'right' }}>Replies (48h)</th>
                <th style={{ textAlign: 'right' }}>Reply rate</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {templateRows.map((t) => {
                const rate = parseInt(t.reply_rate_pct);
                return (
                  <tr key={t.template_key}>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{t.template_key}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{t.sent}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{t.replies}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', color: rate >= 60 ? 'var(--ok)' : rate < 20 ? 'var(--accent)' : 'var(--fg)' }}>
                      {rate}%
                    </td>
                    <td>
                      <div style={{ background: 'var(--line)', height: 6, borderRadius: 3 }}>
                        <div
                          style={{
                            width: `${rate}%`,
                            height: '100%',
                            borderRadius: 3,
                            background: rate >= 60 ? 'var(--ok)' : rate < 20 ? 'var(--accent)' : 'var(--fg)',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </SectionBox>

      {/* ── Patient table ── */}
      <SectionBox
        title="Patients"
        sub={`${patients.length}${patients.length === 500 ? '+' : ''} shown`}
      >
        {patients.length === 0 ? (
          <div className="empty">
            <p>No patients match the current filters.</p>
          </div>
        ) : (
          <table className="table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Phase</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Enrolled</th>
                <th style={{ textAlign: 'right' }}>Last reply</th>
                <th style={{ textAlign: 'right' }}>Sent</th>
                <th style={{ textAlign: 'right' }}>Received</th>
                <th style={{ textAlign: 'right' }}>Reply rate</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                const sent = parseInt(p.messages_sent);
                const recv = parseInt(p.messages_received);
                const rRate = sent > 0 ? Math.round((recv / sent) * 100) : 0;
                return (
                  <tr key={p.id}>
                    <td className="name">
                      <a href={`/patients/${p.id}`}>{p.first_name || '—'}</a>
                    </td>
                    <td className="mono">{maskPhone(p.phone)}</td>
                    <td>
                      <span className="muted">{p.current_phase}.</span>{' '}
                      {PHASE_NAMES[p.current_phase] ?? '—'}
                    </td>
                    <td>
                      <span className={`pill ${p.status === 'flagged' ? 'flagged' : 'active'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 12 }}>
                      {fmtDate(p.enrolled_at)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 12 }}>
                      {relTime(p.last_inbound_at)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 12 }}>
                      {sent}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 12 }}>
                      {recv}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 12,
                      color: rRate >= 60 ? 'var(--ok)' : rRate < 20 ? 'var(--accent)' : 'var(--fg)' }}>
                      {rRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </SectionBox>
    </div>
  );
}