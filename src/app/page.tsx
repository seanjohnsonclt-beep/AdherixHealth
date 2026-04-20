import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { findPhase } from '@/lib/config';
import { getClinicMetrics, fmtMoney } from '@/lib/metrics';
import { Topbar } from '@/app/_components/Topbar';
import Link from 'next/link';

type PatientRow = {
  id: string;
  first_name: string | null;
  phone: string;
  current_phase: number;
  status: string;
  enrolled_at: Date;
  last_inbound_at: Date | null;
  days_enrolled: number;
  engagement_score: number;
  engagement_trend: number; // delta vs 7d prior
  recent_failed: number;
};

// Clinical stage names (patient-facing vocabulary).
const CLINICAL_STAGES: Record<number, string> = {
  0: 'Initiation',
  1: 'Dose Stabilization',
  2: 'Adherence Building',
  3: 'Risk Window',
  4: 'Taper Management',
  5: 'Maintenance',
};

// Risk tier from engagement score + status.
// Green (healthy) should dominate — red is reserved for truly urgent.
function riskTier(score: number, status: string): 'healthy' | 'monitor' | 'urgent' {
  if (status === 'churned') return 'urgent';
  if (status === 'paused') return 'monitor';
  if (score >= 70) return 'healthy';
  if (score >= 40) return 'monitor';
  return 'urgent';
}

function riskLabel(tier: 'healthy' | 'monitor' | 'urgent', status: string): string {
  if (status === 'churned') return 'Churned';
  if (status === 'paused') return 'Paused';
  if (tier === 'healthy') return 'Healthy';
  if (tier === 'monitor') return 'Monitor';
  return 'Urgent';
}

// Derive a directive next-step for clinic staff.
// The point: the table should feel intelligent, not passive.
function recommendedAction(p: PatientRow): { label: string; tone: 'none' | 'soft' | 'strong' } {
  if (p.status === 'churned') return { label: 'Win-back campaign', tone: 'soft' };
  if (p.status === 'paused') return { label: 'No action needed', tone: 'none' };
  if (p.recent_failed > 0) return { label: 'Verify delivery', tone: 'strong' };
  if (p.status === 'flagged') return { label: 'Send human outreach', tone: 'strong' };
  if (p.engagement_score < 40) return { label: 'Recover now', tone: 'strong' };
  if (p.current_phase === 3 && p.engagement_score < 70)
    return { label: 'Plateau intervention suggested', tone: 'soft' };
  if (p.engagement_trend < -15) return { label: 'Monitor — trending down', tone: 'soft' };
  return { label: 'No action needed', tone: 'none' };
}

function trendArrow(delta: number): string {
  if (delta >= 10) return '↗';
  if (delta <= -10) return '↘';
  return '→';
}

function maskPhone(p: string): string {
  if (p.length < 4) return p;
  return `••• ••• ${p.slice(-4)}`;
}

