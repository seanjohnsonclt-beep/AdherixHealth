# Quest Hero Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the /quest marketing page hero - a dark editorial split-layout hero for Adherix Quest (pediatric weight management, ages 13-18) that shows clinic directors the teen product experience.

**Architecture:** Three deliverables in dependency order: (1) CSS theme block appended to globals.css establishes all Quest design tokens and component styles, (2) QuestHero.tsx component consumes those classes and renders the animated split layout, (3) quest/page.tsx page shell wires the component into the marketing layout.

**Tech Stack:** Next.js 14 App Router, framer-motion (already installed), TypeScript, CSS custom properties in globals.css

## Global Constraints

- NEVER use the Edit tool on any file in C:\Dev\AdherixHealth - all file writes use Python via Bash
- No em dashes in source files - use regular dashes or HTML entities in JSX only
- No images - all decoration is CSS and inline SVG only
- All animations gated on useReducedMotion (pattern from HomeHero at src/app/(marketing)/_components/sections/HomeHero.tsx)
- CSS class prefix: mkt-q- for all Quest marketing classes
- No new fonts - Fraunces and Geist are already loaded in globals.css
- Quest color tokens: --quest-electric: #5CFFC8, --quest-violet: #A78BFA, --quest-bg: #0D1A1A
- Python append command: python -c "with open(r'path', 'a', encoding='utf-8') as f: f.write(content)"
- Python write command: python -c "with open(r'path', 'w', encoding='utf-8') as f: f.write(content)"
- Known pre-existing TSC errors to ignore: MobileNav, ProductsDropdown, gauge/_page, overview/_overview, obesity-care

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Append | src/app/globals.css | Quest CSS tokens + all mkt-q-* component styles |
| Create | src/app/(marketing)/_components/sections/QuestHero.tsx | Animated hero component |
| Create | src/app/(marketing)/quest/page.tsx | Page shell with metadata |

---

### Task 1: Quest CSS Theme Block

Append Quest design tokens and all component styles to globals.css. This must run first - the component in Task 2 depends on these classes.

**Files:**
- Modify (append): `src/app/globals.css`

**Interfaces:**
- Produces: CSS custom properties (--quest-bg, --quest-bg-card, --quest-bg-card2, --quest-electric, --quest-violet, --quest-fg, --quest-fg-muted, --quest-line) and classes (.mkt-q-hero, .mkt-q-hero__inner, .mkt-q-hero__copy, .mkt-q-eyebrow, .mkt-q-title, .mkt-q-sub, .mkt-q-ctas, .mkt-q-btn--primary, .mkt-q-btn--ghost, .mkt-q-stats, .mkt-q-stat, .mkt-q-stat__value, .mkt-q-stat__label, .mkt-q-hero__widget, .mkt-q-card, .mkt-q-card__header, .mkt-q-handle, .mkt-q-pill, .mkt-q-pill--violet, .mkt-q-pill--squad, .mkt-q-level, .mkt-q-level__label, .mkt-q-xpbar, .mkt-q-xpbar__meta, .mkt-q-xpbar__track, .mkt-q-xpbar__fill, .mkt-q-reward, .mkt-q-reward__dot, .mkt-q-squad, .mkt-q-squad__label, .mkt-q-avatar, .mkt-q-avatar--active, .mkt-q-toast, .mkt-q-toast__icon, .mkt-q-toast__label, .mkt-q-toast__sub, .mkt-q-hero__wash, .mkt-q-hero__glow)

- [ ] **Step 1: Verify current end of globals.css**

```bash
python -c "
lines = open(r'C:\Dev\AdherixHealth\src\app\globals.css', encoding='utf-8').readlines()
print('Total lines:', len(lines))
for l in lines[-3:]:
    print(repr(l))
"
```

Expected: prints total line count. No Quest references yet.

- [ ] **Step 2: Write the Quest CSS block to a temp file, then append**

Save the following as `quest_css.py` in the scratchpad, then run it:

