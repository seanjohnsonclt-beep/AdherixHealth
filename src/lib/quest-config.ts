// Adherix Quest — pediatric/adolescent obesity modality config
// Dual-channel: teen track + guardian track per phase
// AI personalizes teen messages at send time (same pattern as adult engine)
//
// Age bands:
//   10-12: COPPA, guardian-primary, teen gets simplified version
//   13-17: teen-primary, guardian gets weekly summaries
//
// Phases: Onboarding -> Habit Lock -> Momentum -> Maintenance
// Gamification triggers fire independently of phase messages

import { Phase } from './config';

export interface QuestTemplate {
  key: string;
  phase: number;
  track: 'teen' | 'guardian' | 'both';
  sensitivity: 'low' | 'medium' | 'high';
  after?: { minutes?: number; hours?: number; days?: number };
  send_at_local?: string;
  body: string;
  guardian_body?: string;  // alternate body for guardian track (if track = 'both')
}

export interface QuestTrigger {
  key: string;
  description: string;
  check: (p: QuestPatient) => boolean;
  action: 'schedule_message' | 'flag' | 'award_xp' | 'send_recap';
  templateKey?: string;
  track?: 'teen' | 'guardian' | 'both';
}

export interface QuestPatient {
  id: string;
  quest_streak: number;
  quest_checkin_at: string | null;
  quest_xp: number;
  last_patient_reply_at: string | null;
  status: string;
  consent_type: string;
  phase: number;
  phase_started_at: string | null;
}

// ── Phases ────────────────────────────────────────────────────────────────────
export const QUEST_PHASES: Phase[] = [
  { id: 0, name: 'Welcome',       duration_days: 2,    description: 'First 48h. Set the game up. Welcome teen and guardian separately.' },
  { id: 1, name: 'Onboarding',    duration_days: 14,   description: 'Habit introduction. Daily check-ins establish the loop. Streak building starts.' },
  { id: 2, name: 'Habit Lock',    duration_days: 30,   description: 'Habits become automatic. Boss challenges introduced. Leaderboard competitive.' },
  { id: 3, name: 'Momentum',      duration_days: 60,   description: 'Reinforce progress. Squad dynamics active. AI narrative arc messages.' },
  { id: 4, name: 'Maintenance',   duration_days: 9999, description: 'Light-touch weekly. Milestone celebrations. Long-term identity reinforcement.' },
];

