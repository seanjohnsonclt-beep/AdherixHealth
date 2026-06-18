'use server';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';

/**
 * Mark a keyword_review_queue row as reviewed.
 * clinic_id check in WHERE is the security gate — users can only clear their own clinic's rows.
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
