// pharmacotherapy-config.ts
// Adherix Rx - behavioral adherence for non-GLP-1 prescription weight management.
//
// Covers: phentermine, topiramate, bupropion/naltrexone (Contrave),
//         orlistat, metformin (for weight), and combination protocols.
//
// Key differences from GLP-1 module:
//   - Daily pill vs weekly injection -> different habit anchor
//   - No titration window messaging
//   - Side effects: dry mouth, insomnia, appetite changes, GI (varies by drug)
//   - Refill cadence: 30-day supply typical (controlled substances: monthly Rx)

export interface RxPhase {
  id: number;
  name: string;
  durationDays: number | null;
}

export interface RxTemplate {
  key: string;
  phase: number;
  after: { days: number };
  send_at_local: string;
  body: string;
  internal?: boolean;
  requires_reply_to?: string;
}

export interface RxTrigger {
  key: string;
  label: string;
}

function rxPhases(): RxPhase[] {
  return [
    { id: 0, name: 'Initiation',   durationDays: 1   },
    { id: 1, name: 'Onboarding',   durationDays: 14  },
    { id: 2, name: 'Activation',   durationDays: 30  },
    { id: 3, name: 'Momentum',     durationDays: 45  },
    { id: 4, name: 'Plateau',      durationDays: 45  },
    { id: 5, name: 'Maintenance',  durationDays: null },
  ];
}

