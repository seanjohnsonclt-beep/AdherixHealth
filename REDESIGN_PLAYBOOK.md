# Adherix Health — Marketing Site Redesign Playbook

> **Paste this entire file into Claude Code as your opening message.** It is self-contained: brief, scope, brand kit, section-by-section build order, and verification steps. Read `DO_NOT_TOUCH.md` and `BIBLE.md` (both in project root) before executing.

---

## 0. TL;DR for Claude Code (read first)

You are redesigning the public marketing surface of Adherix Health. Build a premium healthcare SaaS landing page that positions Adherix as the **retention intelligence layer for modern metabolic care** — it helps GLP-1 and metabolic health clinics detect patient drift before dropout and improve adherence through behavioral engagement workflows.

**Design direction:** high-trust, clinical, modern, calm, premium. No gimmicks. No cartoon illustrations. No emoji. Cinematic flow with subtle Framer Motion. Healthcare gravitas, not crypto-startup bravado.

**Stack reality (DO NOT change):**
- Next.js 14 App Router (Server Components by default).
- **NO Tailwind.** Project uses CSS variables + `.mkt-*` class namespace in `src/app/globals.css`. Extend it; do not introduce Tailwind, shadcn, or any new styling library.
- Framer Motion is already installed (`framer-motion` in `node_modules`). Use sparingly.
- TypeScript strict.
- Marketing styles live in `src/app/globals.css` under `.mkt-*` classes.

**Two governing documents — read before any edit:**
1. `DO_NOT_TOUCH.md` — what you may and may not modify, brand tokens, voice rules.
2. `BIBLE.md` — full project context. Especially Section 9 (key files), Section 13 (April 20 + April 21 entries), Section 14 (gotchas).

---

## 1. Brand Kit (use these exact values)

**Palette** — already defined as CSS variables in `globals.css`. Reference, don't redefine:

| Token | Hex | Usage |
|---|---|---|
| Sage | `#5B9B94` | Primary brand mark, eyebrows, focus rings, accent links |
| Sage deep | `#3D7670` | Primary CTA buttons, active states (hover → `#2F5F5B`) |
| Sage soft | `#B8D4CF` | Light borders, dark-section sublinks |
| Sage mist | `#E0ECE9` | Background washes, hover surfaces |
| Paper | `#F4EFE6` | Page background (light sections) |
| Paper soft | `#FAF6ED` | Card backgrounds |
| Ink | `#1F2A2A` | Primary text, dark sections |
| Ink 2 | `#3B4848` | Secondary text |
| Graphite | `#6B7878` | Tertiary text, captions |
| Clay | `#D99877` | Accent only — low-opacity hero washes, never primary |
| Honey | `#E8C989` | Status/warning tokens, sparing |

**Ratio rule:** Paper dominates reading surfaces. Sage owns brand moments (logo, primary CTAs, focus, eyebrows). Ink carries text + dark bands. Clay is reserved for low-opacity hero glows. **Clay is never a button or headline color.**

**Typography:**
- **Fraunces** (serif display, weights 300/400/500/600) — all `.mkt-h1` / `h2` / `h3`
- **Geist** (sans body, weights 300–700) — body, eyebrow, nav, button labels
- **Geist Mono** (400/500) — numbers, code, monospace accents
- Already imported in `globals.css`. Do not swap to Inter or system fonts.

**Type scale (already in `globals.css`):**
- h1: 56px / 1.05 / −0.028em / 400 Fraunces
- h2: 36px / 1.15 / −0.022em / 500 Fraunces
- h3: 20px / 1.35 / −0.012em / 600 Fraunces

**Voice:**
- Sentence case for CTAs and nav. No title case headlines except where typographically deliberate.
- No exclamation points anywhere.
- "Request a demo" — never "Request a pilot" (renamed April 21).
- No ℞ glyph. Marketing wordmark is plain "Adherix" — the client portal is "MyAdherix" (out of scope here).

