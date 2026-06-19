// Adherix Bridge — Bariatric configuration
// getConfig() is the central modality router for all Adherix modules.
//
// Parallel to src/lib/config.ts (GLP-1 / Adherix Keep).
// Used when clinic.modality = 'bariatric'.
//
// Phases: Pre-Op → Acute Recovery → Diet Advancement →
//         Habit Building → Rebound Window → Maintenance
//
// Design principles (same as GLP-1 module):
//   - SMS-first, directive, short
//   - One action per message
//   - Assume the patient is tired and overwhelmed post-op
//   - Protein and supplement adherence are the two non-negotiables
//   - Rebound window (Phase 4) is the highest behavioral risk period

import { Phase, Template, Trigger } from './config';

// --- Phases -------------------------------------------------------------------

const BARI_PHASES: Phase[] = [
  { id: 0, name: 'Pre-Op',            duration_days: 7,    description: 'Commit the patient before surgery. Pre-op diet compliance. Expectation setting.' },
  { id: 1, name: 'Acute Recovery',    duration_days: 14,   description: 'Immediate post-op. Liquid diet, hydration, protein start. Daily check-ins.' },
  { id: 2, name: 'Diet Advancement',  duration_days: 30,   description: 'Progress through diet stages. Protein target increase. Supplement introduction.' },
  { id: 3, name: 'Habit Building',    duration_days: 60,   description: 'Eating behaviors locked in. Exercise introduction. Supplement adherence daily.' },
  { id: 4, name: 'Rebound Window',    duration_days: 90,   description: 'Highest behavioral risk. Appetite returning, grazing risk, behavioral drift.' },
  { id: 5, name: 'Maintenance',       duration_days: 9999, description: 'Monthly check-ins, labs reminders, long-term behavioral anchors.' },
];

// --- Message templates --------------------------------------------------------

