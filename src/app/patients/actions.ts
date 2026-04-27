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

  // Adherence fields — optional
  const medication     = String(formData.get('medication') || '').trim() || undefined;
  const startingDose   = String(formData.get('starting_dose') || '').trim() || undefined;
  const supplyRaw      = String(formData.get('supply_quantity') || '').trim();
  const supplyQuantity = supplyRaw ? parseInt(supplyRaw, 10) || undefined : undefined;

  const id = await enrollPatient({
    clinicId: user.clinicId,
    phone,
    firstName,
    medication,
    startingDose,
    supplyQuantity,
  });

  revalidatePath('/');
  redirect(`/patients/${id}`);
}

async function assertPatientInClinic(patientId: string, clinicId: string) {
  const row = await queryOne(
    `select 1 from patients where id = $1 and clinic_id = $2`,
    [patientId, clinicId]
  );
  if (!row) redirect('/dashboard');
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

// Edit: update first name and/or phone for a patient.
export async function updatePatientAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('patient_id') || '');
  await assertPatientInClinic(id, user.clinicId);

  const firstName = String(formData.get('first_name') || '').trim() || null;
  const rawPhone  = String(formData.get('phone') || '').trim();
  const phone = rawPhone ? normalizePhone(rawPhone) : null;

  if (firstName !== null) {
    await query(`update patients set first_name = $1 where id = $2`, [firstName || null, id]);
  }
  if (phone && phone.length >= 10) {
    // Make sure the new number isn't already enrolled at this clinic
    const conflict = await queryOne(
      `select id from patients where clinic_id = $1 and phone = $2 and id != $3`,
      [user.clinicId, phone, id]
    );
    if (!conflict) {
      await query(`update patients set phone = $1 where id = $2`, [phone, id]);
    }
  }

  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'patient_updated', $2)`,
    [id, JSON.stringify({ by: 'clinic_admin' })]
  );

  revalidatePath(`/patients/${id}`);
  redirect(`/patients/${id}`);
}

// Pause: temporary stop — scheduled messages wait, triggers don't evaluate,
// but nothing is deleted. Use for patients on vacation or mid-gap in care.
export async function pausePatientAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('patient_id') || '');
  await assertPatientInClinic(id, user.clinicId);

  await query(`update patients set status = 'paused' where id = $1`, [id]);
  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'paused', $2)`,
    [id, JSON.stringify({ by: 'clinic_admin' })]
  );

  revalidatePath(`/patients/${id}`);
  revalidatePath('/');
}

// Resume: paused → active. Any pending messages whose scheduled_for is in the
// past will fire on the next tick (intentional — we kept them warm on purpose).
export async function resumePatientAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('patient_id') || '');
  await assertPatientInClinic(id, user.clinicId);

  await query(`update patients set status = 'active' where id = $1`, [id]);
  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'resumed', $2)`,
    [id, JSON.stringify({ by: 'clinic_admin' })]
  );

  revalidatePath(`/patients/${id}`);
  revalidatePath('/');
}

// Reactivate: churned → active. Doesn't re-queue the phase plan (those were
// cancelled on discharge). Clinic can manually advance or re-enroll if needed.
export async function reactivatePatientAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('patient_id') || '');
  await assertPatientInClinic(id, user.clinicId);

  await query(`update patients set status = 'active' where id = $1`, [id]);
  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'reactivated', $2)`,
    [id, JSON.stringify({ by: 'clinic_admin' })]
  );

  revalidatePath(`/patients/${id}`);
  revalidatePath('/');
}

// Discharge: marks churned + cancels pending messages. Keeps record for reporting.
export async function dischargePatientAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('patient_id') || '');
  await assertPatientInClinic(id, user.clinicId);

  await query(`update patients set status = 'churned' where id = $1`, [id]);
  await query(
    `update messages set status = 'cancelled' where patient_id = $1 and status = 'pending'`,
    [id]
  );
  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'discharged', $2)`,
    [id, JSON.stringify({ by: 'clinic_admin' })]
  );

  revalidatePath('/');
  redirect('/dashboard');
}

// Remove: hard deletes the patient and all associated data. Use for test patients.
export async function removePatientAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get('patient_id') || '');
  await assertPatientInClinic(id, user.clinicId);

  // Cascade handles messages, events, trigger_firings
  await query(`delete from patients where id = $1 and clinic_id = $2`, [id, user.clinicId]);

  revalidatePath('/');
  redirect('/dashboard');
}
