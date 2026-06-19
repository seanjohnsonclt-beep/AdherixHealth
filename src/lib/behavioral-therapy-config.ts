// behavioral-therapy-config.ts
// Adherix IBT - SMS support layer for Medicare Intensive Behavioral Therapy.
//
// Medicare IBT covers 22 face-to-face visits in year one:
//   Months 1-6:  1 visit/week x 4, then 1 visit/2 weeks x 8 = 12 visits
//   Months 7-12: 1 visit/month x 6 = 6 visits
//   + initial visit = 22 total
//   Year 2+: monthly if 3kg lost in year one
//
// This module fills the gaps BETWEEN visits with brief, frequent behavioral
// check-ins - exactly what IBT requires but cannot staff at scale.
//
// Phase cadence mirrors the visit frequency:
//   Phase 0: Orientation (1d)
//   Phase 1: Intensive (30d)   - weekly visits; daily SMS between
//   Phase 2: Transition (150d) - biweekly visits; 3x/week SMS
//   Phase 3: Stabilization (180d) - monthly visits; weekly SMS
//   Phase 4: Continuation (ongoing)

export interface IbtPhase {
  id: number;
  name: string;
  durationDays: number | null;
}

export interface IbtTemplate {
  key: string;
  phase: number;
  after: { days: number };
  send_at_local: string;
  body: string;
  internal?: boolean;
  requires_reply_to?: string;
}

export interface IbtTrigger {
  key: string;
  label: string;
}

function ibtPhases(): IbtPhase[] {
  return [
    { id: 0, name: 'Orientation',     durationDays: 1   },
    { id: 1, name: 'Intensive',       durationDays: 30  },
    { id: 2, name: 'Transition',      durationDays: 150 },
    { id: 3, name: 'Stabilization',   durationDays: 180 },
    { id: 4, name: 'Continuation',    durationDays: null },
  ];
}