```python
css = """\n\n/* =========================================================================
   Quest Theme - /quest marketing page
   Dark editorial variant of the Adherix brand.
   All classes prefixed mkt-q- to avoid collision with existing mkt- classes.
   ========================================================================= */\n\n"""
css += """:root {
  --quest-bg:       #0D1A1A;
  --quest-bg-card:  #121F1F;
  --quest-bg-card2: #162424;
  --quest-electric: #5CFFC8;
  --quest-violet:   #A78BFA;
  --quest-fg:       #F0FFF9;
  --quest-fg-muted: #7BA89A;
  --quest-line:     rgba(92, 255, 200, 0.12);
}\n\n"""
css += """.mkt-q-hero {
  position: relative;
  padding: 100px 0 96px;
  background: var(--quest-bg);
  overflow: hidden;
}\n\n"""
css += """.mkt-q-hero__inner {
  position: relative;
  z-index: 1;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 72px;
  align-items: center;
}\n\n"""
css += """.mkt-q-hero__copy { text-align: left; }\n\n"""
css += """.mkt-q-eyebrow {
  display: inline-block;
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--quest-electric);
  margin-bottom: 22px;
}\n\n"""
css += """.mkt-q-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 52px;
  font-weight: 500;
  line-height: 1.02;
  letter-spacing: -0.02em;
  color: var(--quest-fg);
  margin-bottom: 28px;
}\n\n"""
css += """.mkt-q-title em {
  font-style: normal;
  color: var(--quest-electric);
}\n\n"""
css += """.mkt-q-sub {
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 18px;
  line-height: 1.6;
  color: var(--quest-fg-muted);
  max-width: 460px;
  margin: 0 0 44px;
}\n\n"""
css += """.mkt-q-ctas {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 48px;
}\n\n"""
css += """.mkt-q-btn--primary {
  display: inline-flex;
  align-items: center;
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 600;
  padding: 14px 28px;
  background: var(--quest-electric);
  color: var(--quest-bg);
  border: 2px solid var(--quest-electric);
  border-radius: 4px;
  text-decoration: none;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
}
.mkt-q-btn--primary:hover {
  background: transparent;
  color: var(--quest-electric);
  box-shadow: 0 0 16px rgba(92, 255, 200, 0.28);
  border-bottom: 2px solid var(--quest-electric);
}\n\n"""
css += """.mkt-q-btn--ghost {
  display: inline-flex;
  align-items: center;
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 500;
  padding: 14px 28px;
  background: transparent;
  color: var(--quest-fg);
  border: 2px solid rgba(240, 255, 249, 0.24);
  border-radius: 4px;
  text-decoration: none;
  transition: border-color 0.18s;
}
.mkt-q-btn--ghost:hover {
  border-color: var(--quest-fg);
  border-bottom: 2px solid var(--quest-fg);
}\n\n"""
css += """.mkt-q-stats {
  display: flex;
  gap: 32px;
}
.mkt-q-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mkt-q-stat__value {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 22px;
  font-weight: 500;
  color: var(--quest-electric);
  line-height: 1;
}
.mkt-q-stat__label {
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--quest-fg-muted);
}\n\n"""
css += """.mkt-q-hero__widget { position: relative; }\n\n"""
css += """.mkt-q-card {
  background: var(--quest-bg-card);
  border: 1px solid var(--quest-line);
  border-radius: 16px;
  padding: 24px;
  box-shadow:
    0 0 0 1px rgba(92, 255, 200, 0.05),
    0 4px 24px rgba(0, 0, 0, 0.4),
    0 0 48px rgba(92, 255, 200, 0.04);
}\n\n"""
css += """.mkt-q-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}\n\n"""
css += """.mkt-q-handle {
  font-family: 'Geist Mono', monospace;
  font-size: 13px;
  color: var(--quest-electric);
}\n\n"""
css += """.mkt-q-pill {
  display: inline-flex;
  align-items: center;
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 100px;
}
.mkt-q-pill--violet {
  background: rgba(167, 139, 250, 0.18);
  color: var(--quest-violet);
}
.mkt-q-pill--squad {
  background: rgba(92, 255, 200, 0.1);
  color: var(--quest-electric);
}\n\n"""
css += """.mkt-q-level {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.mkt-q-level__label {
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 12px;
  color: var(--quest-fg-muted);
}\n\n"""
css += """.mkt-q-xpbar { margin-bottom: 8px; }
.mkt-q-xpbar__meta {
  display: flex;
  justify-content: space-between;
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 11px;
  color: var(--quest-fg-muted);
  margin-bottom: 6px;
}
.mkt-q-xpbar__track {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
  overflow: hidden;
}
.mkt-q-xpbar__fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--quest-electric) 0%, rgba(92, 255, 200, 0.65) 100%);
  transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 0 8px rgba(92, 255, 200, 0.35);
}\n\n"""
css += """.mkt-q-reward {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--quest-electric);
  background: rgba(92, 255, 200, 0.07);
  border: 1px solid rgba(92, 255, 200, 0.18);
  padding: 6px 12px;
  border-radius: 6px;
  margin: 16px 0;
}
.mkt-q-reward__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--quest-electric);
  flex-shrink: 0;
}\n\n"""
css += """.mkt-q-squad {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}
.mkt-q-squad__label {
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 11px;
  color: var(--quest-fg-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-right: 4px;
}
.mkt-q-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--quest-bg-card2);
  border: 1.5px solid var(--quest-line);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: var(--quest-fg-muted);
}
.mkt-q-avatar--active {
  border-color: var(--quest-electric);
  color: var(--quest-electric);
}\n\n"""
css += """.mkt-q-toast {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(92, 255, 200, 0.05);
  border: 1px solid rgba(92, 255, 200, 0.18);
  border-radius: 10px;
  padding: 12px 14px;
  margin-top: 16px;
}
.mkt-q-toast__icon {
  font-size: 18px;
  flex-shrink: 0;
}
.mkt-q-toast__label {
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: var(--quest-electric);
  margin: 0 0 2px;
}
.mkt-q-toast__sub {
  font-family: 'Geist', system-ui, sans-serif;
  font-size: 11px;
  color: var(--quest-fg-muted);
  margin: 0;
}\n\n"""
css += """.mkt-q-hero__wash {
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: radial-gradient(circle, rgba(92, 255, 200, 0.06) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
}
.mkt-q-hero__glow {
  position: absolute;
  top: -20%;
  right: -10%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(92, 255, 200, 0.055) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
}\n\n"""
css += """@media (max-width: 1000px) {
  .mkt-q-hero { padding: 72px 0 64px; }
  .mkt-q-hero__inner {
    grid-template-columns: 1fr;
    gap: 48px;
    max-width: 620px;
  }
  .mkt-q-hero__copy { text-align: center; }
  .mkt-q-sub { margin: 0 auto 44px; }
  .mkt-q-ctas { justify-content: center; }
  .mkt-q-stats { justify-content: center; }
}
@media (max-width: 680px) {
  .mkt-q-title { font-size: 38px; }
  .mkt-q-hero { padding: 60px 0 48px; }
  .mkt-q-stats { flex-wrap: wrap; gap: 20px; }
}
@media (max-width: 420px) {
  .mkt-q-title { font-size: 32px; }
}
@media (prefers-reduced-motion: reduce) {
  .mkt-q-xpbar__fill { transition: none; }
}\n"""

with open(r'C:\Dev\AdherixHealth\src\app\globals.css', 'a', encoding='utf-8') as f:
    f.write(css)
print('Quest CSS appended.')
```

