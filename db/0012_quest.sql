-- Adherix Quest — pediatric/adolescent modality
-- Run after 0011_ai_personalization.sql

-- 1. Expand modality constraint to include 'quest'
ALTER TABLE clinics  DROP CONSTRAINT IF EXISTS clinics_modality_check;
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_modality_check;

ALTER TABLE clinics  ADD CONSTRAINT clinics_modality_check
  CHECK (modality IN ('glp1','bariatric','pharmacotherapy','behavioral_therapy','metabolic_health','quest'));

ALTER TABLE patients ADD CONSTRAINT patients_modality_check
  CHECK (modality IN ('glp1','bariatric','pharmacotherapy','behavioral_therapy','metabolic_health','quest'));

-- 2. Quest patient fields
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS date_of_birth       DATE,
  ADD COLUMN IF NOT EXISTS state               VARCHAR(2),
  ADD COLUMN IF NOT EXISTS guardian_phone      VARCHAR(20),
  ADD COLUMN IF NOT EXISTS guardian_name       VARCHAR(100),
  ADD COLUMN IF NOT EXISTS consent_type        VARCHAR(30),   -- 'coppa_parent' | 'minor_self' | 'minor_parent'
  ADD COLUMN IF NOT EXISTS consent_status      VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'obtained' | 'revoked'
  ADD COLUMN IF NOT EXISTS quest_handle        VARCHAR(30),   -- anonymous handle e.g. @quickfeet
  ADD COLUMN IF NOT EXISTS quest_xp            INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quest_level         INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS quest_streak        INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quest_squad_id      UUID,
  ADD COLUMN IF NOT EXISTS quest_intensity     VARCHAR(10) DEFAULT 'standard', -- 'chill' | 'standard' | 'beast'
  ADD COLUMN IF NOT EXISTS quest_checkin_at    TIMESTAMPTZ,  -- last gamified check-in
  ADD COLUMN IF NOT EXISTS quest_power_week    BOOLEAN DEFAULT FALSE;

-- 3. Quest consent audit log (immutable)
CREATE TABLE IF NOT EXISTS quest_consent_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id      UUID NOT NULL REFERENCES clinics(id)  ON DELETE CASCADE,
  event_type     VARCHAR(40) NOT NULL,  -- 'consent_obtained' | 'consent_revoked' | 'opt_out' | 'opt_in' | 'suppressed'
  track          VARCHAR(10),           -- 'teen' | 'guardian' | 'both'
  consent_type   VARCHAR(30),
  state          VARCHAR(2),
  patient_age    INTEGER,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 4. Quest squads
CREATE TABLE IF NOT EXISTS quest_squads (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name           VARCHAR(30) NOT NULL,  -- e.g. 'Squad Alpha'
  week_xp        INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- 5. Quest weekly leaderboard snapshot (rebuilt each Sunday)
CREATE TABLE IF NOT EXISTS quest_leaderboard (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  week_start     DATE NOT NULL,
  handle         VARCHAR(30),
  xp_this_week   INTEGER DEFAULT 0,
  xp_prev_week   INTEGER DEFAULT 0,
  streak         INTEGER DEFAULT 0,
  rank_overall   INTEGER,
  rank_improved  INTEGER,  -- rank on most-improved board
  rank_streak    INTEGER,  -- rank on streak board
  comeback_flag  BOOLEAN DEFAULT FALSE,
  dark_horse_flag BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT now(),
  UNIQUE (clinic_id, patient_id, week_start)
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_quest_leaderboard_week ON quest_leaderboard(clinic_id, week_start);
CREATE INDEX IF NOT EXISTS idx_quest_consent_log_patient ON quest_consent_log(patient_id);