function ibtTemplates(): IbtTemplate[] {
  return [
    // ── Phase 0: Orientation ──────────────────────────────────────────────────
    {
      key: 'ibt.phase0.welcome',
      phase: 0, after: { days: 0 }, send_at_local: '09:00',
      body: 'Hi {{first_name}}, this is your Adherix behavioral support line. Between your clinic visits, this program sends brief daily check-ins to keep you on track. Reply YES to start.',
      requires_reply_to: undefined,
    },
    {
      key: 'ibt.phase0.confirmed',
      phase: 0, after: { days: 0 }, send_at_local: '09:05',
      body: 'Good. These messages are short on purpose - one question, one action. The research behind this program shows that brief daily contact is more effective than monthly calls. Your next clinic visit is where the deeper work happens. See you there.',
      requires_reply_to: 'ibt.phase0.welcome',
    },

    // ── Phase 1: Intensive (monthly 1 - daily SMS support) ────────────────────
    {
      key: 'ibt.phase1.day1.food_log_intro',
      phase: 1, after: { days: 1 }, send_at_local: '12:00',
      body: 'First check-in: what did you eat for your first meal today? No judgment - just a baseline. Reply with anything.',
    },
    {
      key: 'ibt.phase1.day2.hunger_scale',
      phase: 1, after: { days: 2 }, send_at_local: '18:30',
      body: 'Hunger check: on a scale of 1-10, how hungry were you before dinner today? 1 = not at all, 10 = very. Reply with the number.',
    },
    {
      key: 'ibt.phase1.day3.movement_baseline',
      phase: 1, after: { days: 3 }, send_at_local: '17:00',
      body: 'Movement today: anything counts - a walk, stairs, standing instead of sitting. Did you move intentionally today? Reply Y or N.',
    },
    {
      key: 'ibt.phase1.day5.eating_speed',
      phase: 1, after: { days: 5 }, send_at_local: '12:30',
      body: 'One behavioral experiment at lunch today: put your fork down between bites. It takes 20 minutes for your brain to register fullness. Eating slower changes how much you need. Reply DONE after lunch.',
    },
    {
      key: 'ibt.phase1.day7.week1_review',
      phase: 1, after: { days: 7 }, send_at_local: '09:00',
      body: 'One week in. Quick reflection: what felt easiest this week? What felt hardest? Reply with one word for each.',
    },
    {
      key: 'ibt.phase1.day8.visit_prep',
      phase: 1, after: { days: 8 }, send_at_local: '09:00',
      body: 'Visit prep: your next clinic appointment is coming up. Come with one specific thing you want to work on. The more concrete, the more useful the visit. Reply READY when you have something in mind.',
    },
    {
      key: 'ibt.phase1.day10.emotional_eating_intro',
      phase: 1, after: { days: 10 }, send_at_local: '19:00',
      body: 'Evening check: did you eat anything today out of stress, boredom, or emotion rather than hunger? No wrong answer. Reply Y or N.',
    },
    {
      key: 'ibt.phase1.day14.mid_month_check',
      phase: 1, after: { days: 14 }, send_at_local: '09:00',
      body: 'Two weeks in. Are the daily check-ins landing at a good time? If the timing is off, reply with a better hour and we will adjust.',
    },
    {
      key: 'ibt.phase1.day17.environment_prompt',
      phase: 1, after: { days: 17 }, send_at_local: '09:00',
      body: 'Your environment shapes your behavior more than your willpower does. One question: is there one food in your house that you consistently overeat? Reply Y or N.',
    },
    {
      key: 'ibt.phase1.day21.movement_goal',
      phase: 1, after: { days: 21 }, send_at_local: '09:00',
      body: 'Movement goal this week: 150 minutes total. That is 22 minutes a day - a 15-minute walk and going up stairs counts. Track it however works for you. Reply DONE at the end of the week.',
    },
    {
      key: 'ibt.phase1.day28.month_close',
      phase: 1, after: { days: 28 }, send_at_local: '09:00',
      body: 'Month one complete. You have been showing up. One honest question: compared to 30 days ago, do you feel more in control of your eating? Reply MORE, SAME, or LESS.',
    },

    // ── Phase 2: Transition (months 2-6 - biweekly visits) ────────────────────
    {
      key: 'ibt.phase2.day3.habit_audit',
      phase: 2, after: { days: 3 }, send_at_local: '09:00',
      body: 'Entering the next phase. Visits are every two weeks now. The SMS check-ins stay more frequent - that is the point. What is the one habit from month one you want to keep? Reply with it.',
    },
    {
      key: 'ibt.phase2.day7.plate_method',
      phase: 2, after: { days: 7 }, send_at_local: '12:00',
      body: 'Plate method reminder: half vegetables, quarter protein, quarter complex carbs. One meal today - can you hit all three? Reply DONE when you do.',
    },
    {
      key: 'ibt.phase2.day14.setback_reframe',
      phase: 2, after: { days: 14 }, send_at_local: '09:00',
      body: 'Setback framing: a hard week is not evidence you cannot do this. It is data. What made this week harder than usual? Reply with one word.',
    },
    {
      key: 'ibt.phase2.day21.visit_prep',
      phase: 2, after: { days: 21 }, send_at_local: '09:00',
      body: 'Clinic visit coming up. Bring one number: how many days this week did you eat in a way you felt good about after? That is your engagement score for the visit.',
    },
    {
      key: 'ibt.phase2.day28.stress_eating_check',
      phase: 2, after: { days: 28 }, send_at_local: '19:30',
      body: 'Evening check: stress eating is the most common reason behavioral programs stall. Has stress been a factor in your eating this week? Reply Y or N.',
    },
    {
      key: 'ibt.phase2.day42.sleep_prompt',
      phase: 2, after: { days: 42 }, send_at_local: '09:00',
      body: 'Sleep is a metabolic variable. Under 7 hours raises hunger hormones and makes high-calorie food more appealing - this is biochemistry, not weakness. How has your sleep been this week? Reply GOOD, OKAY, or ROUGH.',
    },
    {
      key: 'ibt.phase2.day70.halfway_check',
      phase: 2, after: { days: 70 }, send_at_local: '09:00',
      body: 'Halfway through the transition phase. Habits are more stable now than month one. What feels different? Reply with one thing.',
    },
    {
      key: 'ibt.phase2.day120.phase_close',
      phase: 2, after: { days: 120 }, send_at_local: '09:00',
      body: 'Five months in. You have done the intensive work. Moving into the stabilization phase - monthly clinic visits, weekly check-ins here. The goal now is making this permanent. Reply READY.',
    },

    // ── Phase 3: Stabilization (months 7-12 - monthly visits) ─────────────────
    {
      key: 'ibt.phase3.weekly_checkin',
      phase: 3, after: { days: 7 }, send_at_local: '09:00',
      body: 'Weekly check: how did eating go this week? Reply STRONG, OKAY, or ROUGH.',
    },
    {
      key: 'ibt.phase3.day14.movement_check',
      phase: 3, after: { days: 14 }, send_at_local: '09:00',
      body: 'Movement this week: did you hit 150 minutes? Reply Y, NO, or CLOSE.',
    },
    {
      key: 'ibt.phase3.day21.visit_prep',
      phase: 3, after: { days: 21 }, send_at_local: '09:00',
      body: 'Monthly clinic visit coming up. One thing to bring: the hardest moment this month with food or behavior. That is the most useful thing to work through in the room.',
    },

    // ── Phase 4: Continuation ─────────────────────────────────────────────────
    {
      key: 'ibt.phase4.monthly_check',
      phase: 4, after: { days: 30 }, send_at_local: '09:00',
      body: 'Monthly check-in: habits still holding? Reply SOLID, OKAY, or SLIPPING.',
    },
  ];
}

function ibtTriggers(): IbtTrigger[] {
  return [
    { key: 'no_response_48h',    label: 'No reply in 48 hours - send nudge' },
    { key: 'no_response_5d',     label: 'No reply in 5 days - flag to clinic' },
    { key: 'flag_for_clinic',    label: 'Patient flagged for clinic review' },
    { key: 'phase_auto_advance', label: 'Phase duration elapsed - advance phase' },
    { key: 'visit_reminder',     label: 'Upcoming clinic visit - send prep message' },
  ];
}

function ibtFindTemplate(key: string): IbtTemplate | undefined {
  return ibtTemplates().find(t => t.key === key);
}

function ibtFindPhase(id: number): IbtPhase | undefined {
  return ibtPhases().find(p => p.id === id);
}

function ibtTemplatesForPhase(phaseId: number): IbtTemplate[] {
  return ibtTemplates().filter(t => t.phase === phaseId);
}

export {
  ibtPhases,
  ibtTemplates,
  ibtTriggers,
  ibtFindTemplate,
  ibtFindPhase,
  ibtTemplatesForPhase,
};