Run as: `python quest_css.py`

- [ ] **Step 3: Verify append**

```bash
python -c "
lines = open(r'C:\Dev\AdherixHealth\src\app\globals.css', encoding='utf-8').readlines()
print('Total lines:', len(lines))
q = [i+1 for i,l in enumerate(lines) if '--quest' in l or '.mkt-q-' in l]
print('Quest lines:', len(q), '| First 3:', q[:3])
"
```

Expected: 50+ quest references, total line count grew by ~250.

- [ ] **Step 4: Type-check (CSS change has no TSC effect, just confirming no regressions)**

```bash
npx tsc --noEmit 2>&1 | grep -v "MobileNav\|ProductsDropdown\|gauge\|overview\|obesity" | head -10
```

Expected: no output (or only pre-existing errors not listed above).

- [ ] **Step 5: Commit** (Sean runs in PowerShell)

```powershell
git add src/app/globals.css
git commit -m "feat(quest): add Quest dark theme CSS tokens and mkt-q-* component styles"
```

---

### Task 2: QuestHero Component

Create the animated hero component. Depends on Task 1.

**Files:**
- Create: `src/app/(marketing)/_components/sections/QuestHero.tsx`

**Interfaces:**
- Consumes: CSS classes from Task 1
- Produces: named export `QuestHero` - React component, no props, 'use client'

