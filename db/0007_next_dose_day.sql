-- 0007: add next_dose_day to patients
-- Used by drift correction engine for personalized correction message copy.
-- e.g. "your next dose is Thursday"

alter table patients
  add column if not exists next_dose_day text;
