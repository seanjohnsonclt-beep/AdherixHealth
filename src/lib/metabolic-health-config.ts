// metabolic-health-config.ts
// Adherix Metabolic - pre-diabetes and metabolic syndrome management.
//
// Target patient: A1c 5.7-6.4% (pre-diabetes) or metabolic syndrome
// (3+ of: elevated waist, BP, triglycerides, low HDL, elevated fasting glucose).
// 88M Americans have pre-diabetes; ~80% do not know it.
//
// Key behavioral levers:
//   - Fasting glucose awareness (not clinical monitoring - behavioral prompting)
//   - Carbohydrate quality (not strict counting - Mediterranean/low-glycemic patterns)
//   - Post-meal movement (10-min walk after eating reduces glucose spike ~25%)
//   - Sleep as a metabolic variable (under 7h raises fasting glucose)
//   - Medication adherence (metformin if prescribed)
//   - Lab follow-up (A1c every 3 months)
//
// This module is also the downstream home for IBT patients who need
// ongoing metabolic monitoring after the behavioral program ends.

export interface MetabolicPhase {
  id: number;
  name: string;
  durationDays: number | null;
}

export interface MetabolicTemplate {
  key: string;
  phase: number;
  after: { days: number };
  send_at_local: string;
  body: string;
  internal?: boolean;
  requires_reply_to?: string;
}

export interface MetabolicTrigger {
  key: string;
  label: string;
}

function metabolicPhases(): MetabolicPhase[] {
  return [
    { id: 0, name: 'Initiation',     durationDays: 1   },
    { id: 1, name: 'Baseline',       durationDays: 14  },
    { id: 2, name: 'Intervention',   durationDays: 30  },
    { id: 3, name: 'Optimization',   durationDays: 60  },
    { id: 4, name: 'Monitoring',     durationDays: null },
  ];
}

