-- 0006_drift_correction.sql
-- Adds the Drift Correction infrastructure:
--   - 10 new columns on patients for trajectory + drift state tracking
--   - 3 new tables: drift_correction_events, keyword_review_queue, inbound_scan_log
--   - RLS policies consistent with 0004_rls_security.sql
--
-- Run AFTER 0005_adherence.sql.
-- Apply with: npm run db:migrate
-- Or manually: psql $DATABASE_URL -f db/0006_drift_correction.sql

-- ─── Patient columns ──────────────────────────────────────────────────────────

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS engagement_trajectory    VARCHAR(20)  DEFAULT 'responsive',
  ADD COLUMN IF NOT EXISTS consecutive_silences     INTEGER      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS side_effect_flag         BOOLEAN      DEFAULT false,
  ADD COLUMN IF NOT EXISTS dose_missed_flag         BOOLEAN      DEFAULT false,
  ADD COLUMN IF NOT EXISTS plateau_flag             BOOLEAN      DEFAULT false,
  ADD COLUMN IF NOT EXISTS drift_pattern            VARCHAR(50),
  ADD COLUMN IF NOT EXISTS last_drift_correction_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS drift_correction_count   INTEGER      DEFAULT 0,
  ADD COLUMN IF NOT EXISTS dc_resolved_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS dc_resolution_status     VARCHAR(20);

-- Add check constraint on trajectory values
ALTER TABLE patients
  DROP CONSTRAINT IF EXISTS patients_engagement_trajectory_check;
ALTER TABLE patients
  ADD CONSTRAINT patients_engagement_trajectory_check
  CHECK (engagement_trajectory IN ('responsive', 'inconsistent', 'declining'));

-- ─── drift_correction_events ──────────────────────────────────────────────────
-- One row per DC message sent. Tracks resolution or escalation lifecycle.

CREATE TABLE IF NOT EXISTS drift_correction_events (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id               UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id                UUID        NOT NULL REFERENCES clinics(id)  ON DELETE CASCADE,
  drift_pattern            VARCHAR(50) NOT NULL,       -- expectation | shame | uncertainty | friction
  message_template         VARCHAR(100),
  message_body             TEXT,
  fired_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at              TIMESTAMPTZ,
  resolution_status        VARCHAR(20),               -- monitoring | auto_resolved | escalated | no_response
  time_to_resolution_hours NUMERIC(8,1),
  escalated_at             TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS drift_correction_events_patient_idx
  ON drift_correction_events (patient_id, fired_at DESC);

CREATE INDEX IF NOT EXISTS drift_correction_events_clinic_open_idx
  ON drift_correction_events (clinic_id, fired_at DESC)
  WHERE resolved_at IS NULL AND escalated_at IS NULL;

-- ─── keyword_review_queue ─────────────────────────────────────────────────────
-- Inbound messages that matched keywords, queued for human review.
-- Used to evolve keyword lists over time.

CREATE TABLE IF NOT EXISTS keyword_review_queue (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id           UUID        NOT NULL REFERENCES clinics(id)  ON DELETE CASCADE,
  message_body        TEXT        NOT NULL,
  patient_phase       INTEGER,
  patient_trajectory  VARCHAR(20),
  outcome             VARCHAR(50),   -- filled after review (e.g. 'dc_sent', 'no_action', 'new_keyword')
  reviewed            BOOLEAN     NOT NULL DEFAULT false,
  keyword_added       BOOLEAN     NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS keyword_review_queue_clinic_unreviewed_idx
  ON keyword_review_queue (clinic_id, created_at DESC)
  WHERE reviewed = false;

-- ─── inbound_scan_log ─────────────────────────────────────────────────────────
-- Every inbound message that was scanned, with keyword match results.
-- Internal audit log — clinic users cannot read this directly.

CREATE TABLE IF NOT EXISTS inbound_scan_log (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id          UUID        NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  body_raw            TEXT        NOT NULL,
  uncertainty_matched BOOLEAN     NOT NULL DEFAULT false,
  friction_matched    BOOLEAN     NOT NULL DEFAULT false,
  matched_keywords    TEXT[],
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inbound_scan_log_patient_idx
  ON inbound_scan_log (patient_id, created_at DESC);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
-- Mirrors the pattern from 0004_rls_security.sql.
-- Service role (cron) bypasses all RLS. Clinic users get read-only access
-- to their own clinic's data. Internal tables are locked entirely.

ALTER TABLE drift_correction_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_review_queue     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_scan_log         ENABLE ROW LEVEL SECURITY;

-- drift_correction_events: clinic admins can read their own clinic's events
DROP POLICY IF EXISTS "clinic_users_select_dc_events" ON drift_correction_events;
CREATE POLICY "clinic_users_select_dc_events" ON drift_correction_events
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

-- keyword_review_queue: clinic admins can read their own queue
DROP POLICY IF EXISTS "clinic_users_select_keyword_queue" ON keyword_review_queue;
CREATE POLICY "clinic_users_select_keyword_queue" ON keyword_review_queue
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

-- inbound_scan_log: no clinic-user access (internal audit log only, mirrors trigger_firings)
-- No SELECT policy = effectively locked for authenticated clinic users.
