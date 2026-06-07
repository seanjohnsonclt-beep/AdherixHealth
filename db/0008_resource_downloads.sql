create table if not exists resource_downloads (
  id           uuid        default gen_random_uuid() primary key,
  name         text        not null,
  clinic_name  text,
  email        text        not null,
  resource_key text        not null,
  downloaded_at timestamptz default now(),
  ip_address   text,
  user_agent   text
);
