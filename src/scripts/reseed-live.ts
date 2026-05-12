/**
 * Run demo reseed directly against the live Supabase DB.
 * Much faster than hitting the Vercel API endpoint (no 10s timeout).
 *
 * Usage (from the adherix folder):
 *   npx tsx src/scripts/reseed-live.ts
 *
 * Requires .env.local to be present with DATABASE_URL set.
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local before importing anything that touches the DB
config({ path: resolve(process.cwd(), '.env.local') });

import { query } from '@/lib/db';
import { reseedDemo } from '@/engine/demoSeed';

async function main() {
  console.log('Connecting to DB…');

  const clinics = await query<{ id: string; name: string }>(
    `SELECT id, name FROM clinics ORDER BY created_at LIMIT 5`
  );

  if (clinics.length === 0) {
    console.error('No clinics found. Run seed.ts first.');
    process.exit(1);
  }

  // Use first clinic (for multi-clinic setups, pass clinic_id as arg)
  const clinic = clinics[0];
  console.log(`Reseeding clinic: ${clinic.name} (${clinic.id})`);

  const result = await reseedDemo({ clinicId: clinic.id });

  console.log('\nDone ✓');
  console.log(`  Total patients: ${result.totalPatients}`);
  console.log(`  Total messages: ${result.totalMessages}`);
  console.log('  Breakdown:');
  Object.entries(result.bucketCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([bucket, count]) => console.log(`    ${bucket.padEnd(18)} ${count}`));

  process.exit(0);
}

main().catch((err) => {
  console.error('Reseed failed:', err);
  process.exit(1);
});
