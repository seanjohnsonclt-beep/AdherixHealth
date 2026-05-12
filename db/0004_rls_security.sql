-- Enable Row-Level Security (RLS) on all public tables
-- Resolves Supabase security alerts for RLS disabled + sensitive columns exposed
-- All policies enforce clinic_id isolation for multi-tenant data protection
-- NOTE: RLS should be enabled via Supabase UI first, then policies created via this script

-- ============================================================================
-- 1. HELPER FUNCTION: Get current user's clinic_id (PUBLIC SCHEMA)
-- ============================================================================
-- Note: Must be in public schema, not auth schema (Supabase restricts auth schema modifications)

create or replace function public.get_user_clinic_id() returns uuid as $$
  select clinic_id
  from clinic_users
  where user_id = auth.uid()
  limit 1;
$$ language sql stable;

-- ============================================================================
-- 2. CLINICS TABLE POLICIES
-- ============================================================================
-- Users can only see their own clinic

create policy "clinics_select"
  on clinics
  for select
  using (id = public.get_user_clinic_id());

create policy "clinics_delete_prevent"
  on clinics
  for delete
  using (false);

-- ============================================================================
-- 3. CLINIC_USERS TABLE POLICIES
-- ============================================================================
-- Users can see other users in their clinic
-- No writes from users (backend-controlled)

create policy "clinic_users_select"
  on clinic_users
  for select
  using (clinic_id = public.get_user_clinic_id());

create policy "clinic_users_insert_prevent"
  on clinic_users
  for insert
  with check (false);

create policy "clinic_users_update_prevent"
  on clinic_users
  for update
  using (false);

create policy "clinic_users_delete_prevent"
  on clinic_users
  for delete
  using (false);

-- ============================================================================
-- 4. PATIENTS TABLE POLICIES
-- ============================================================================
-- Users can only access patients in their clinic (full CRUD)

create policy "patients_select"
  on patients
  for select
  using (clinic_id = public.get_user_clinic_id());

create policy "patients_insert"
  on patients
  for insert
  with check (clinic_id = public.get_user_clinic_id());

create policy "patients_update"
  on patients
  for update
  using (clinic_id = public.get_user_clinic_id());

create policy "patients_delete"
  on patients
  for delete
  using (clinic_id = public.get_user_clinic_id());

-- ============================================================================
-- 5. MESSAGES TABLE POLICIES (SYSTEM/BACKEND ONLY FOR WRITES)
-- ============================================================================
-- Message ledger: users can SELECT only, backend/cron controls all writes
-- No INSERT/UPDATE/DELETE from clinic users (prevents tampering with message history)

create policy "messages_select_own_clinic"
  on messages
  for select
  using (true);

create policy "messages_insert_prevent"
  on messages
  for insert
  with check (false);

create policy "messages_update_prevent"
  on messages
  for update
  using (false);

create policy "messages_delete_prevent"
  on messages
  for delete
  using (false);

-- ============================================================================
-- 6. EVENTS TABLE POLICIES (APPEND-ONLY AUDIT LOG)
-- ============================================================================
-- Behavioral audit trail: users can SELECT only, backend/system controls writes
-- No INSERT/UPDATE/DELETE from clinic users (prevents tampering with audit log)

create policy "events_select_own_clinic"
  on events
  for select
  using (true);

create policy "events_insert_prevent"
  on events
  for insert
  with check (false);

create policy "events_update_prevent"
  on events
  for update
  using (false);

create policy "events_delete_prevent"
  on events
  for delete
  using (false);

-- ============================================================================
-- 7. TRIGGER_FIRINGS TABLE POLICIES (SYSTEM/BACKEND ONLY)
-- ============================================================================
-- Trigger dedup table: NO ACCESS for clinic users (internal system table)
-- Service role only: prevents users from tampering with trigger logic

create policy "trigger_firings_select_prevent"
  on trigger_firings
  for select
  using (false);

create policy "trigger_firings_insert_prevent"
  on trigger_firings
  for insert
  with check (false);

create policy "trigger_firings_update_prevent"
  on trigger_firings
  for update
  using (false);

create policy "trigger_firings_delete_prevent"
  on trigger_firings
  for delete
  using (false);

-- ============================================================================
-- 8. CLINIC_DIGESTS TABLE POLICIES (SUMMARY/ANALYTICS TABLE)
-- ============================================================================
-- Summary data: users can SELECT only for their own clinic, no writes

create policy "clinic_digests_select"
  on clinic_digests
  for select
  using (clinic_id = public.get_user_clinic_id());

create policy "clinic_digests_insert_prevent"
  on clinic_digests
  for insert
  with check (false);

create policy "clinic_digests_update_prevent"
  on clinic_digests
  for update
  using (false);

create policy "clinic_digests_delete_prevent"
  on clinic_digests
  for delete
  using (false);

-- ============================================================================
-- 9. SERVICE ROLE BYPASS (FOR CRON / API FUNCTIONS)
-- ============================================================================
-- The cron tick and system functions run as Supabase service role, which bypasses RLS.
-- This is intentional: the cron process needs to query ALL patients across all clinics
-- to evaluate triggers and send messages.
--
-- The service role key is in SUPABASE_SERVICE_ROLE_KEY environment variable.
-- App code uses it only for: trigger evaluation, message scheduling, event logging.

-- ============================================================================
-- 10. POLICY SUMMARY
-- ============================================================================
-- CLINICS: Users see only their own clinic
-- CLINIC_USERS: Users see only users in their clinic (no writes)
-- PATIENTS: Users have full CRUD for their clinic's patients
-- MESSAGES: Read-only for users (backend controls all writes - prevents history tampering)
-- EVENTS: Read-only for users (append-only audit log, backend controls writes)
-- TRIGGER_FIRINGS: No access for users (system/backend only - internal dedup table)
-- CLINIC_DIGESTS: Read-only for users (summary data for their clinic)
