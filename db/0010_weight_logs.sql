-- Migration 0010: Adherix Gauge - weight tracking
-- Run via: npm run db:migrate

-- ─── New columns on patients ───────────────────────────────────────────────────

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS starting_weight_lbs    DECIMAL(5,1),
  ADD COLUMN IF NOT EXISTS last_weight_logged_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_gauge_checkin_at  TIMESTAMPTZ;

-- ─── weight_logs ──────────────────────────────────────────────────────────────
-- One row per patient weight check-in.
-- weight_lbs is what the patient texted back.
-- lbs_lost_at_log is computed at insert time for fast milestone queries.

CREATE TABLE IF NOT EXISTS weight_logs (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  weight_lbs        DECIMAL(5,1) NOT NULL,
  lbs_lost_at_log   DECIMAL(5,1),   -- starting_weight_lbs - weight_lbs at time of log
  logged_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS weight_logs_patient_logged
  ON weight_logs (patient_id, logged_at DESC);

-- ─── RLS for weight_logs ──────────────────────────────────────────────────────

ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS weight_logs_select ON weight_logs;
CREATE POLICY weight_logs_select ON weight_logs
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE clinic_id = public.get_user_clinic_id()
    )
  );
