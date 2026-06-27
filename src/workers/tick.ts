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
//   8. activatePowerWeek()              -  Monday: set quest_power_week=true for streak>=10 patients
//   9. runSundayBossCheck()              -  Sunday: complete/fail boss challenges, award/deduct XP
//  10. deactivatePowerWeek()             -  Sunday: reset quest_power_week for all Quest patients
//  11. rebuildLeaderboard()+recap SMS    -  Sunday: snapshot leaderboard, send weekly recap texts
//  12. updateSquadXp()                   -  Sunday: sync squad XP totals
//  13. resetMonthlyXp()                  -  1st of month: reset quest_monthly_xp after fulfillment window

import { evaluateTriggersForAllPatients } from '@/engine/triggers';
import { sendDueMessages }                from '@/engine/sender';
import { updateAllTrajectories }          from '@/engine/trajectory';
import { runDriftCorrection }             from '@/engine/drift-correction';
import { runResolutionTracker }           from '@/engine/dc-resolution-tracker';
import { runWeeklyDigestIfDue }           from '@/workers/digest';
import {
  sendWeeklyBossChallenge,
  runSundayBossCheck,
  activatePowerWeek,
  deactivatePowerWeek,
  resetMonthlyXp,
} from '@/engine/boss-challenge';
import {
  rebuildLeaderboard,
  sendWeeklyQuestRecap,
  updateSquadXp,
} from '@/engine/quest-game';
import { query } from '@/lib/db';

// Returns all distinct clinic IDs that have at least one active Quest patient.
async function getQuestClinicIds(): Promise<string[]> {
  const rows = await query<{ clinic_id: string }>(
    `SELECT DISTINCT clinic_id FROM patients
     WHERE modality = 'quest' AND status = 'active'`,
    []
  );
  return rows.map(r => r.clinic_id);
}

export async function tick() {
  const start = Date.now();
  try {

    // Step 1: trajectory scoring
    try {
      await updateAllTrajectories();
    } catch (err) {
      console.error('[tick] trajectory update failed (non-fatal):', err);
    }

    // Step 2: trigger evaluation
    await evaluateTriggersForAllPatients();

    // Step 3: drift correction
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

    // Step 6: weekly digest (Monday 8-10am)
    try {
      await runWeeklyDigestIfDue();
    } catch (err) {
      console.error('[tick] weekly digest failed (non-fatal):', err);
    }

    // Step 7: Monday boss challenge send
    try {
      await sendWeeklyBossChallenge();
    } catch (err) {
      console.error('[tick] boss challenge send failed (non-fatal):', err);
    }

    // Step 8: Monday power week activation (streak >= 10)
    try {
      await activatePowerWeek();
    } catch (err) {
      console.error('[tick] power week activation failed (non-fatal):', err);
    }

    // Step 9: Sunday boss check - resolve outcomes, award/deduct XP
    try {
      await runSundayBossCheck();
    } catch (err) {
      console.error('[tick] Sunday boss check failed (non-fatal):', err);
    }

    // Step 10: Sunday - deactivate power week after boss check resolves
    try {
      await deactivatePowerWeek();
    } catch (err) {
      console.error('[tick] power week deactivation failed (non-fatal):', err);
    }

    // Steps 11-12: Sunday - leaderboard rebuild + recap SMS + squad XP sync
    // Runs per-clinic since leaderboard is clinic-scoped.
    try {
      const clinicIds = await getQuestClinicIds();
      for (const clinicId of clinicIds) {
        try {
          await rebuildLeaderboard(clinicId);
          await sendWeeklyQuestRecap(clinicId);
          await updateSquadXp(clinicId);
        } catch (err) {
          console.error(`[tick] Quest Sunday jobs failed for clinic ${clinicId}:`, err);
        }
      }
    } catch (err) {
      console.error('[tick] Quest clinic fetch failed (non-fatal):', err);
    }

    // Step 13: 1st of month - reset monthly XP after fulfillment window closes
    try {
      await resetMonthlyXp();
    } catch (err) {
      console.error('[tick] monthly XP reset failed (non-fatal):', err);
    }

  } finally {
    console.log(`[tick] completed in ${Date.now() - start}ms`);
  }
}
