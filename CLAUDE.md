# Adherix Health — Claude Code Context

> Full project history is in `C:\Users\seanj\OneDrive\Documents\Claude\Projects\Adherix Health\BIBLE.md`.
> Read BIBLE.md at the start of any session. This file covers operational essentials only.

---

## What This Is

Adherix Health is a behavior-driven SMS adherence system for GLP-1 and pediatric weight management programs.
Two product arms:
- **Adherix Keep** - adult GLP-1 adherence, drift correction, injection confirmation
- **Adherix Quest** - pediatric/adolescent (ages 13-18), gamified: XP, levels, squads, boss challenges, leaderboard

**Status:** Demo/validation phase. Live at https://adherixhealth.com. No real clinic pilots yet.

---

## Stack

| Layer | Choice |
|---|---|
| Frontend/API | Next.js 14 App Router, Server Components |
| Database | Postgres via Supabase (Transaction Pooler, port 6543) |
| DB driver | `pg` (node-postgres) via `DATABASE_URL` |
| Auth | Supabase SSR (`@supabase/ssr`) |
| SMS | Twilio (trial account - verified numbers only) |
| Email | Resend (delivery-failure alerts to clinic admins) |
| Hosting | Vercel Hobby plan |
| Cron | cron-job.org hits `/api/cron/tick` every 60s |

---

## Common Commands

```bash
# Dev server
npm run dev

# Type check
npx tsc --noEmit

# Run DB migrations
npx ts-node -r tsconfig-paths/register src/scripts/migrate.ts

# Seed demo data (GLP-1)
# POST /api/demo/reseed  (must be logged in)

# Seed Quest demo data
# POST /api/demo/reseed?modality=quest  (must be logged in)
```

---

## CRITICAL: File Write Constraint

**Never use the Edit tool on files in `C:\Dev\AdherixHealth`.**
The directory is on an OneDrive FUSE mount. Edit tool causes silent truncation/corruption.

Always write files with Python:
```python
with open(r"C:\Dev\AdherixHealth\src\...", "w", encoding="utf-8") as f:
    f.write(content)
```

Or bash heredoc with ASCII-only content (no multi-byte UTF-8 like arrows or em dashes).

Also: never use em dashes (`-`) in source files - use regular dashes (`-`). Em dash bytes have caused file truncation bugs.

Git operations must be done by Sean in PowerShell. If `index.lock` appears, Sean runs:
```powershell
del .git\index.lock
```

---

## Architecture Essentials

**Engine flow (every 60s tick):**
```
cron-job.org -> GET /api/cron/tick
  -> tick()
    -> updateAllTrajectories()
    -> evaluateTriggersForAllPatients()    # fires triggers, deduped via trigger_firings
    -> runDriftCorrection()
    -> runResolutionTracker()
    -> sendDueMessages()                   # up to 50, calls Twilio
    -> runWeeklyDigestIfDue()
    -> sendWeeklyBossChallenge()           # Quest: Monday only
    -> runSundayBossCheck()               # Quest: Sunday only
```

**Key patterns:**
- Phases/triggers/templates live in TypeScript (not DB/YAML) - intentional, type-checked
- `trigger_firings` dedupes: unique on `(patient_id, trigger_key, fired_on::date)`
- `DRY_RUN=true` in Vercel currently - zero real SMS going out until removed
- Messages schedule against patient `timezone`, not server time
- Cron endpoint `/api/cron/tick` is currently open (no auth) - intentional for now

**Quest-specific:**
- Consent routing: `getConsentType(age, state)` in `src/engine/quest-consent.ts`
- Dual-channel SMS: teen gets message, guardian gets sanitized copy (no PHI)
- Boss challenges: Monday send, Sunday check, XP stake (+30 win, -30 monthly ledger on loss)
- Reward tiers: 500 monthly XP = $5, 1000 = $10, 2500 = $25 (manual fulfillment)
- Leaderboard: rebuilt every Sunday, dark horse + comeback flags

**AI personalization:**
- Every outbound SMS passes through Claude Haiku before send (src/lib/ai.ts)
- Falls back to template body on any failure - never crashes tick
- No drug names/doses sent to AI - uses generic categories only
- `ANTHROPIC_API_KEY` already set in Vercel

---

## Key Files

