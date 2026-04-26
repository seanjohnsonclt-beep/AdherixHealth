# DO NOT TOUCH — Adherix Health UI/UX Refresh Guardrails

> **For the AI doing the redesign work (Claude Code, 21st.dev, etc.):** This is a UI/UX-only pass on the marketing/public-facing surfaces. The engine, database, auth, API routes, brand kit, and logo are out of scope. Read this file BEFORE making any change. If a request would touch a file in the "Never modify" list below, STOP and ask first.

Project root: `C:\Users\seanj\OneDrive\Documents\Claude\Projects\Adherix Health\adherix\`
Cross-reference: `BIBLE.md` (sits next to this file) — Sections 9 (Key Files), 13 (Recent Changes), 14 (Gotchas).

---

## 1. Scope of this UI/UX pass

**In scope (you may modify these):**
- `src/app/page.tsx` — public marketing homepage
- `src/app/(marketing)/**` — marketing route group (pilot page, layout, marketing-only components)
- `src/app/demo/page.tsx` — public product preview
- `src/app/roi/page.tsx` — ROI calculator surface (note: also linked from auth nav, see §4)
- `src/app/login/page.tsx` — login surface (visual only, do not change auth logic)

**That's it.** Everything else is out of scope unless explicitly approved.

---

## 2. Never modify (engine + business logic)

These run the SMS engine. Touching them WILL break production patient messaging:

- `src/engine/**` — phases, triggers, scheduler, sender, templates, conditions, enroll, replyGate, demoSeed
- `src/workers/**` — tick, loop, digest
- `src/lib/db.ts` — Postgres pool + region fixup (BIBLE §14.3)
- `src/lib/twilio.ts` — SMS sender (DRY_RUN mode, §14.2)
- `src/lib/email.ts` — Resend wrapper, delivery-failure batching (§14.11)
- `src/lib/auth.ts` — `requireUser()` helper
- `src/lib/supabase.ts` — Supabase SSR with cookie try/catch (commit `6272403`, §10)
- `src/lib/csv.ts` — RFC 4180 CSV serializer (used by 4 export routes)
- `src/lib/metrics.ts` — modeled financial constants ($600/mo, 35% churn, 3.4 mo protected). The Recovery Ledger CSV must equal the homepage Revenue Protected number — both read from here.
- `src/scripts/**` — migrate, seed, demo, provision

---

## 3. Never modify (API + database)

- `src/app/api/**` — every route. Specifically:
  - `api/cron/tick/route.ts` — external cron entry, currently auth-free intentionally (BIBLE §13, April 19)
  - `api/twilio/inbound/route.ts` + `api/twilio/status/route.ts` — Twilio webhooks
  - `api/export/{action-list,roster,recovery-ledger,exec-summary}/route.ts` — clinic CSV exports
  - `api/pilot/route.ts` — demo request email handler
  - `api/demo/reseed/route.ts` — demo dataset reset
- `db/*.sql` — migrations: `0001_init.sql`, `0002_clinic_users.sql`, `0003_clinic_digests.sql`, `0004_rls_security.sql` (RLS landed April 22 + tightened April 25 — DO NOT regenerate or "clean up")
- `RLS_MIGRATION_GUIDE.md`

---

## 4. Never modify (auth-gated clinic portal "MyAdherix")

The portal was rebranded April 21 (BIBLE §13). Visual or copy changes here belong in a separate pass.

- `src/app/dashboard/page.tsx` — homepage was moved here from `/` April 20
- `src/app/patients/**` — list, detail, new, actions, components (`PatientActions.tsx` etc.)
- `src/app/reports/**` — including `_components/FilterBar.tsx`, `print/recovery-ledger/page.tsx`, `print/exec-summary/page.tsx`, and the shared `printStyles.ts`
- `src/app/(auth)/**` — auth actions
- Anything that imports `requireUser()` — that's the gate marker

`src/app/roi/page.tsx` is dual-linked (marketing CTA + portal nav). You can restyle it but **keep the `<SiteHeader />` / portal `<Topbar />` conditional intact** — don't strip nav wiring.

---

## 5. Never modify (brand kit — preserve, don't replace)

The brand landed April 21 (BIBLE §13). 21st.dev / any generator MUST inherit, not override, these:

**CSS variables in `src/app/globals.css`** — preserve all `--mkt-*` and dashboard color tokens. Specifically:

```
Sage         #5B9B94    (primary brand, --mkt-sage / --mkt-teal alias)
Sage deep    #3D7670    (primary CTA, --mkt-sage-deep / --mkt-navy alias)
Sage soft    #B8D4CF
Sage mist    #E0ECE9
Paper        #F4EFE6    (background)
Paper soft   #FAF6ED
Ink          #1F2A2A    (text + dark sections)
Ink 2        #3B4848
Graphite     #6B7878
Clay         #D99877    (low-opacity accent only — never primary)
Honey        #E8C989
```

**Back-compat aliases must remain** — `--mkt-navy` → Sage deep, `--mkt-teal` → Sage. Existing class names rely on these.

**Typography** — Fraunces (display, 300/400/500/600) + Geist (body, 300–700) + Geist Mono. Do not swap to Inter, system fonts, or anything else. The `@import` line in `globals.css` is correct as-is.

- `.mkt-h1` 56px / 1.05 / −0.028em / 400 weight Fraunces
- `.mkt-h2` 36px / 1.15 / −0.022em / 500 Fraunces
- `.mkt-h3` 20px / 1.35 / −0.012em / 600 Fraunces
- Body / eyebrow / mono → Geist family

**Voice** — sentence case for CTAs and nav. No exclamation points. "Request a demo" (NOT "Request a pilot" — renamed April 21). For client-portal surfaces use **MyAdherix** wordmark; for marketing use **Adherix** (no ℞ glyph anywhere — removed deliberately).

---

## 6. Never modify (logo assets)

The Cohort A logo was custom-designed April 21 (BIBLE §13.3). Don't regenerate, don't auto-replace, don't have 21st.dev "make a logo":

- `src/app/(marketing)/_components/AdherixLogo.tsx` — inline SVG, `full` + `mark` variants, `invert` prop
- `public/logo.svg`
- `public/logo-mark.svg`
- `public/favicon.svg` — Ink background, rounded

If 21st.dev outputs its own logo, replace the import with `<AdherixLogo />`.

---

## 7. Never modify (config + infra)

- `vercel.json` — must stay `{}`. Hobby plan rejects minute-level cron schedules; adding any `crons` key blocks ALL deploys (BIBLE §13, April 19, root cause of the 500s).
- `next.config.js` — known cosmetic warning about `outputFileTracingIncludes`; leave it (BIBLE §15)
- `package.json` / `package-lock.json` — only add deps if actually needed. Framer Motion is already installed.
- `tsconfig.json`
- `.env*` files — no edits, no creates, no commits. Credentials were exposed once (BIBLE §15); don't touch.
- `BIBLE.md` — append-only. If something material changes, add a dated entry to Section 13 per §18 protocol. Never rewrite history.

---

## 8. Safe-to-modify list (the actual UI/UX work)

Ordered by what generally drives the most visual lift:

| File | What you can do |
|---|---|
| `src/app/page.tsx` | Re-flow the 9 marketing sections (hero → value → problem → how it works → dashboard preview → ROI → why buy → trust → final CTA). Keep section count + intent. |
| `src/app/(marketing)/_components/SiteHeader.tsx` | Sticky header restyle — keep nav links (Platform, How it works, ROI, Sign in) and the primary CTA |
| `src/app/(marketing)/_components/SiteFooter.tsx` | 4-col footer restyle |
| `src/app/(marketing)/_components/RoiCalculator.tsx` | Inputs + outputs visual treatment. Don't change the math — it pulls from the same modeled assumptions as `metrics.ts` |
| `src/app/(marketing)/_components/PilotForm.tsx` | Visual + a11y. Keep the 7 fields + validation + the `POST /api/pilot` submit handler |
| `src/app/(marketing)/pilot/page.tsx` | Page composition, copy stays "Request a demo" framing |
| `src/app/(marketing)/layout.tsx` | Page wrapper — keep SiteHeader + SiteFooter import |
| `src/app/demo/page.tsx` | Public product preview |
| `src/app/roi/page.tsx` | Calculator surface (see §4 dual-link caveat) |
| `src/app/login/page.tsx` | Visual only — do not change form fields, server action, or redirect |
| `src/app/globals.css` | **Add new `.mkt-*` classes only.** Do NOT remove or rename existing tokens/classes — back-compat aliases are load-bearing. |

You may add new client components under `src/app/(marketing)/_components/` (animations, hero variants, scroll effects). Use Framer Motion (already installed). Do NOT add new top-level routes without checking `(marketing)/` route-group structure.

---

## 9. Hard rules for the redesign

1. **Generate into a feature branch.** Don't commit to `main` directly. The April 18 deploy break caught us off-guard once already.
2. **No new dependencies without justification.** Framer Motion is in. Don't add Tailwind, shadcn, GSAP, lottie, three.js, etc. unless you've got a specific reason.
3. **No localStorage / sessionStorage.** SSR will hate it.
4. **No client-side fetches to the engine.** Marketing pages should remain static (or revalidate-only). Patient/clinic data NEVER renders on public surfaces.
5. **No analytics scripts.** Don't drop in GA, Mixpanel, Hotjar, Posthog, etc. without approval.
6. **No "AI chatbot" widgets.** This is a directive SMS platform; don't bolt a chat on the marketing site.
7. **Keep accessibility intact.** Focus rings on `.mkt-form` inputs use Sage `rgba(91,155,148,0.18)` — preserve. Don't ship a redesign with worse a11y than what's there.
8. **Test the build before push.** `npm run build` in `adherix/` — if it errors, fix or back out.
9. **Twilio trial constraint stays.** Marketing pages must not imply "fully operational" SMS sending. Trial-only language is correct.
10. **Append a BIBLE entry** when the redesign ships. Format in BIBLE §18.

---

## 10. Prompt template for 21st.dev / Claude Code

When you fire `/21st build ...` or similar, include this preamble verbatim:

```
Read DO_NOT_TOUCH.md and BIBLE.md (project root) before generating anything.
Brand: Sage #5B9B94 / Sage deep #3D7670 / Paper #F4EFE6 / Ink #1F2A2A / Clay #D99877 (accent only).
Type: Fraunces (display, weights 300-600) + Geist (body) + Geist Mono. NEVER Inter or system.
Voice: sentence case, no exclamation points, "Request a demo" not "Request a pilot", no ℞ glyph.
Logo: import existing <AdherixLogo /> from src/app/(marketing)/_components/AdherixLogo.tsx — DO NOT regenerate.
CSS: extend src/app/globals.css with new .mkt-* classes only. Do not remove or rename existing tokens.
Animation lib: Framer Motion (already installed). Do not add other animation deps.
Scope: src/app/page.tsx, src/app/(marketing)/**, src/app/demo/page.tsx, src/app/roi/page.tsx, src/app/login/page.tsx visual only.
Out of scope: anything under src/engine, src/workers, src/lib, src/app/api, src/app/dashboard, src/app/patients, src/app/reports, db/, vercel.json, next.config.js, package.json.
Branch: create a new git branch before edits — do not commit to main.
```
