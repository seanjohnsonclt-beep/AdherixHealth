// Proves the engine works end to end without Twilio.
// Creates a clinic + patient, schedules Phase 0 messages, then dumps the queue.
//
// Run after `npm run db:migrate`:
//   npm run db:seed
//
// Then run `npm run worker:tick` to attempt sending (will hit Twilio if env is set).

import 'dotenv/config';
import { query, queryOne } from '@/lib/db';
import { enrollPatient } from '@/engine/enroll';

async function seed() {
  // Find or create the demo clinic. Don't nuke other clinics.
  let clinic = await queryOne<{ id: string }>(
    `select id from clinics where name = 'Demo Clinic' limit 1`
  );
  if (clinic) {
    // Wipe its patients only
    await query(`delete from patients where clinic_id = $1`, [clinic.id]);
    console.log(`[seed] reusing clinic ${clinic.id}`);
  } else {
    clinic = await queryOne<{ id: string }>(
      `insert into clinics (name, plan) values ('Demo Clinic', 'pilot') returning id`
    );
    if (!clinic) throw new Error('failed to create clinic');
    console.log(`[seed] clinic ${clinic.id}`);
  }

  const patientId = await enrollPatient({
    clinicId: clinic.id,
    phone: process.env.SEED_PHONE || '+15555550199',
    firstName: 'Alex',
  });
  console.log(`[seed] patient ${patientId}`);

  const queued = await query(
    `select template_key, scheduled_for, body
     from messages where patient_id = $1 order by scheduled_for asc`,
    [patientId]
  );
  console.log(`[seed] queued ${queued.length} messages:`);
  for (const m of queued) {
    console.log(`  ${m.scheduled_for.toISOString()}  ${m.template_key}`);
    console.log(`    "${m.body.slice(0, 60)}${m.body.length > 60 ? '...' : ''}"`);
  }
}

seed().then(() => process.exit(0)).catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
