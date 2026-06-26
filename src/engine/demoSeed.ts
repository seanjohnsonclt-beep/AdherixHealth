// Curated 15-patient demo dataset that tells the Adherix story clearly.
//
// Story arc on the dashboard:
//   - 7 healthy patients on track (green dominates)
//   - 3 recovered by the engine this week (trigger fired, patient replied)
//   - 2 drifting - engine is watching (yellow)
//   - 1 flagged - needs a human call (1 red, not 77)
//   - 1 paused
//   - 1 brand new patient
//
// Dashboard reads:
//   - 14 active + 1 paused
//   - 2 drifting now
//   - 3 recovered this week
//   - 1 flagged - call today
//   - ~$2,100 protected revenue

import { query, queryOne } from '@/lib/db';

export type ReseedOptions = {
  clinicId: string;
  targetCount?: number;
};

export type ReseedResult = {
  clinicId: string;
  totalPatients: number;
  totalMessages: number;
  bucketCounts: Record<string, number>;
};

const N = Date.now();
// Outbound messages go at 9am patient local time.
// Inbound replies vary by day-of-seed to feel organic (10am, 2pm, 5pm cycle).
function daysAgo(d: number, hour?: number): Date {
  const dt = new Date(N - d * 86_400_000);
  const h = hour ?? 9;
  dt.setHours(h, 0, 0, 0);
  return dt;
}
function hoursAgo(h: number): Date {
  return new Date(N - h * 3_600_000);
}
// Helper: pick a realistic inbound reply hour based on day offset
function replyHour(d: number): number {
  const opts = [10, 14, 17, 11, 19, 13, 16];
  return opts[d % opts.length];
}

function phone(suffix: string): string { return `+1555201${suffix}`; }

type Msg = {
  direction: 'inbound' | 'outbound';
  body: string;
  template_key?: string;
  sent_at: Date;
};

type TriggerFiring = {
  trigger_key: string;
  fired_at: Date;
};

type Event = {
  kind: string;
  payload: object;
  created_at: Date;
};

type Patient = {
  first_name: string;
  phone: string;
  phase: number;
  status: 'active' | 'flagged' | 'paused';
  enrolled_at: Date;
  phase_started_at: Date;
  last_inbound_at: Date | null;
  messages: Msg[];
  triggers?: TriggerFiring[];
  events?: Event[];
};

