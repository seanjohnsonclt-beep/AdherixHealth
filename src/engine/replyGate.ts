// When a patient replies, check if any template is gated on a reply to the
// last outbound template they received. If so, queue it now.
//
// Match logic: find the most recent outbound message for this patient, look
// for any template whose `requires_reply_to` equals that template_key, queue
// it immediately. Dedupe: don't re-queue if we already sent this template.

import { query, queryOne } from '@/lib/db';
import { templates, findTemplate } from '@/lib/config';

const NEGATIVE = new Set(['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'HELP']);

function isAffirmative(body: string): boolean {
  const first = body.trim().split(/\s+/)[0]?.toUpperCase() ?? '';
  if (!first) return false;
  if (NEGATIVE.has(first)) return false;
  return true;
}

export async function handleReplyGate(patientId: string, replyBody: string) {
  if (!isAffirmative(replyBody)) return;

  // Most recent outbound template received by this patient
  const last = await queryOne<{ template_key: string }>(
    `select template_key from messages
     where patient_id = $1 and direction = 'outbound' and template_key is not null
     order by sent_at desc nulls last, created_at desc
     limit 1`,
    [patientId]
  );
  if (!last?.template_key) return;

  // Find templates gated on that key
  const gated = templates().filter((t) => t.requires_reply_to === last.template_key);
  if (gated.length === 0) return;

  // Get patient first name for merge
  const patient = await queryOne<{ first_name: string | null }>(
    `select first_name from patients where id = $1`,
    [patientId]
  );

  for (const t of gated) {
    // Dedupe: skip if we already queued/sent this template for this patient
    const existing = await queryOne(
      `select 1 from messages where patient_id = $1 and template_key = $2 limit 1`,
      [patientId, t.key]
    );
    if (existing) continue;

    const body = t.body.trim().replace(/\{(\w+)\}/g, (_, k) =>
      k === 'first_name' ? (patient?.first_name ?? 'there') : ''
    );

    await query(
      `insert into messages (patient_id, direction, template_key, body, scheduled_for, status)
       values ($1, 'outbound', $2, $3, now(), 'pending')`,
      [patientId, t.key, body]
    );

    console.log(`[reply-gate] queued ${t.key} for ${patientId}`);
  }
}
