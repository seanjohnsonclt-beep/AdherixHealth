import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { findPhase } from '@/lib/config';
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
};

type RetentionMetrics = {
  total: string;
  retained: string;
  churned: string;
  at_risk: string;
  recovered: string;
};

function riskLevel(score: number, status: string): 'high' | 'medium' | 'low' {
  if (status === 'churned') return 'high';
  if (score >= 70) return 'low';
  if (score >= 40) return 'medium';
  return 'high';
}

function riskLabel(score: number, status: string): string {
  if (status === 'churned') return 'Churned';
  const r = riskLevel(score, status);
  if (r === 'high') return 'High Risk';
  if (r === 'medium') return 'At Risk';
  return 'On Track';
}

function maskPhone(p: string): string {
  if (p.length < 4) return p;
  return `••• ••• ${p.slice(-4)}`;
}

// Map phase IDs to clinical stage names
const CLINICAL_STAGES: Record<number, string> = {
  0: 'Initiation',
  1: 'Dose Stabilization',
  2: 'Adherence Building',
  3: 'Risk Window',
  4: 'Taper Management',
  5: 'Maintenance',
};

export default async function HomePage() {
  const user = await requireUser();

  // Main patient query with inline engagement scoring
  const patients = await query<PatientRow>(
    `SELECT
       p.id, p.first_name, p.phone, p.current_phase, p.status,
       p.enrolled_at, p.last_inbound_at,
       ROUND(EXTRACT(EPOCH FROM (NOW() - p.enrolled_at)) / 86400)::int AS days_enrolled,
       CASE
         WHEN p.status = 'churned'                                          THEN 0
         WHEN p.last_inbound_at IS NULL                                     THEN 12
         WHEN NOW() - p.last_inbound_at < INTERVAL '24 hours'               THEN 95
         WHEN NOW() - p.last_inbound_at < INTERVAL '2 days'                 THEN 80
         WHEN NOW() - p.last_inbound_at < INTERVAL '5 days'                 THEN 55
         WHEN NOW() - p.last_inbound_at < INTERVAL '7 days'                 THEN 30
         ELSE 10
       END AS engagement_score
     FROM patients p
     WHERE p.clinic_id = $1
     ORDER BY
       CASE
         WHEN p.status = 'churned'                                          THEN 0
         WHEN p.last_inbound_at IS NULL                                     THEN 12
         WHEN NOW() - p.last_inbound_at < INTERVAL '24 hours'               THEN 95
         WHEN NOW() - p.last_inbound_at < INTERVAL '2 days'                 THEN 80
         WHEN NOW() - p.last_inbound_at < INTERVAL '5 days'                 THEN 55
         WHEN NOW() - p.last_inbound_at < INTERVAL '7 days'                 THEN 30
         ELSE 10
       END ASC,
       p.last_inbound_at DESC NULLS LAST`,
    [user.clinicId]
  );

  // Retention metrics
  const [metrics] = await query<RetentionMetrics>(
    `SELECT
       COUNT(*)                                                                          AS total,
       COUNT(*) FILTER (WHERE status IN ('active','flagged'))                           AS retained,
       COUNT(*) FILTER (WHERE status = 'churned')                                       AS churned,
       COUNT(*) FILTER (
         WHERE status != 'churned'
           AND (last_inbound_at IS NULL OR NOW() - last_inbound_at > INTERVAL '5 days')
       )                                                                                AS at_risk,
       COUNT(DISTINCT p2.id) FILTER (WHERE p2.id IS NOT NULL)                          AS recovered
     FROM patients p
     LEFT JOIN LATERAL (
       SELECT p3.id FROM patients p3
       WHERE p3.id = p.id
         AND p3.status = 'active'
         AND p3.last_inbound_at > NOW() - INTERVAL '14 days'
         AND EXISTS (
           SELECT 1 FROM trigger_firings tf
           WHERE tf.patient_id = p3.id
             AND tf.trigger_key IN ('no_response_48h','no_response_5d')
             AND tf.fired_at < p3.last_inbound_at
         )
       LIMIT 1
     ) p2 ON TRUE
     WHERE p.clinic_id = $1`,
    [user.clinicId]
  );

  const total = parseInt(metrics?.total ?? '0');
  const retained = parseInt(metrics?.retained ?? '0');
  const atRisk = parseInt(metrics?.at_risk ?? '0');
  const recovered = parseInt(metrics?.recovered ?? '0');
  const retentionRate = total > 0 ? Math.round((retained / total) * 100) : 0;

  return (
    <div className="shell">
      <Topbar clinicName={user.clinicName} email={user.email} />

      {/* Retention KPIs */}
      <div className="stat-row">
        <div className="stat">
          <div className="num">{retentionRate}%</div>
          <div className="lbl">Retention Rate</div>
        </div>
        <div className="stat">
          <div className="num">{total}</div>
          <div className="lbl">Enrolled</div>
        </div>
        <div className={`stat ${atRisk > 0 ? 'flagged' : ''}`}>
          <div className="num">{atRisk}</div>
          <div className="lbl">At-Risk</div>
        </div>
        <div className={`stat ${recovered > 0 ? 'recovered' : ''}`}>
          <div className="num">{recovered}</div>
          <div className="lbl">Recovered</div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2>Patients</h2>
          <Link href="/patients/new" className="btn">Enroll patient</Link>
        </div>

        {patients.length === 0 ? (
          <div className="empty">
            <div className="num">No patients yet</div>
            <p style={{ marginTop: 12 }}>Enroll one to start the behavior loop.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Clinical Stage</th>
                <th>Engagement</th>
                <th>Risk Level</th>
                <th>Days Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                const score = Number(p.engagement_score);
                const risk = riskLevel(score, p.status);
                const stageName = CLINICAL_STAGES[p.current_phase] ?? findPhase(p.current_phase)?.name ?? '—';

                return (
                  <tr key={p.id}>
                    <td className="name">
                      <Link href={`/patients/${p.id}`}>{p.first_name || '—'}</Link>
                    </td>
                    <td className="mono">{maskPhone(p.phone)}</td>
                    <td>
                      <span className="stage-label">
                        <span className="muted small" style={{ marginRight: 4 }}>Ph {p.current_phase}</span>
                        {stageName}
                      </span>
                    </td>
                    <td>
                      <div className="engagement-cell">
                        <div className="engagement-bar-wrap">
                          <div
                            className={`engagement-bar engagement-bar--${risk}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="engagement-score">{score}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`pill risk-${risk}`}>
                        {riskLabel(score, p.status)}
                      </span>
                    </td>
                    <td className="mono small muted">{p.days_enrolled}d</td>
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
