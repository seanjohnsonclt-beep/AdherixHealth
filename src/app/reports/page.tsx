import type { ReactNode } from 'react';
import { requireUser } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { Topbar } from '@/app/_components/Topbar';
import { FilterBar } from './_components/FilterBar';

// ─── Phase metadata ────────────────────────────────────────────────────────────

const PHASE_NAMES: Record<number, string> = {
  0: 'Onboarding',
  1: 'Activation',
  2: 'Momentum',
  3: 'Plateau',
  4: 'Transition',
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
        <span className="small faint mono">{user.clinicName}</span>
      </div>

      {/* Filter bar */}
      <FilterBar current={filters} />

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
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{sent}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--mono)' }}>{recv}</td>
                    <td
                      style={{
                        textAlign: 'right',
                        fontFamily: 'var(--mono)',
                        color: rRate >= 60 ? 'var(--ok)' : rRate < 20 ? 'var(--accent)' : 'var(--fg)',
                      }}
                    >
                      {sent > 0 ? `${rRate}%` : '—'}
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
