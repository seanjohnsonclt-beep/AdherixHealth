// Provision a new clinic and link a user to it.
// Use this to onboard pilot clinics manually:
//
//   npx tsx src/scripts/provision.ts "Westside Wellness" admin@westside.com
//
// Steps:
//   1. Insert clinic row
//   2. Invite the user via Supabase admin API (sends magic link email)
//   3. Insert clinic_users row linking them
//
// Requires SUPABASE_SERVICE_ROLE_KEY in env.

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { query, queryOne } from '@/lib/db';

async function provision(clinicName: string, email: string) {
  if (!clinicName || !email) {
    console.error('Usage: tsx src/scripts/provision.ts "Clinic Name" admin@email.com');
    process.exit(1);
  }

  const supa = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // 1. Clinic
  const clinic = await queryOne<{ id: string }>(
    `insert into clinics (name, plan) values ($1, 'pilot') returning id`,
    [clinicName]
  );
  if (!clinic) throw new Error('failed to create clinic');
  console.log(`[provision] clinic ${clinic.id} (${clinicName})`);

  // 2. Invite user (Supabase generates user, sends magic link)
  const { data, error } = await supa.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.APP_URL}/auth/callback`,
  });
  if (error) throw error;
  if (!data.user) throw new Error('no user returned from invite');
  console.log(`[provision] user ${data.user.id} (${email})`);

  // 3. Link
  await query(
    `insert into clinic_users (user_id, clinic_id, email, role)
     values ($1, $2, $3, 'admin')
     on conflict (user_id) do update set clinic_id = excluded.clinic_id`,
    [data.user.id, clinic.id, email]
  );

  console.log(`[provision] done. invite email sent to ${email}`);
}

const [, , clinicName, email] = process.argv;
provision(clinicName, email)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[provision] failed:', err);
    process.exit(1);
  });
