// Executive summary — one CSV with the top-line metrics followed by
// 12 weeks of retention + recovery trend rows.
//
// Layout:
//   section,metric,value
//   headline,retention_rate,84
//   headline,revenue_protected_usd,14280
//   ...
//   trend,week_start,retention_pct,recovery_pct
//   trend,2026-02-02,82,47
//   ...
//
// Designed to paste into a board deck or Google Sheet with minimal fuss.

import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { getClinicMetrics } from '@/lib/metrics';
import { csvFilename } from '@/lib/csv';

export async function GET() {
  const user = await requireUser();
  const metrics = await getClinicMetrics(user.clinicId);

  // Retention trend last 12 weeks
  const retentionTrend = await query<{ week: string; enrolled: string; retained: string }>(
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

  // Recovery success last 12 weeks
  const recoverySuccess = await query<{ week: string; fired: string; recovered: string }>(
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

  // Build the CSV manually so we can have two sub-tables in one file
  const lines: string[] = [];
  lines.push('Clinic summary — generated ' + new Date().toISOString());
  lines.push('Clinic,' + JSON.stringify(user.clinicName));
  lines.push('');
  lines.push('section,metric,value');
  lines.push('headline,active_patients,' + (metrics.active + metrics.flagged));
  lines.push('headline,retention_rate_pct,' + metrics.retentionRate);
  lines.push('headline,retention_delta_pct,' + metrics.retentionDeltaPct);
  lines.push('headline,patients_recovered_this_month,' + metrics.recoveredThisMonth);
  lines.push('headline,patients_recovered_this_week,' + metrics.recoveredThisWeek);
  lines.push('headline,revenue_protected_usd,' + metrics.revenueProtected30d);
  lines.push('headline,revenue_protected_is_projected,' + metrics.revenueProtectedIsModeled);
  lines.push('headline,drifting_now,' + metrics.driftingNow);
  lines.push('headline,need_staff_outreach,' + metrics.needStaffOutreach);
  lines.push('headline,avg_months_on_program,' + metrics.avgMonthsOnProgram);
  lines.push('headline,response_rate_pct,' + metrics.responseRatePct);
  lines.push('headline,staff_hours_saved_30d,' + metrics.staffHoursSaved30d);
  lines.push('headline,outbound_sent_30d,' + metrics.outboundSent30d);
  lines.push('headline,inbound_received_30d,' + metrics.inboundReceived30d);
  lines.push('risk,healthy,' + metrics.healthy);
  lines.push('risk,monitor,' + metrics.monitor);
  lines.push('risk,urgent,' + metrics.urgent);
  lines.push('');
  lines.push('trend,week_start,retention_pct,recovery_pct');

  const recByWeek = new Map<string, { fired: number; recovered: number }>();
  for (const r of recoverySuccess) {
    recByWeek.set(r.week, {
      fired: parseInt(r.fired),
      recovered: parseInt(r.recovered),
    });
  }

  for (const t of retentionTrend) {
    const e = parseInt(t.enrolled);
    const r = parseInt(t.retained);
    const retPct = e > 0 ? Math.round((r / e) * 100) : 100;
    const rec = recByWeek.get(t.week) ?? { fired: 0, recovered: 0 };
    const recPct = rec.fired > 0 ? Math.round((rec.recovered / rec.fired) * 100) : 0;
    lines.push(`trend,${t.week},${retPct},${recPct}`);
  }

  const csv = lines.join('\r\n') + '\r\n';

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${csvFilename('exec-summary', user.clinicName)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
