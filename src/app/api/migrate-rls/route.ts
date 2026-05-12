import { db } from '@/lib/db';

export async function POST(req: Request) {
  // Verify this is a local or trusted request
  const authHeader = req.headers.get('authorization');
  if (authHeader !== 'Bearer migrate-rls') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await db().connect();
  try {
    const migrationSql = `
-- Enable Row-Level Security (RLS) on all public tables
alter table clinics enable row level security;
alter table clinic_users enable row level security;
alter table patients enable row level security;
alter table messages enable row level security;
alter table events enable row level security;
alter table trigger_firings enable row level security;

-- Helper function: Get current user's clinic_id
create or replace function auth.get_user_clinic_id() returns uuid as $$
  select clinic_id
  from clinic_users
  where user_id = auth.uid()
  limit 1;
$$ language sql stable;

-- CLINICS policies
create policy "Users can view their own clinic"
  on clinics
  for select
  using (id = auth.get_user_clinic_id());

create policy "Users cannot modify clinics"
  on clinics
  for delete
  using (false);

-- CLINIC_USERS policies
create policy "Users can view clinic_users in their clinic"
  on clinic_users
  for select
  using (clinic_id = auth.get_user_clinic_id());

create policy "No direct clinic_users insert"
  on clinic_users
  for insert
  using (false);

create policy "No direct clinic_users update"
  on clinic_users
  for update
  using (false);

create policy "No direct clinic_users delete"
  on clinic_users
  for delete
  using (false);

-- PATIENTS policies
create policy "Users can select patients in their clinic"
  on patients
  for select
  using (clinic_id = auth.get_user_clinic_id());

create policy "Users can insert patients in their clinic"
  on patients
  for insert
  with check (clinic_id = auth.get_user_clinic_id());

create policy "Users can update patients in their clinic"
  on patients
  for update
  using (clinic_id = auth.get_user_clinic_id());

create policy "Users can delete patients in their clinic"
  on patients
  for delete
  using (clinic_id = auth.get_user_clinic_id());

-- MESSAGES policies
create policy "Users can select messages for their clinic's patients"
  on messages
  for select
  using (
    patient_id in (
      select id from patients where clinic_id = auth.get_user_clinic_id()
    )
  );

create policy "Users can insert messages for their clinic's patients"
  on messages
  for insert
  with check (
    patient_id in (
      select id from patients where clinic_id = auth.get_user_clinic_id()
    )
  );

create policy "Users can update messages for their clinic's patients"
  on messages
  for update
  using (
    patient_id in (
      select id from patients where clinic_id = auth.get_user_clinic_id()
    )
  );

create policy "Users can delete messages for their clinic's patients"
  on messages
  for delete
  using (
    patient_id in (
      select id from patients where clinic_id = auth.get_user_clinic_id()
    )
  );

-- EVENTS policies
create policy "Users can select events for their clinic's patients"
  on events
  for select
  using (
    patient_id in (
      select id from patients where clinic_id = auth.get_user_clinic_id()
    )
  );

create policy "Users can insert events for their clinic's patients"
  on events
  for insert
  with check (
    patient_id in (
      select id from patients where clinic_id = auth.get_user_clinic_id()
    )
  );

create policy "Users can update events for their clinic's patients"
  on events
  for update
  using (
    patient_id in (
      select id from patients where clinic_id = auth.get_user_clinic_id()
    )
  );

create policy "Users can delete events for their clinic's patients"
  on events
  for delete
  using (
    patient_id in (
      select id from patients where clinic_id = auth.get_user_clinic_id()
    )
  );

-- TRIGGER_FIRINGS policies
create policy "Users can select trigger_firings for their clinic's patients"
  on trigger_firings
  for select
  using (
    patient_id in (
      select id from patients where clinic_id = auth.get_user_clinic_id()
    )
  );

create policy "Users can insert trigger_firings for their clinic's patients"
  on trigger_firings
  for insert
  with check (
    patient_id in (
      select id from patients where clinic_id = auth.get_user_clinic_id()
    )
  );

create policy "Users can update trigger_firings for their clinic's patients"
  on trigger_firings
  for update
  using (
    patient_id in (
      select id from patients where clinic_id = auth.get_user_clinic_id()
    )
  );

create policy "Users can delete trigger_firings for their clinic's patients"
  on trigger_firings
  for delete
  using (
    patient_id in (
      select id from patients where clinic_id = auth.get_user_clinic_id()
    )
  );
`;

    await client.query(migrationSql);
    return Response.json({
      ok: true,
      message: 'RLS migration applied successfully'
    });
  } catch (error) {
    console.error('[migrate-rls] Error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