const BARI_TEMPLATES: Template[] = [

  // Phase 0 - Pre-Op (7 days before surgery)
  { key: 'bari.phase0.welcome', phase: 0, after: { minutes: 5 },
    body: 'Hi {first_name}, this is your support line for your procedure. One short text at a time from here to recovery. Reply YES to start.' },

  { key: 'bari.phase0.confirmed', phase: 0, requires_reply_to: 'bari.phase0.welcome',
    body: "Locked in. Your pre-op diet is the first step - it reduces surgical risk and starts your recovery before you're even in the OR. How is it going today? Reply GOOD or HARD." },

  { key: 'bari.phase0.diet_check', phase: 0, after: { days: 2 }, send_at_local: '09:00',
    body: 'Pre-op diet check. Sticking to it? Reply Y or N - honest answer only.' },

  { key: 'bari.phase0.protein_intro', phase: 0, after: { days: 4 }, send_at_local: '09:00',
    body: "Starting protein now matters. Your goal post-op is 60g a day - practice hitting 30g at breakfast this week. Reply DONE after today's breakfast." },

  { key: 'bari.phase0.day_before', phase: 0, after: { days: 6 }, send_at_local: '19:00',
    body: "Tomorrow is the day. You've done the prep work. Focus on what you can control tonight: rest, hydration, nothing by mouth after midnight. Reply READY." },

  // Phase 1 - Acute Recovery (days 1-14 post-op)
  { key: 'bari.phase1.day1', phase: 1, after: { hours: 18 }, send_at_local: '10:00',
    body: "Welcome to day one. One job: sip water all day. Small sips, 64oz goal. No gulping. Reply SIPPING when you hit your first 8oz." },

  { key: 'bari.phase1.day2', phase: 1, after: { days: 2 }, send_at_local: '09:00',
    body: 'Still sipping? How is the pain today on a 1-5 scale? Reply with a number.' },

  { key: 'bari.phase1.day3_protein', phase: 1, after: { days: 3 }, send_at_local: '10:00',
    body: "Time to start protein. Clear protein shake or broth today - aim for 20g. This is the most important habit you'll build. Reply DONE when you get it in." },

  { key: 'bari.phase1.day5_supplement', phase: 1, after: { days: 5 }, send_at_local: '09:00',
    body: 'Starting your bariatric vitamins today. Chewable only for now. Did you take them this morning? Reply Y or N.' },

  { key: 'bari.phase1.day7_checkin', phase: 1, after: { days: 7 }, send_at_local: '10:00',
    body: "One week out. On a 1-5 scale, how are you feeling overall? Reply with a number." },

  { key: 'bari.phase1.day10_protein', phase: 1, after: { days: 10 }, send_at_local: '09:00',
    body: 'Protein check. Hitting 30-40g a day yet? Reply Y or N.' },

  { key: 'bari.phase1.day14_transition', phase: 1, after: { days: 14 }, send_at_local: '10:00',
    body: "Two weeks out. The liquid phase is almost done. Next phase: pureed foods start. Reply READY to keep going." },

  // Phase 2 - Diet Advancement (weeks 2-6 post-op)
  { key: 'bari.phase2.welcome', phase: 2, after: { minutes: 5 },
    body: "Moving into pureed foods. Still soft and smooth only - no chunks. Protein first at every meal. Reply OK." },

  { key: 'bari.phase2.protein_target', phase: 2, after: { days: 3 }, send_at_local: '09:00',
    body: 'New protein target: 60g a day. Eggs, Greek yogurt, soft fish, protein shakes. Hit 20g at breakfast. Reply DONE after today.' },

  { key: 'bari.phase2.supplement_daily', phase: 2, after: { days: 1 }, send_at_local: '08:00', repeat_every_days: 3,
    body: 'Vitamins today? Bariatric multi + calcium (separate from multi by 2 hours). Reply Y or N.' },

  { key: 'bari.phase2.eating_rules', phase: 2, after: { days: 7 }, send_at_local: '12:00',
    body: "Three rules that protect your pouch: eat slow, small bites, stop at the first full signal. Which one is hardest right now? Reply 1, 2, or 3." },

  { key: 'bari.phase2.day14_soft', phase: 2, after: { days: 14 }, send_at_local: '10:00',
    body: "Two weeks in. How is soft food going? Any foods that are not sitting right? Reply GOOD or ISSUE." },

  { key: 'bari.phase2.day28_milestone', phase: 2, after: { days: 28 }, send_at_local: '09:30',
    body: "One month post-op. Protein habit forming, supplements started, healing underway. What is one thing that has surprised you? Reply with anything." },

  // Phase 3 - Habit Building (months 2-4 post-op)
  { key: 'bari.phase3.welcome', phase: 3, after: { minutes: 5 },
    body: "Into the habit phase. Diet is advancing toward regular foods - protein still first, always. Check-ins every other day from here. Reply OK." },

  { key: 'bari.phase3.protein_checkin', phase: 3, after: { days: 2 }, send_at_local: '10:00', repeat_every_days: 2,
    body: 'Protein yesterday - did you hit 60g? Reply Y or N.' },

  { key: 'bari.phase3.no_drinking_meals', phase: 3, after: { days: 5 }, send_at_local: '12:00',
    body: "Reminder: no drinking with meals or for 30 minutes after. This is the habit that protects your results long-term. Still holding it? Reply Y or N." },

  { key: 'bari.phase3.exercise_intro', phase: 3, after: { days: 14 }, send_at_local: '09:00',
    body: "Time to add movement. 20-30 minutes of walking most days. Protects your muscle and accelerates everything else. Did you move today? Reply Y or N." },

  { key: 'bari.phase3.supplement_check', phase: 3, after: { days: 21 }, send_at_local: '09:00',
    body: 'Supplement check. You need these for life - not just the first few months. Still taking them daily? Reply Y or N.' },

  { key: 'bari.phase3.day45_identity', phase: 3, after: { days: 45 }, send_at_local: '10:00',
    body: "Six weeks of new habits. Name one thing about how you eat now that feels different. Just one thing - reply with it." },

  { key: 'bari.phase3.day60_transition', phase: 3, after: { days: 60 }, send_at_local: '09:30',
    body: "Wrapping up the habit phase. These patterns are yours now. Reply READY to move into the next stretch." },

  // Phase 4 - Rebound Window (months 4-7 post-op, highest risk)
  { key: 'bari.phase4.welcome', phase: 4, after: { minutes: 5 },
    body: "This stretch is where most people either lock in their results or start to drift. We are paying close attention. Still in? Reply YES." },

  { key: 'bari.phase4.appetite_check', phase: 4, after: { days: 7 }, send_at_local: '10:00',
    body: "Has your appetite come back more than expected this week? Reply MORE, SAME, or LESS." },

  { key: 'bari.phase4.grazing_check', phase: 4, after: { days: 14 }, send_at_local: '18:00',
    body: "Grazing check - eating small amounts throughout the day instead of three structured meals? Reply YES or NO." },

  { key: 'bari.phase4.protein_reset', phase: 4, after: { days: 21 }, send_at_local: '09:00',
    body: "Resetting the one rule: protein first at every meal, 60g a day. This is what protects your results when appetite starts coming back. Reply DONE after today's breakfast." },

  { key: 'bari.phase4.supplement_anchor', phase: 4, after: { days: 30 }, send_at_local: '08:00',
    body: 'Bariatric vitamins for life - not until you feel better. Still taking them daily? Reply Y or N.' },

  { key: 'bari.phase4.identity_anchor', phase: 4, after: { days: 45 }, send_at_local: '10:00',
    body: "What is the one result from this process you refuse to give up? Reply with it - I want to remember it." },

  { key: 'bari.phase4.appointment_check', phase: 4, after: { days: 60 }, send_at_local: '10:00',
    body: "Reminder: your 6-month follow-up is coming up. Have you scheduled it? Reply Y or N." },

  { key: 'bari.phase4.rebound_prevention', phase: 4, after: { days: 75 }, send_at_local: '09:00',
    body: "The patients who keep their results at year two are the ones who stayed consistent now. Not perfect - consistent. Still going? Reply YES." },

  { key: 'bari.phase4.pre_maintenance', phase: 4, after: { days: 88 }, send_at_local: '09:00',
    body: "Almost to maintenance mode. Monthly check-ins from here. The hard work of building is done. Reply READY." },

  // Phase 5 - Maintenance (ongoing)
  { key: 'bari.phase5.welcome', phase: 5, after: { minutes: 5 },
    body: "Monthly check-ins from here. One text, one reply. That is it. Reply OK to confirm." },

  { key: 'bari.phase5.monthly_checkin', phase: 5, after: { days: 30 }, send_at_local: '10:00', repeat_every_days: 30,
    body: 'Monthly check: protein still first? Supplements daily? Reply Y or N.' },

  { key: 'bari.phase5.month3_labs', phase: 5, after: { days: 90 }, send_at_local: '10:00',
    body: "Heads up: annual labs time. Bariatric bloodwork checks for deficiencies that build up silently. Have you scheduled them? Reply Y or N." },

  { key: 'bari.phase5.month6_milestone', phase: 5, after: { days: 180 }, send_at_local: '09:30',
    body: "Six months in maintenance. That puts you in the top tier of long-term outcomes. The habits you built are the reason. Keep that standard." },

  { key: 'bari.phase5.month12_anchor', phase: 5, after: { days: 365 }, send_at_local: '10:00',
    body: "One year. What is the one habit you will never give up? Reply with it." },

  // Intervention messages - triggered, not scheduled
  { key: 'bari.trigger.no_response_48h',
    body: "Haven't heard from you in 2 days. Everything ok? Reply with anything - even one word." },

  { key: 'bari.trigger.no_response_5d',
    body: "It's been 5 days. No pressure. Reply BACK when you're ready to pick this up again." },

  { key: 'bari.trigger.supplement_lapse',
    body: "Supplements are a lifetime commitment after bariatric surgery - deficiencies build silently. Back on them? Reply Y." },

  { key: 'bari.trigger.grazing_flag',
    body: "Grazing - eating small amounts all day - is the most common habit that undoes results over time. Three structured meals, protein first. Reply OK." },

  { key: 'bari.trigger.appointment_reminder',
    body: "Follow-up appointment coming up. These visits protect your results and catch issues early. Scheduled? Reply Y or N." },

  { key: 'bari.trigger.streak_8wk',
    body: "8 weeks of consistent protein and supplement habits. That foundation is what your long-term results are built on. Keep it." },

  { key: 'bari.trigger.streak_6mo',
    body: "6 months of consistent habits. Patients who hold this standard at 6 months keep their results at year 2. You're in that group." },
];

