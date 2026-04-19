// Adherix configuration — phases, message templates, and triggers.
//
// Previously loaded from YAML files at runtime, which breaks in Vercel's
// serverless environment (file system not bundled). Config is now inlined
// as TypeScript so it's compiled into the bundle automatically.
//
// To edit behavior: change the data below.
// YAML files in /config remain as human-readable documentation/backup.

export type Phase = {
  id: number;
  name: string;
  duration_days: number;
  description: string;
};

export type Template = {
  key: string;
  phase?: number;
  after?: { minutes?: number; hours?: number; days?: number };
  send_at_local?: string;
  requires_reply_to?: string;
  repeat_every_days?: number;
  internal?: boolean;
  body: string;
};

export type Trigger = {
  key: string;
  condition: string;
  args?: Record<string, any>;
  only_in_phases?: number[];
  action: 'send_template' | 'flag_patient' | 'advance_phase';
  template?: string;
  reason?: string;
  dedupe_window_hours: number;
};

// ─── Phases ───────────────────────────────────────────────────────────────────

const PHASES: Phase[] = [
  { id: 0, name: 'Initiation',         duration_days: 2,    description: 'Remove confusion. First contact within 1 hour of enrollment. Reply-gated.' },
  { id: 1, name: 'Dose Stabilization', duration_days: 12,   description: 'Establish structure during active dose period. Daily protein and hydration directives.' },
  { id: 2, name: 'Adherence Building', duration_days: 30,   description: 'Reinforce habits. Cadence drops to every other day. Behavior becomes automatic.' },
  { id: 3, name: 'Risk Window',        duration_days: 21,   description: 'Highest behavioral divergence risk. Triggered by engagement signals, not just time.' },
  { id: 4, name: 'Taper Management',   duration_days: 30,   description: 'Prevent rebound as medication tapers or stops. Most critical retention phase.' },
  { id: 5, name: 'Maintenance',        duration_days: 9999, description: 'Sustain long-term. Weekly low-touch check-ins indefinitely.' },
];

// ─── Message templates ────────────────────────────────────────────────────────