- [ ] **Step 1: Create component via Python**

Write `quest_hero.py` in scratchpad and run it:

```python
content = '''\
"use client";

import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { MotionProps } from "framer-motion";

function useReducedMotionSafe(): boolean {
  const reduced = useReducedMotion();
  return reduced === true;
}

function TapButton({
  children,
  className,
  style,
  ...rest
}: { children: ReactNode; className?: string; style?: CSSProperties } & MotionProps) {
  const reduced = useReducedMotionSafe();
  return (
    <motion.span
      className={className}
      style={{ display: "inline-flex", ...style }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      {...rest}
    >
      {children}
    </motion.span>
  );
}

export function QuestHero() {
  const reduced = useReducedMotionSafe();
  const [toastVisible, setToastVisible] = useState(false);
  const [xpWidth, setXpWidth] = useState(0);
  const ease = [0.22, 1, 0.36, 1] as const;

  useEffect(() => {
    const xpTimer = setTimeout(() => setXpWidth(52), reduced ? 0 : 600);
    const toastTimer = setTimeout(() => setToastVisible(true), reduced ? 0 : 2500);
    return () => {
      clearTimeout(xpTimer);
      clearTimeout(toastTimer);
    };
  }, [reduced]);

  const seq = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease, delay },
        };

  return (
    <section className="mkt-q-hero">
      <div className="mkt-q-hero__wash" aria-hidden="true" />
      <div className="mkt-q-hero__glow" aria-hidden="true" />

      <div className="mkt-q-hero__inner">
        <div className="mkt-q-hero__copy">
          <motion.span className="mkt-q-eyebrow" {...seq(0)}>
            Adherix Quest - Pediatric Weight Management
          </motion.span>

          <motion.h1 className="mkt-q-title" {...seq(0.08)}>
            Your patients&rsquo; kids are losing
            <br />
            a fight they didn&rsquo;t choose.
            <br />
            <em>Give them a squad.</em>
          </motion.h1>

          <motion.p className="mkt-q-sub" {...seq(0.18)}>
            Quest turns clinical behavioral protocols into a game world teens
            actually inhabit. XP, squads, boss challenges, weekly missions.
            Same clinical rigor. A completely different experience.
          </motion.p>

          <motion.div className="mkt-q-ctas" {...seq(0.28)}>
            <TapButton>
              <Link href="/pilot" className="mkt-q-btn--primary">
                Book a demo
              </Link>
            </TapButton>
            <TapButton>
              <Link href="#quest-how" className="mkt-q-btn--ghost">
                See how it works
              </Link>
            </TapButton>
          </motion.div>

          <motion.div
            className="mkt-q-stats"
            {...seq(0.36)}
            aria-label="Quest program facts"
          >
            <div className="mkt-q-stat">
              <span className="mkt-q-stat__value">13-18</span>
              <span className="mkt-q-stat__label">Age range</span>
            </div>
            <div className="mkt-q-stat">
              <span className="mkt-q-stat__value">Dual SMS</span>
              <span className="mkt-q-stat__label">Teen + guardian</span>
            </div>
            <div className="mkt-q-stat">
              <span className="mkt-q-stat__value">Clinically</span>
              <span className="mkt-q-stat__label">Structured</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mkt-q-hero__widget"
          initial={reduced ? undefined : { opacity: 0, x: 28, y: 8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.85, ease, delay: 0.3 }}
        >
          <div className="mkt-q-card">
            <div className="mkt-q-card__header">
              <span className="mkt-q-handle">@quickhawk</span>
              <span className="mkt-q-pill mkt-q-pill--squad">Alpha Squad</span>
            </div>

            <div className="mkt-q-level">
              <span className="mkt-q-level__label">Level</span>
              <span className="mkt-q-pill mkt-q-pill--violet">Lv. 4 - Beast Mode</span>
            </div>

            <div
              className="mkt-q-xpbar"
              role="progressbar"
              aria-valuenow={520}
              aria-valuemin={0}
              aria-valuemax={1000}
              aria-label="Monthly XP progress"
            >
              <div className="mkt-q-xpbar__meta">
                <span>Monthly XP</span>
                <span>520 / 1,000</span>
              </div>
              <div className="mkt-q-xpbar__track">
                <div
                  className="mkt-q-xpbar__fill"
                  style={{ width: xpWidth + "%" }}
                />
              </div>
            </div>

            <div className="mkt-q-reward">
              <span className="mkt-q-reward__dot" aria-hidden="true" />
              $5 reward unlocked
            </div>

            <div className="mkt-q-squad">
              <span className="mkt-q-squad__label">Squad</span>
              <div className="mkt-q-avatar mkt-q-avatar--active" aria-label="Jordan">J</div>
              <div className="mkt-q-avatar" aria-label="Maya">M</div>
              <div className="mkt-q-avatar" aria-label="Carlos">C</div>
            </div>

            <AnimatePresence>
              {toastVisible && (
                <motion.div
                  className="mkt-q-toast"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease }}
                >
                  <span className="mkt-q-toast__icon" aria-hidden="true">&#x26A1;</span>
                  <div>
                    <p className="mkt-q-toast__label">+30 XP - Boss Challenge: CONQUERED</p>
                    <p className="mkt-q-toast__sub">
                      @quickhawk completed this week&rsquo;s mission
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
'''

import os
os.makedirs(r'C:\Dev\AdherixHealth\src\app\(marketing)\_components\sections', exist_ok=True)
with open(r'C:\Dev\AdherixHealth\src\app\(marketing)\_components\sections\QuestHero.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('QuestHero.tsx written.')
```

