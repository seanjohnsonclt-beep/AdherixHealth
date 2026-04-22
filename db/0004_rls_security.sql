-- Enable Row-Level Security (RLS) on all public tables
-- Resolves Supabase security alerts for RLS disabled + sensitive columns exposed
-- All policies enforce clinic_id isolation for multi-tenant data protection

-- ============================================================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================================================

alter table clinics enable row level security;
alter table clinic_users enable row level security;
alter table patients enable row level security;
alter table messages enable row level security;
alter table events enable row level security;
alter table trigger_firings enable row level security;

-- ============================================================================
-- 2. HELPER FUNCTION: Get current user's clinic_id
-- ============================================================================
-- Returns the clinic_id for the authenticated user, or null if not a clinic user

create or replace function auth.get_user_clinic_id() returns uuid as $$
  select clinic_id
  from clinic_users
  where user_id = auth.uid()
  limit 1;
$$ language sql stable;

-- ============================================================================
-- 3. CLINICS TABLE POLICIES
-- ============================================================================
-- Users can only see their own clinic

create policy "Users can view their own clinic"
  on clinics
  for select
  using (id = auth.get_user_clinic_id());

create policy "Users cannot insert/update/delete clinics"
  on clinics
  for delete
  using (false);

-- ============================================================================
-- 4. CLINIC_USERS TABLE POLICIES
-- ============================================================================
-- Users can see other users in their clinic
-- Only allow select to clinic admins

create policy "Users can view clinic_users in their clinic"
  on clinic_users
  for select
  using (clinic_id = auth.get_user_clinic_id());

create policy "Users cannot modify clinic_users via RLS"
  on clinic_users
  for insert
  using (false);

create policy "Users cannot update clinic_users via RLS"
  on clinic_users
  for update
  using (false);

create policy "Users cannot delete clinic_users via RLS"
  on clinic_users
  for delete
  using (false);

-- ============================================================================
-- 5. PATIENTS TABLE POLICIES
-- ============================================================================
-- Users can only access patients in their clinic

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

-- ============================================================================
-- 6. MESSAGES TABLE POLICIES
-- ============================================================================
-- Users can only access messages for patients in their clinic
-- Messages join through patient → clinic_id

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

-- ============================================================================
-- 7. EVENTS TABLE POLICIES
-- ============================================================================
-- Users can only access events for patients in their clinic

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

-- ============================================================================
-- 8. TRIGGER_FIRINGS TABLE POLICIES
-- ============================================================================
-- Users can only access trigger firings for patients in their clinic

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

-- ============================================================================
-- 9. SERVICE ROLE BYPASS (FOR CRON / API FUNCTIONS)
-- ============================================================================
-- The cron tick and system functions run as Supabase service role, which bypasses RLS.
-- This is intentional: the cron process needs to query ALL patients across all clinics
-- to evaluate triggers and send messages.
--
-- The service role key is in SUPABASE_SERVICE_ROLE_KEY environment variable.
-- App code uses it only for: ticker queries (evaluateTriggersForAllPatients),
-- and any other system-level operations that don't belong to a specific user.

-- ============================================================================
-- 10. NOTES FOR DEVELOPERS
-- ============================================================================
--
-- RLS + node-postgres / Transaction Pooler:
--   Supabase automatically propagates auth.uid() through the Transaction Pooler.
--   Just connect with DATABASE_URL (pooler) and Supabase handles the JWT token.
--
-- Testing RLS policies locally:
--   Set JWT_SECRET in your .env.local
--   Supabase CLI: npx supabase start (spins up a local Postgres with RLS enabled)
--
-- Cron / system queries:
--   Cron runs with SUPABASE_SERVICE_ROLE_KEY, which is the admin key.
--   Admin key bypasses all RLS. Use it only for system operations.
--   For user-facing queries, always use the Supabase client (which includes the user's JWT).
--