const PATIENTS: Patient[] = [

  // 1. JENNIFER - Ph 1, just getting started, replied this morning
  {
    first_name: 'Jennifer',
    phone: phone('0001'),
    phase: 1,
    status: 'active',
    enrolled_at: daysAgo(11),
    phase_started_at: daysAgo(10),
    last_inbound_at: hoursAgo(6),
    messages: [
      { direction: 'outbound', body: 'Hi Jennifer, welcome to your program. Reply YES to start.', template_key: 'phase0.welcome', sent_at: daysAgo(11, 9) },
      { direction: 'inbound', body: 'YES', sent_at: daysAgo(11, 10) },
      { direction: 'outbound', body: "Today's one thing: 30g protein at breakfast. Reply DONE when you eat it.", template_key: 'phase1.day1.morning', sent_at: daysAgo(10, 9) },
      { direction: 'inbound', body: 'done!', sent_at: daysAgo(10, 11) },
      { direction: 'outbound', body: "Day 3 check. How's the first dose feeling? Reply OK or ROUGH.", template_key: 'phase1.day3.checkin', sent_at: daysAgo(8, 9) },
      { direction: 'inbound', body: 'OK so far', sent_at: daysAgo(8, 14) },
      { direction: 'outbound', body: 'Reminder: keep water up. Aim 64oz today. Reply DONE.', template_key: 'phase1.day5.hydrate', sent_at: daysAgo(6, 9) },
      { direction: 'inbound', body: 'done', sent_at: hoursAgo(6) },
    ],
  },

  // 2. JAMES - Ph 0, enrolled 2 days ago, just replied
  {
    first_name: 'James',
    phone: phone('0002'),
    phase: 0,
    status: 'active',
    enrolled_at: daysAgo(2),
    phase_started_at: daysAgo(2),
    last_inbound_at: hoursAgo(2),
    messages: [
      { direction: 'outbound', body: 'Hi James, welcome to your program. Reply YES to start.', template_key: 'phase0.welcome', sent_at: daysAgo(2, 9) },
      { direction: 'inbound', body: 'YES, excited to start!', sent_at: hoursAgo(2) },
    ],
  },

  // 3. SARAH - Ph 2, 35 days in, consistent responder
  {
    first_name: 'Sarah',
    phone: phone('0003'),
    phase: 2,
    status: 'active',
    enrolled_at: daysAgo(35),
    phase_started_at: daysAgo(24),
    last_inbound_at: hoursAgo(18),
    messages: [
      { direction: 'outbound', body: "Week 2. Pick one protein-forward meal today. Reply DONE.", template_key: 'phase2.day1.habit', sent_at: daysAgo(24, 9) },
      { direction: 'inbound', body: 'done - chicken salad', sent_at: daysAgo(24, replyHour(24)) },
      { direction: 'outbound', body: "Quick log: what did you eat today that had protein? Reply in 5 words.", template_key: 'phase2.day4.log', sent_at: daysAgo(21, 9) },
      { direction: 'inbound', body: 'eggs turkey bacon greek yogurt', sent_at: daysAgo(21, replyHour(21)) },
      { direction: 'outbound', body: "You're 2 weeks in. Reply Y if protein is sticking, N if slipping.", template_key: 'phase2.day7.review', sent_at: daysAgo(17, 9) },
      { direction: 'inbound', body: 'Y - definitely sticking', sent_at: daysAgo(17, replyHour(17)) },
      { direction: 'outbound', body: "Scale can stall around now. Normal. Keep protein + water dialed. Reply OK.", template_key: 'phase3.day20.plateau', sent_at: daysAgo(10, 9) },
      { direction: 'inbound', body: 'ok will do', sent_at: hoursAgo(18) },
    ],
  },

  // 4. MARCUS - Ph 3 Risk Window, 70 days in, solid engagement
  {
    first_name: 'Marcus',
    phone: phone('0004'),
    phase: 3,
    status: 'active',
    enrolled_at: daysAgo(70),
    phase_started_at: daysAgo(40),
    last_inbound_at: daysAgo(1),
    messages: [
      { direction: 'outbound', body: "Add 10 mins of movement today - walk counts. Reply DONE.", template_key: 'phase3.day3.mov', sent_at: daysAgo(37, 9) },
      { direction: 'inbound', body: 'done - 20 min walk', sent_at: daysAgo(37, replyHour(37)) },
      { direction: 'outbound', body: "Streak check: how many days this week hit your protein goal? Reply 0-7.", template_key: 'phase3.day10.streak', sent_at: daysAgo(30, 9) },
      { direction: 'inbound', body: '6', sent_at: daysAgo(30, replyHour(30)) },
      { direction: 'outbound', body: "Scale can stall around now. Normal. Keep protein + water dialed. Reply OK.", template_key: 'phase3.day20.plateau', sent_at: daysAgo(20, 9) },
      { direction: 'inbound', body: 'yep on it', sent_at: daysAgo(20, replyHour(20)) },
      { direction: 'outbound', body: "Weekly check: protein still a habit? Reply Y or N.", template_key: 'phase5.weekly_checkin', sent_at: daysAgo(3, 9) },
      { direction: 'inbound', body: 'Y', sent_at: daysAgo(1, replyHour(1)) },
    ],
  },

  // 5. PRIYA - Ph 4 Taper, 100 days in, nearly at maintenance
  {
    first_name: 'Priya',
    phone: phone('0005'),
    phase: 4,
    status: 'active',
    enrolled_at: daysAgo(100),
    phase_started_at: daysAgo(25),
    last_inbound_at: daysAgo(1),
    messages: [
      { direction: 'outbound', body: "Moving to steady-state. Same rules, lighter cadence. Reply Y to confirm.", template_key: 'phase4.day5.taper', sent_at: daysAgo(25, 9) },
      { direction: 'inbound', body: 'Y ready', sent_at: daysAgo(25, replyHour(25)) },
      { direction: 'outbound', body: "Anchor habit check. Which is strongest: protein, water, or movement? Reply one.", template_key: 'phase4.day15.anchor', sent_at: daysAgo(10, 9) },
      { direction: 'inbound', body: 'protein', sent_at: daysAgo(10, replyHour(10)) },
      { direction: 'outbound', body: "Weekly check: protein still a habit? Reply Y or N.", template_key: 'phase5.weekly_checkin', sent_at: daysAgo(3, 9) },
      { direction: 'inbound', body: 'Y feeling great', sent_at: daysAgo(1, replyHour(1)) },
    ],
  },

  // 6. EMMA - Ph 5 Maintenance, 158 days - the long-tenure proof
  {
    first_name: 'Emma',
    phone: phone('0006'),
    phase: 5,
    status: 'active',
    enrolled_at: daysAgo(158),
    phase_started_at: daysAgo(28),
    last_inbound_at: hoursAgo(20),
    messages: [
      { direction: 'outbound', body: "Weekly check: protein still a habit? Reply Y or N.", template_key: 'phase5.weekly_checkin', sent_at: daysAgo(7, 9) },
      { direction: 'inbound', body: 'Y always', sent_at: daysAgo(7, replyHour(7)) },
      { direction: 'outbound', body: "How's this week on a 1-5 scale? Reply a number.", template_key: 'phase5.weekly_rate', sent_at: daysAgo(3, 9) },
      { direction: 'inbound', body: '5', sent_at: hoursAgo(20) },
    ],
  },

  // 7. MAYA - Ph 5 Maintenance, 144 days - another long-tenure patient
  {
    first_name: 'Maya',
    phone: phone('0007'),
    phase: 5,
    status: 'active',
    enrolled_at: daysAgo(144),
    phase_started_at: daysAgo(14),
    last_inbound_at: daysAgo(1),
    messages: [
      { direction: 'outbound', body: "Weekly check: protein still a habit? Reply Y or N.", template_key: 'phase5.weekly_checkin', sent_at: daysAgo(7, 9) },
      { direction: 'inbound', body: 'yes still going strong', sent_at: daysAgo(7, replyHour(7)) },
      { direction: 'outbound', body: "How's this week on a 1-5 scale? Reply a number.", template_key: 'phase5.weekly_rate', sent_at: daysAgo(3, 9) },
      { direction: 'inbound', body: '4', sent_at: daysAgo(1, replyHour(1)) },
    ],
  },

  // 8. CARLOS - RECOVERED this week. Went quiet, engine nudged, he replied. THE story.
  {
    first_name: 'Carlos',
    phone: phone('0008'),
    phase: 4,
    status: 'active',
    enrolled_at: daysAgo(93),
    phase_started_at: daysAgo(18),
    last_inbound_at: daysAgo(1),
    messages: [
      { direction: 'outbound', body: "Moving to steady-state. Same rules, lighter cadence. Reply Y to confirm.", template_key: 'phase4.day5.taper', sent_at: daysAgo(18, 9) },
      { direction: 'inbound', body: 'Y', sent_at: daysAgo(18, replyHour(18)) },
      { direction: 'outbound', body: "Haven't heard from you in 2 days. Everything ok? One word is enough.", template_key: 'trigger.no_response_48h', sent_at: daysAgo(7, 9) },
      { direction: 'inbound', body: 'sorry been traveling - back on it', sent_at: daysAgo(6, replyHour(6)) },
      { direction: 'outbound', body: "Anchor habit check. Which is strongest: protein, water, or movement? Reply one.", template_key: 'phase4.day15.anchor', sent_at: daysAgo(3, 9) },
      { direction: 'inbound', body: 'water', sent_at: daysAgo(1, replyHour(1)) },
    ],
    triggers: [
      { trigger_key: 'no_response_48h', fired_at: daysAgo(7, 9) },
    ],
    events: [
      { kind: 'patient_unflagged', payload: { reason: 'inbound_reply' }, created_at: daysAgo(6, 9) },
    ],
  },

  // 9. AALIYAH - RECOVERED this week. Engine caught her drift.
  {
    first_name: 'Aaliyah',
    phone: phone('0009'),
    phase: 2,
    status: 'active',
    enrolled_at: daysAgo(43),
    phase_started_at: daysAgo(32),
    last_inbound_at: daysAgo(2),
    messages: [
      { direction: 'outbound', body: "Week 2. Pick one protein-forward meal today. Reply DONE.", template_key: 'phase2.day1.habit', sent_at: daysAgo(32, 9) },
      { direction: 'inbound', body: 'done', sent_at: daysAgo(32, replyHour(32)) },
      { direction: 'outbound', body: "Quick log: what did you eat today that had protein? Reply in 5 words.", template_key: 'phase2.day4.log', sent_at: daysAgo(28, 9) },
      { direction: 'inbound', body: 'chicken rice beans', sent_at: daysAgo(28, replyHour(28)) },
      { direction: 'outbound', body: "Haven't heard from you in 2 days. Everything ok? One word is enough.", template_key: 'trigger.no_response_48h', sent_at: daysAgo(5, 9) },
      { direction: 'inbound', body: 'ok back now', sent_at: daysAgo(4, replyHour(4)) },
      { direction: 'outbound', body: "You're 2 weeks in. Reply Y if protein is sticking, N if slipping.", template_key: 'phase2.day7.review', sent_at: daysAgo(4, 9) },
      { direction: 'inbound', body: 'Y', sent_at: daysAgo(2, replyHour(2)) },
    ],
    triggers: [
      { trigger_key: 'no_response_48h', fired_at: daysAgo(5, 9) },
    ],
    events: [
      { kind: 'patient_unflagged', payload: { reason: 'inbound_reply' }, created_at: daysAgo(4, 9) },
    ],
  },

  // 10. NOOR - RECOVERED this week. 3 days ago after engine nudge 5 days ago.
  {
    first_name: 'Noor',
    phone: phone('0010'),
    phase: 3,
    status: 'active',
    enrolled_at: daysAgo(79),
    phase_started_at: daysAgo(49),
    last_inbound_at: daysAgo(3),
    messages: [
      { direction: 'outbound', body: "Add 10 mins of movement today - walk counts. Reply DONE.", template_key: 'phase3.day3.mov', sent_at: daysAgo(46, 9) },
      { direction: 'inbound', body: 'done', sent_at: daysAgo(46, replyHour(46)) },
      { direction: 'outbound', body: "Streak check: how many days this week hit your protein goal? Reply 0-7.", template_key: 'phase3.day10.streak', sent_at: daysAgo(36, 9) },
      { direction: 'inbound', body: '5', sent_at: daysAgo(36, replyHour(36)) },
      { direction: 'outbound', body: "Haven't heard from you in 2 days. Everything ok? One word is enough.", template_key: 'trigger.no_response_48h', sent_at: daysAgo(6, 9) },
      { direction: 'inbound', body: 'im good just busy', sent_at: daysAgo(5, replyHour(5)) },
      { direction: 'outbound', body: "Scale can stall around now. Normal. Keep protein + water dialed. Reply OK.", template_key: 'phase3.day20.plateau', sent_at: daysAgo(4, 9) },
      { direction: 'inbound', body: 'ok noted', sent_at: daysAgo(3, replyHour(3)) },
    ],
    triggers: [
      { trigger_key: 'no_response_48h', fired_at: daysAgo(6, 9) },
    ],
    events: [
      { kind: 'patient_unflagged', payload: { reason: 'inbound_reply' }, created_at: daysAgo(5, 9) },
    ],
  },

  // 11. SOPHIA - Ph 2, light engagement, replied 2 days ago - healthy
  {
    first_name: 'Sophia',
    phone: phone('0011'),
    phase: 2,
    status: 'active',
    enrolled_at: daysAgo(30),
    phase_started_at: daysAgo(19),
    last_inbound_at: daysAgo(2),
    messages: [
      { direction: 'outbound', body: "Week 2. Pick one protein-forward meal today. Reply DONE.", template_key: 'phase2.day1.habit', sent_at: daysAgo(19, 9) },
      { direction: 'inbound', body: 'done', sent_at: daysAgo(19, replyHour(19)) },
      { direction: 'outbound', body: "Quick log: what did you eat today that had protein? Reply in 5 words.", template_key: 'phase2.day4.log', sent_at: daysAgo(15, 9) },
      { direction: 'inbound', body: 'chicken and eggs', sent_at: daysAgo(15, replyHour(15)) },
      { direction: 'outbound', body: "You're 2 weeks in. Reply Y if protein is sticking, N if slipping.", template_key: 'phase2.day7.review', sent_at: daysAgo(12, 9) },
      { direction: 'inbound', body: 'mostly Y', sent_at: daysAgo(12, replyHour(12)) },
      { direction: 'outbound', body: "Scale can stall around now. Normal. Keep protein + water dialed. Reply OK.", template_key: 'phase3.day20.plateau', sent_at: daysAgo(4, 9) },
      { direction: 'inbound', body: 'ok', sent_at: daysAgo(2, replyHour(2)) },
    ],
  },

  // 12. DAVID - Ph 3, DRIFTING - 4 days quiet, engine is about to nudge
  {
    first_name: 'David',
    phone: phone('0012'),
    phase: 3,
    status: 'active',
    enrolled_at: daysAgo(74),
    phase_started_at: daysAgo(44),
    last_inbound_at: daysAgo(4),
    messages: [
      { direction: 'outbound', body: "Add 10 mins of movement today - walk counts. Reply DONE.", template_key: 'phase3.day3.mov', sent_at: daysAgo(41, 9) },
      { direction: 'inbound', body: 'done 15 min walk', sent_at: daysAgo(41, replyHour(41)) },
      { direction: 'outbound', body: "Streak check: how many days this week hit your protein goal? Reply 0-7.", template_key: 'phase3.day10.streak', sent_at: daysAgo(34, 9) },
      { direction: 'inbound', body: '5', sent_at: daysAgo(34, replyHour(34)) },
      { direction: 'outbound', body: "Scale can stall around now. Normal. Keep protein + water dialed. Reply OK.", template_key: 'phase3.day20.plateau', sent_at: daysAgo(24, 9) },
      { direction: 'inbound', body: 'ok', sent_at: daysAgo(24, replyHour(24)) },
      { direction: 'outbound', body: "Weekly check: protein still a habit? Reply Y or N.", template_key: 'phase5.weekly_checkin', sent_at: daysAgo(6, 9) },
      { direction: 'inbound', body: 'Y', sent_at: daysAgo(4, replyHour(4)) },
      { direction: 'outbound', body: "How's this week on a 1-5 scale? Reply a number.", template_key: 'phase5.weekly_rate', sent_at: daysAgo(2, 9) },
      // No reply - drifting
    ],
  },

  // 13. FATIMA - Ph 3, DRIFTING - 4 days quiet, plateau window
  {
    first_name: 'Fatima',
    phone: phone('0013'),
    phase: 3,
    status: 'active',
    enrolled_at: daysAgo(81),
    phase_started_at: daysAgo(51),
    last_inbound_at: daysAgo(4),
    messages: [
      { direction: 'outbound', body: "Add 10 mins of movement today - walk counts. Reply DONE.", template_key: 'phase3.day3.mov', sent_at: daysAgo(48, 9) },
      { direction: 'inbound', body: 'done', sent_at: daysAgo(48, replyHour(48)) },
      { direction: 'outbound', body: "Scale can stall around now. Normal. Keep protein + water dialed. Reply OK.", template_key: 'phase3.day20.plateau', sent_at: daysAgo(31, 9) },
      { direction: 'inbound', body: 'this is hard', sent_at: daysAgo(31, replyHour(31)) },
      { direction: 'outbound', body: "Weekly check: protein still a habit? Reply Y or N.", template_key: 'phase5.weekly_checkin', sent_at: daysAgo(7, 9) },
      { direction: 'inbound', body: 'mostly', sent_at: daysAgo(4, replyHour(4)) },
      { direction: 'outbound', body: "How's this week on a 1-5 scale? Reply a number.", template_key: 'phase5.weekly_rate', sent_at: daysAgo(2, 9) },
      // No reply - drifting
    ],
  },

  // 14. ROBERT - Ph 4, FLAGGED - 6 days no reply, needs a human call (the 1 red)
  {
    first_name: 'Robert',
    phone: phone('0014'),
    phase: 4,
    status: 'flagged',
    enrolled_at: daysAgo(90),
    phase_started_at: daysAgo(15),
    last_inbound_at: daysAgo(7),
    messages: [
      { direction: 'outbound', body: "Moving to steady-state. Same rules, lighter cadence. Reply Y to confirm.", template_key: 'phase4.day5.taper', sent_at: daysAgo(15, 9) },
      { direction: 'inbound', body: 'Y', sent_at: daysAgo(15, replyHour(15)) },
      { direction: 'outbound', body: "Anchor habit check. Which is strongest: protein, water, or movement? Reply one.", template_key: 'phase4.day15.anchor', sent_at: daysAgo(9, 9) },
      { direction: 'inbound', body: 'protein', sent_at: daysAgo(7, replyHour(7)) },
      { direction: 'outbound', body: "Haven't heard from you in 2 days. Everything ok? One word is enough.", template_key: 'trigger.no_response_48h', sent_at: daysAgo(4, 9) },
      { direction: 'outbound', body: "5 days quiet. We want to keep you on plan. Reply anything and we'll pick up where you left off.", template_key: 'trigger.no_response_5d', sent_at: daysAgo(2, 9) },
    ],
    triggers: [
      { trigger_key: 'no_response_48h', fired_at: daysAgo(4, 9) },
      { trigger_key: 'no_response_5d', fired_at: daysAgo(2, 9) },
    ],
    events: [
      { kind: 'patient_flagged', payload: { reason: 'no_response_5d' }, created_at: daysAgo(2, 9) },
    ],
  },

  // 15. TYLER - Ph 1, PAUSED - traveling, asked to pause
  {
    first_name: 'Tyler',
    phone: phone('0015'),
    phase: 1,
    status: 'paused',
    enrolled_at: daysAgo(24),
    phase_started_at: daysAgo(23),
    last_inbound_at: daysAgo(10),
    messages: [
      { direction: 'outbound', body: "Hi Tyler, welcome to your program. Reply YES to start.", template_key: 'phase0.welcome', sent_at: daysAgo(24, 9) },
      { direction: 'inbound', body: 'YES', sent_at: daysAgo(24, replyHour(24)) },
      { direction: 'outbound', body: "Today's one thing: 30g protein at breakfast. Reply DONE when you eat it.", template_key: 'phase1.day1.morning', sent_at: daysAgo(23, 9) },
      { direction: 'inbound', body: 'done', sent_at: daysAgo(23, replyHour(23)) },
      { direction: 'outbound', body: "Day 3 check. How's the first dose feeling? Reply OK or ROUGH.", template_key: 'phase1.day3.checkin', sent_at: daysAgo(21, 9) },
      { direction: 'inbound', body: 'traveling this week - can we pause?', sent_at: daysAgo(10, replyHour(10)) },
    ],
  },
];