Run as: `python quest_hero.py`

- [ ] **Step 2: Verify file**

```bash
python -c "
lines = open(r'C:\Dev\AdherixHealth\src\app\(marketing)\_components\sections\QuestHero.tsx', encoding='utf-8').readlines()
print('Lines:', len(lines))
print('First:', lines[0].strip())
print('Has QuestHero export:', any('export function QuestHero' in l for l in lines))
print('Has AnimatePresence:', any('AnimatePresence' in l for l in lines))
"
```

Expected: 115+ lines, first line `"use client";`, both checks True.

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep -v "MobileNav\|ProductsDropdown\|gauge\|overview\|obesity" | head -15
```

Expected: no output.

- [ ] **Step 4: Commit** (Sean runs in PowerShell)

```powershell
git add "src/app/(marketing)/_components/sections/QuestHero.tsx"
git commit -m "feat(quest): add QuestHero animated split-layout hero component"
```

---

### Task 3: Quest Page Shell

Create the page entry point. Depends on Task 2.

**Files:**
- Create: `src/app/(marketing)/quest/page.tsx`

**Interfaces:**
- Consumes: `QuestHero` named export from `../_components/sections/QuestHero`
- Produces: default export `QuestPage` with Next.js `metadata` export

- [ ] **Step 1: Create page via Python**

```bash
python -c "
import os
os.makedirs(r'C:\Dev\AdherixHealth\src\app\(marketing)\quest', exist_ok=True)
content = '''import type { Metadata } from \"next\";
import { QuestHero } from \"../_components/sections/QuestHero\";

export const metadata: Metadata = {
  title: \"Adherix Quest - Pediatric Weight Management for Teens 13-18\",
  description:
    \"Quest turns clinical behavioral protocols into a game world teens actually inhabit. \" +
    \"XP, squads, boss challenges, weekly missions. Book a demo for your pediatric program.\",
};

export default function QuestPage() {
  return <QuestHero />;
}
'''
with open(r'C:\Dev\AdherixHealth\src\app\(marketing)\quest\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('done')
"
```

Expected: `done`

- [ ] **Step 2: Full type-check**

```bash
npx tsc --noEmit 2>&1 | grep -v "MobileNav\|ProductsDropdown\|gauge\|overview\|obesity" | head -15
```

Expected: no output.

- [ ] **Step 3: Visual verification - start dev server**

```bash
npm run dev
```

Open http://localhost:3000/quest. Confirm all of the following:

| Check | Expected |
|-------|----------|
| Background | Near-black (#0D1A1A) with visible dot-grid texture |
| Eyebrow | Electric mint uppercase: "ADHERIX QUEST - PEDIATRIC WEIGHT MANAGEMENT" |
| H1 | White Fraunces serif, "Give them a squad." line in electric mint |
| Subhead | Muted teal body text |
| Primary CTA | Electric mint background, dark text: "Book a demo" |
| Ghost CTA | White border, white text: "See how it works" |
| Stat trio | Electric mint Fraunces values: 13-18, Dual SMS, Clinically |
| Card enters | Slides in from right ~0.3s after load |
| @quickhawk | Electric mint monospace handle visible |
| Alpha Squad | Electric mint pill top-right of card |
| Lv. 4 pill | Soft violet pill below header |
| XP bar | Fills to ~52% about 0.6s after load with mint gradient |
| Reward badge | "$5 reward unlocked" in mint |
| Avatars | J (active/mint border), M, C in teal-muted |
| Toast | "+30 XP - Boss Challenge: CONQUERED" slides in ~2.5s |
| SiteHeader | Existing nav renders above section |
| SiteFooter | Existing footer renders below section |

- [ ] **Step 4: Commit** (Sean runs in PowerShell)

```powershell
git add "src/app/(marketing)/quest/page.tsx"
git commit -m "feat(quest): add /quest marketing page - pediatric hero with dark editorial split layout"
```

---

## Self-Review

**Spec coverage:**
- [x] /quest dedicated page - Task 3
- [x] Dark #0D1A1A background - Task 1
- [x] Electric mint (#5CFFC8) + violet (#A78BFA) tokens - Task 1
- [x] Dot-grid decoration + radial glow - Task 1
- [x] Fraunces headline in white, em in electric mint - Task 1+2
- [x] Copy: "Your patients' kids are losing a fight they didn't choose. Give them a squad." - Task 2
- [x] Eyebrow text - Task 2
- [x] Subhead copy - Task 2
- [x] Primary CTA "Book a demo" -> /pilot - Task 2
- [x] Ghost CTA "See how it works" -> #quest-how - Task 2
- [x] Stat trio below CTAs - Task 2
- [x] Game card: @quickhawk, Alpha Squad, Lv. 4 Beast Mode, XP bar, reward, avatars, toast - Task 2
- [x] XP animates 0->52% at 600ms - Task 2 useEffect
- [x] Toast at 2500ms with AnimatePresence - Task 2
- [x] useReducedMotion gates all timers and motion props - Task 2
- [x] No em dashes in source files - all dashes are hyphens
- [x] Python write for all files - all steps use python
- [x] metadata export - Task 3
- [x] SiteHeader/SiteFooter inherited via (marketing)/layout.tsx - no action needed

**Type consistency:** `QuestHero` exported (Task 2) matches import path in Task 3 exactly: `../_components/sections/QuestHero`.

**No placeholders found.**
