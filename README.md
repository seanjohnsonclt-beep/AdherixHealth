# Adherix Health

Behavioral infrastructure for GLP-1 patient retention. SMS-first, rule-driven, deidentified.

## What's built

**Phase 1 — Engine**
- Patient enrollment via API or CLI
- Phase 0 → 1 → 2 message scheduling with timezone-aware time windows
- Reply-gated onboarding (Phase 0 waits for YES before continuing)
- Twilio inbound webhook + delivery status callbacks
- Trigger evaluator with dedupe (no-response → re-engage → flag)
- Auto phase advance on duration elapsed
- Cron worker (local loop or Vercel cron)

**Phase 2 — Clinic admin**
- Magic link auth via Supabase
- Multi-tenant: every query scoped to the user's clinic
- Patient list with active/flagged stats
- Single-patient timeline (every message in/out, status, template key)
- Manual phase advance, manual flag/unflag
- Enroll patient form

**Not built yet**
- Demo route (Phase 3) — public sales tool
- Stripe billing — invoicing is manual
- Self-serve clinic signup — provision via CLI for now

## Stack

Next.js 14 (App Router) · Postgres · Supabase Auth · Twilio · Vercel cron

## Setup

```bash
# 1. Install
npm install

# 2. Env
cp .env.example .env.local
# Fill in:
#   DATABASE_URL                  (Supabase Postgres or local)
#   NEXT_PUBLIC_SUPABASE_URL      (Supabase project URL)
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY     (for provision script)
#   TWILIO_ACCOUNT_SID
#   TWILIO_AUTH_TOKEN
#   TWILIO_DEFAULT_FROM           (your Twilio number)
#   APP_URL                       (http://localhost:3000 for dev)

# 3. Migrate
npm run db:migrate

# 4. (optional) Seed a fake patient to test the engine without auth
npm run db:seed

# 5. Run app + cron loop in two terminals
npm run dev          # terminal A
npm run worker:loop  # terminal B

# 6. Provision your first real clinic + admin user
npm run provision -- "Westside Wellness" admin@westside.com

# 7. Point Twilio inbound webhook at:
#    https://<tunnel>/api/twilio/inbound
```

## Onboarding a new pilot clinic

```bash
npm run provision -- "Clinic Name" owner@clinic.com
```

The owner receives a magic-link email, clicks through, and lands on their patient list. They click "Enroll patient", enter a phone number, and the engine takes over.

## Architecture

```
config/        ← phases, messages, triggers (YAML, edit freely)
db/            ← idempotent SQL migrations
src/
  lib/         ← db, twilio, supabase, auth, config loaders
  engine/      ← scheduler, conditions, triggers, sender, enroll, replyGate
  workers/     ← tick (one cycle), loop (every 60s, dev only)
  app/
    login/                   ← magic link form
    auth/callback/           ← Supabase OAuth callback
    page.tsx                 ← patient list (home)
    patients/new/            ← enroll form
    patients/[id]/           ← timeline + actions
    api/twilio/inbound/      ← receives patient SMS
    api/twilio/status/       ← delivery callbacks
    api/cron/tick/           ← Vercel cron entrypoint
  scripts/     ← migrate, seed, provision
```

The engine has five moving parts:

1. **Scheduler** queues outbound messages when a patient enters a phase. Reads `config/messages.yaml`. Skips templates with `requires_reply_to`.
2. **Reply gate** runs on every inbound. If the patient just replied to a template that gates a follow-up, queue the follow-up immediately.
3. **Trigger evaluator** runs every tick. Reads `config/triggers.yaml`. Evaluates named conditions in `src/engine/conditions.ts`. Fires actions: send_template, flag_patient, advance_phase. Dedupes by window.
4. **Sender** picks up due messages and ships them via Twilio.
5. **Inbound webhook** logs replies, updates `last_inbound_at`, un-flags patients on any reply, runs the reply gate.

## Editing behavior

90% of behavior changes are YAML-only:

- Change a Phase 1 message → edit `config/messages.yaml`
- Change phase length → edit `config/phases.yaml`
- Change re-engagement timing → edit `config/triggers.yaml`

Adding a new condition (e.g. "weight stalled 14 days"):
1. Add a function to `src/engine/conditions.ts`
2. Reference its name from a trigger in `triggers.yaml`

No DB migration. No schema change.

## HIPAA posture

Pragmatic mode:
- Patient PII (phone, first name) lives in Postgres
- SMS bodies contain no diagnosis, no medication name, no dosage
- First-name merge allowed in scheduled messages
- Trigger messages strip the merge to `there` for safety
- Phone numbers are masked (`••• ••• 1234`) in the UI
- BAAs (Twilio + Supabase) signed before first paying clinic

**Before pilot:** add Twilio signature validation to `/api/twilio/inbound` and `/api/twilio/status`. The `twilio` SDK has `validateRequest` — drop it in front of the form parsing.

## Production deployment notes

- Deploy to Vercel
- `vercel.json` cron runs `/api/cron/tick` every minute
- Set `CRON_SECRET` env var
- Local `worker:loop` is for dev only; in prod the cron route does the work
- Use Supabase Postgres (not local) so DATABASE_URL is reachable from Vercel functions

## Phase 3 next

Public `/demo` route — the sales tool. Two modes:
- Compressed: 5-min button-driven walkthrough that fires triggers on click
- Live: prospect enters their phone, gets the real Phase 0 sequence on real timing, auto-expires after 7 days

This is the artifact that closes pilot deals.
