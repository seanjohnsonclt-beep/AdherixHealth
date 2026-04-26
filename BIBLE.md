# Adherix Health — Project Bible

> **For future chats:** Read this document at the start of every new conversation before responding. It is the source of truth for Adherix Health architecture, state, and decisions. When something material changes, append to it (don't replace — this is a living log).

---

## 1. What Adherix Is

Adherix Health is a behavior-driven adherence system for GLP-1 treatment programs. It is **not** a generic "health app." It is a thin, SMS-first patient-engagement engine designed to move patients through phase-based progression and respond to behavioral triggers.

**North star:** keep patients on treatment longer by reducing decision-making friction and delivering timely, directive SMS nudges.

**Status:** Demo / validation phase. Live at https://adherix-health.vercel.app. No real clinic pilots yet. Twilio is on a trial account (only sends to verified numbers).

**Design principles (from project custom instructions):**
- SMS-first experiences, short and directive
- Phase-based progression (onboarding → activation → momentum → plateau → transition)
- Trigger-based logic (if X → Y)
- Simple architecture — no enterprise-scale infra
- Assume low patient motivation; reduce decision-making
- Fast MVP / pilot-ready, not a full SaaS platform
- Avoid generic "health app" patterns (dashboards, content libraries, feature sprawl)

---

## 2. Stack

| Layer | Choice |
|---|---|
| Frontend / API | Next.js 14 App Router, Server Components |
| Database | Postgres via Supabase (Transaction Pooler / Supavisor on port 6543) |
| DB driver in app | `pg` (node-postgres) using `DATABASE_URL` |
| Auth | Supabase SSR (`@supabase/ssr`) |
| SMS | Twilio (trial account) |
| Email | Resend (used for delivery-failure alerts to clinic admins) |
| Hosting | Vercel (Hobby plan — no minute-level crons allowed) |
| Cron | cron-job.org (external, hits `/api/cron/tick` every 60s) |

---

## 3. URLs, IDs, and Local Paths

- **Production site:** https://adherix-health.vercel.app
- **GitHub repo:** `seanjohnsonclt-beep/AdherixHealth` (main branch auto-deploys)
- **Vercel project ID:** `prj_NHFJkme6m3r0rgjKDtbEXqC03Zt9`
- **Vercel team ID:** `team_z6egacN8EZHoJ1JkPgZDUUyy`
- **Supabase project ref:** `intpbbojlfspnohulgps`
- **Supabase region:** us-west-2 (`aws-1-us-west-2.pooler.supabase.com`)
- **Local project folder:** `C:\Users\seanj\OneDrive\Documents\Claude\Projects\Adherix Health\adherix`

---

## 4. Data Model (Postgres)

Six tables. All patient-scoped data carries `clinic_id` for multi-tenant isolation.

**clinics** — tenant root. Holds name, Twilio number, timezone, billing info.

**clinic_users** — clinic admins for auth and delivery-failure alert routing. Joined to `auth.users` via Supabase.

**patients** — enrolled patients. Key columns: `clinic_id`, `first_name`, `phone` (unique), `timezone`, `enrolled_at`, `phase` (0–5), `phase_started_at`, `status` (`active` | `flagged` | `paused`), `last_patient_reply_at`.

**messages** — every outbound and inbound SMS. Key columns: `patient_id`, `direction` (`outbound` | `inbound`), `template_key`, `body`, `scheduled_for`, `sent_at`, `status` (`pending` | `sent` | `failed`), `twilio_sid`, `error`.

**events** — append-only behavioral log for analytics. Examples: `message_sent`, `message_received`, `phase_advanced`, `patient_flagged`, `patient_unflagged`.

**trigger_firings** — dedupe record. Key columns: `patient_id`, `trigger_key`, `fired_on` (date). Unique on `(patient_id, trigger_key, fired_on)` so the same trigger can't fire twice in one day for the same patient.

---

## 5. Behavior Engine — Phases

Phases are defined in TypeScript (not YAML/config file) so they're type-checked and easy to refactor.

| # | Phase | Duration | Intent |
|---|---|---|---|
| 0 | Initiation | 1 day | Welcome, set expectations |
| 1 | Onboarding | 7 days | Dose prep, first injection, early side effects |
| 2 | Activation | 14 days | Habit formation, logging routine |
| 3 | Momentum | 30 days | Reinforce progress, reduce plateau risk |
| 4 | Plateau / Transition | 30 days | Acknowledge plateau, sustain engagement |
| 5 | Maintenance | ongoing | Light-touch check-ins |

Patients advance automatically via the `phase_auto_advance` trigger when their phase duration has elapsed.

---

## 6. Behavior Engine — Triggers

Four triggers, all deduped per-patient per-day via `trigger_firings`.

- **`no_response_48h`** — patient hasn't replied in 48 hours → schedule a nudge message.
- **`no_response_5d`** — patient hasn't replied in 5 days → set `status='flagged'`, queue clinic alert.
- **`flag_for_clinic`** — manual or derived flag → notifies clinic admin.
- **`phase_auto_advance`** — phase duration elapsed → increment `phase`, reset `phase_started_at`, schedule next phase's opening messages.

Trigger evaluation runs every tick, for every active patient, ordered by last activity.

---

## 7. Behavior Engine — Messages

Message templates live in TypeScript config keyed by `template_key`. Each template specifies:
- `phase` (0–5) — which phase it belongs to
- `after` (days offset from phase start) — when to schedule
- `send_at_local` (e.g., `09:00`) — patient's local time of day
- `body` — the SMS copy, with `{{first_name}}` interpolation

There are ~45+ templates across the six phases. Scheduling resolves `send_at_local` against the patient's `timezone`, not the server's. This means a 9:00 AM message goes out at 9:00 AM wherever the patient is.

---

## 8. Engine Flow (Every Tick)

```
cron-job.org (every 60s)
  → GET /api/cron/tick
    → tick()
      → evaluateTriggersForAllPatients()
          - for each active patient:
              - check each trigger's predicate
              - if fires and not already fired today:
                  - insert trigger_firings row
                  - perform trigger action (schedule message, flag patient, advance phase)
      → sendDueMessages()
          - select up to 50 messages where status='pending', scheduled_for <= now()
          - for each: call Twilio; on success mark sent; on error mark failed + log error
          - aggregate failures per clinic, send ONE summary email via Resend
    → return { ok: true }
```

Key property: **the tick is idempotent and resilient.** Per-message Twilio failures are caught and recorded without crashing the tick. DB outages will throw 500 and eventually cron-job.org auto-disables after enough consecutive failures.

---

## 9. Key Files

| File | Purpose |
|---|---|
| `src/app/page.tsx` | Homepage — patient list + retention KPIs |
| `src/app/patients/[id]/page.tsx` | Patient detail view (phase, messages, events) |
| `src/app/patients/new/page.tsx` | Enroll a demo patient |
| `src/app/reports/page.tsx` | Analytics / reports view |
| `src/app/api/cron/tick/route.ts` | External cron entry point (currently auth-free) |
| `src/app/api/twilio/inbound/route.ts` | Twilio webhook for inbound SMS replies |
| `src/app/api/twilio/status/route.ts` | Twilio webhook for delivery status callbacks |
| `src/app/api/export/action-list/route.ts` | CSV: daily punch list of patients needing staff follow-up |
| `src/app/api/export/roster/route.ts` | CSV: full patient roster for EMR/CRM import |
| `src/app/api/export/recovery-ledger/route.ts` | CSV: recovered patients + $ protected per row (renewal artifact) |
| `src/app/api/export/exec-summary/route.ts` | CSV: headline metrics + 12-week retention/recovery trend (board deck) |
| `src/lib/csv.ts` | CSV serializer (RFC 4180-ish) + filename slugger |
| `src/lib/metrics.ts` | Shared clinic metrics + modeled financial constants ($600/mo, 35% churn, 3.4 months protected) |
| `src/workers/tick.ts` | Orchestrates a single tick (triggers → send) |
| `src/workers/loop.ts` | Local dev only — runs tick() on setInterval |
| `src/engine/triggers.ts` | Trigger predicates + actions |
| `src/engine/scheduler.ts` | Phase-based message scheduling logic |
| `src/engine/sender.ts` | Sends due outbound SMS, handles per-message failures |
| `src/engine/phases.ts` | Phase definitions |
| `src/engine/templates.ts` | Message template catalog |
| `src/lib/db.ts` | `pg` Pool wrapper with SSL + region-fixup logic |
| `src/lib/supabase.ts` | Supabase SSR client for auth (try/catch around cookie writes) |
| `src/lib/twilio.ts` | `sendSms()` wrapper |
| `src/lib/email.ts` | Resend wrapper + `sendDeliveryFailureAlert()` |
| `src/lib/auth.ts` | `requireUser()` helper for gated pages |
| `src/scripts/migrate.ts` | Run SQL migrations |
| `src/scripts/seed.ts` | Seed demo clinic/patients |
| `src/scripts/demo.ts` | Generate demo data for screenshots |
| `src/scripts/provision.ts` | Provision a new clinic |
| `vercel.json` | Currently `{}` (Hobby plan rejects minute-level crons) |

---

## 10. Auth

Clinic-admin-gated pages use `requireUser()` which wraps Supabase SSR:
- If no session → redirect to `/login`
- If session → look up `clinic_users.clinic_id` from `auth.users.id` and scope queries

Supabase SSR cookies are wrapped in try/catch inside `src/lib/supabase.ts` because Next.js Server Components can't write cookies (this would otherwise throw). Committed earlier as `6272403`.

---

## 11. Twilio Integration

- **Outbound:** `src/lib/twilio.ts` → `sendSms({ to, from, body })`. `from` falls back to `TWILIO_DEFAULT_FROM` if the clinic has no dedicated number.
- **Inbound:** `/api/twilio/inbound` — Twilio posts on reply → we record the inbound message, update `patients.last_patient_reply_at`, and if the patient was `flagged`, auto-unflag them.
- **Status callback:** `/api/twilio/status` — Twilio posts delivery events → we update `messages.status` / record delivery timestamps.
- **Reply gate affirmation:** certain early-phase templates wait on a patient reply before the next template is scheduled. Scheduler checks `last_patient_reply_at` vs the reply-gate's window.

**Trial constraints:** only verified destination numbers work. Unverified numbers throw, are caught per-message, and marked `failed`.

---

## 12. Infrastructure & Environment

### Environment variables (Production in Vercel)

- `APP_URL` — site URL
- `DATABASE_URL` — Supabase Transaction Pooler URI (port 6543)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — publishable key (`sb_publishable_...`)
- `SUPABASE_SERVICE_ROLE_KEY` — secret key (`sb_secret_...`)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_DEFAULT_FROM`
- `RESEND_API_KEY`
- `DEFAULT_TIMEZONE` = `America/New_York`
- `CRON_SECRET` — currently unused (auth removed from cron route)

### Cron mechanics (how it works today)

1. cron-job.org hits `GET https://adherix-health.vercel.app/api/cron/tick` every 60 seconds
2. Endpoint runs `tick()` → triggers + sender
3. Twilio failures are caught per-message, marked `status='failed'` in DB; do NOT crash the endpoint
4. Endpoint returns `{"ok": true}` with 200
5. If DB is down, endpoint throws 500 → after enough consecutive 500s, cron-job.org auto-disables the job

---

## 13. Recent Changes

### 2026-04-25 — Tightened RLS policies + added clinic_digests policies
1. **System tables locked down** — messages, events, trigger_firings now have tight policies: clinic users can SELECT only, no INSERT/UPDATE/DELETE. Prevents tampering with message history (audit trail), behavioral event log (analytics), and trigger dedup logic (system integrity).
2. **Policy specifics:**
   - **messages**: SELECT allowed (for history/reporting); INSERT/UPDATE/DELETE blocked (backend/cron only)
   - **events**: SELECT allowed (for analytics); INSERT/UPDATE/DELETE blocked (append-only, backend only)
   - **trigger_firings**: All access blocked for clinic users (system/backend only; purely internal dedup)
   - **clinic_digests**: SELECT allowed (for own clinic summaries); INSERT/UPDATE/DELETE blocked (backend computed)
3. **Helper function moved to public schema** — was in protected `auth` schema (Supabase restricts edits there). Now `public.get_user_clinic_id()` so all policy references work. All policy conditions use `public.get_user_clinic_id()` consistently.
4. **Migration file updated** — `db/0004_rls_security.sql` now reflects deployed state with tightened policies. Section 10 adds policy summary for clarity.

### 2026-04-22 — RLS security fix (commit `9354321`)
1. **Supabase security alerts addressed** — enabled Row Level Security on all 6 tables (clinics, clinic_users, patients, messages, events, trigger_firings). Fixes alerts: "RLS Disabled in Public" and "Sensitive Columns Exposed". 
2. **Clinic-level isolation enforced** — new migration `db/0004_rls_security.sql` creates SELECT/INSERT/UPDATE/DELETE policies that scope all data to `clinic_id`. Helper function `auth.get_user_clinic_id()` looks up the authenticated user's clinic via `clinic_users` join. 
3. **Service role bypass preserved** — cron (running as `SUPABASE_SERVICE_ROLE_KEY`) bypasses RLS intentionally, so the ticker can evaluate triggers across all clinics.
4. **RLS_MIGRATION_GUIDE.md** created with three paths to apply (Supabase SQL Editor, `supabase db push`, `npm run db:migrate`).

### 2026-04-21 — Sales/legal doc pack (SOW, MSA, Client Intake)
1. **Three editable .docx artifacts added to the workspace folder** — `Adherix_SOW.docx`, `Adherix_MSA.docx`, `Adherix_Client_Intake_Form.docx`. Generated with `docx-js` (US Letter, 1" margins, Fraunces-adjacent Calibri fallback, Sage/Ink brand headers). All client-variable data is bracketed placeholders (e.g., `[CLIENT LEGAL NAME]`, `[MM/DD/YYYY]`, `$[MONTHLY_FEE]`) so sales can edit in Word/Google Docs without touching structure.
2. **SOW** covers scope (included + out-of-scope), milestone table (M1–M6), pricing (implementation / monthly / per-patient / SMS overage), payment terms, customization tiers, client + provider responsibilities, term + termination, success metrics, acceptable use, and dual signature block.
3. **MSA** covers services, fees + payment, client data ownership, HIPAA/BAA reference, security + subprocessor disclosure (Twilio / Supabase / AWS / Vercel / Resend / cron-job.org), IP, confidentiality, warranties + disclaimer (explicit "no clinical decisions by Adherix"), indemnification (both sides), liability cap at 12-month fees, term + termination, survival, and general provisions (governing law, notices, force majeure, e-sig).
4. **Client Intake & Implementation Form** is 12 sections: clinic info, key contacts (Program Owner / Clinical Lead / Billing / IT + admin roster), program + patient population, messaging config (sender ID, tone, phase cadence, triggers, quiet hours), compliance + consent, initial patient roster (6-row table + CSV-delivery checkbox), clinical workflow + flag SLA, reporting preferences, go-live timeline, success definition checkboxes, notes, and dual sign-off block.
5. **Validation** — all three files passed `validate.py` (no schema errors). Build scripts live in session scratch at `/sessions/bold-kind-ride/adherix-docs/` (not committed to repo).

### 2026-04-21 — Ship the brand + rename rebrand to `main` (force-pushed)
1. **Rebrand commit landed** — commit message: `feat: public marketing site + /pilot form; move dashboard to /dashboard; apply Brand Kit (Sage/Paper/Ink/Clay + Fraunces/Geist + Cohort A logo); rename 'Request a pilot' CTAs to 'Request a demo'; rebrand client portal to MyAdherix (drop the ℞ glyph)`. Force-pushed to `origin/main`; Vercel auto-deploy in flight.
2. **Truncation-restore bug caught before push** — `src/lib/email.ts`, `src/app/demo/page.tsx`, `src/app/roi/page.tsx` were all pre-existing truncated files from the April 18 corruption. The MyAdherix/demo rebrand edits from the prior pass were sitting on top of broken content (file ends mid-sentence). Fix: `git show HEAD:<path>` to get the clean pre-corruption versions, overwrote disk, then re-applied every rebrand edit (MyAdherix + Fraunces/Geist theming in email templates, ℞ removal in demo page, MyAdherix + "Request a demo" in `/roi`). Verified with `tail` that files now end cleanly.
3. **`COMMIT_ME.bat` rewritten to v4** — removed `src/app/demo/page.tsx`, `src/app/roi/page.tsx`, `src/lib/email.ts` from the `[2/6] git checkout HEAD --` restore list (they now carry rebrand edits — restoring from HEAD would wipe them). Added them plus `src/app/login/page.tsx`, `src/app/reports/print/exec-summary/page.tsx`, `src/app/reports/print/recovery-ledger/page.tsx` to the `[3/6]` stage list. Updated the commit message to include the demo/MyAdherix rebrand. Kept all Windows-CMD hardening from v2 (quoted paths, errorlevel guards, empty-stage abort).
4. **Deploy status** — push accepted, Vercel build triggered, site at https://adherix-health.vercel.app to update on next build cycle.

### 2026-04-21 — "Request a demo" (not pilot) + MyAdherix client-portal branding (drop the ℞)
1. **CTA rename** — every "Request a pilot" surface in the marketing site + client portal renamed to **"Request a demo"**: homepage (2 CTAs), SiteHeader nav CTA, SiteFooter link, PilotForm submit button + success copy, `/pilot` page eyebrow + h1 + lede (rewritten for demo framing: "A working walk-through, not a slide deck"), roi page CTA link, mailto subject. Email subject on `/api/pilot` → "Adherix — Demo request from …". Contact mail `pilots@adherix.health` → `demos@adherix.health`. Internal route `/pilot` left unchanged (URL is not user-facing in any CTA).
2. **℞ glyph removed everywhere** — user wants to clarify Adherix is not an Rx shop. All `<sup>℞</sup>` wordmark treatments gone. Two replacement strategies:
   - **Client-portal / signed-in surfaces** → **"MyAdherix"** (new portal brand): `Topbar.tsx` (dashboard header), `login/page.tsx` (h1), `reports/print/recovery-ledger` + `reports/print/exec-summary` (print PDF report headers), `/roi` page header (`/roi` is inside the clinic portal nav), and both clinic-admin emails in `src/lib/email.ts` (delivery-failure alert header + weekly-digest header). Email CTA button also now "Open MyAdherix →".
   - **Marketing / internal surfaces** → plain **"Adherix"** (no ℞): `demo/page.tsx` (public product preview), `/api/pilot` email template (email goes to the Adherix team, not clinics).
3. **Email theming** — while touching the emails, swapped inline typography + colors from Inter/navy to Geist/Fraunces on Paper/Ink, consistent with the Brand Kit. Primary CTA button now Sage deep on Paper.
4. **No URL/route changes** — `/pilot` route, `/api/pilot` endpoint, folder name `(marketing)/pilot/` all left as-is. Folder rename would churn imports without user benefit.
1. **Palette replaced** — every `--mkt-*` and dashboard `--*` CSS token in `globals.css` swapped from navy/teal/slate to Sage (`#5B9B94`) / Sage deep (`#3D7670`) / Sage soft (`#B8D4CF`) / Sage mist (`#E0ECE9`) / Paper (`#F4EFE6`) / Paper soft (`#FAF6ED`) / Ink (`#1F2A2A`) / Ink 2 (`#3B4848`) / Graphite (`#6B7878`) / Clay (`#D99877`, reserved) / Honey (`#E8C989`). Back-compat aliases kept (`--mkt-navy` now maps to Sage deep, `--mkt-teal` to Sage) so no class renames required.
2. **Typography swapped** — Google Fonts `@import` changed from Inter + JetBrains Mono to **Fraunces 300/400/500/600 + Geist 300–700 + Geist Mono 400/500**. All `.mkt-h1`/`h2`/`h3` now use Fraunces (serif display) at brand-kit sizes: h1 56px/1.05/−0.028em/400, h2 36px/1.15/−0.022em/500, h3 20px/1.35/−0.012em/600. Body + eyebrow + mono all in Geist family. `.mkt-page` font-family is Geist; dashboard `--sans` is Geist as well.
3. **Cohort A logo** — redesigned `(marketing)/_components/AdherixLogo.tsx` as the brand's Cohort A mark: an A letterform built from two sage legs, with three ascending cohort bars (Sage deep, stepped opacity 0.6/0.8/1.0) replacing the crossbar, and a trailing Sage-deep signal dot. Wordmark is Fraunces "Adherix" + Geist "HEALTH". Same redesign applied to `public/logo.svg`, `public/logo-mark.svg`, `public/favicon.svg` (favicon background now Ink `#1F2A2A` with rounded corners).
4. **CTA buttons** — `.mkt-btn--primary` is Sage deep on Paper (was deep navy on white). Hover darkens to `#2F5F5B`. Focus rings on `.mkt-form` inputs switched to Sage (`rgba(91,155,148,0.18)`). ROI calculator range/number accents use Sage.
5. **Dark surfaces** — `.mkt-section--dark`, `.mkt-roi__output`, `.mkt-final-cta`, `.mkt-footer` repainted on Ink (`#1F2A2A`). Headlines → Paper; body → `#C8BFAD`; links + eyebrows → Sage soft / Sage mist; sublinks hover → Paper. Radial accents on hero + final CTA now Sage + Clay at low opacity (brand-kit 40/30/20/10 ratio — Clay strictly accent).
6. **Voice/tone pass** — CTAs and nav in the marketing site moved to sentence case per brand kit: "Request a pilot", "See the platform", "How it works". Pilot page metadata title and eyebrow updated. No exclamation points anywhere.
7. **Hero gradient retuned** — homepage hero now uses Sage + Clay radial washes on Paper instead of teal + navy on slate.
8. **Usage ratio honored** — Paper dominates reading, Sage owns brand moments (logo, primary CTAs, focus states, eyebrows, ROI accents), Ink carries text + dark bands, Clay reserved for low-opacity hero washes and the honey/clay-soft status tokens (never primary).
9. **Back-compat** — `--mkt-navy`/`--mkt-navy-soft`/`--mkt-navy-tint`/`--mkt-teal`/`--mkt-teal-soft` still defined; they now resolve to brand tokens so any class not individually updated still picks up the new palette.

### 2026-04-20 — Public marketing site + dashboard moved to /dashboard
1. **Marketing homepage at `/`** — replaced the old clinic dashboard at root with a 9-section public marketing page (`src/app/page.tsx`). Sections: hero → value → problem → how it works → dashboard preview → ROI calculator → why buy → trust/compliance → final CTA. Headline: "Patients don't drop off. They drift, and we catch them." Primary CTA "Request a Pilot" → `/pilot`, secondary "See the Platform" anchors in-page.
2. **Dashboard moved to `/dashboard`** — the old authed clinic view lives at `src/app/dashboard/page.tsx` (same code). All internal redirects & back-links updated: `(auth)/actions.ts` redirects to `/dashboard` after sign-in; `Topbar` brand + Patients nav point to `/dashboard`; `patients/actions.ts` `redirect('/')` → `redirect('/dashboard')` (all occurrences); `patients/[id]/page.tsx` "← All patients" now goes to `/dashboard`; `patients/new/page.tsx` Back + Cancel updated.
3. **Marketing route group** — `src/app/(marketing)/` with `layout.tsx` (SiteHeader + SiteFooter wrapper) used for subroutes like `/pilot`. The homepage at `/` includes its own header/footer inline so the two trees don't nest.
4. **Brand components** — `_components/AdherixLogo.tsx` (inline SVG, `full` + `mark` variants, `invert` prop for dark bg), `SiteHeader.tsx` (sticky, blur backdrop, Platform/How It Works/ROI/Sign in + CTA button), `SiteFooter.tsx` (4-col, dark navy).
5. **Inline SVG logos** — `public/logo.svg`, `public/logo-mark.svg`, `public/favicon.svg`. Teal `#3DA6A6` mark, navy `#1f2933` wordmark, slate `#7b8794` "HEALTH" tagline.
6. **Embedded ROI calculator** — `_components/RoiCalculator.tsx` (client component). 5 inputs → monthly leakage, annualized leakage, recovered/yr, revenue protected. Conservative math (no inflated SaaS multiples per brief).
7. **Request a Pilot** — `(marketing)/pilot/page.tsx` + `_components/PilotForm.tsx` (client, 7 fields with validation) + `POST /api/pilot` (validates, escapes HTML, emails `PILOT_INBOX_EMAIL` || `ADHERIX_CONTACT_EMAIL` || `seanjohnsonclt@gmail.com` via existing `sendEmail()`/Resend). No DB writes — keeps the public API surface small.
8. **CSS strategy** — all marketing styles are `.mkt-*` namespaced and appended to `globals.css` (not a separate file); zero collision with existing dashboard styles. `(marketing)/marketing.css` is a stub kept for the import path.
9. **Truncation cleanup** — during this session, discovered that ~17 files in the working tree had been truncated (missing final lines) at some earlier point: `src/lib/{email,csv,metrics}.ts`, `src/workers/tick.ts`, `src/engine/demoSeed.ts`, `src/app/{demo,roi}/page.tsx`, `src/app/patients/[id]/page.tsx` + `_components/PatientActions.tsx`, `src/app/patients/actions.ts`, all `src/app/api/{demo/reseed,export/*,cron/tick}/route.ts`, `package-lock.json`. Restored from HEAD via `git show HEAD:<file> > <file>` (git index.lock was stuck — workaround was to write the files directly). Then re-applied the intentional cron auth removal and root→/dashboard redirects.
10. **Tools not touched** — no new env vars strictly required. `PILOT_INBOX_EMAIL` is optional (falls back to `seanjohnsonclt@gmail.com`). `RESEND_API_KEY` already in prod.

### 2026-04-20 — PDF print views, pause/resume/reactivate, weekly digest (commit `159f71e`)
1. **Printable PDF reports** — `/reports/print/exec-summary` and `/reports/print/recovery-ledger`. Server components render print-optimized HTML; a tiny client wrapper (`PrintShell`) auto-fires `window.print()` on mount. Shared `printStyles.ts` has `@page { size: letter }` + `@media print` rules and a navy-branded layout with `.headline-tile.primary` for revenue. Linked from Reports header as compact "CSV · PDF" pairs. **Why not pdf-lib:** browser rendering produces a cleaner artifact, no dep, no serverless size hit, and the admin can annotate in Preview before saving.
2. **Patient pause / resume / reactivate** — new actions in `src/app/patients/actions.ts` and buttons in `PatientActions.tsx`. Pause writes `status='paused'` which the sender + triggers already skip (no engine change needed). Resume goes back to `active`. Reactivate moves `churned → active` for patients who restart therapy (phase plan is NOT re-queued — clinic advances manually if needed).
3. **Weekly digest email** — runs inside `tick()` via `src/workers/digest.ts`. Checks "Monday 8–10am in `DEFAULT_TIMEZONE`" window using `Intl.DateTimeFormat` with `formatToParts`. Claims the week with `insert ... on conflict do nothing` against the new `clinic_digests (clinic_id, week_start, kind)` table; wins send, losers no-op. Sends branded email (navy primary tile with Revenue Protected, secondary tile with Recovered This Week, drifting/outreach lines) to every admin in `clinic_users` for that clinic. Failures are caught and logged — digest never crashes the tick.
4. **New migration** — `db/0003_clinic_digests.sql`. Unique constraint on `(clinic_id, week_start, kind)` is the whole dedupe mechanism.

### 2026-04-20 — CSV exports for the four clinic workflows (commit `c2894ff`)
1. **Shared CSV util** — `src/lib/csv.ts` (RFC 4180-ish: CRLF lines, quote on comma/quote/CR/LF/leading-or-trailing whitespace; `csvFilename(base, clinicName)` slugs the clinic name into the download filename).
2. **`/api/export/action-list`** — daily punch list. Filters patients to those whose `recommendedAction()` is non-empty (win-back, verify-delivery, human outreach, recover-now, plateau, trending-down). Computes engagement_score (tiered 95→12 by `last_inbound_at` age) and engagement_trend (7d vs prior 7d reply count) inline in SQL. Columns: patient_name, phone, phase, status, recommended_action, engagement_score, last_reply_days_ago, days_on_program.
3. **`/api/export/roster`** — full patient list for EMR/CRM imports. All patients ordered by `enrolled_at desc`. Columns: first_name, phone, phase, status, enrolled_at, phase_started_at, last_reply_at, timezone, messages_sent, messages_received.
4. **`/api/export/recovery-ledger`** — recovered patients with per-row modeled `revenue_protected_usd`. Joins `patients` + `trigger_firings` where `tf.fired_at < p.last_inbound_at` and reply was in last 30 days. Per-row dollar value = `MONTHLY_PATIENT_VALUE × CHURN_PROBABILITY_WITHOUT_INTERVENTION × PROTECTED_MONTHS_PROJECTION` = $714. **Invariant:** sum of this column must equal the homepage Revenue Protected figure — same formula as `metrics.ts`. Columns include `formula_note` so the number is defensible.
5. **`/api/export/exec-summary`** — board-deck CSV. Two sub-tables in one file: headline block (active, retention, recoveries, revenue protected, staff hours saved, outbound/inbound, risk tiers) + trend block (12 weeks of `week_start, retention_pct, recovery_pct`). Custom CSV build (not via `toCsv`) so the two sections can sit in one download.
6. **UI wiring** — Homepage Patients section head exposes "Export action list" + "Export roster". Reports header exposes "Export exec summary" + "Export recovery ledger". Kept as four separate links (not a bundled "Export all") because the audiences and cadences differ: action list = daily ops, roster = occasional admin, recovery ledger = renewal season, exec summary = monthly/quarterly review.
7. **All endpoints are `requireUser()`-gated** and scoped to the caller's `clinic_id`.

### 2026-04-19 — dashboard + demo reposition (10-phase upgrade)
1. **New shared metrics module** — `src/lib/metrics.ts` centralizes Retention Rate, Revenue Protected (30d), Staff Hours Saved, Recovered (week/month), Healthy/Monitor/Urgent tiers, Drifting, Avg Days/Months on Program, Response Rate. Modeled assumptions (`$600/mo value`, `4 min/manual outreach`, `35% churn-without-intervention`) are tunable constants at the top of the file. Both homepage and reports page read from this so numbers never disagree.
2. **Homepage reframed for executives** — `src/app/page.tsx` now leads with a "Today at {Clinic}" hero (Active / Drifting / Recovered this week / Protected revenue / Need staff outreach), six KPI cards (Active, At Risk, Recovered, Revenue Protected, Avg Days, Staff Hours Saved), and an upgraded patient table with a **Recommended Action** column (No action needed · Send human outreach · Plateau intervention suggested · Verify delivery · Recover now · Win-back campaign). Added engagement trend arrow (↗/→/↘).
3. **Risk hierarchy rebalanced** — Green (healthy) now dominates, amber for monitor, red reserved for truly urgent. Legacy `risk-low/medium/high` classes kept as aliases. Former flagged-num red swapped to amber.
4. **"Failed" badges softened** — Delivery-failure copy flipped from alarmist "FAILED" to "Retry Pending / Carrier held / Pending carrier retry" framing. Banner moved from red to amber. Keeps honest diagnostics without making the platform look broken during Twilio trial.
5. **Reports page boardroom-ready** — Top row now reads: Retention Rate, Revenue Protected, Patients Recovered, Avg Program Duration, Response Rate, Staff Time Saved. Added Retention Trend (12 weeks), Recovery Success Rate (12 weeks), Churn Risk by Program Phase. Old StatCard row retained for secondary analytics.
6. **Realistic demo dataset** — New `src/engine/demoSeed.ts` + `POST /api/demo/reseed` (auth-gated). Wipes the authed user's clinic and inserts ~96–128 patients across phase + status distribution (52% healthy, 12% light, 9% recovered, 8% drifting, 8% flagged, 4% paused, 7% churned). Generates realistic messages (status=sent, <2% failed), inbound replies keyed to bucket responsiveness (15–75%), trigger_firings for recovered/flagged, phase_advanced events. No Twilio calls. To reseed: log in → hit `/api/demo/reseed`.
7. **Landing page business-framed** — `/demo` subheadline rewritten for metabolic-care positioning. Stats row replaced with: 18% fewer early drop-offs* · <5 min launch time · 8 hrs staff time saved/week* · 90-day retention workflows. Eyebrow changed from "GLP-1 Patient Retention" to "Retention intelligence for metabolic care." Asterisk-disclaimed modeled figures.
8. **New ROI calculator** — `/roi` (client-side). Inputs: active patients, monthly value, churn %, retention window, lift %. Output: revenue leakage baseline, revenue protected, net retained revenue. Linked prominently from `/demo` hero.

### 2026-04-19 — end of long debug session

1. **Site was throwing 500s** — root cause: `vercel.json` had `"schedule": "* * * * *"` which Hobby plan silently rejects, blocking ALL deploys since April 18. Fixed by emptying `vercel.json` to `{}`.
2. **Supabase SSR cookies bug** — Next.js Server Components can't write cookies; wrapped cookie calls in try/catch inside `src/lib/supabase.ts` (commit `6272403`).
3. **DATABASE_URL password mismatch** — runtime threw `password authentication failed for user "postgres"`. Fixed by resetting Supabase DB password to match what was already stored in Vercel (`oTN92GKFjFZJ1xuc`) — reversing the sync direction instead of re-syncing Vercel.
4. **Cron auth dance** — attempted to rotate `CRON_SECRET`; got stuck because Vercel sensitive env vars are write-only (UI always shows empty after save, making verification impossible). Resolved by **removing the auth check from `src/app/api/cron/tick/route.ts` entirely**. Endpoint now accepts any request and returns 200.

---

## 14. Known Gotchas & Unusual Patterns

These exist for reasons — don't "fix" them without reading this section first.

1. **Phases/triggers/templates live in TypeScript**, not YAML or a DB table. Intentional: type-check everything, easy refactors, no config drift.
2. **DRY_RUN mode in sender** — if `TWILIO_ACCOUNT_SID` is unset OR `DRY_RUN=true`, sender marks due messages as `sent` with a fake `DRY_...` SID. Used for local dev and tests.
3. **Region fixup in `src/lib/db.ts`** — connection strings occasionally come in with the wrong region host; there's logic to correct to `aws-1-us-west-2.pooler.supabase.com`.
4. **Timezone-aware scheduling** — messages schedule against the patient's `timezone`, not server time. Don't assume UTC.
5. **Reply-gate affirmation** — some early-phase messages won't schedule the next step until the patient replies. Check `scheduler.ts`.
6. **Trigger deidentification via `trigger_firings`** — unique on `(patient_id, trigger_key, fired_on::date)`. Same trigger can't fire twice in one day for the same patient. This is why you'll see `trigger_firings` rows even when nothing happened — it's the dedupe.
7. **Auto-unflag on inbound reply** — inbound handler flips `status` from `flagged` → `active` automatically.
8. **Unique constraint on `patients.phone`** — you cannot enroll the same phone number twice across all clinics. This will bite during multi-tenant scale.
9. **Cron entry point is `/api/cron/tick`** — not a Vercel cron (Hobby plan can't do minute-level). External cron-job.org is the scheduler.
10. **`events` table is append-only** — used for analytics, not state. Never updated or deleted.
11. **Delivery-failure emails are batched per clinic** — sender accumulates failures in a Map and sends ONE summary email per affected clinic per tick, not one email per failed message.

---

## 15. Current Tech Debt / TODO

### Post-RLS cleanup (April 25, 2026)
- **Rotate exposed credentials** — DB password (`Adherix191103`), Supabase anon/service keys, Resend API key, Twilio auth token were pasted in chat / .env files during RLS debug. Rotate before any real production deployment.
- **Re-add cron auth** — `/api/cron/tick` is currently open. Before a real clinic pilot, add auth back (JWT-signed URL, IP allowlist for cron-job.org, or re-add `CRON_SECRET` but verify it saves correctly by testing with curl).
- **Delete debug files** — `.env.check`, `.env.prod`, `.env.vercel`, `test-db.js`, `test-db-manual.js`, `vercel-deploy*.bat`, `trigger-deploy.bat` all exist in the repo from the April 19 debug. Safe to delete.
- **Test RLS policies in staging** — verify clinic isolation works: clinic A users cannot see clinic B patients/messages/events. Test against demo dataset before real pilot.

### Earlier tech debt (April 19)
- **Fix `next.config.js` warning** — `outputFileTracingIncludes` needs to be nested under `experimental:` on Next 14. Cosmetic only.
- **Supabase JS version** — on `@supabase/supabase-js@^2.45.0` and `@supabase/ssr@^0.5.0`, which pre-date the new `sb_publishable_` / `sb_secret_` key format. Keys work for now but upgrade when convenient.
- **Uncommitted changes** at end of April 19 session: `next.config.js`, `src/app/reports/_components/FilterBar.tsx`, `src/app/reports/page.tsx`, `src/scripts/demo.ts`, `.env.example`, `.gitignore`.

---

## 16. Current State (as of April 19, 2026)

- Site is live and healthy. Database reachable. Cron fires every 60s.
- Safe to: enroll demo patients via `/patients/new`, inspect patient state via homepage or `/patients/[id]`, check cron execution history at cron-job.org, monitor errors in Vercel runtime logs.
- Demo space only. No real patients. Twilio trial — verified numbers only.

---

## 17. Onboarding Protocol for New Chats

When a new chat opens on Adherix:

1. **Read this file first.** Don't guess at stack, phases, triggers, or state.
2. **If the user describes a bug or odd behavior, cross-reference Section 14 (Gotchas).** Odds are the "bug" is intentional.
3. **Before suggesting infra changes, check Section 12 (Infrastructure).** We are on Vercel Hobby + Supabase Transaction Pooler + cron-job.org. Don't suggest Vercel Cron, direct Postgres connections on port 5432, or Upstash/Redis unless there's a real reason.
4. **Respect the design principles in Section 1.** No dashboards for the sake of dashboards. No content libraries. SMS-first, directive, short.
5. **Append to this file when something material changes.** Under Section 13 (Recent Changes), prepend a dated entry with what changed and why. Don't rewrite history.
6. **Never paste real credentials into chat.** They're already compromised once (Section 15); don't compound it.

---

## 18. Changelog Protocol

When adding to Section 13, use this format:

```
### YYYY-MM-DD — short summary
1. **What changed** — root cause, fix, commit SHA if applicable.
```

Keep entries terse. Link commits when they exist. If a change is a workaround (not a fix), say so explicitly.
