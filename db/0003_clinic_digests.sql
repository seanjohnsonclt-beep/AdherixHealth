-- Phase 3: Weekly clinic digest dedupe table.
-- One row per (clinic, week_start) — prevents double-sending the Monday
-- morning digest if tick() runs concurrently or a retry happens.

create table if not exists clinic_digests (
  id             uuid primary key default uuid_generate_v4(),
  clinic_id      uuid not null references clinics(id) on delete cascade,
  week_start     date not null,           -- the Monday local-to-clinic that this digest covers
  kind           text not null default 'weekly',
  sent_at        timestamptz not null default now(),
  recipients     text,                    -- comma-joined emails actually sent to
  unique (clinic_id, week_start, kind)
);

create index if not exists clinic_digests_clinic_idx
  on clinic_digests (clinic_id, sent_at desc);
