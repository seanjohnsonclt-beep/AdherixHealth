# Quest Hero Section - Design Spec
Date: 2026-06-27

## Summary
A dedicated /quest marketing page hero for Adherix Quest (pediatric weight management, ages 13-18). Audience: pediatric clinic directors evaluating Quest for their program. Visual direction: dark editorial split - same Adherix font/structure bones, dark game-world energy.

## Emotion Goal
Make a clinic director *feel* what their teen patients would feel: stakes are real, the squad is waiting, sitting out is not an option. Lead with the clinical weight of the problem, not gaming chrome.

## Page Route
src/app/(marketing)/quest/page.tsx

## Files
- src/app/(marketing)/quest/page.tsx - new page shell
- src/app/(marketing)/_components/sections/QuestHero.tsx - new hero component
- src/app/globals.css - Quest theme CSS block appended

## Layout: Dark Editorial Split
Full-width dark section. Container: two columns (copy left, widget right).

### Background
- Base: #0D1A1A (deep teal-black)
- Faint CSS dot-grid texture (no images, aria-hidden)
- Subtle radial electric mint glow behind widget (~5% opacity)

### Color Tokens
- --quest-bg: #0D1A1A
- --quest-bg-card: #121F1F
- --quest-electric: #5CFFC8
- --quest-violet: #A78BFA
- --quest-fg: #F0FFF9
- --quest-fg-muted: #7BA89A

### Typography
Same Fraunces + Geist already loaded. No new fonts.

## Left Column - Copy
- Eyebrow: Adherix Quest - Pediatric Weight Management
- H1 (Fraunces, white): Your patients kids are losing a fight they didnt choose. Give them a squad.
- Subhead: Quest turns clinical behavioral protocols into a game world teens actually inhabit.
- CTAs: Book a demo (electric mint) + See how it works (ghost)
- Stat trio: Ages 13-18 / Teen + guardian SMS / Clinically structured

## Right Column - Quest Game Card Widget
- Dark card (#121F1F), mint border glow
- Handle @quickhawk + Alpha Squad violet pill
- Level: Lv. 4 - Beast Mode (violet)
- XP bar animates 0->52% on mount
- Reward badge:  reward unlocked
- Squad avatars: J, M, C initials
- Toast at 2.5s: +30 XP - Boss Challenge: CONQUERED

## CSS Prefix
mkt-q- for all Quest marketing classes.

## Out of Scope
Sections below hero, nav updates, mobile polish.
