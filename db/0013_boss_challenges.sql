-- 0013_boss_challenges.sql
-- Quest Boss Challenge feature:
--   - quest_boss_challenges table: one row per patient per week
--   - patients columns: reward_category, boss_challenge_pending, monthly_xp, rewards_redeemed

-- Boss challenge tracking table
CREATE TABLE IF NOT EXISTS quest_boss_challenges (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID        NOT NULL REFERENCES patients(id),
  week_start      DATE        NOT NULL,
  challenge_text  TEXT        NOT NULL,
  target_checkins INTEGER     NOT NULL DEFAULT 5,
  xp_stake        INTEGER     NOT NULL DEFAULT 30,
  -- pending_opt_in | accepted | declined | completed | failed
  status          VARCHAR(20) NOT NULL DEFAULT 'pending_opt_in',
  opted_in_at     TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  checkins_at_start  INTEGER  DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(patient_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_quest_boss_patient ON quest_boss_challenges(patient_id, week_start);
CREATE INDEX IF NOT EXISTS idx_quest_boss_status  ON quest_boss_challenges(status);

-- Patient columns for reward redemption + opt-in routing
ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS quest_reward_category  VARCHAR(20) DEFAULT 'gamer',
  -- 'gamer'    -> Roblox, Fortnite, PSN, Xbox, 2K/Madden tokens
  -- 'wellness' -> Smoothie King
  -- 'reader'   -> Barnes & Noble
  ADD COLUMN IF NOT EXISTS boss_challenge_pending BOOLEAN DEFAULT FALSE,
  -- TRUE while this week's boss challenge awaits YES/NO opt-in
  ADD COLUMN IF NOT EXISTS quest_monthly_xp       INTEGER DEFAULT 0;
  -- XP accrued this calendar month; reset on 1st of each month
  -- Used for reward threshold: 500=5, 1000=10, 2500=25