// --- Triggers -----------------------------------------------------------------

const BARI_TRIGGERS: Trigger[] = [
  // Engagement
  { key: 'bari_no_response_48h', condition: 'hours_since_last_inbound_gte', args: { hours: 48 },
    only_in_phases: [1, 2, 3], action: 'send_template', template: 'bari.trigger.no_response_48h', dedupe_window_hours: 72 },
  { key: 'bari_no_response_5d', condition: 'hours_since_last_inbound_gte', args: { hours: 120 },
    only_in_phases: [1, 2, 3, 4], action: 'send_template', template: 'bari.trigger.no_response_5d', dedupe_window_hours: 168 },
  { key: 'bari_flag_for_clinic', condition: 'hours_since_last_inbound_gte', args: { hours: 144 },
    only_in_phases: [1, 2, 3, 4], action: 'flag_patient', reason: 'no_response_6d', dedupe_window_hours: 168 },

  // Phase advancement
  { key: 'bari_phase_auto_advance', condition: 'phase_duration_elapsed',
    action: 'advance_phase', dedupe_window_hours: 24 },

  // Supplement adherence - weekly check in Phase 2-5
  { key: 'bari_supplement_weekly', condition: 'hours_since_last_inbound_gte', args: { hours: 168 },
    only_in_phases: [2, 3, 4, 5], action: 'send_template', template: 'bari.trigger.supplement_lapse', dedupe_window_hours: 144 },

  // Appointment reminders - fires at 3mo, 6mo, 12mo marks
  { key: 'bari_appointment_3mo', condition: 'days_since_phase0_start_gte', args: { days: 84 },
    action: 'send_template', template: 'bari.trigger.appointment_reminder', dedupe_window_hours: 720 },

  // Streak milestones
  { key: 'bari_streak_8wk', condition: 'injection_streak_at', args: { weeks: 8 },
    action: 'send_template', template: 'bari.trigger.streak_8wk', dedupe_window_hours: 8760 },
];