// --- Main reseed ---------------------------------------------------------------

export async function reseedDemo(opts: ReseedOptions): Promise<ReseedResult> {
  const { clinicId } = opts;

  // Wipe existing patients (cascades to messages, events, trigger_firings)
  await query(`delete from patients where clinic_id = $1`, [clinicId]);

  let totalMessages = 0;
  const bucketCounts: Record<string, number> = {
    healthy: 0, recovered: 0, drifting: 0, flagged: 0, paused: 0, new: 0,
  };

  for (const p of PATIENTS) {
    // Insert patient
    const row = await queryOne<{ id: string }>(
      `insert into patients
         (clinic_id, phone, first_name, enrolled_at, current_phase,
          phase_started_at, status, last_inbound_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning id`,
      [
        clinicId, p.phone, p.first_name,
        p.enrolled_at, p.phase, p.phase_started_at,
        p.status, p.last_inbound_at,
      ]
    );
    if (!row) continue;
    const pid = row.id;

    // Enrollment event
    await query(
      `insert into events (patient_id, kind, payload, created_at)
       values ($1, 'enrolled', $2, $3)`,
      [pid, JSON.stringify({ source: 'demo' }), p.enrolled_at]
    );

    // Messages
    for (const m of p.messages) {
      await query(
        `insert into messages
           (patient_id, direction, template_key, body, sent_at,
            twilio_sid, status, created_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          pid, m.direction, m.template_key ?? null, m.body,
          m.sent_at,
          m.direction === 'outbound' ? `DEMO_${pid.slice(0, 8)}_${totalMessages}` : null,
          m.direction === 'outbound' ? 'sent' : 'received',
          m.sent_at,
        ]
      );
      totalMessages++;
    }

    // Trigger firings
    for (const tf of p.triggers ?? []) {
      await query(
        `insert into trigger_firings (patient_id, trigger_key, dedupe_key, fired_at)
         values ($1, $2, $3, $4)
         on conflict do nothing`,
        [
          pid, tf.trigger_key,
          `${tf.trigger_key}:${tf.fired_at.toISOString().slice(0, 10)}`,
          tf.fired_at,
        ]
      );
    }

    // Events
    for (const ev of p.events ?? []) {
      await query(
        `insert into events (patient_id, kind, payload, created_at)
         values ($1, $2, $3, $4)`,
        [pid, ev.kind, JSON.stringify(ev.payload), ev.created_at]
      );
    }

    // Phase advancement events
    for (let ph = 1; ph <= p.phase; ph++) {
      const advanceAt = new Date(
        p.enrolled_at.getTime() +
          (ph === 1 ? 1 : ph === 2 ? 7 : ph === 3 ? 21 : ph === 4 ? 51 : 81) * 86_400_000
      );
      if (advanceAt.getTime() < Date.now()) {
        await query(
          `insert into events (patient_id, kind, payload, created_at)
           values ($1, 'phase_advanced', $2, $3)`,
          [pid, JSON.stringify({ to: ph }), advanceAt]
        );
      }
    }

    // Bucket count
    if (p.status === 'flagged') bucketCounts.flagged++;
    else if (p.status === 'paused') bucketCounts.paused++;
    else if ((p.triggers ?? []).length > 0) bucketCounts.recovered++;
    else if (!p.last_inbound_at || Date.now() - p.last_inbound_at.getTime() > 3 * 86_400_000) bucketCounts.drifting++;
    else if (p.phase === 0) bucketCounts.new++;
    else bucketCounts.healthy++;
  }

  return {
    clinicId,
    totalPatients: PATIENTS.length,
    totalMessages,
    bucketCounts,
  };
}
