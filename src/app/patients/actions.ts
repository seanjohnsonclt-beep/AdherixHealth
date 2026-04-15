'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { enrollPatient } from '@/engine/enroll';
import { advancePhase } from '@/engine/scheduler';

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

export async function enrollPatientAction(formData: FormData) {
  const user = await requireUser();
  const phone = normalizePhone(String(formData.get('phone') || ''));
  const firstName = String(formData.get('first_name') || '').trim() || undefined;

  if (!phone || phone.length < 10) {
    redirect('/patients/new?error=invalid_phone');
  }

  const id = await enrollPatient({
    clinicId: user.clinicId,
    phone,
    firstName,
  });

  revalidatePath('/');
  redirect(`/patients/${id}`);
}

async function assertPatientInClinic(patientId: string, clinicId: string) {
  const row = await queryOne(
    `select 1 from patients where id = $1 and clinic_id = $2`,
    [patientId, clinicId]
  );
  if (!row) redirect('/');
}

export async function advancePhaseAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('patient_id') || '');
  await assertPatientInClinic(id, user.clinicId);
  await advancePhase(id);
  revalidatePath(`/patients/${id}`);
}

export async function toggleFlagAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('patient_id') || '');
  await assertPatientInClinic(id, user.clinicId);

  const current = await queryOne<{ status: string }>(
    `select status from patients where id = $1`,
    [id]
  );
  const next = current?.status === 'flagged' ? 'active' : 'flagged';

  await query(`update patients set status = $1 where id = $2`, [next, id]);
  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'manual_flag_toggle', $2)`,
    [id, JSON.stringify({ from: current?.status, to: next })]
  );

  revalidatePath(`/patients/${id}`);
}