| File | Purpose |
|---|---|
| `src/workers/tick.ts` | Tick orchestrator |
| `src/engine/triggers.ts` | Trigger predicates + actions |
| `src/engine/scheduler.ts` | Phase-based message scheduling |
| `src/engine/sender.ts` | Outbound SMS + Twilio |
| `src/engine/quest-game.ts` | XP, levels, streaks, leaderboard |
| `src/engine/quest-consent.ts` | Minor consent routing by age + state |
| `src/engine/boss-challenge.ts` | Boss challenge weekly cycle |
| `src/engine/demoSeed.ts` | Demo data (GLP-1 + Quest) |
| `src/engine/ai.ts` | Claude Haiku personalization |
| `src/lib/db.ts` | pg Pool wrapper (SSL + region fixup) |
| `src/lib/config.ts` | GLP-1 templates + triggers |
| `src/lib/quest-config.ts` | Quest templates + triggers |
| `src/lib/bariatric-config.ts` | getConfig() router for all modalities |
| `src/app/api/cron/tick/route.ts` | Cron entry point |
| `src/app/api/twilio/inbound/route.ts` | Inbound SMS handler |
| `src/app/admin/rewards/page.tsx` | Quest reward fulfillment dashboard |
| `src/app/roi/page.tsx` | ROI calculator (Keep + Quest tracks) |

---

## Database Tables

`clinics`, `clinic_users`, `patients`, `messages`, `events`, `trigger_firings`,
`injection_events`, `weight_logs`, `quest_squads`, `quest_leaderboard`,
`quest_boss_challenges`, `quest_consent_log`, `keyword_review_queue`,
`inbound_scan_log`, `drift_correction_events`, `resource_downloads`, `clinic_digests`

All patient data carries `clinic_id` for multi-tenant isolation. RLS enabled.

---

## Environment Variables (Vercel)

`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
`TWILIO_DEFAULT_FROM`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`,
`DEFAULT_TIMEZONE=America/New_York`, `DRY_RUN=true` (REMOVE before real pilot)

---

## Pre-Launch Blockers (Do Before First Real Patient)

1. Remove `DRY_RUN=true` from Vercel - currently blocks ALL real SMS
2. Rotate credentials (DB, Supabase, Twilio, Resend all exposed in prior chat)
3. Re-add cron auth to `/api/cron/tick`
4. Upgrade Twilio off trial account
5. Verify Resend domain + set `RESEND_FROM` env var

---

## Gotchas

1. **`vercel.json` must stay `{}`** - Hobby plan rejects minute-level crons and blocks all deploys
2. **Supabase SSR cookies** - wrapped in try/catch because Server Components can't write cookies
3. **Region fixup** - `src/lib/db.ts` corrects connection strings to `aws-1-us-west-2.pooler.supabase.com`
4. **Unique phone constraint** - `patients.phone` is globally unique across all clinics
5. **`events` table is append-only** - never update or delete rows
6. **Guardian-only templates** - `quest.boss_declined_guardian`, `staff.reply.guardian` route to guardian_phone not patient phone
7. **Auto-unflag** - inbound reply from flagged patient auto-flips status to active
8. **Pre-existing TSC errors** - MobileNav, ProductsDropdown, gauge/_page, overview/_overview have encoding errors that predate current work, ignore them

---

## Product Suite

| Name | Modality key | Target |
|---|---|---|
| Adherix Keep | `glp1` | Adult GLP-1 patients |
| Adherix Bridge | `bariatric` | Post-bariatric surgery |
| Adherix Gauge | (feature of Keep) | Weekly weight check-ins + milestones |
| Adherix Metabolic | `metabolic_health` | Pre-diabetes / metabolic risk |
| Adherix Quest | `quest` | Teens 13-18, gamified |

Rx (`pharmacotherapy`) and IBT (`behavioral_therapy`) still exist in DB constraints but are hidden from UI.

---

## Pricing (Current)

**Keep (adult GLP-1):**
- Launch: up to 100 patients - $999/mo + $1,500 impl
- Growth: 101-250 - $1,799/mo + $2,500 impl
- Performance: 251-500 - $2,999/mo + $5,000 impl
- Advanced: 501-1,000 - $4,999/mo + $7,500 impl
- Enterprise: 1,000+ - Custom

**Quest (pediatric):**
- Starter: up to 50 patients - $599/mo + $1,000 impl
- Core: 51-150 - $999/mo + $1,500 impl
- Growth: 151-300 - $1,599/mo + $2,500 impl
- Program: 301-500 - $2,499/mo + $4,000 impl
- Enterprise: 500+ - Custom

Reward admin fee: 10% of gift card value (Adherix revenue, clinic funds the cards).

---

## Demo Patients (Quest)

Five teens in two squads for prospecting demos:
- **Jordan** (@quickhawk, 14, TX, Beast, 620 total XP, 520 monthly XP -> $5 reward DUE)
- **Maya** (@solarpeak, 16, CA, Standard, 380 XP, power week active)
- **Devon** (@neonwolf, 13, FL, Chill, 85 XP, new patient, guardian track)
- **Aisha** (@ironrise, 17, WA, comeback after failed boss)
- **Carlos** (@boldtrack, 15, NY, guardian track, first boss completed)

Squads: Alpha (Jordan/Maya/Carlos), Beta (Devon/Aisha)
