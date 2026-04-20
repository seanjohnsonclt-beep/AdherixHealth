// Daily action list — patients the clinic should act on today.
//
// Returns CSV with: name, phone, phase, status, recommended action,
// last reply (days ago), days on program.
//
// Filters to patients where the Recommended Action is something other
// than "No action needed" — flagged, churned, engagement<40, recent
// failed delivery, plateau-risk, or trending down.

import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { toCsv, csvFilename } from '@/lib/csv';

const PHASE_NAMES: Record<number, string> = {
  0: 'Initiation',
  1: 'Dose Stabilization',
  2: 'Adherence Building',
  3: 'Risk Window',
  4: 'Taper Management',
  5: 'Maintenance',
};

type Row = {
  id: string;
  first_name: string | null;
  phone: string;
  current_phase: number;
  status: string;
  last_inbound_at: Date | null;
  days_enrolled: string;
  engagement_score: string;
  engagement_trend: string;
  recent_failed: string;
};

function recommendedAction(p: Row): string {
  const score = Number(p.engagement_score);
  const trend = Number(p.engagement_trend);
  const recentFailed = Number(p.recent_failed);
  if (p.status === 'churned') return 'Win-back campaign';
  if (p.status === 'paused') return '';
  if (recentFailed > 0) return 'Verify delivery';
  if (p.status === 'flagged') return 'Send human outreach';
  if (score < 40) return 'Recover now';
  if (p.current_phase === 3 && score < 70) return 'Plateau intervention';
  if (trend < -15) return 'Monitor — trending down';
  return '';
}

function daysSince(d: Date | null): string {
  if (!d) return '';
  const ms = Date.now() - new Date(d).getTime();
  return String(Math.floor(ms / 86400000));
}

export async function GET() {
  const user = await requireUser();

  const patients = await query<Row>(
    `select
       p.id,
       p.first_name,
       p.phone,
       p.current_phase,
       p.status,
       p.last_inbound_at,
       extract(day from (now() - p.enrolled_at))::text as days_enrolled,

       (case
          when p.last_inbound_at is null then '12'
          when now() - p.last_inbound_at < interval '1 day'  then '95'
          when now() - p.last_inbound_at < interval '2 days' then '80'
          when now() - p.last_inbound_at < interval '3 days' then '62'
          when now() - p.last_inbound_at < interval '5 days' then '42'
          when now() - p.last_inbound_at < interval '7 days' then '28'
          else '15'
        end)::text as engagement_score,

       coalesce((
         select case
           when count(*) filter (where m.created_at > now() - interval '7 days') = 0 then 0
           when count(*) filter (where m.created_at > now() - interval '14 days' and m.created_at <= now() - interval '7 days') = 0 then 10
           else
             round(((count(*) filter (where m.created_at > now() - interval '7 days')::float
               - count(*) filter (where m.created_at > now() - interval '14 days' and m.created_at <= now() - interval '7 days')::float)
             / nullif(count(*) filter (where m.created_at > now() - interval '14 days' and m.created_at <= now() - interval '7 days'), 0)) * 100)::int
         end
         from messages m
         where m.patient_id = p.id and m.direction = 'inbound'
       ), 0)::text as engagement_trend,

       coalesce((
         select count(*)::int
         from messages m
         where m.patient_id = p.id and m.status = 'failed' and m.created_at > now() - interval '7 days'
       ), 0)::text as recent_failed
     from patients p
     where p.clinic_id = $1
     order by
       case p.status when 'flagged' then 0 when 'active' then 1 else 2 end,
       p.last_inbound_at asc nulls first`,
    [user.clinicId]
  );

  // Filter to actionable rows only
  const csvRows = patients
    .map((p) => ({ p, action: recommendedAction(p) }))
    .filter((r) => r.action !== '')
    .map((r) => ({
      patient_name: r.p.first_name ?? '',
      phone: r.p.phone,
      phase: `${r.p.current_phase}. ${PHASE_NAMES[r.p.current_phase] ?? ''}`,
      status: r.p.status,
      recommended_action: r.action,
      engagement_score: r.p.engagement_score,
      last_reply_days_ago: daysSince(r.p.last_inbound_at),
      days_on_program: r.p.days_enrolled,
    }));

  const csv = toCsv(csvRows, [
    'patient_name',
    'phone',
    'phase',
    'status',
    'recommended_action',
    'engagement_score',
    'last_reply_days_ago',
    'days_on_program',
  ]);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${csvFilename('action-list', user.clinicName)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
