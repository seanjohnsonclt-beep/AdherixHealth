// Single tick of the engine. Called by:
//   - workers/loop.ts (local dev — runs in a setInterval loop)
//   - a Vercel cron job (production — hits /api/cron/tick)
//   - manual: `npm run worker:tick`

import 'dotenv/config';
import { evaluateTriggersForAllPatients } from '@/engine/triggers';
import { sendDueMessages } from '@/engine/sender';

export async function tick() {
  const start = Date.now();
  try {
    await evaluateTriggersForAllPatients();
    await sendDueMessages();
    console.log(`[tick] ok in ${Date.now() - start}ms`);
  } catch (err) {
    console.error('[tick] failed:', err);
    throw err;
  }
}

// CLI entry
if (import.meta.url === `file://${process.argv[1]}`) {
  tick().then(() => process.exit(0));
}
