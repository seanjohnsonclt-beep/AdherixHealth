// Recovery ledger — the list of patients recovered from drift, with
// modeled revenue protected per patient. This is the artifact a clinic
// uses to justify renewing Adherix at the end of their billing cycle.

import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { toCsv, csvFilename } from '@/lib/csv';
import {
  MONTHLY_PATIENT_VALUE,
  CHURN_PROBABILITY_WITHOUT_INTERVENTION,
  PROTECTED_MONTHS_PROJECTION,
} from '@/lib/metrics';

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

export async function GET() {
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

  // Dollar value protected per recovery — must match metrics.ts formula
  // so the sum of this column equals the homepage Revenue Protected figure.
  const perRecoveryUsd = Math.round(
    MONTHLY_PATIENT_VALUE *
      CHURN_PROBABILITY_WITHOUT_INTERVENTION *
      PROTECTED_MONTHS_PROJECTION
  );

  const csvRows = recoveries.map((r) => ({
    patient_name: r.first_name ?? '',
    phone: r.phone,
    phase: `${r.current_phase}. ${PHASE_NAMES[r.current_phase] ?? ''}`,
    trigger: r.trigger_key,
    drift_detected_at: new Date(r.fired_at).toISOString().slice(0, 10),
    replied_at: new Date(r.last_inbound_at).toISOString().slice(0, 10),
    days_to_recover: r.days_to_recover,
    revenue_protected_usd: perRecoveryUsd,
    formula_note:
      `${MONTHLY_PATIENT_VALUE} monthly × ${CHURN_PROBABILITY_WITHOUT_INTERVENTION} churn × ${PROTECTED_MONTHS_PROJECTION} months`,
  }));

  const csv = toCsv(csvRows, [
    'patient_name',
    'phone',
    'phase',
    'trigger',
    'drift_detected_at',
    'replied_at',
    'days_to_recover',
    'revenue_protected_usd',
    'formula_note',
  ]);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${csvFilename('recovery-ledger', user.clinicName)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
