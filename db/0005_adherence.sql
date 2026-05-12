-- Migration 0005: Adherence gap — medication tracking + injection confirmation loop
-- Run via: npm run db:migrate
-- Note: migrations are applied in filename order. 0001–0004 must already be applied.

-- ─── New columns on patients ───────────────────────────────────────────────────

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS medication                      TEXT,
  ADD COLUMN IF NOT EXISTS starting_dose                   TEXT,
  ADD COLUMN IF NOT EXISTS current_dose                    TEXT,
  ADD COLUMN IF NOT EXISTS dose_unit                       TEXT,
  ADD COLUMN IF NOT EXISTS injection_frequency             TEXT DEFAULT 'weekly',
  ADD COLUMN IF NOT EXISTS titration_schedule              JSONB,
  ADD COLUMN IF NOT EXISTS next_titration_date             DATE,
  ADD COLUMN IF NOT EXISTS last_titration_date             DATE,
  ADD COLUMN IF NOT EXISTS supply_quantity                 INT,
  ADD COLUMN IF NOT EXISTS last_confirmed_injection_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmed_injection_streak      INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS consecutive_missed_injections   INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS missed_injection_count          INT NOT NULL DEFAULT 0;

-- ─── injection_events ─────────────────────────────────────────────────────────
-- One row per expected injection cycle.
-- response = 'no_response' means the confirmation window is open.
-- confirmed / missed are written by the inbound handler (patient replies YES/NO)
-- or by the missed_injection trigger when the window closes without a reply.

CREATE TABLE IF NOT EXISTS injection_events (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  expected_at   TIMESTAMPTZ NOT NULL,
  confirmed_at  TIMESTAMPTZ,
  response      TEXT        CHECK (response IN ('confirmed', 'missed', 'no_response')),
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS injection_events_patient_expected
  ON injection_events (patient_id, expected_at DESC);

-- ─── RLS for injection_events ─────────────────────────────────────────────────
-- Consistent with the RLS model on all other tables (0004_rls_security.sql).
-- Service role (cron / tick) bypasses RLS. Clinic users read-only.

ALTER TABLE injection_events ENABLE ROW LEVEL SECURITY;

-- Clinic users can SELECT their own patients' injection events
DROP POLICY IF EXISTS injection_events_select ON injection_events;
CREATE POLICY injection_events_select ON injection_events
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE clinic_id = public.get_user_clinic_id()
    )
  );

-- All writes (INSERT / UPDATE / DELETE) are backend-only via service role.
-- No explicit policy = deny for authenticated users (RLS default).