// ── Templates ─────────────────────────────────────────────────────────────────
export const QUEST_TEMPLATES: QuestTemplate[] = [

  // ── Phase 0: Welcome ───────────────────────────────────────────────────────

  { key: 'quest.p0.teen_welcome', phase: 0, track: 'teen', sensitivity: 'low',
    after: { minutes: 5 },
    body: 'Hey - this is Adherix Quest. You are officially on a Quest. No lectures, no homework. Just show up and reply. Reply YES to start.' },

  { key: 'quest.p0.guardian_welcome', phase: 0, track: 'guardian', sensitivity: 'low',
    after: { minutes: 10 },
    body: 'Hi {guardian_name} - this is Adherix Quest. {first_name} just enrolled. You will get weekly progress summaries. Your teen drives this - your job is to encourage, not manage. Reply OK to confirm.' },

  { key: 'quest.p0.teen_handle', phase: 0, track: 'teen', sensitivity: 'low',
    requires_reply_to: 'quest.p0.teen_welcome',
    body: 'Your anonymous handle is {quest_handle}. Nobody knows who is behind it. This is how you show up on the leaderboard. Reply YES to lock it in.' },

  { key: 'quest.p0.handle_confirmed', phase: 0, track: 'teen', sensitivity: 'low',
    requires_reply_to: 'quest.p0.teen_handle',
    body: 'Locked in. First check-in tomorrow at 4pm. That is when your streak starts.' },

  // ── Phase 1: Onboarding ────────────────────────────────────────────────────

  { key: 'quest.p1.day1_checkin', phase: 1, track: 'teen', sensitivity: 'low',
    after: { days: 1 }, send_at_local: '16:00',
    body: 'Day 1. Movement goal - did you hit it today? YES or NO. Honest answer only.' },

  { key: 'quest.p1.day2_checkin', phase: 1, track: 'teen', sensitivity: 'low',
    after: { days: 2 }, send_at_local: '16:00',
    body: 'Day 2. Same question. Movement goal - YES or NO. Streak is at 1 right now.' },

  { key: 'quest.p1.day3_food', phase: 1, track: 'teen', sensitivity: 'medium',
    after: { days: 3 }, send_at_local: '12:00',
    body: 'Midday check. Lunch - did you eat something that had protein in it? YES or NO.' },

  { key: 'quest.p1.day5_streak', phase: 1, track: 'teen', sensitivity: 'low',
    after: { days: 5 }, send_at_local: '16:00',
    body: 'Day 5 check-in. How are you feeling on the program so far? Reply 1 (rough) to 5 (solid).' },

  { key: 'quest.p1.day7_guardian', phase: 1, track: 'guardian', sensitivity: 'low',
    after: { days: 7 }, send_at_local: '10:00',
    body: 'Week 1 update: {first_name} has completed {checkin_count} of 7 check-ins. The best thing you can do this week: notice any small win and name it out loud.' },

  { key: 'quest.p1.day10_hydration', phase: 1, track: 'teen', sensitivity: 'low',
    after: { days: 10 }, send_at_local: '14:00',
    body: 'Water check. Half your body weight in ounces is your daily target. Are you close today? YES or NO.' },

  { key: 'quest.p1.day14_transition', phase: 1, track: 'teen', sensitivity: 'low',
    after: { days: 14 }, send_at_local: '16:00',
    body: 'Two weeks in. You have built something. Phase 2 starts now - harder challenges, bigger XP. Reply READY.' },

  { key: 'quest.p1.day14_guardian', phase: 1, track: 'guardian', sensitivity: 'low',
    after: { days: 14 }, send_at_local: '10:00',
    body: 'Two-week update: {first_name} completed onboarding. Habit loop is established. Phase 2 begins - movement and nutrition goals become more specific.' },

  // ── Phase 2: Habit Lock ────────────────────────────────────────────────────

  { key: 'quest.p2.daily_checkin', phase: 2, track: 'teen', sensitivity: 'low',
    after: { days: 1 }, send_at_local: '16:00',
    body: 'Check-in. Movement goal today - YES or NO. {quest_handle} is on a {quest_streak}-day streak.' },

  { key: 'quest.p2.boss_monday', phase: 2, track: 'teen', sensitivity: 'low',
    after: { days: 1 }, send_at_local: '09:00',
    body: 'This week\'s boss challenge: 5 consecutive movement days. Most won\'t try it. Reply BOSS to accept. Worth 3x XP.' },

  { key: 'quest.p2.water_mid', phase: 2, track: 'teen', sensitivity: 'low',
    after: { days: 3 }, send_at_local: '13:00',
    body: 'Midweek. Water and movement are the two things. How is the water today? Reply GOOD or BEHIND.' },

  { key: 'quest.p2.guardian_week3', phase: 2, track: 'guardian', sensitivity: 'low',
    after: { days: 7 }, send_at_local: '10:00',
    body: 'Week 3 summary: {first_name} is at Level {quest_level} with a {quest_streak}-day streak. The biggest support you can give: keep dinner screens off and eat together when you can.' },

  { key: 'quest.p2.villain_arc', phase: 2, track: 'teen', sensitivity: 'low',
    after: { days: 4 }, send_at_local: '17:00',
    body: 'You went quiet for a few days. The board moved. This is the villain arc part. Reply BACK to start your comeback.' },

  { key: 'quest.p2.sleep_check', phase: 2, track: 'teen', sensitivity: 'medium',
    after: { days: 6 }, send_at_local: '21:00',
    body: 'Sleep check. Less than 7 hours tanks your metabolism and energy. What time are you aiming for lights out tonight? Reply with a time.' },

  // ── Phase 3: Momentum ──────────────────────────────────────────────────────

  { key: 'quest.p3.daily_checkin', phase: 3, track: 'teen', sensitivity: 'low',
    after: { days: 1 }, send_at_local: '16:00',
    body: 'Daily check-in. Movement - YES or NO.' },

  { key: 'quest.p3.narrative_arc', phase: 3, track: 'teen', sensitivity: 'low',
    after: { days: 14 }, send_at_local: '10:00',
    body: 'Six weeks in. Week 1 you were just figuring out the check-ins. Now you have a streak, a handle, and a rank. That is a different person. Reply FACTS or NAH.' },

  { key: 'quest.p3.squad_update', phase: 3, track: 'teen', sensitivity: 'low',
    after: { days: 7 }, send_at_local: '18:00',
    body: 'Squad update this week. Your squad is tracking. Everyone\'s streak counts toward the squad board. Do not be the reason the squad drops.' },

  { key: 'quest.p3.guardian_month2', phase: 3, track: 'guardian', sensitivity: 'low',
    after: { days: 30 }, send_at_local: '10:00',
    body: 'Month 2 update: {first_name} is at Level {quest_level}. Streak: {quest_streak} days. The engine is doing its job. Keep the home environment consistent - regular meals, movement visible, screens limited after 9pm.' },

  { key: 'quest.p3.protein_anchor', phase: 3, track: 'teen', sensitivity: 'medium',
    after: { days: 10 }, send_at_local: '12:00',
    body: 'Protein check. Are you hitting 20g at breakfast most days? YES or NOT REALLY.' },

  // ── Phase 4: Maintenance ───────────────────────────────────────────────────

  { key: 'quest.p4.weekly_checkin', phase: 4, track: 'teen', sensitivity: 'low',
    after: { days: 7 }, send_at_local: '16:00',
    body: 'Weekly check-in. How is everything going? Reply 1-5.' },

  { key: 'quest.p4.milestone_celebrate', phase: 4, track: 'teen', sensitivity: 'low',
    after: { days: 1 }, send_at_local: '10:00',
    body: 'You have been on Quest for 90 days. Most people do not make it this far. {quest_handle} is still in the game. That matters.' },

  { key: 'quest.p4.guardian_quarterly', phase: 4, track: 'guardian', sensitivity: 'low',
    after: { days: 30 }, send_at_local: '10:00',
    body: 'Quarterly update: {first_name} is Level {quest_level}, {quest_streak}-day streak. Long-term adherence is about identity now. Keep reinforcing: this is who they are becoming, not something they are doing.' },
];