const TEMPLATES: Template[] = [
  // Phase 0 — Initiation
  { key: 'phase0.welcome',    phase: 0, after: { minutes: 5 },
    body: 'Hi {first_name}, this is your support line. One short text a day, one action at a time. Reply YES to start.' },
  { key: 'phase0.confirmed',  phase: 0, requires_reply_to: 'phase0.welcome',
    body: "Locked in. Your only job tomorrow morning: drink 16oz of water before anything else. I'll text to confirm." },
  { key: 'phase0.day1_check', phase: 0, after: { days: 1 }, send_at_local: '09:00',
    body: 'Morning. Did you drink the 16oz of water? Reply Y or N.' },

  // Phase 1 — Dose Stabilization
  { key: 'phase1.day1.morning',     phase: 1, after: { hours: 2 },  send_at_local: '08:30',
    body: "Today's one thing: 30g of protein at breakfast. Eggs, Greek yogurt, or a shake. Reply DONE when you eat it." },
  { key: 'phase1.day1.evening',     phase: 1, after: { days: 1 },   send_at_local: '19:00',
    body: 'Quick check: did you hit 30g protein at breakfast today? Y or N.' },
  { key: 'phase1.day3.hydration',   phase: 1, after: { days: 2 },   send_at_local: '09:00',
    body: 'New rule starting today: water bottle with you all day. Aim for 64oz. Reply READY.' },
  { key: 'phase1.day7.checkin',     phase: 1, after: { days: 6 },   send_at_local: '10:00',
    body: "One week in. On a 1-5 scale, how are you feeling? Just reply with a number." },
  { key: 'phase1.day10.protein_streak', phase: 1, after: { days: 9 }, send_at_local: '09:00',
    body: 'Almost through the first phase. Protein habit still going? Reply Y or N — honest answer only.' },

  // Phase 2 — Adherence Building
  { key: 'phase2.welcome',           phase: 2, after: { minutes: 5 },
    body: "You've built the base. Now we drop to every other day. Same rules: protein first, water always." },
  { key: 'phase2.checkin',           phase: 2, after: { days: 2 },  send_at_local: '10:00', repeat_every_days: 2,
    body: 'Quick one: protein at breakfast yesterday? Y or N.' },
  { key: 'phase2.day14.momentum',    phase: 2, after: { days: 14 }, send_at_local: '09:30',
    body: "Two weeks of this. That's real. What's one thing that's gotten easier? Reply with anything." },
  { key: 'phase2.day28.transition_prep', phase: 2, after: { days: 28 }, send_at_local: '10:00',
    body: "Wrapping up this phase. The habits are yours now — not the program's. Reply READY to keep going." },

  // Phase 3 — Risk Window
  { key: 'phase3.welcome',           phase: 3, after: { minutes: 5 },
    body: "You're in a phase where most people slip. We're going to pay closer attention. Still with it? Reply YES." },
  { key: 'phase3.day3.identity',     phase: 3, after: { days: 3 },  send_at_local: '09:00',
    body: "Quick check-in: what's one habit from the last month you're actually keeping? Just name it." },
  { key: 'phase3.day7.engagement_pulse', phase: 3, after: { days: 7 }, send_at_local: '10:00',
    body: "Midpoint. On a 1-5 scale, how consistent have you been this week? No wrong answer — reply with a number." },
  { key: 'phase3.day10.friction_check', phase: 3, after: { days: 10 }, send_at_local: '18:00',
    body: 'What\'s getting in the way right now? Reply with one word — or just "nothing" if you\'re good.' },
  { key: 'phase3.day14.reanchor',    phase: 3, after: { days: 14 }, send_at_local: '09:00',
    body: "You've been at this for weeks. What's the one thing you don't want to give up? Reply and I'll remember it." },
  { key: 'phase3.day18.pre_transition', phase: 3, after: { days: 18 }, send_at_local: '10:00',
    body: "Almost through this phase. The next one is about protecting what you've built. Still in? Reply YES." },

  // Phase 4 — Taper Management
  { key: 'phase4.welcome',           phase: 4, after: { minutes: 5 },
    body: "This phase is about you, not the medication. The habits you have now are what protects the progress. Reply READY." },
  { key: 'phase4.day3.mindset',      phase: 4, after: { days: 3 },  send_at_local: '08:30',
    body: "Reminder: the results you've gotten came from behavior, not just the prescription. Are you keeping that in mind? Y or N." },
  { key: 'phase4.day7.hunger_check', phase: 4, after: { days: 7 },  send_at_local: '10:00',
    body: 'Check-in: has your appetite felt different this week? Reply MORE, SAME, or LESS.' },
  { key: 'phase4.day10.protein_reset', phase: 4, after: { days: 10 }, send_at_local: '09:00',
    body: "Resetting the one rule: 30g protein at breakfast. This matters most right now. Reply DONE after tomorrow's breakfast." },
  { key: 'phase4.day14.identity_anchor', phase: 4, after: { days: 14 }, send_at_local: '09:30',
    body: "Halfway through. Name one thing about how you eat now that's different than before. Just one thing." },
  { key: 'phase4.day21.rebound_prevention', phase: 4, after: { days: 21 }, send_at_local: '10:00',
    body: "Some people feel like they can relax now. The ones who keep going don't wait to slip first. Still going? Reply YES." },
  { key: 'phase4.day28.pre_maintenance', phase: 4, after: { days: 28 }, send_at_local: '09:00',
    body: "You're almost in maintenance mode. We drop to weekly check-ins. You've earned that. Reply READY." },

  // Phase 5 — Maintenance
  { key: 'phase5.welcome',           phase: 5, after: { minutes: 5 },
    body: "Weekly check-ins from here. One text per week, one reply. That's it. Reply OK to confirm." },
  { key: 'phase5.weekly_checkin',    phase: 5, after: { days: 7 },  send_at_local: '10:00', repeat_every_days: 7,
    body: 'Weekly check: protein still a habit? Reply Y or N.' },
  { key: 'phase5.week4.milestone',   phase: 5, after: { days: 28 }, send_at_local: '09:30',
    body: "One month in maintenance. That puts you in the top 20% of programs like this. Keep that standard. Reply OK." },
  { key: 'phase5.week8.identity',    phase: 5, after: { days: 56 }, send_at_local: '10:00',
    body: "Two months. Quick one: what's the one thing you'll never go back on? Reply with it." },
  { key: 'phase5.week12.longevity',  phase: 5, after: { days: 84 }, send_at_local: '09:30',
    body: "Three months of maintenance. Most people don't make it this far. You're not most people. Still going? Reply YES." },

  // Intervention messages — fired by triggers, not schedule
  { key: 'trigger.no_response_48h',
    body: "Haven't heard from you in 2 days. Everything ok? Reply with anything — even one word." },
  { key: 'trigger.no_response_5d',
    body: "It's been 5 days. No pressure, no judgement. Reply BACK when you're ready to pick this up again." },
  { key: 'trigger.engagement_drop',
    body: "Noticed you've gone quiet. No judgement — but I want to make sure you haven't stopped. Reply YES if you're still in." },
  { key: 'trigger.flagged_for_clinic', internal: true,
    body: 'Patient flagged: 5+ days no response. Consider direct outreach.' },
];

// ─── Triggers ─────────────────────────────────────────────────────────────────

const TRIGGERS: Trigger[] = [
  { key: 'no_response_48h',  condition: 'hours_since_last_inbound_gte', args: { hours: 48 },
    only_in_phases: [1, 2, 3], action: 'send_template', template: 'trigger.no_response_48h', dedupe_window_hours: 72 },
  { key: 'no_response_5d',   condition: 'hours_since_last_inbound_gte', args: { hours: 120 },
    only_in_phases: [1, 2, 3, 4], action: 'send_template', template: 'trigger.no_response_5d', dedupe_window_hours: 168 },
  { key: 'flag_for_clinic',  condition: 'hours_since_last_inbound_gte', args: { hours: 144 },
    only_in_phases: [1, 2, 3, 4], action: 'flag_patient', reason: 'no_response_6d', dedupe_window_hours: 168 },
  { key: 'phase_auto_advance', condition: 'phase_duration_elapsed',
    action: 'advance_phase', dedupe_window_hours: 24 },
];

// ─── Accessors ────────────────────────────────────────────────────────────────

export function phases(): Phase[]                       { return PHASES; }
export function templates(): Template[]                  { return TEMPLATES; }
export function triggers(): Trigger[]                    { return TRIGGERS; }
export function findTemplate(key: string)                { return TEMPLATES.find(t => t.key === key); }
export function findPhase(id: number)                    { return PHASES.find(p => p.id === id); }
export function templatesForPhase(phaseId: number)       { return TEMPLATES.filter(t => t.phase === phaseId); }
