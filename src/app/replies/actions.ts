'use server';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { sendSms } from '@/lib/twilio';

/**
 * Mark a keyword_review_queue row as reviewed.
 * clinic_id check in WHERE is the security gate.
 */
export async function acknowledgeAction(formData: FormData) {
  const user = await requireUser();
  const id = formData.get('id') as string;
  if (!id) return;

  await query(
    `update keyword_review_queue
     set reviewed = true, outcome = 'acknowledged'
     where id = $1 and clinic_id = $2`,
    [id, user.clinicId]
  );

  revalidatePath('/replies');
}

/**
 * Send a staff reply SMS to a patient or guardian.
 * Validates clinic ownership before sending. Logs to messages + events.
 */
export async function replyAction(formData: FormData) {
  const user = await requireUser();
  const patientId = formData.get('patientId') as string;
  const toPhone   = formData.get('toPhone')   as string;
  const body      = (formData.get('body') as string | null)?.trim();

  if (!patientId || !toPhone || !body) throw new Error('Missing fields');

  // Verify patient belongs to this clinic
  const patient = await queryOne<{ id: string; clinic_id: string }>(
    `select id, clinic_id from patients where id = $1`,
    [patientId]
  );
  if (!patient || patient.clinic_id !== user.clinicId) {
    throw new Error('Unauthorized');
  }

  // DRY_RUN: if no Twilio credentials, log and skip the actual send
  const DRY_RUN = !process.env.TWILIO_ACCOUNT_SID || process.env.DRY_RUN === 'true';
  const smsResult = DRY_RUN
    ? { sid: `DRY_REPLY_${Date.now()}` }
    : await sendSms({ to: toPhone, body });

  // Determine if this is a guardian reply based on phone match
  const isGuardian = await queryOne<{ id: string }>(
    `select id from patients where id = $1 and guardian_phone = $2`,
    [patientId, toPhone]
  );

  // Log outbound staff reply to messages table
  await query(
    `insert into messages (patient_id, direction, template_key, body, status, sent_at, twilio_sid)
     values ($1, 'outbound', $2, $3, 'sent', now(), $4)`,
    [
      patientId,
      isGuardian ? 'staff.reply.guardian' : 'staff.reply',
      body,
      smsResult.sid,
    ]
  );

  await query(
    `insert into events (patient_id, kind, payload)
     values ($1, 'staff_reply_sent', $2)`,
    [patientId, JSON.stringify({ to_type: isGuardian ? 'guardian' : 'patient' })]
  );

  revalidatePath('/replies');
}
