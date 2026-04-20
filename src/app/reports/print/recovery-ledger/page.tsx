// Recovery Ledger — printable PDF version.
// Same data + dollar math as /api/export/recovery-ledger, laid out as a
// one-page (or multi-page) board-ready document. Auto-prints on load.

import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import {
  MONTHLY_PATIENT_VALUE,
  CHURN_PROBABILITY_WITHOUT_INTERVENTION,
  PROTECTED_MONTHS_PROJECTION,
} from '@/lib/metrics';
import { PrintShell } from '../_components/PrintShell';
import { PRINT_CSS } from '../_components/printStyles';

export const dynamic = 'force-dynamic';

const PHASE_NAMES: Record<number, string> = {
  0: 'Initiation',
  1: 'Dose Stabilization',
  2: 'Adherence Building',
  3: 'Risk Window',
  4: 'Taper Management',
  5: 'Maintenance',
};

type Row = {
  first_name: string | null;
  phone: string;
  current_phase: number;
  trigger_key: string;
  fired_at: Date;
  last_inbound_at: Date;
  days_to_recover: string;
};

function maskPhone(p: string): string {
  if (!p || p.length < 4) return p;
  return `••• ••• ${p.slice(-4)}`;
}

function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function RecoveryLedgerPrint() {
  const user = await requireUser();

  const recoveries = await query<Row>(
    `select
       p.first_name,
       p.phone,
       p.current_phase,
       tf.trigger_key,
       tf.fired_at,
       p.last_inbound_at,
       round(extract(epoch from (p.last_inbound_at - tf.fired_at)) / 86400)::text
         as days_to_recover
     from patients p
     join trigger_firings tf on tf.patient_id = p.id
     where p.clinic_id = $1
       and p.status = 'active'
       and p.last_inbound_at is not null
       and tf.trigger_key in ('no_response_48h','no_response_5d')
       and tf.fired_at < p.last_inbound_at
       and p.last_inbound_at > now() - interval '30 days'
     order by p.last_inbound_at desc`,
    [user.clinicId]
  );

  const perRecoveryUsd = Math.round(
    MONTHLY_PATIENT_VALUE *
      CHURN_PROBABILITY_WITHOUT_INTERVENTION *
      PROTECTED_MONTHS_PROJECTION
  );
  const totalProtected = perRecoveryUsd * recoveries.length;
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - 30);

  return (
    <PrintShell>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div className="print-hint">Ctrl/⌘+P to save as PDF</div>
      <div className="page">
        <header className="brand">
          <h1>Adherix<sup>℞</sup> · Recovery Ledger</h1>
          <div className="meta">
            <div className="clinic">{user.clinicName}</div>
            <div>Period: last 30 days · Generated {today}</div>
          </div>
        </header>

        <div className="headline-row">
          <div className="headline-tile primary">
            <div className="label">Revenue Protected</div>
            <div className="value">${totalProtected.toLocaleString()}</div>
            <div className="sub">modeled · last 30 days</div>
          </div>
          <div className="headline-tile">
            <div className="label">Patients Recovered</div>
            <div className="value">{recoveries.length}</div>
            <div className="sub">drift → re-engagement</div>
          </div>
          <div className="headline-tile">
            <div className="label">Per Recovery</div>
            <div className="value">${perRecoveryUsd}</div>
            <div className="sub">modeled value</div>
          </div>
          <div className="headline-tile">
            <div className="label">Avg Days to Recover</div>
            <div className="value">
              {recoveries.length > 0
                ? Math.round(
                    recoveries.reduce(
                      (sum, r) => sum + parseInt(r.days_to_recover || '0'),
                      0
                    ) / recoveries.length
                  )
                : 0}
            </div>
            <div className="sub">from drift to reply</div>
          </div>
        </div>

        <h2 className="section">Recovered patients</h2>

        {recoveries.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--fg-muted)' }}>
            No recoveries logged in this period.
          </p>
        ) : (
          <table className="rows">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phone</th>
                <th>Phase</th>
                <th>Trigger</th>
                <th>Drift detected</th>
                <th>Replied</th>
                <th className="num">Days to recover</th>
                <th className="num">Revenue protected</th>
              </tr>
            </thead>
            <tbody>
              {recoveries.map((r, i) => (
                <tr key={i}>
                  <td>{r.first_name ?? '—'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>
                    {maskPhone(r.phone)}
                  </td>
                  <td>
                    {r.current_phase}.{' '}
                    {PHASE_NAMES[r.current_phase] ?? ''}
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--fg-muted)' }}>
                    {r.trigger_key.replace(/_/g, ' ')}
                  </td>
                  <td>{fmtDate(r.fired_at)}</td>
                  <td>{fmtDate(r.last_inbound_at)}</td>
                  <td className="num">{r.days_to_recover}</td>
                  <td className="num money">
                    ${perRecoveryUsd.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={7} style={{ textAlign: 'right', fontWeight: 500 }}>
                  Total
                </td>
                <td className="num money" style={{ fontWeight: 600 }}>
                  ${totalProtected.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        <div className="footer-note">
          <strong>Revenue protected formula.</strong> Each recovered patient is
          credited with ${MONTHLY_PATIENT_VALUE}/mo ×{' '}
          {Math.round(CHURN_PROBABILITY_WITHOUT_INTERVENTION * 100)}% churn
          probability without intervention × {PROTECTED_MONTHS_PROJECTION}{' '}
          months of protected tenure = ${perRecoveryUsd} per recovery. Figures
          are modeled, not billed. Adherix measures recovery as an active drift
          signal followed by an inbound patient reply within 7 days.
        </div>
      </div>
    </PrintShell>
  );
}
