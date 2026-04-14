import { query, queryOne } from '@/lib/db';
import { schedulePhaseMessages } from './scheduler';

export type EnrollArgs = {
  clinicId: string;
  phone: string;          // E.164
  firstName?: string;
};

export async function enrollPatient({ clinicId, phone, firstName }: EnrollArgs): Promise<string> {
  // Idempotent on (clinic_id, phone)
  const existing = await queryOne<{ id: string }>(
    `select id from patients where clinic_id = $1 and phone = $2`,
    [clinicId, phone]
  );
  if (existing) return existing.id;

  const row = await queryOne<{ id: string }>(
    `insert into patients (clinic_id, phone, first_name, current_phase, phase_started_at)
     values ($1, $2, $3, 0, now())
     returning id`,
    [clinicId, phone, firstName ?? null]
  );
  if (!row) throw new Error('Failed to insert patient');

  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'enrolled', $2)`,
    [row.id, JSON.stringify({ phone_last4: phone.slice(-4) })]
  );

  await schedulePhaseMessages(row.id, 0);
  return row.id;
}
