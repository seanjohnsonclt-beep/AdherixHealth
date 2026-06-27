// Single tick of the engine. Called by:
//   - workers/loop.ts (local dev  -  runs in a setInterval loop)
//   - a Vercel cron job (production  -  hits /api/cron/tick)
//   - manual: `npm run worker:tick`
//
// Tick order (each step wrapped in try/catch  -  one step failing must not abort the rest):
//   1. updateAllTrajectories()           -  score responsive/inconsistent/declining per patient
//   2. evaluateTriggersForAllPatients()  -  fire if/then rules from config
//   3. runDriftCorrection()              -  diagnose drift pattern, queue correction messages
//   4. runResolutionTracker()            -  resolve or escalate open DC events
//   5. sendDueMessages()                 -  dispatch pending SMS via Twilio
//   6. runWeeklyDigestIfDue()            -  Monday 8-10am digest email to clinic admins
//   7. sendWeeklyBossChallenge()         -  Monday: AI boss challenge SMS to Quest patients (phase 2+)
//   8. runSundayBossCheck()              -  Sunday: complete/fail boss challenges, award/deduct XP

import { evaluateTriggersForAllPatients } from '@/engine/triggers';
import { sendDueMessages }                from '@/engine/sender';
import { updateAllTrajectories }          from '@/engine/trajectory';
import { runDriftCorrection }             from '@/engine/drift-correction';
import { runResolutionTracker }           from '@/engine/dc-resolution-tracker';
import { runWeeklyDigestIfDue }           from '@/workers/digest';
import { sendWeeklyBossChallenge, runSundayBossCheck } from '@/engine/boss-challenge';

export async function tick() {
  const start = Date.now();
  try {

    // Step 1: trajectory scoring
    // Must run before triggers and DC so responsive/inconsistent/declining values
    // are current when pattern detection runs.
    try {
      await updateAllTrajectories();
    } catch (err) {
      // Trajectory failures are non-fatal  -  DC falls back to stored column values.
      console.error('[tick] trajectory update failed (non-fatal):', err);
    }

    // Step 2: trigger evaluation
    await evaluateTriggersForAllPatients();

    // Step 3: drift correction
    // Runs after triggers so any inbound-driven flag changes visible this tick
    // are picked up. DC and triggers write to separate tables  -  no contention.
    try {
      await runDriftCorrection();
    } catch (err) {
      console.error('[tick] drift correction failed (non-fatal):', err);
    }

    // Step 4: resolution tracker
    try {
      await runResolutionTracker();
    } catch (err) {
      console.error('[tick] resolution tracker failed (non-fatal):', err);
    }

    // Step 5: send due messages
    await sendDueMessages();

    // Step 6: weekly digest
    // Short-circuits in ~1ms unless it's Monday 8-10am in DEFAULT_TIMEZONE.
    // Idempotent via unique-constrained insert.
    try {
      await runWeeklyDigestIfDue();
    } catch (err) {
      console.error('[tick] weekly digest failed (non-fatal):', err);
    }

    // Step 7: Monday - send weekly boss challenge to Quest patients (phase 2+)
    try {
      await sendWeeklyBossChallenge();
    } catch (err) {
      console.error('[tick] boss challenge send failed (non-fatal):', err);
    }

    // Step 8: Sunday - complete/fail boss challenges, award/deduct XP
    try {
      await runSundayBossCheck();
    } catch (err) {
      console.error('[tick] Sunday boss check failed (non-fatal):', err);
    }

  } finally {
    console.log(`[tick] completed in ${Date.now() - start}ms`);
  }
}
