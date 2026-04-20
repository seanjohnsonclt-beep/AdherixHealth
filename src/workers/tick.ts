// Single tick of the engine. Called by:
//   - workers/loop.ts (local dev — runs in a setInterval loop)
//   - a Vercel cron job (production — hits /api/cron/tick)
//   - manual: `npm run worker:tick`

import { evaluateTriggersForAllPatients } from '@/engine/triggers';
import { sendDueMessages } from '@/engine/sender';
import { runWeeklyDigestIfDue } from '@/workers/digest';

export async function tick() {
  const start = Date.now();
  try {
    await evaluateTriggersForAllPatients();
    await sendDueMessages();

    // Weekly digest runs inline. It short-circuits in ~1ms unless it's
    // Monday 8-10am in the digest timezone, at which point it claims the
    // week via a unique-constrained insert + sends emails. Idempotent.
    try {
      await runWeeklyDigestIfDue();
    } catch (err) {
      // Digest failures must NOT crash the tick — triggers + sender are priority.
      console.error('[tick] weekly digest failed (non-fatal):', err);
    }

    console.log(`[tick] ok in ${Date.now() - start}ms`);
  } catch (err) {
    console.error('[tick] failed:', err);
    throw err;
  }
}

// CLI entry
if (require.main === module) {
  tick().then(() => process.exit(0)).catch(() => process.exit(1));
}
