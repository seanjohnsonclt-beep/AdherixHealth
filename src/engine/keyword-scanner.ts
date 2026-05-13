// Keyword scanner for inbound SMS.
//
// Scans every patient reply for uncertainty and friction signals.
// Sets flags on the patient row (side_effect_flag, dose_missed_flag) that the
// drift correction engine reads on the next tick.
//
// Also detects CALL/HELP escalation keywords for immediate clinic escalation.
//
// Logs every scan to inbound_scan_log (internal audit).
// Queues keyword_review_queue rows when new matches are found (for keyword evolution).

import { query } from '@/lib/db';

// --- Keyword lists (per handoff spec §11) -------------------------------------
// Edit these lists to expand detection coverage.
// Changes here are picked up immediately  -  no migration needed.

const UNCERTAINTY_KEYWORDS: string[] = [
  'nauseous', 'nausea', 'queasy', 'dizzy', 'headache', 'tired', 'exhausted',
  'fatigue', 'vomit', 'throwing up', 'sick', 'feel weird', 'feeling weird',
  'off', 'feel off', 'feeling off', "don't feel like myself", 'not myself',
  'stomach feels off', 'stomach is off', 'food makes me sick',
  "food isn't sitting right", "can't eat", "can't really eat", 'no appetite',
  'not hungry', 'not really hungry', 'full fast', 'get full fast', 'full so fast',
  'backed up', 'constipated', "haven't gone", "can't go", 'bloated', 'bloating',
  'gassy', 'is this normal', 'normal?', 'supposed to feel like this',
  'should i feel', 'is it normal', 'something wrong', "something's wrong",
  'worried', 'concerned', 'scared', 'not sure if', 'taking a break',
  'need a break', 'stopping', 'stopped', 'pausing', 'thinking about stopping',
  'not sure i should continue', 'not working for me', "doesn't seem to be working",
];

const FRICTION_KEYWORDS: string[] = [
  'missed', 'forgot', 'skipped', 'refill', 'pharmacy', 'out of',
  'appointment', 'reschedule', 'cancel', 'what do i do', 'now what',
  'confused', 'help', 'how do i', 'what should i', "don't know what",
];

// Single-word replies that trigger immediate clinic escalation.
// These bypass the 72hr cooldown and escalate open DC events right away.
const ESCALATION_WORDS = new Set(['call', 'help']);

// --- Helpers ------------------------------------------------------------------

function matchKeywords(body: string, keywords: string[]): string[] {
  const lower = body.toLowerCase();
  return keywords.filter(kw => lower.includes(kw.toLowerCase()));
}

/**
 * Returns true if the message body is a bare CALL or HELP reply.
 * Used by the inbound webhook to trigger immediate escalation.
 */
export function isEscalationKeyword(body: string): boolean {
  const first = body.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  return ESCALATION_WORDS.has(first);
}

// --- Main scan ----------------------------------------------------------------

export interface ScanResult {
  uncertaintyMatched: boolean;
  frictionMatched:    boolean;
  matchedKeywords:    string[];
}

/**
 * Scan an inbound message body for behavioral signals.
 *
 * Side effects (when keywords match):
 *   - Sets side_effect_flag / dose_missed_flag on patients row
 *   - Inserts into inbound_scan_log (always)
 *   - Inserts into keyword_review_queue (only on matches)
 *
 * @param patientId  UUID of the patient who sent the message
 * @param clinicId   UUID of the clinic (for keyword_review_queue)
 * @param body       Raw SMS body text
 */
export async function scanInbound(
  patientId: string,
  clinicId:  string,
  body:      string,
): Promise<ScanResult> {
  const uncertaintyMatches = matchKeywords(body, UNCERTAINTY_KEYWORDS);
  const frictionMatches    = matchKeywords(body, FRICTION_KEYWORDS);
  const allMatches         = [...uncertaintyMatches, ...frictionMatches];

  const uncertaintyMatched = uncertaintyMatches.length > 0;
  const frictionMatched    = frictionMatches.length > 0;

  // Always log the scan
  await query(
    `insert into inbound_scan_log
       (patient_id, body_raw, uncertainty_matched, friction_matched, matched_keywords)
     values ($1, $2, $3, $4, $5)`,
    [patientId, body, uncertaintyMatched, frictionMatched, allMatches],
  );

  if (uncertaintyMatched || frictionMatched) {
    // Set behavioral flags  -  drift-correction.ts reads these next tick
    await query(
      `update patients set
         side_effect_flag = side_effect_flag OR $2,
         dose_missed_flag = dose_missed_flag OR $3
       where id = $1`,
      [patientId, uncertaintyMatched, frictionMatched],
    );

    // Queue for human review (clinic admin can evolve keyword lists from this)
    await query(
      `insert into keyword_review_queue
         (patient_id, clinic_id, message_body, patient_phase, patient_trajectory)
       select $1, $2, $3, p.current_phase, p.engagement_trajectory
       from patients p
       where p.id = $1`,
      [patientId, clinicId, body],
    );

    console.log(
      `[DC] keyword match [${allMatches.join(', ')}]  -  patient ${patientId}` +
      (uncertaintyMatched ? ' side_effect_flag=true' : '') +
      (frictionMatched    ? ' dose_missed_flag=true' : ''),
    );
  }

  return { uncertaintyMatched, frictionMatched, matchedKeywords: allMatches };
}