function metabolicTemplates(): MetabolicTemplate[] {
  return [
    // ── Phase 0: Initiation ───────────────────────────────────────────────────
    {
      key: 'met.phase0.welcome',
      phase: 0, after: { days: 0 }, send_at_local: '09:00',
      body: 'Hi {{first_name}}, this is your Adherix metabolic health line. Your numbers put you in a window where small changes have a large impact. This program keeps those changes consistent. Reply YES to start.',
      requires_reply_to: undefined,
    },
    {
      key: 'met.phase0.confirmed',
      phase: 0, after: { days: 0 }, send_at_local: '09:05',
      body: 'Good. Pre-diabetes is not a diagnosis you are stuck with - it is a signal that the body is still responsive. The research is clear: lifestyle change at this stage cuts progression to T2D by over 50%. You have real leverage here. We start tomorrow.',
      requires_reply_to: 'met.phase0.welcome',
    },

    // ── Phase 1: Baseline ─────────────────────────────────────────────────────
    {
      key: 'met.phase1.day1.carb_baseline',
      phase: 1, after: { days: 1 }, send_at_local: '12:30',
      body: 'Baseline question: what did you eat for lunch today? No tracking needed - just a snapshot. Reply with anything.',
    },
    {
      key: 'met.phase1.day2.glucose_intro',
      phase: 1, after: { days: 2 }, send_at_local: '09:00',
      body: 'Context for what we are working on: blood sugar spikes happen after every meal. The size of the spike depends on what you eat and what you do right after. Small shifts in both make a measurable difference in your A1c over 90 days.',
    },
    {
      key: 'met.phase1.day3.post_meal_walk',
      phase: 1, after: { days: 3 }, send_at_local: '13:00',
      body: 'One experiment after lunch today: take a 10-minute walk. A short walk right after eating reduces your blood sugar spike by up to 25%. This is one of the highest-leverage things you can do. Reply DONE when you try it.',
    },
    {
      key: 'met.phase1.day5.sleep_check',
      phase: 1, after: { days: 5 }, send_at_local: '09:00',
      body: 'Sleep is a metabolic variable most people do not know about: under 7 hours of sleep raises your fasting glucose and makes your cells more insulin resistant the next day. How many hours did you sleep last night? Reply with a number.',
    },
    {
      key: 'met.phase1.day7.carb_quality',
      phase: 1, after: { days: 7 }, send_at_local: '12:00',
      body: 'Carb quality matters more than carb quantity. White bread, white rice, and sugary drinks spike glucose fast. Legumes, vegetables, and whole grains are slow. Today at one meal: swap one fast carb for a slow one. Reply DONE when you do.',
    },
    {
      key: 'met.phase1.day10.medication_check',
      phase: 1, after: { days: 10 }, send_at_local: '09:00',
      body: 'If your doctor prescribed metformin or any other medication: are you taking it consistently? Reply Y or N. If N, no judgment - just tell us what is getting in the way.',
    },
    {
      key: 'met.phase1.day14.baseline_close',
      phase: 1, after: { days: 14 }, send_at_local: '09:00',
      body: 'Two weeks in. You have a baseline now. Moving into the intervention phase - more specific targets, same brief format. One thing: your A1c reflects the last 90 days. Everything you do from here matters more than you think.',
    },

    // ── Phase 2: Intervention ─────────────────────────────────────────────────
    {
      key: 'met.phase2.day2.protein_anchor',
      phase: 2, after: { days: 2 }, send_at_local: '08:30',
      body: 'Morning target: 25-30g of protein at breakfast slows glucose absorption for the rest of the morning. Eggs, Greek yogurt, cottage cheese. Reply DONE when you eat it.',
    },
    {
      key: 'met.phase2.day5.post_meal_habit',
      phase: 2, after: { days: 5 }, send_at_local: '13:00',
      body: 'Post-meal walk check: this week, try to walk after at least 3 meals. Even 5 minutes counts. Today - did you walk after eating? Reply Y or N.',
    },
    {
      key: 'met.phase2.day10.fiber_prompt',
      phase: 2, after: { days: 10 }, send_at_local: '12:00',
      body: 'Fiber slows glucose into your bloodstream. Target: 25g a day. One serving of lentils is 15g. One apple is 4g. This week: add one high-fiber food per day you are not already eating. Reply DONE when you find one.',
    },
    {
      key: 'met.phase2.day14.stress_glucose',
      phase: 2, after: { days: 14 }, send_at_local: '09:00',
      body: 'Stress raises blood sugar directly - cortisol triggers glucose release. If your week has been high-stress, your metabolic numbers feel it. Has stress been high this week? Reply Y or N.',
    },
    {
      key: 'met.phase2.day21.lab_reminder',
      phase: 2, after: { days: 21 }, send_at_local: '09:00',
      body: 'Lab reminder: if your last A1c was more than 3 months ago, schedule a recheck. This is the only way to see whether what you are doing is working at the clinical level. Reply SCHEDULED or NEED TO SCHEDULE.',
    },
    {
      key: 'met.phase2.day28.intervention_close',
      phase: 2, after: { days: 28 }, send_at_local: '09:00',
      body: 'One month of changes. The habits that stick are the ones that became automatic - not the ones you have to think about. Which one of these has felt most natural? Post-meal walk, protein at breakfast, or better carb choices? Reply with one.',
    },

    // ── Phase 3: Optimization ─────────────────────────────────────────────────
    {
      key: 'met.phase3.day7.glucose_pattern',
      phase: 3, after: { days: 7 }, send_at_local: '09:00',
      body: 'Optimization phase. The goal now is consistency, not perfection. One question this week: are there specific meals or times of day where you feel your eating is hardest to control? Reply with one.',
    },
    {
      key: 'met.phase3.day14.medication_adherence',
      phase: 3, after: { days: 14 }, send_at_local: '09:00',
      body: 'Medication check: if you are on metformin, how consistent have you been this week? Reply EVERY DAY, MOST DAYS, or MISSED SOME.',
    },
    {
      key: 'met.phase3.day21.sleep_target',
      phase: 3, after: { days: 21 }, send_at_local: '20:30',
      body: 'Sleep target this week: 7 hours minimum. Tonight - what time are you planning to sleep? Saying it out loud increases follow-through. Reply with a time.',
    },
    {
      key: 'met.phase3.day30.a1c_frame',
      phase: 3, after: { days: 30 }, send_at_local: '09:00',
      body: 'A1c context: a 0.5% reduction in A1c cuts your risk of progressing to T2D by roughly 30%. That is achievable in 90 days with consistent habits. You are in that window right now.',
    },
    {
      key: 'met.phase3.day45.lab_reminder',
      phase: 3, after: { days: 45 }, send_at_local: '09:00',
      body: 'Lab check: your next A1c is due soon if you have not had one in the last 90 days. Schedule it now while you are in an active improvement window - the result will reflect everything you have done. Reply SCHEDULED.',
    },

    // ── Phase 4: Monitoring ───────────────────────────────────────────────────
    {
      key: 'met.phase4.weekly_check',
      phase: 4, after: { days: 7 }, send_at_local: '09:00',
      body: 'Weekly check: post-meal walks, protein at breakfast, sleep. How did this week land? Reply STRONG, OKAY, or ROUGH.',
    },
    {
      key: 'met.phase4.quarterly_lab',
      phase: 4, after: { days: 84 }, send_at_local: '09:00',
      body: 'Quarterly lab reminder: A1c should be checked every 3 months while in the pre-diabetes range. Have you had a blood draw in the last 90 days? Reply Y or N.',
    },
  ];
}

function metabolicTriggers(): MetabolicTrigger[] {
  return [
    { key: 'no_response_48h',    label: 'No reply in 48 hours - send nudge' },
    { key: 'no_response_5d',     label: 'No reply in 5 days - flag to clinic' },
    { key: 'flag_for_clinic',    label: 'Patient flagged for clinic review' },
    { key: 'phase_auto_advance', label: 'Phase duration elapsed - advance phase' },
    { key: 'lab_due_90d',        label: 'A1c lab due - prompt patient to schedule' },
    { key: 'medication_missed',  label: 'Medication adherence signal detected' },
  ];
}

function metabolicFindTemplate(key: string): MetabolicTemplate | undefined {
  return metabolicTemplates().find(t => t.key === key);
}

function metabolicFindPhase(id: number): MetabolicPhase | undefined {
  return metabolicPhases().find(p => p.id === id);
}

function metabolicTemplatesForPhase(phaseId: number): MetabolicTemplate[] {
  return metabolicTemplates().filter(t => t.phase === phaseId);
}

export {
  metabolicPhases,
  metabolicTemplates,
  metabolicTriggers,
  metabolicFindTemplate,
  metabolicFindPhase,
  metabolicTemplatesForPhase,
};
