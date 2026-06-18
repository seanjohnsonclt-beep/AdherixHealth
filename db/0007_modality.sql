-- 0007_modality.sql
-- Adds modality support for Adherix Bridge (bariatric) alongside
-- the existing GLP-1 (Adherix Keep) product line.
--
-- Run AFTER 0006_drift_correction.sql.
-- Apply with: npm run db:migrate
-- Or manually: psql $DATABASE_URL -f db/0007_modality.sql

-- ─── Clinics: modality ────────────────────────────────────────────────────────
-- 'glp1'      = Adherix Keep (default, existing clinics unaffected)
-- 'bariatric' = Adherix Bridge

ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS modality VARCHAR(20) NOT NULL DEFAULT 'glp1';

ALTER TABLE clinics
  DROP CONSTRAINT IF EXISTS clinics_modality_check;

ALTER TABLE clinics
  ADD CONSTRAINT clinics_modality_check
  CHECK (modality IN ('glp1', 'bariatric'));

-- ─── Patients: surface modality for quick lookup ──────────────────────────────
-- Denormalized from clinics to avoid a join on every tick evaluation.
-- Set on enrollment, updated if clinic modality ever changes (rare).

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS modality VARCHAR(20) NOT NULL DEFAULT 'glp1';

-- Backfill from parent clinic (safe to run on existing data)
UPDATE patients p
SET modality = c.modality
FROM clinics c
WHERE p.clinic_id = c.id
  AND p.modality != c.modality;

-- ─── Index ────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS patients_modality_idx ON patients (modality);
