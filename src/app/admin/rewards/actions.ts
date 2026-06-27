'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

/**
 * Mark a reward as fulfilled for a Quest patient.
 * Resets quest_monthly_xp to 0 (total XP is untouched).
 * Logs a reward_fulfilled event for the audit trail.
 */
export async function fulfillRewardAction(formData: FormData) {
  const user = await requireUser();
  const patientId = formData.get('patientId') as string;
  const tier      = formData.get('tier') as string;

  if (!patientId) return;

  // Security: ensure patient belongs to this clinic
  const patient = await queryOne<{
    id: string;
    clinic_id: string;
    quest_monthly_xp: number;
    quest_reward_category: string | null;
    first_name: string | null;
  }>(
    `SELECT id, clinic_id, COALESCE(quest_monthly_xp, 0) as quest_monthly_xp,
            quest_reward_category, first_name
     FROM patients WHERE id = $1`,
    [patientId]
  );

  if (!patient || patient.clinic_id !== user.clinicId) return;

  const xpFulfilled = patient.quest_monthly_xp;

  // Reset monthly XP
  await query(
    `UPDATE patients SET quest_monthly_xp = 0 WHERE id = $1`,
    [patientId]
  );

  // Log the fulfillment
  await query(
    `INSERT INTO events (patient_id, kind, payload)
     VALUES ($1, 'reward_fulfilled', $2)`,
    [patientId, JSON.stringify({
      tier,
      xp_redeemed:      xpFulfilled,
      reward_category:  patient.quest_reward_category,
      fulfilled_by:     user.email,
      fulfilled_at:     new Date().toISOString(),
    })]
  );

  console.log(
    `[rewards] fulfilled ${tier} for ${patient.first_name ?? patientId} ` +
    `(${xpFulfilled} XP, category: ${patient.quest_reward_category})`
  );

  revalidatePath('/admin/rewards');
}
