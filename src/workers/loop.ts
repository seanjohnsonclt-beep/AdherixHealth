// Local development cron loop. In production, replace with Vercel Cron
// hitting an /api/cron/tick route every 1 minute.

import { config } from 'dotenv';
config({ path: '.env.local' });
import { tick } from './tick';

const intervalSec = Number(process.env.TICK_INTERVAL_SECONDS || 60);

console.log(`[loop] starting, tick every ${intervalSec}s`);

async function run() {
  try {
    await tick();
  } catch (err) {
    console.error('[loop] tick error:', err);
  }
  setTimeout(run, intervalSec * 1000);
}

run();