**Logo:**
- Import existing `<AdherixLogo />` from `src/app/(marketing)/_components/AdherixLogo.tsx`.
- Cohort A mark with three ascending Sage bars + signal dot. Do not regenerate.

---

## 2. Positioning + messaging foundation

**One-line:** Adherix is the retention intelligence layer for modern metabolic care.

**Audience:** Operators at GLP-1 / metabolic / weight-loss clinics — typically a Program Director, Clinical Lead, or Founding Practitioner running 50–500 patients on injectable therapy.

**Pain:** Patients drift before they drop. Clinics see retention die in months 2–4 without warning. Manual outreach is reactive, expensive (4 min/patient/touch), and inconsistent. Generic SMS reminder apps don't move the needle because they don't read behavior.

**Promise:** Detect drift early. Auto-engage with phase-aware behavioral nudges. Surface the patients who actually need a human to call. Protect revenue and clinic hours.

**Proof points (from BIBLE / `metrics.ts`):**
- Modeled: 18% fewer early drop-offs vs. unaided control
- Modeled: $600/mo patient value, 35% counterfactual churn, 3.4 months of revenue protected per recovery → ~$714 protected per recovered patient
- Modeled: ~8 staff hours saved/week per ~100 patient cohort
- < 5 min clinic launch
- 90-day retention workflow built in

Asterisk-disclaim modeled figures (existing convention).

