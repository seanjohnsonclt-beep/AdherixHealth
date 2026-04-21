// Executive Summary — printable PDF version. One-page board-deck artifact.
// Auto-prints on load.

import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { getClinicMetrics } from '@/lib/metrics';
import { PrintShell } from '../_components/PrintShell';
import { PRINT_CSS } from '../_components/printStyles';

export const dynamic = 'force-dynamic';

type WeekRow = { week: string; enrolled: string; retained: string };
type RecoveryWeekRow = { week: string; fired: string; recovered: string };

export default async function ExecSummaryPrint() {
  const user = await requireUser();
  const metrics = await getClinicMetrics(user.clinicId);

  const retentionTrend = await query<WeekRow>(
    `with weeks as (
       select generate_series(
         date_trunc('week', now() - interval '11 weeks'),
         date_trunc('week', now()),
         interval '1 week'
       )::date as wk
     )
     select
       to_char(weeks.wk, 'YYYY-MM-DD') as week,
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

  const recoverySuccess = await query<RecoveryWeekRow>(
    `with weeks as (
       select generate_series(
         date_trunc('week', now() - interval '11 weeks'),
         date_trunc('week', now()),
         interval '1 week'
       )::date as wk
     )
     select
       to_char(weeks.wk, 'YYYY-MM-DD') as week,
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

  const recByWeek = new Map<string, { fired: number; recovered: number }>();
  for (const r of recoverySuccess) {
    recByWeek.set(r.week, {
      fired: parseInt(r.fired),
      recovered: parseInt(r.recovered),
    });
  }

  const weekly = retentionTrend.map((t) => {
    const e = parseInt(t.enrolled);
    const r = parseInt(t.retained);
    const retPct = e > 0 ? Math.round((r / e) * 100) : 100;
    const rec = recByWeek.get(t.week) ?? { fired: 0, recovered: 0 };
    const recPct = rec.fired > 0 ? Math.round((rec.recovered / rec.fired) * 100) : 0;
    return { week: t.week, enrolled: e, retained: r, retPct, recPct };
  });

  const totalActive = metrics.active + metrics.flagged;
  const riskTotal = Math.max(1, metrics.healthy + metrics.monitor + metrics.urgent);
  const goodPct = (metrics.healthy / riskTotal) * 100;
  const warnPct = (metrics.monitor / riskTotal) * 100;
  const urgentPct = (metrics.urgent / riskTotal) * 100;

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const deltaSymbol =
    metrics.retentionDeltaPct > 0 ? '↑' : metrics.retentionDeltaPct < 0 ? '↓' : '→';

  return (
    <PrintShell>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div className="print-hint">Ctrl/⌘+P to save as PDF</div>
      <div className="page">
        <header className="brand">
          <h1>MyAdherix · Executive Summary</h1>
          <div className="meta">
            <div className="clinic">{user.clinicName}</div>
            <div>Period: last 30 days · Generated {today}</div>
          </div>
        </header>

        <div className="headline-row">
          <div className="headline-tile primary">
            <div className="label">Revenue Protected</div>
            <div className="value">
              ${metrics.revenueProtected30d.toLocaleString()}
            </div>
            <div className="sub">
              {metrics.revenueProtectedIsModeled ? 'projected' : 'modeled'} · last 30d
            </div>
          </div>
          <div className="headline-tile">
            <div className="label">Retention Rate</div>
            <div className="value">{metrics.retentionRate}%</div>
            <div className="sub">
              {deltaSymbol} {Math.abs(metrics.retentionDeltaPct)}% vs 30d ago
            </div>
          </div>
          <div className="headline-tile">
            <div className="label">Patients Recovered</div>
            <div className="value">{metrics.recoveredThisMonth}</div>
            <div className="sub">this month · {metrics.recoveredThisWeek} this week</div>
          </div>
          <div className="headline-tile">
            <div className="label">Avg Program Duration</div>
            <div className="value">{metrics.avgMonthsOnProgram}</div>
            <div className="sub">months on program</div>
          </div>
        </div>

        <h2 className="section">Operations</h2>
        <div className="headline-row">
          <div className="headline-tile">
            <div className="label">Active patients</div>
            <div className="value">{totalActive}</div>
            <div className="sub">{metrics.active} active · {metrics.flagged} flagged</div>
          </div>
          <div className="headline-tile">
            <div className="label">Response Rate</div>
            <div className="value">{metrics.responseRatePct}%</div>
            <div className="sub">inbound vs outbound</div>
          </div>
          <div className="headline-tile">
            <div className="label">Staff Hours Saved</div>
            <div className="value">{metrics.staffHoursSaved30d}</div>
            <div className="sub">automated outreach · 30d</div>
          </div>
          <div className="headline-tile">
            <div className="label">Need staff outreach</div>
            <div className="value">{metrics.needStaffOutreach}</div>
            <div className="sub">flagged or drifting</div>
          </div>
        </div>

        <h2 className="section">Risk distribution</h2>
        <div className="risk-bar">
          <div className="risk-good"    style={{ width: `${goodPct}%` }} />
          <div className="risk-warn"    style={{ width: `${warnPct}%` }} />
          <div className="risk-urgent"  style={{ width: `${urgentPct}%` }} />
        </div>
        <div className="risk-legend">
          <span className="good">Healthy {metrics.healthy}</span>
          <span className="warn">Monitor {metrics.monitor}</span>
          <span className="urgent">Urgent {metrics.urgent}</span>
        </div>

        <h2 className="section">12-week trend</h2>
        <table className="rows">
          <thead>
            <tr>
              <th>Week</th>
              <th className="num">Enrolled</th>
              <th className="num">Retained</th>
              <th className="num">Retention</th>
              <th className="num">Recovery rate</th>
            </tr>
          </thead>
          <tbody>
            {weekly.map((w) => (
              <tr key={w.week}>
                <td>{w.week}</td>
                <td className="num">{w.enrolled}</td>
                <td className="num">{w.retained}</td>
                <td className="num">{w.retPct}%</td>
                <td className="num">{w.recPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="footer-note">
          <strong>About these numbers.</strong> Retention counts patients whose
          status is not <em>churned</em>. Recovery rate is the share of
          triggered drift signals that produced an inbound reply within 7 days.
          Revenue Protected is modeled, not billed — see the Recovery Ledger
          for per-patient attribution.
        </div>
      </div>
    </PrintShell>
  );
}