function relTime(d: Date | null | string): string {
  if (!d) return 'never';
  const ms = Date.now() - new Date(d).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default async function HomePage() {
  const user = await requireUser();
  const metrics = await getClinicMetrics(user.clinicId);

  const patients = await query<PatientRow>(
    `select
       p.id, p.first_name, p.phone, p.current_phase, p.status,
       p.enrolled_at, p.last_inbound_at,
       round(extract(epoch from (now() - p.enrolled_at)) / 86400)::int as days_enrolled,
       (
         select count(*)::int from messages m
         where m.patient_id = p.id
           and m.status = 'failed'
           and m.created_at > now() - interval '7 days'
       ) as recent_failed,

       case
         when p.status = 'churned'                                     then 0
         when p.last_inbound_at is null                                then 12
         when now() - p.last_inbound_at < interval '1 day'             then 95
         when now() - p.last_inbound_at < interval '2 days'            then 82
         when now() - p.last_inbound_at < interval '3 days'            then 68
         when now() - p.last_inbound_at < interval '5 days'            then 50
         when now() - p.last_inbound_at < interval '7 days'            then 30
         else 12
       end as engagement_score,

       /* Delta: today's score − score they "would have had" 7 days ago.
          A quick approximation from patient reply cadence. */
       case
         when p.last_inbound_at is null                                then 0
         when now() - p.last_inbound_at < interval '1 day'             then 20
         when now() - p.last_inbound_at < interval '2 days'            then 8
         when now() - p.last_inbound_at < interval '5 days'            then -10
         else -25
       end as engagement_trend
     from patients p
     where p.clinic_id = $1
     order by
       case p.status
         when 'flagged' then 0
         when 'active'  then 1
         when 'paused'  then 2
         when 'churned' then 3
       end,
       case
         when p.last_inbound_at is null                                then 12
         when now() - p.last_inbound_at < interval '1 day'             then 95
         when now() - p.last_inbound_at < interval '2 days'            then 82
         when now() - p.last_inbound_at < interval '5 days'            then 50
         else 25
       end asc,
       p.last_inbound_at desc nulls last`,
    [user.clinicId]
  );

  return (
    <div className="shell">
      <Topbar clinicName={user.clinicName} email={user.email} />

      {/* ─── Hero: today at {Clinic} ─── */}
      <div className="hero-card">
        <div className="hero-card__head">
          <div>
            <div className="label">Today at</div>
            <h1 style={{ fontSize: 30, marginTop: 4 }}>{user.clinicName}</h1>
          </div>
          <Link href="/patients/new" className="btn" title="Enroll a new patient">
            Enroll patient
          </Link>
        </div>

        <div className="hero-grid">
          <div className="hero-stat">
            <div className="hero-stat__num">{metrics.active + metrics.flagged}</div>
            <div className="hero-stat__lbl">Active patients</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat__num" style={{ color: metrics.driftingNow > 0 ? '#b45309' : 'var(--fg)' }}>
              {metrics.driftingNow}
            </div>
            <div className="hero-stat__lbl">Drifting</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat__num" style={{ color: metrics.recoveredThisWeek > 0 ? '#14532d' : 'var(--fg)' }}>
              {metrics.recoveredThisWeek}
            </div>
            <div className="hero-stat__lbl">Recovered this week</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat__num" style={{ color: 'var(--navy)' }}>
              {fmtMoney(metrics.revenueProtected30d)}
              {metrics.revenueProtectedIsModeled && (
                <span className="modeled-badge" style={{ marginLeft: 6 }}>Projected</span>
              )}
            </div>
            <div className="hero-stat__lbl">Protected revenue (30d)</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat__num" style={{ color: metrics.needStaffOutreach > 0 ? '#b45309' : 'var(--fg)' }}>
              {metrics.needStaffOutreach}
            </div>
            <div className="hero-stat__lbl">Need staff outreach</div>
          </div>
        </div>
      </div>

      {/* ─── Executive KPI row ─── */}
      <div className="kpi-row">
        <KpiCard
          label="Active patients"
          value={metrics.active + metrics.flagged}
          sub={`${metrics.retentionRate}% retention`}
          tone="neutral"
        />
        <KpiCard
          label="Patients at risk"
          value={metrics.urgent}
          sub={metrics.urgent > 0 ? 'Review today' : 'None right now'}
          tone={metrics.urgent > 0 ? 'warn' : 'good'}
        />
        <KpiCard
          label="Patients recovered"
          value={metrics.recoveredThisMonth}
          sub="last 30 days"
          tone="good"
        />
        <KpiCard
          label="Revenue protected"
          value={fmtMoney(metrics.revenueProtected30d)}
          sub={metrics.revenueProtectedIsModeled ? 'projected · last 30d' : 'modeled · last 30d'}
          tone="accent"
        />
        <KpiCard
          label="Avg days on program"
          value={metrics.avgDaysOnProgram}
          sub={`${metrics.avgMonthsOnProgram} mo average`}
          tone="neutral"
        />
        <KpiCard
          label="Staff hours saved"
          value={metrics.staffHoursSaved30d}
          sub={`${metrics.outboundSent30d} auto-outreaches`}
          tone="neutral"
        />
      </div>

      {/* ─── Patient table ─── */}
      <div className="section">
        <div className="section-head">
          <h2>Patients</h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span className="small faint">
              {metrics.healthy} healthy · {metrics.monitor} monitor ·{' '}
              <span style={{ color: metrics.urgent > 0 ? '#b91c1c' : 'inherit' }}>
                {metrics.urgent} urgent
              </span>
            </span>
            <a
              href="/api/export/action-list"
              className="btn ghost"
              style={{ fontSize: 13, padding: '6px 12px', borderBottom: '1px solid var(--fg)' }}
              title="Download CSV of patients needing action today"
            >
              Export action list
            </a>
            <a
              href="/api/export/roster"
              className="btn ghost"
              style={{ fontSize: 13, padding: '6px 12px', borderBottom: '1px solid var(--fg)' }}
              title="Download full patient roster as CSV"
            >
              Export roster
            </a>
          </div>
        </div>

        {patients.length === 0 ? (
          <div className="empty">
            <div className="num">No patients yet</div>
            <p style={{ marginTop: 12 }}>Enroll one to start the behavior loop.</p>
          </div>
        ) : (
          <table className="table table--actions">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Program stage</th>
                <th>Engagement</th>
                <th>Risk</th>
                <th>Recommended action</th>
                <th style={{ textAlign: 'right' }}>Days</th>
                <th style={{ textAlign: 'right' }}>Last response</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                const score = Number(p.engagement_score);
                const trend = Number(p.engagement_trend);
                const tier = riskTier(score, p.status);
                const stageName =
                  CLINICAL_STAGES[p.current_phase] ??
                  findPhase(p.current_phase)?.name ??
                  '—';
                const action = recommendedAction(p);

                return (
                  <tr key={p.id}>
                    <td className="name">
                      <Link href={`/patients/${p.id}`}>{p.first_name || '—'}</Link>
                      <div className="small faint mono" style={{ marginTop: 2 }}>
                        {maskPhone(p.phone)}
                      </div>
                    </td>
                    <td>
                      <span className="stage-label">
                        <span className="muted small" style={{ marginRight: 4 }}>
                          Ph {p.current_phase}
                        </span>
                        {stageName}
                      </span>
                    </td>
                    <td>
                      <div className="engagement-cell">
                        <div className="engagement-bar-wrap">
                          <div
                            className={`engagement-bar engagement-bar--${tier}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="engagement-score">
                          {score}{' '}
                          <span
                            className="small faint"
                            style={{
                              color:
                                trend > 0
                                  ? '#14532d'
                                  : trend < 0
                                  ? '#b45309'
                                  : 'var(--fg-faint)',
                              marginLeft: 2,
                            }}
                          >
                            {trendArrow(trend)}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`pill risk-${tier}`}>
                        {riskLabel(tier, p.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`action-tag action-tag--${action.tone}`}>
                        {action.label}
                      </span>
                    </td>
                    <td className="mono small muted" style={{ textAlign: 'right' }}>
                      {p.days_enrolled}d
                    </td>
                    <td className="mono small muted" style={{ textAlign: 'right' }}>
                      {relTime(p.last_inbound_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── KPI card ────────────────────────────────────────────────────────────────

type KpiTone = 'neutral' | 'good' | 'warn' | 'accent';

function KpiCard({
  label,
  value,
  sub,
  tone = 'neutral',
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: KpiTone;
}) {
  return (
    <div className={`kpi-card kpi-card--${tone}`}>
      <div className="label">{label}</div>
      <div className="kpi-card__num">{value}</div>
      {sub && <div className="kpi-card__sub">{sub}</div>}
    </div>
  );
}