function rxTemplates(): RxTemplate[] {
  return [
    // ── Phase 0: Initiation ───────────────────────────────────────────────────
    {
      key: 'rx.phase0.welcome',
      phase: 0, after: { days: 0 }, send_at_local: '09:00',
      body: 'Hi {{first_name}}, this is your Adherix support line. Your medication is one part of the plan - this program keeps the behavioral side on track. Reply YES to begin.',
      requires_reply_to: undefined,
    },
    {
      key: 'rx.phase0.confirmed',
      phase: 0, after: { days: 0 }, send_at_local: '09:05',
      body: "Good. One thing today: pick the time you will take your medication every day and reply with it. Same time builds the habit faster.",
      requires_reply_to: 'rx.phase0.welcome',
    },

    // ── Phase 1: Onboarding ───────────────────────────────────────────────────
    {
      key: 'rx.phase1.day1.first_dose',
      phase: 1, after: { days: 1 }, send_at_local: '08:00',
      body: 'First week on the medication. If you notice a dry mouth, headache, or mild appetite change - that is the medication working. It settles in 5-7 days. Reply DONE after your first dose today.',
    },
    {
      key: 'rx.phase1.day3.side_effect_frame',
      phase: 1, after: { days: 3 }, send_at_local: '09:00',
      body: 'Three days in. Common at this stage: appetite feels different, energy may be off. None of that means the medication is not working - it means your system is adjusting. Keep the dose consistent. Reply OK if you are feeling roughly on track.',
    },
    {
      key: 'rx.phase1.day7.habit_anchor',
      phase: 1, after: { days: 7 }, send_at_local: '09:00',
      body: 'One week in. The research is clear: people who anchor medication to an existing habit - morning coffee, brushing teeth - are significantly more consistent at 90 days. Is your medication attached to a morning routine? Reply Y or N.',
    },
    {
      key: 'rx.phase1.day10.appetite_check',
      phase: 1, after: { days: 10 }, send_at_local: '12:00',
      body: 'Quick check: has your appetite shifted at all in the first 10 days? Reply MORE, LESS, or SAME. This helps the clinic track your early response.',
    },
    {
      key: 'rx.phase1.day14.end_onboarding',
      phase: 1, after: { days: 14 }, send_at_local: '09:00',
      body: 'Two weeks complete. The adjustment period is behind you. From here the focus is consistency - same dose, same time, same habits around it. Your next refill is coming up in about 2 weeks. Reply READY if you are on track.',
    },

    // ── Phase 2: Activation ───────────────────────────────────────────────────
    {
      key: 'rx.phase2.day2.protein_prompt',
      phase: 2, after: { days: 2 }, send_at_local: '08:30',
      body: 'The medication changes your appetite signal. You have to eat deliberately now - especially protein. 30g at your first meal. Reply DONE when you eat it.',
    },
    {
      key: 'rx.phase2.day7.refill_warning',
      phase: 2, after: { days: 7 }, send_at_local: '09:00',
      body: 'Heads up: if you are on a 30-day supply, your first refill is about 2 weeks out. For controlled substances your prescriber needs to write a new Rx each month - confirm your appointment is scheduled. Reply OK.',
    },
    {
      key: 'rx.phase2.day14.consistency_check',
      phase: 2, after: { days: 14 }, send_at_local: '09:00',
      body: 'Halfway through month one. Consistency now sets the trajectory for month three. How many days this week did you take your medication at the same time? Reply with a number 0-7.',
    },
    {
      key: 'rx.phase2.day21.movement_prompt',
      phase: 2, after: { days: 21 }, send_at_local: '09:00',
      body: 'The medication reduces appetite - but movement is what shifts your metabolic set point. Even 20 minutes of walking changes how your body responds to the medication. Reply DONE when you move today.',
    },

    // ── Phase 3: Momentum ─────────────────────────────────────────────────────
    {
      key: 'rx.phase3.day5.refill_reminder',
      phase: 3, after: { days: 5 }, send_at_local: '09:00',
      body: 'Refill reminder: schedule your next pickup before you run out. Running out for even 2-3 days breaks the habit pattern you have built. Reply DONE when your refill is confirmed.',
    },
    {
      key: 'rx.phase3.day15.results_frame',
      phase: 3, after: { days: 15 }, send_at_local: '09:00',
      body: 'Six weeks in. If progress feels slower than expected - that is normal at this stage. The medication is working at the metabolic level whether you can see it or not. Stay consistent through week 8. Reply OK.',
    },
    {
      key: 'rx.phase3.day30.momentum_check',
      phase: 3, after: { days: 30 }, send_at_local: '09:00',
      body: 'Ten weeks on the medication. How is the habit sitting? Reply SOLID, OKAY, or STRUGGLING - no wrong answer, just an honest check.',
    },

    // ── Phase 4: Plateau ──────────────────────────────────────────────────────
    {
      key: 'rx.phase4.day7.plateau_frame',
      phase: 4, after: { days: 7 }, send_at_local: '09:00',
      body: 'Around the 3-month mark, most patients hit a window where the scale stalls. This is physiological, not a medication failure. Your body is recalibrating. The patients who push through this window are the ones who see the best results at 6 months. Stay on it. Reply OK.',
    },
    {
      key: 'rx.phase4.day20.dose_check',
      phase: 4, after: { days: 20 }, send_at_local: '09:00',
      body: 'If you have a follow-up scheduled with your prescriber, this is a good time to discuss how you are responding. Some protocols adjust dosing at 90 days. Reply SCHEDULED if you have an appointment, or NEED TO SCHEDULE if not.',
    },

    // ── Phase 5: Maintenance ──────────────────────────────────────────────────
    {
      key: 'rx.phase5.weekly_checkin',
      phase: 5, after: { days: 7 }, send_at_local: '09:00',
      body: 'Weekly check: medication still part of your morning routine? Reply Y or N.',
    },
    {
      key: 'rx.phase5.refill_cycle',
      phase: 5, after: { days: 21 }, send_at_local: '09:00',
      body: 'Refill window: make sure your next 30-day supply is confirmed. Consistency is the only variable that matters long-term. Reply DONE when your refill is set.',
    },
  ];
}

function rxTriggers(): RxTrigger[] {
  return [
    { key: 'no_response_48h',    label: 'No reply in 48 hours - send nudge' },
    { key: 'no_response_5d',     label: 'No reply in 5 days - flag to clinic' },
    { key: 'flag_for_clinic',    label: 'Patient flagged for clinic review' },
    { key: 'phase_auto_advance', label: 'Phase duration elapsed - advance phase' },
    { key: 'refill_due',         label: 'Refill window approaching (day 25 of supply)' },
  ];
}

function rxFindTemplate(key: string): RxTemplate | undefined {
  return rxTemplates().find(t => t.key === key);
}

function rxFindPhase(id: number): RxPhase | undefined {
  return rxPhases().find(p => p.id === id);
}

function rxTemplatesForPhase(phaseId: number): RxTemplate[] {
  return rxTemplates().filter(t => t.phase === phaseId);
}

export {
  rxPhases,
  rxTemplates,
  rxTriggers,
  rxFindTemplate,
  rxFindPhase,
  rxTemplatesForPhase,
};