// --- Accessors ----------------------------------------------------------------

export function bariPhases(): Phase[]            { return BARI_PHASES; }
export function bariTemplates(): Template[]       { return BARI_TEMPLATES; }
export function bariTriggers(): Trigger[]         { return BARI_TRIGGERS; }
export function bariFindTemplate(key: string)     { return BARI_TEMPLATES.find(t => t.key === key); }
export function bariFindPhase(id: number)         { return BARI_PHASES.find(p => p.id === id); }
export function bariTemplatesForPhase(phaseId: number) { return BARI_TEMPLATES.filter(t => t.phase === phaseId); }

/**
 * Returns the correct phase/template/trigger set for a given clinic modality.
 * Use this everywhere the engine currently calls phases(), templates(), triggers().
 */
export function getConfig(modality: string) {
  if (modality === 'bariatric') {
    return {
      phases:            bariPhases(),
      templates:         bariTemplates(),
      triggers:          bariTriggers(),
      findTemplate:      bariFindTemplate,
      findPhase:         bariFindPhase,
      templatesForPhase: bariTemplatesForPhase,
    };
  }

  if (modality === 'pharmacotherapy') {
    const {
      rxPhases, rxTemplates, rxTriggers,
      rxFindTemplate, rxFindPhase, rxTemplatesForPhase,
    } = require('./pharmacotherapy-config');
    return {
      phases:            rxPhases(),
      templates:         rxTemplates(),
      triggers:          rxTriggers(),
      findTemplate:      rxFindTemplate,
      findPhase:         rxFindPhase,
      templatesForPhase: rxTemplatesForPhase,
    };
  }

  if (modality === 'behavioral_therapy') {
    const {
      ibtPhases, ibtTemplates, ibtTriggers,
      ibtFindTemplate, ibtFindPhase, ibtTemplatesForPhase,
    } = require('./behavioral-therapy-config');
    return {
      phases:            ibtPhases(),
      templates:         ibtTemplates(),
      triggers:          ibtTriggers(),
      findTemplate:      ibtFindTemplate,
      findPhase:         ibtFindPhase,
      templatesForPhase: ibtTemplatesForPhase,
    };
  }

  if (modality === 'metabolic_health') {
    const {
      metabolicPhases, metabolicTemplates, metabolicTriggers,
      metabolicFindTemplate, metabolicFindPhase, metabolicTemplatesForPhase,
    } = require('./metabolic-health-config');
    return {
      phases:            metabolicPhases(),
      templates:         metabolicTemplates(),
      triggers:          metabolicTriggers(),
      findTemplate:      metabolicFindTemplate,
      findPhase:         metabolicFindPhase,
      templatesForPhase: metabolicTemplatesForPhase,
    };
  }

  // Default: GLP-1 / Adherix Keep
  const { phases, templates, triggers, findTemplate, findPhase, templatesForPhase } = require('./config');
  return { phases: phases(), templates: templates(), triggers: triggers(), findTemplate, findPhase, templatesForPhase };
}
