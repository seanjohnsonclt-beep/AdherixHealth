-- Adherix Health — Phase 1 schema
-- Pragmatic HIPAA: PII (phone, name) lives here, but never in SMS body.
-- SMS bodies pull from deidentified templates in /config/messages.yaml.

create extension if not exists "uuid-ossp";

-- Clinics. One row per paying customer.
create table if not exists clinics (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  plan          text not null default 'pilot',          -- pilot | standard
  setup_fee_paid_at timestamptz,
  twilio_number text,                                    -- nullable: falls back to env default
  created_at    timestamptz not null default now()
);

-- Patients. Enrolled by a clinic. Phone is the only required contact.
create table if not exists patients (
  id            uuid primary key default uuid_generate_v4(),
  clinic_id    uuid not null references clinics(id) on delete cascade,
  phone         text not null,                           -- E.164, e.g. +14155551234
  first_name    text,                                    -- used in template merge, never sent in PHI-sensitive context
  enrolled_at   timestamptz not null default now(),
  current_phase int  not null default 0,                 -- 0..5, see config/phases.yaml
  phase_started_at timestamptz not null default now(),
  status        text not null default 'active',          -- active | paused | flagged | churned
  last_inbound_at timestamptz,                           -- last time patient texted back
  unique (clinic_id, phone)
);

-- Outbound + inbound message log. One row per SMS, in either direction.
create table if not exists messages (
  id              uuid primary key default uuid_generate_v4(),
  patient_id      uuid not null references patients(id) on delete cascade,
  direction       text not null,                         -- outbound | inbound
  template_key    text,                                  -- e.g. 'phase1.day1.morning' (outbound only)
  body            text not null,
  scheduled_for   timestamptz,                           -- outbound: when to send. inbound: null.
  sent_at         timestamptz,                           -- outbound: when actually sent
  twilio_sid      text,                                  -- for status callbacks
  status          text not null default 'pending',       -- pending | sent | delivered | failed | received
  created_at      timestamptz not null default now()
);

create index if not exists messages_due_idx on messages (scheduled_for) where status = 'pending' and direction = 'outbound';
create index if not exists messages_patient_idx on messages (patient_id, created_at desc);

-- Patient events. Anything the engine needs to remember for trigger logic.
-- e.g. 'phase_advanced', 'trigger_fired:no_response_48h', 'flagged'
create table if not exists events (
  id          uuid primary key default uuid_generate_v4(),
  patient_id  uuid not null references patients(id) on delete cascade,
  kind        text not null,
  payload     jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists events_patient_idx on events (patient_id, created_at desc);
create index if not exists events_kind_idx on events (kind, created_at desc);

-- Trigger firings. Dedupe key prevents the same trigger from firing twice for the same patient in the same window.
create table if not exists trigger_firings (
  id           uuid primary key default uuid_generate_v4(),
  patient_id   uuid not null references patients(id) on delete cascade,
  trigger_key  text not null,                            -- e.g. 'no_response_48h'
  dedupe_key   text not null,                            -- e.g. 'no_response_48h:2026-04-13'
  fired_at     timestamptz not null default now(),
  unique (patient_id, dedupe_key)
);