**Why "SMS alone is not enough" (Section 3 framing):**
SMS reminder tools blast the same message at the same time and call it engagement. Adherix is **behavioral SMS** — phase-aware (Initiation → Onboarding → Activation → Momentum → Plateau → Maintenance), trigger-driven (no-response 48h, no-response 5d, plateau detection, manual flag), reply-gated (don't advance until the patient confirms), and clinic-routed (when human contact is needed, the right staff member sees it).

---

## 3. Section-by-section build order (8 sections)

Build top-down. Each section is its own component file under `src/app/(marketing)/_components/sections/`. Compose them in `src/app/page.tsx`.

### Section 1 — Hero
- **Headline (h1):** "Patients don't drop off. They drift, and we catch them." (existing copy — keep)
- **Subheadline (1–2 lines):** "The retention intelligence layer for modern metabolic care. Adherix detects patient drift in GLP-1 programs and automates behavioral engagement that keeps adherence above the average."
- **Eyebrow:** "Retention intelligence for metabolic care"
- **Primary CTA:** "Request a demo" → `/pilot`
- **Secondary CTA:** "See the platform" → smooth-scroll to Section 6 (#dashboard-preview)
- **Visual:** subtle radial Sage + Clay washes on Paper. Micro-animated stat trio underneath the CTA row: e.g. "18% fewer drop-offs · 8 staff hours/week saved · 90-day workflow." Each number counts up on scroll into view (Framer Motion, 800ms, easeOut, runs once).

### Section 2 — The drift problem
- **h2:** "Retention dies between months 2 and 4. Without warning."
- 3-column visual: timeline of a patient program where engagement decays silently. Use a Framer Motion line chart that draws on scroll-into-view. Sage line for "engaged" → Graphite line for "drifting" → Clay marker for "churn point."
- Subcopy: GLP-1 patients don't quit dramatically — they fade. By the time a clinic calls, it's too late. The clinic doesn't have the operational capacity to manually monitor every patient's response cadence.
- Pull-quote stat tile: "**~35%** of GLP-1 patients churn within the first 90 days without active engagement." (asterisk → modeled)

### Section 3 — Why SMS alone isn't enough
- **h2:** "SMS reminders aren't engagement. Behavior is."
- Two-column comparison. Left: "Generic SMS reminder app." Right: "Adherix behavioral engine."
- Left bullets: same message every day, no phase awareness, blasts on a schedule, treats every reply (or non-reply) the same, no clinic routing.
- Right bullets: phase-based progression (6 phases), trigger-driven outreach (4 triggers), reply-gated advancement, behavioral logging for analytics, clinic alerts only when a human actually needs to step in.
- Footnote line: "Built on the same SMS rails. Different engine."

### Section 4 — Behavioral adherence intelligence
- **h2:** "An engine, not a content library."
- Three-card row, each card animates in on scroll (stagger 80ms). Each card has a small Sage-mono icon (use simple geometric SVG; no Lucide cartoon icons), a title in Fraunces 600, body in Geist.
  1. **Phase-aware progression** — Initiation → Onboarding → Activation → Momentum → Plateau → Maintenance. Templates and cadence shift as the patient moves through their journey.
  2. **Trigger-driven outreach** — Drift detection (no reply 48h / 5d), plateau identification, manual clinical flags. Nudges go out before the patient disengages.
  3. **Clinic routing** — When automated nudges aren't enough, the right patient surfaces to the right staff member with a recommended action, not a generic alert.
- Below cards: a horizontal "phase timeline" component — six labeled chips showing the phases, with subtle Sage-deep bar fill animating left-to-right on scroll.

### Section 5 — Clinic operations ROI
- **h2:** "Calm operations. Defensible numbers."
- Three big stat tiles in a row. Use Geist Mono for the numbers, Fraunces for the unit labels.
  - **18%** — "fewer early drop-offs"*
  - **~$714** — "revenue protected per recovered patient"*
  - **8 hrs/wk** — "staff hours saved per ~100-patient cohort"*
- Below the tiles: a single-paragraph plain-language explainer (Geist body) of the recovery math: $600 monthly patient value × 35% counterfactual churn × 3.4 months protected = ~$714. Every recovery is logged in the Recovery Ledger CSV — same number that drives the homepage Revenue Protected figure.
- CTA row: "Run the calculator" → `/roi`. Secondary subdued link: "See how the math works" — anchors a small disclosure block with the formula constants.

### Section 6 — Dashboard preview (`#dashboard-preview`)
- **h2:** "What clinics see every Monday morning."
- Browser-frame mockup (CSS-only — no real iframe). Inside the frame, a static screenshot-style composition of the dashboard: "Today at {Clinic}" hero row, six KPI cards, patient table with engagement trend arrows.
- Use real component visuals — pull headings, KPI labels, and table column names from the actual `src/app/dashboard/page.tsx`. Numbers are illustrative.
- Subtle Framer Motion: when scrolled into view, KPI numbers animate from 0 → final value over 600ms. The patient-table row "Send human outreach" highlights in Sage soft.
- Caption below the frame: "Live demo available on request. Built around the operator's morning routine, not a feature inventory."

### Section 7 — Pilot CTA
- **h2:** "Pilot Adherix in your clinic."
- Dark band — `Ink` background, Paper headline, Sage soft body. Radial Sage + Clay washes at 8–12% opacity.
- Two-line subhead: "Five-minute setup. Twilio-backed messaging. Real retention math from week one."
- Primary CTA: "Request a demo" → `/pilot` (Sage deep button on Paper).
- Secondary inline link: "Or just see the product →" → `/demo`.
- Trust strip below CTA (small caps, Sage mist text on Ink): "Twilio · Supabase · HIPAA-aware architecture · BAA on request."

### Section 8 — Founder credibility note
- Smaller section. `Paper soft` background, single column, max 720px wide.
- Small portrait/avatar slot on the left (use a Sage-tinted SVG silhouette placeholder with the comment `{/* TODO: real photo */}` — do NOT generate a fake AI portrait).
- Right column: 3–4 sentence founder note, signed "Sean Johnson, Founder." Tone: operator, not pitchman. Why this exists, what's been seen go wrong in clinics, why behavior beats reminders. Leave a `{/* TODO: replace with final founder copy from Sean */}` comment around the placeholder paragraph so it's obvious to swap.
- Below the note, three small text links: "Methodology", "Compliance posture", "Talk to the founder" (mailto `demos@adherix.health`).

### Footer
- Reuse existing `<SiteFooter />`. Do not regenerate. If colors don't fit the new flow, restyle within `.mkt-footer` rules — don't replace the component.

### Header
- Reuse existing `<SiteHeader />`. If anchor IDs change (Section 6 is now `#dashboard-preview`), update the in-page nav links. Keep "Sign in" + primary CTA on the right.

---

## 4. Animation rules (Framer Motion)

Use Framer Motion only where it adds clarity, never for ornament.

| Element | Animation | Timing |
|---|---|---|
| Hero stat trio | Number count-up on mount | 800ms easeOut |
| Section h2s | Fade + 12px Y-offset on scroll-into-view | 500ms easeOut, viewport `once: true` |
| Section 2 timeline | SVG path stroke-dashoffset draw on scroll | 1100ms easeInOut |
| Section 4 cards | Stagger fade+rise | 400ms each, 80ms stagger |
| Section 4 phase-bar | Width 0 → 100% on scroll | 900ms easeOut |
| Section 5 stat tiles | Number count-up on scroll-into-view | 700ms easeOut |
| Section 6 KPIs | Number count-up + row highlight | 600ms easeOut, 200ms delay between |
| Buttons | Scale 1 → 0.98 on tap; no hover scale | 120ms |

Do NOT animate: page-load whole-page transitions, parallax backgrounds, mouse-follow effects, scroll-jacking, autoplay sliders, anything that delays the headline being readable. Respect `prefers-reduced-motion` — wrap animations in a `useReducedMotion()` guard and short-circuit to instant for users with motion off.

---

## 5. File-by-file plan

Create these new files (under `adherix/`):

```
src/app/(marketing)/_components/sections/Hero.tsx
src/app/(marketing)/_components/sections/Drift.tsx
src/app/(marketing)/_components/sections/SmsAlone.tsx
src/app/(marketing)/_components/sections/Engine.tsx
src/app/(marketing)/_components/sections/RoiTiles.tsx
src/app/(marketing)/_components/sections/DashboardPreview.tsx
src/app/(marketing)/_components/sections/PilotBand.tsx
src/app/(marketing)/_components/sections/FounderNote.tsx
src/app/(marketing)/_components/animation/MotionPrimitives.tsx   ← shared FadeRise, CountUp, ScrollDraw
src/app/(marketing)/_components/animation/useReducedMotionSafe.ts ← wrapper for prefers-reduced-motion
```

Modify these existing files:

```
src/app/page.tsx                     ← rewrite as a thin composer of the 8 sections + header/footer
src/app/globals.css                  ← APPEND new .mkt-* classes only. Do NOT remove existing tokens.
src/app/(marketing)/_components/SiteHeader.tsx   ← only if anchor IDs change
```

**Do NOT modify** anything in `src/engine/`, `src/workers/`, `src/lib/`, `src/app/api/`, `src/app/dashboard/`, `src/app/patients/`, `src/app/reports/`, `src/app/(auth)/`, `db/`, `vercel.json`, `next.config.js`, or `package.json`. See `DO_NOT_TOUCH.md` for the full list.

---

## 6. Execution order (what Claude Code should actually do, in sequence)

1. **Read context.** Open `DO_NOT_TOUCH.md`, `BIBLE.md` (focus Sections 9, 13, 14), then current `src/app/page.tsx` and `src/app/globals.css` so you understand the existing `.mkt-*` system before extending it.
2. **Branch.** `git checkout -b redesign/marketing-2026-04` from `main`. Do not touch `main` directly.
3. **Build animation primitives first.** Create `MotionPrimitives.tsx` (FadeRise, CountUp, ScrollDraw, StaggerGroup) and `useReducedMotionSafe.ts`. Type them strictly. Test by importing into an empty section.
4. **Build sections in order 1 → 8**, one at a time. After each section, the dev server should compile clean. Don't move on with a broken section.
5. **Compose `src/app/page.tsx`.** Server component shell that imports `<SiteHeader />`, the eight section components, and `<SiteFooter />`. Each section component is its own file; the page is mostly imports + composition.
6. **Extend `globals.css`.** Add new `.mkt-*` classes only at the bottom of the existing file with a comment header `/* === Redesign 2026-04 — additive === */`. Do NOT remove or rename existing tokens or aliases (`--mkt-navy`, `--mkt-teal` etc. are load-bearing back-compat).
7. **Update header anchors.** If Section 6's anchor changed to `#dashboard-preview`, update the corresponding link in `SiteHeader.tsx`.
8. **Build verification.** Run `npm run build` from the `adherix/` directory. Fix any errors. The build MUST pass before push.
9. **Visual QA pass — local.** `npm run dev`, open `http://localhost:3000/`, walk through all 8 sections at desktop widths (1440, 1280, 1024) and mobile (390, 360). Verify: typography is Fraunces + Geist (not fallbacks), buttons are Sage deep on Paper, no Clay headlines, no exclamation points, all CTAs say "Request a demo," no ℞ glyph anywhere, motion respects `prefers-reduced-motion` (test with OS-level setting).
10. **Lighthouse spot-check.** Aim for accessibility ≥ 95. Fix obvious offenders (missing alt text, low contrast, focus traps).
11. **Commit + push.** Single semantic commit:
    ```
    feat(marketing): premium redesign — 8-section narrative, Framer Motion accents, Sage/Paper/Ink brand kit applied; no engine, API, or dashboard changes
    ```
    Push to the redesign branch only. Open a PR. Do NOT auto-merge.
12. **Append a BIBLE entry.** Following `BIBLE.md` Section 18 changelog format, prepend a dated entry under Section 13 summarizing what changed and which files. Keep it terse.

---

## 7. Hard NOs (paste verbatim into your own internal notes)

- No Tailwind, no shadcn/ui, no daisyUI, no styled-components, no Emotion. The project is plain CSS in `globals.css`.
- No new top-level dependencies without explicit approval. Framer Motion is in. Nothing else.
- No localStorage, sessionStorage, or IndexedDB — SSR will choke on it.
- No analytics scripts (GA, Mixpanel, Posthog, Hotjar). Not in this pass.
- No chatbot widgets, no Intercom, no Crisp, no AI assistants on the page.
- No fake testimonials, no fake clinic logos, no fake doctor photos, no AI-generated portraits.
- No medical claims that aren't asterisk-disclaimed as modeled.
- No exclamation points. No emoji.
- No "Request a pilot" — it's "Request a demo."
- No ℞ glyph anywhere on marketing surfaces.
- No commits to `main` directly.
- No edits to `vercel.json` (must remain `{}`), `next.config.js`, `package.json` deps, `.env*`, anything in `db/`, `src/engine/`, `src/workers/`, `src/lib/`, `src/app/api/`, or any auth-gated route.

---

## 8. Definition of done

- [ ] All 8 sections render at desktop and mobile breakpoints.
- [ ] Brand kit colors and fonts match `DO_NOT_TOUCH.md` §5 exactly.
- [ ] Existing `<AdherixLogo />`, `<SiteHeader />`, `<SiteFooter />` are reused (not regenerated).
- [ ] All CTAs say "Request a demo" and route to `/pilot`.
- [ ] No ℞ glyph; wordmark is "Adherix."
- [ ] Framer Motion animations honor `prefers-reduced-motion`.
- [ ] `npm run build` passes clean.
- [ ] No files outside the safe-to-modify list (DO_NOT_TOUCH §8) were touched.
- [ ] Branch is pushed; PR is open; `main` is untouched.
- [ ] BIBLE.md Section 13 has a new dated entry.

When all checked, return a one-screen summary to the user with the branch name, PR URL (if available), and a short list of the new files created.
