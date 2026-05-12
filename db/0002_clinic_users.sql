-- Phase 2: tie Supabase auth users to clinics.
-- One user belongs to one clinic for MVP. Multi-clinic users come later.

create table if not exists clinic_users (
  user_id    uuid primary key,                                   -- Supabase auth.users.id
  clinic_id  uuid not null references clinics(id) on delete cascade,
  email      text not null,
  role       text not null default 'operator',                   -- operator | admin
  created_at timestamptz not null default now()
);

create index if not exists clinic_users_clinic_idx on clinic_users (clinic_id);