// ── Triggers ──────────────────────────────────────────────────────────────────
export const QUEST_TRIGGERS = [
  {
    key: 'quest.no_reply_24h',
    description: 'Teen has not replied in 24h - send villain arc prompt',
    track: 'teen' as const,
    templateKey: 'quest.p2.villain_arc',
  },
  {
    key: 'quest.no_reply_48h',
    description: '48h no reply - flag for clinic, send guardian alert',
    track: 'guardian' as const,
    templateKey: 'quest.guardian_drift_alert',
  },
  {
    key: 'quest.boss_accepted',
    description: 'Teen replied BOSS - lock in boss challenge',
    track: 'teen' as const,
    templateKey: null,
  },
  {
    key: 'quest.streak_broken',
    description: 'Streak dropped to 0 - recovery prompt within 12h',
    track: 'teen' as const,
    templateKey: 'quest.p2.villain_arc',
  },
  {
    key: 'quest.weekly_recap',
    description: 'Sunday - send leaderboard recap to all active quest teens',
    track: 'teen' as const,
    templateKey: null, // built dynamically by quest-game.ts
  },
];

// ── Guardian-only drift alert ─────────────────────────────────────────────────
export const GUARDIAN_DRIFT_ALERT: QuestTemplate = {
  key: 'quest.guardian_drift_alert',
  phase: -1,
  track: 'guardian',
  sensitivity: 'low',
  body: 'Hi {guardian_name} - {first_name} has been quiet on Quest for 48 hours. A gentle check-in from you tonight can help more than another text from us.',
};
