// Full patient roster — every patient in the clinic, for EMR/CRM imports.

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
  first_name: string | null;
  phone: string;
  current_phase: number;
  status: string;
  enrolled_at: Date;
  phase_started_at: Date | null;
  last_inbound_at: Date | null;
  timezone: string | null;
  messages_sent: string;
  messages_received: string;
};

export async function GET() {
  const user = await requireUser();

  const patients = await query<Row>(
    `select
       p.first_name,
       p.phone,
       p.current_phase,
       p.status,
       p.enrolled_at,
       p.phase_started_at,
       p.last_inbound_at,
       p.timezone,
       coalesce(ms.sent, 0)::text     as messages_sent,
       coalesce(ms.received, 0)::text as messages_received
     from patients p
     left join lateral (
       select
         count(*) filter (where direction = 'outbound' and status = 'sent') as sent,
         count(*) filter (where direction = 'inbound')                      as received
       from messages where patient_id = p.id
     ) ms on true
     where p.clinic_id = $1
     order by p.enrolled_at desc`,
    [user.clinicId]
  );

  const csvRows = patients.map((p) => ({
    first_name: p.first_name ?? '',
    phone: p.phone,
    phase: `${p.current_phase}. ${PHASE_NAMES[p.current_phase] ?? ''}`,
    status: p.status,
    enrolled_at: p.enrolled_at ? new Date(p.enrolled_at).toISOString().slice(0, 10) : '',
    phase_started_at: p.phase_started_at
      ? new Date(p.phase_started_at).toISOString().slice(0, 10)
      : '',
    last_reply_at: p.last_inbound_at
      ? new Date(p.last_inbound_at).toISOString().slice(0, 10)
      : '',
    timezone: p.timezone ?? '',
    messages_sent: p.messages_sent,
    messages_received: p.messages_received,
  }));

  const csv = toCsv(csvRows, [
    'first_name',
    'phone',
    'phase',
    'status',
    'enrolled_at',
    'phase_started_at',
    'last_reply_at',
    'timezone',
    'messages_sent',
    'messages_received',
  ]);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${csvFilename('roster', user.clinicName)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
