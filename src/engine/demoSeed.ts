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
  // Store as UTC so the fmtTime(tz=America/New_York) display lands at the right local hour.
  // EDT = UTC-4, so 9am ET = 13:00 UTC. We accept the ET hour and add 4.
  dt.setUTCHours(h + 4, 0, 0, 0);
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

// ── Quest demo data ─────────────────────────────────────────────────────────
//
// 5 adolescent patients (ages 13-17) across two squads.
// Story arc visible on /admin/rewards + /patients:
//   - Jordan: Beast mode, 21d streak, power week, $5 reward DUE (520 monthly XP)
//   - Maya:   14d streak, power week, boss challenge in progress, near $5
//   - Devon:  New, guardian track, first boss challenge pending opt-in
//   - Aisha:  Comeback story — boss failed last week, replied to recovery prompt
//   - Carlos: Guardian track, first boss completed, building streak
//
// Consent routing (matches quest-consent.ts state table):
//   TX 14yo -> minor_parent (TX requires 16+ for self-consent)
//   CA 16yo -> minor_self   (CA allows 13+)
//   FL 13yo -> minor_parent (FL requires 16+)
//   WA 17yo -> minor_self   (WA allows 13+)
//   NY 15yo -> minor_parent (NY requires 16+)

type QuestMsg = {
  direction: 'inbound' | 'outbound';
  body: string;
  template_key?: string;
  sent_at: Date;
};

type BossRow = {
  week_start: string;
  challenge_text: string;
  target_checkins: number;
  xp_stake: number;
  status: 'pending_opt_in' | 'accepted' | 'declined' | 'completed' | 'failed';
  opted_in_at: Date | null;
  completed_at: Date | null;
  checkins_at_start: number;
};

type LeaderboardRow = {
  week_start: string;
  xp_this_week: number;
  xp_prev_week: number;
  streak: number;
  rank_overall: number;
  rank_improved: number;
  rank_streak: number;
  comeback_flag: boolean;
};

type QuestPatient = {
  first_name: string;
  phone: string;
  phase: number;
  status: 'active' | 'flagged' | 'paused';
  enrolled_at: Date;
  phase_started_at: Date;
  last_inbound_at: Date | null;
  // Quest identity
  date_of_birth: string;      // YYYY-MM-DD
  state: string;
  consent_type: 'minor_self' | 'minor_parent';
  guardian_name: string | null;
  guardian_phone: string | null;
  quest_handle: string;
  quest_xp: number;
  quest_level: number;
  quest_streak: number;
  quest_monthly_xp: number;
  quest_reward_category: 'gamer' | 'wellness' | 'reader';
  quest_intensity: 'chill' | 'standard' | 'beast';
  quest_power_week: boolean;
  quest_checkin_at: Date | null;
  squad: 'alpha' | 'beta';
  messages: QuestMsg[];
  boss: BossRow | null;
  leaderboard: LeaderboardRow[];
};

function qphone(suffix: string): string { return `+1555209${suffix}`; }

// Current Monday (for boss challenge / leaderboard week_start)
function currentMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}
function prevMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -13 : 1 - day - 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}
// DOB for a given age (birthday earlier this year)
function dobForAge(age: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - age, 2, 15); // March 15 birthday
  return d.toISOString().slice(0, 10);
}

const QUEST_PATIENTS: QuestPatient[] = [

  // 1. JORDAN — 14yo TX, Beast mode, 21d streak, power week, $5 reward DUE
  {
    first_name: 'Jordan',
    phone: qphone('0001'),
    phase: 2,
    status: 'active',
    enrolled_at: daysAgo(45),
    phase_started_at: daysAgo(34),
    last_inbound_at: hoursAgo(5),
    date_of_birth: dobForAge(14),
    state: 'TX',
    consent_type: 'minor_parent',
    guardian_name: 'Sarah Thompson',
    guardian_phone: qphone('G001'),
    quest_handle: '@quickhawk',
    quest_xp: 620,
    quest_level: 3,
    quest_streak: 21,
    quest_monthly_xp: 520,
    quest_reward_category: 'gamer',
    quest_intensity: 'beast',
    quest_power_week: true,
    quest_checkin_at: hoursAgo(5),
    squad: 'alpha',
    messages: [
      { direction: 'outbound', body: "QUEST unlocked. You're in, Jordan. Handle: @quickhawk. First check-in drops tomorrow at 9am. Get ready.", template_key: 'quest.welcome', sent_at: daysAgo(45, 9) },
      { direction: 'inbound', body: "let's gooo", sent_at: daysAgo(45, 10) },
      { direction: 'outbound', body: "Day 1 check-in. Beast Mode: 30 min movement + 80g protein today. Reply DONE when both are done.", template_key: 'quest.checkin.beast', sent_at: daysAgo(44, 9) },
      { direction: 'inbound', body: 'DONE', sent_at: daysAgo(44, replyHour(44)) },
      { direction: 'outbound', body: "+10 XP. Streak: 3. @quickhawk is on the board.", template_key: 'quest.xp_confirm', sent_at: daysAgo(44, replyHour(44) + 1) },
      { direction: 'outbound', body: "5-day streak. +15 bonus XP. Total: 65 XP. Contender level unlocks at 100.", template_key: 'quest.streak_bonus_5', sent_at: daysAgo(40, 9) },
      { direction: 'inbound', body: 'how much more to level up', sent_at: daysAgo(40, 11) },
      { direction: 'outbound', body: "35 more XP to Contender. You're earning ~20/day in Beast Mode. 2 more days.", template_key: 'quest.xp_info', sent_at: daysAgo(40, 11) },
      { direction: 'outbound', body: "LEVEL UP. @quickhawk is now Contender. 100 XP total. New boss challenge unlocks Monday.", template_key: 'quest.level_up', sent_at: daysAgo(38, 9) },
      { direction: 'inbound', body: "YOOO lets go", sent_at: daysAgo(38, replyHour(38)) },
      { direction: 'outbound', body: "Boss challenge this week: 5 check-ins before Sunday. 30 XP on the line. Reply YES to accept.", template_key: 'quest.boss_challenge', sent_at: daysAgo(14, 9) },
      { direction: 'inbound', body: 'YES', sent_at: daysAgo(14, replyHour(14)) },
      { direction: 'outbound', body: "Challenge accepted. 5 check-ins by Sunday. You're at 0/5. First one counts when you reply DONE today.", template_key: 'quest.boss_accepted', sent_at: daysAgo(14, replyHour(14) + 1) },
      { direction: 'outbound', body: "BOSS DEFEATED. 5/5 check-ins. +30 XP. @quickhawk: 430 total. Athlete level at 250 - you passed it.", template_key: 'quest.boss_completed', sent_at: daysAgo(7, 9) },
      { direction: 'inbound', body: 'i hit athlete already??', sent_at: daysAgo(7, 11) },
      { direction: 'outbound', body: "LEVEL UP. @quickhawk is now Athlete. 250 XP threshold crossed. Champion unlocks at 500.", template_key: 'quest.level_up', sent_at: daysAgo(7, 11) },
      { direction: 'outbound', body: "POWER WEEK activated. You hit 21 days straight. All XP doubled this week. Go.", template_key: 'quest.power_week_start', sent_at: daysAgo(0, 9) },
      { direction: 'outbound', body: "Beast Mode check-in. 30 min movement + 80g protein. Power Week: 2x XP. Reply DONE.", template_key: 'quest.checkin.beast', sent_at: hoursAgo(6) },
      { direction: 'inbound', body: 'DONE', sent_at: hoursAgo(5) },
      { direction: 'outbound', body: "+20 XP (Power Week 2x). @quickhawk: 620 total. $5 reward threshold crossed.", template_key: 'quest.xp_confirm', sent_at: hoursAgo(5) },
    ],
    boss: {
      week_start: currentMonday(),
      challenge_text: 'New boss unlocks at 5 check-ins. 30 XP on the line. Reply YES to accept.',
      target_checkins: 5,
      xp_stake: 30,
      status: 'accepted',
      opted_in_at: daysAgo(0, 10),
      completed_at: null,
      checkins_at_start: 0,
    },
    leaderboard: [
      { week_start: prevMonday(), xp_this_week: 190, xp_prev_week: 120, streak: 14, rank_overall: 1, rank_improved: 1, rank_streak: 1, comeback_flag: false },
      { week_start: currentMonday(), xp_this_week: 40, xp_prev_week: 190, streak: 21, rank_overall: 1, rank_improved: 2, rank_streak: 1, comeback_flag: false },
    ],
  },

  // 2. MAYA — 16yo CA, Standard, 14d streak, power week, boss in progress
  {
    first_name: 'Maya',
    phone: qphone('0002'),
    phase: 3,
    status: 'active',
    enrolled_at: daysAgo(90),
    phase_started_at: daysAgo(55),
    last_inbound_at: daysAgo(1),
    date_of_birth: dobForAge(16),
    state: 'CA',
    consent_type: 'minor_self',
    guardian_name: null,
    guardian_phone: null,
    quest_handle: '@solarpeak',
    quest_xp: 380,
    quest_level: 3,
    quest_streak: 14,
    quest_monthly_xp: 380,
    quest_reward_category: 'wellness',
    quest_intensity: 'standard',
    quest_power_week: true,
    quest_checkin_at: daysAgo(1),
    squad: 'alpha',
    messages: [
      { direction: 'outbound', body: "QUEST unlocked. Handle: @solarpeak. Standard Mode: 1 check-in per day. Reply READY.", template_key: 'quest.welcome', sent_at: daysAgo(90, 9) },
      { direction: 'inbound', body: 'READY', sent_at: daysAgo(90, replyHour(90)) },
      { direction: 'outbound', body: "10-day streak. You're consistent. +25 bonus XP. Total: 180 XP. Contender level hit.", template_key: 'quest.streak_bonus_10', sent_at: daysAgo(24, 9) },
      { direction: 'outbound', body: "LEVEL UP. @solarpeak is now Contender. Keep the streak alive.", template_key: 'quest.level_up', sent_at: daysAgo(24, 9) },
      { direction: 'inbound', body: 'thanks! what is next level', sent_at: daysAgo(24, 11) },
      { direction: 'outbound', body: "Athlete unlocks at 250 XP. You're at 180. 7 more days at this pace.", template_key: 'quest.xp_info', sent_at: daysAgo(24, 11) },
      { direction: 'outbound', body: "LEVEL UP. @solarpeak is now Athlete. 250 XP crossed. Warrior path continues.", template_key: 'quest.level_up', sent_at: daysAgo(17, 9) },
      { direction: 'outbound', body: "Boss challenge: 5 check-ins this week. 30 XP stake. Reply YES to accept.", template_key: 'quest.boss_challenge', sent_at: daysAgo(0, 9) },
      { direction: 'inbound', body: 'YES im in', sent_at: daysAgo(0, replyHour(0)) },
      { direction: 'outbound', body: "Challenge locked in. 5 check-ins by Sunday. 0/5 right now. Reply DONE each day to log.", template_key: 'quest.boss_accepted', sent_at: daysAgo(0, replyHour(0) + 1) },
      { direction: 'outbound', body: "POWER WEEK. 14-day streak = 2x XP all week. @solarpeak. Go get it.", template_key: 'quest.power_week_start', sent_at: daysAgo(0, 9) },
      { direction: 'outbound', body: "Standard check-in. Protein goal + one health win today. Reply DONE.", template_key: 'quest.checkin.standard', sent_at: daysAgo(1, 9) },
      { direction: 'inbound', body: 'done - protein shake + 45 min walk', sent_at: daysAgo(1, replyHour(1)) },
      { direction: 'outbound', body: "+10 XP (Power Week 2x = +20). @solarpeak: 380 total.", template_key: 'quest.xp_confirm', sent_at: daysAgo(1, replyHour(1) + 1) },
    ],
    boss: {
      week_start: currentMonday(),
      challenge_text: 'Boss challenge: 5 check-ins before Sunday. 30 XP on the line. Reply YES to accept.',
      target_checkins: 5,
      xp_stake: 30,
      status: 'accepted',
      opted_in_at: daysAgo(0, 10),
      completed_at: null,
      checkins_at_start: 0,
    },
    leaderboard: [
      { week_start: prevMonday(), xp_this_week: 80, xp_prev_week: 70, streak: 7, rank_overall: 2, rank_improved: 3, rank_streak: 2, comeback_flag: false },
      { week_start: currentMonday(), xp_this_week: 20, xp_prev_week: 80, streak: 14, rank_overall: 2, rank_improved: 4, rank_streak: 2, comeback_flag: false },
    ],
  },

  // 3. DEVON — 13yo FL, Chill, new, guardian track, boss pending opt-in
  {
    first_name: 'Devon',
    phone: qphone('0003'),
    phase: 1,
    status: 'active',
    enrolled_at: daysAgo(12),
    phase_started_at: daysAgo(11),
    last_inbound_at: daysAgo(1),
    date_of_birth: dobForAge(13),
    state: 'FL',
    consent_type: 'minor_parent',
    guardian_name: 'Marcus Williams',
    guardian_phone: qphone('G002'),
    quest_handle: '@neonwolf',
    quest_xp: 85,
    quest_level: 1,
    quest_streak: 5,
    quest_monthly_xp: 85,
    quest_reward_category: 'gamer',
    quest_intensity: 'chill',
    quest_power_week: false,
    quest_checkin_at: daysAgo(1),
    squad: 'beta',
    messages: [
      { direction: 'outbound', body: "You're in, Devon. Handle: @neonwolf. Chill Mode: one small win per day. Reply YES to start.", template_key: 'quest.welcome', sent_at: daysAgo(12, 9) },
      { direction: 'inbound', body: 'yes', sent_at: daysAgo(12, replyHour(12)) },
      { direction: 'outbound', body: "Guardian update: Devon started the Quest program today. Reply STOP to pause updates.", template_key: 'quest.guardian_welcome', sent_at: daysAgo(12, 9) },
      { direction: 'outbound', body: "Chill Mode check-in. One win today: water, protein, or a walk. Reply DONE.", template_key: 'quest.checkin.chill', sent_at: daysAgo(11, 9) },
      { direction: 'inbound', body: 'done i drank water all day', sent_at: daysAgo(11, replyHour(11)) },
      { direction: 'outbound', body: "+10 XP. @neonwolf: 10 total. Keep it rolling.", template_key: 'quest.xp_confirm', sent_at: daysAgo(11, replyHour(11) + 1) },
      { direction: 'outbound', body: "Chill Mode check-in. Same deal - one win. Reply DONE.", template_key: 'quest.checkin.chill', sent_at: daysAgo(10, 9) },
      { direction: 'inbound', body: 'done - protein bar', sent_at: daysAgo(10, replyHour(10)) },
      { direction: 'outbound', body: "5-day streak. +15 bonus XP. @neonwolf: 75 total. You're building something.", template_key: 'quest.streak_bonus_5', sent_at: daysAgo(7, 9) },
      { direction: 'outbound', body: "Guardian update: Devon hit a 5-day streak this week. Consistent effort.", template_key: 'quest.guardian_update', sent_at: daysAgo(7, 9) },
      { direction: 'outbound', body: "First Boss Challenge unlocked. Task: 3 check-ins this week. 20 XP on the line. Reply YES to accept.", template_key: 'quest.boss_challenge', sent_at: daysAgo(0, 9) },
      { direction: 'outbound', body: "Chill Mode check-in. One win today. Reply DONE.", template_key: 'quest.checkin.chill', sent_at: daysAgo(1, 9) },
      { direction: 'inbound', body: 'done walked to school', sent_at: daysAgo(1, replyHour(1)) },
      { direction: 'outbound', body: "+10 XP. @neonwolf: 85 total. Boss Challenge is waiting - reply YES to accept.", template_key: 'quest.xp_confirm', sent_at: daysAgo(1, replyHour(1) + 1) },
    ],
    boss: {
      week_start: currentMonday(),
      challenge_text: 'First Boss Challenge: 3 check-ins this week. 20 XP. Reply YES to accept.',
      target_checkins: 3,
      xp_stake: 20,
      status: 'pending_opt_in',
      opted_in_at: null,
      completed_at: null,
      checkins_at_start: 0,
    },
    leaderboard: [
      { week_start: currentMonday(), xp_this_week: 10, xp_prev_week: 0, streak: 5, rank_overall: 5, rank_improved: 5, rank_streak: 4, comeback_flag: false },
    ],
  },

  // 4. AISHA — 17yo WA, Standard, comeback story (boss failed, replied to recovery)
  {
    first_name: 'Aisha',
    phone: qphone('0004'),
    phase: 2,
    status: 'active',
    enrolled_at: daysAgo(60),
    phase_started_at: daysAgo(45),
    last_inbound_at: daysAgo(1),
    date_of_birth: dobForAge(17),
    state: 'WA',
    consent_type: 'minor_self',
    guardian_name: null,
    guardian_phone: null,
    quest_handle: '@ironrise',
    quest_xp: 290,
    quest_level: 3,
    quest_streak: 3,
    quest_monthly_xp: 290,
    quest_reward_category: 'reader',
    quest_intensity: 'standard',
    quest_power_week: false,
    quest_checkin_at: daysAgo(1),
    squad: 'beta',
    messages: [
      { direction: 'outbound', body: "QUEST unlocked. Handle: @ironrise. Standard Mode. Reply READY.", template_key: 'quest.welcome', sent_at: daysAgo(60, 9) },
      { direction: 'inbound', body: 'ready', sent_at: daysAgo(60, replyHour(60)) },
      { direction: 'outbound', body: "10-day streak. +25 bonus XP. @ironrise: 155 XP. Contender tier crossed.", template_key: 'quest.streak_bonus_10', sent_at: daysAgo(32, 9) },
      { direction: 'outbound', body: "LEVEL UP. @ironrise is Contender. New challenges coming.", template_key: 'quest.level_up', sent_at: daysAgo(32, 9) },
      { direction: 'outbound', body: "Boss challenge: 5 check-ins before Sunday. 30 XP stake. Reply YES.", template_key: 'quest.boss_challenge', sent_at: daysAgo(14, 9) },
      { direction: 'inbound', body: 'YES', sent_at: daysAgo(14, replyHour(14)) },
      { direction: 'outbound', body: "LEVEL UP. @ironrise hit Athlete - 250 XP crossed. Keep going.", template_key: 'quest.level_up', sent_at: daysAgo(11, 9) },
      { direction: 'outbound', body: "Boss challenge: 4/5 check-ins. One more to complete before Sunday midnight.", template_key: 'quest.boss_reminder', sent_at: daysAgo(8, 9) },
      // missed the last check-in
      { direction: 'outbound', body: "Boss missed. 4/5. No XP penalty but the streak paused. New challenge resets Monday.", template_key: 'quest.boss_failed', sent_at: daysAgo(7, 9) },
      { direction: 'outbound', body: "Comeback time. Reply DONE for today's check-in. +20 XP comeback bonus.", template_key: 'quest.comeback', sent_at: daysAgo(4, 9) },
      { direction: 'inbound', body: 'done. sorry i got busy last week', sent_at: daysAgo(4, replyHour(4)) },
      { direction: 'outbound', body: "+20 XP comeback bonus. @ironrise: 290 total. Streak reset to 1 - build it back.", template_key: 'quest.xp_confirm', sent_at: daysAgo(4, replyHour(4) + 1) },
      { direction: 'outbound', body: "Standard check-in. Protein goal today. Reply DONE.", template_key: 'quest.checkin.standard', sent_at: daysAgo(1, 9) },
      { direction: 'inbound', body: 'done', sent_at: daysAgo(1, replyHour(1)) },
      { direction: 'outbound', body: "+10 XP. Streak: 3. @ironrise: 290 total.", template_key: 'quest.xp_confirm', sent_at: daysAgo(1, replyHour(1) + 1) },
    ],
    boss: {
      week_start: currentMonday(),
      challenge_text: 'Comeback challenge: 4 check-ins this week. 25 XP. Reply YES.',
      target_checkins: 4,
      xp_stake: 25,
      status: 'accepted',
      opted_in_at: daysAgo(0, 9),
      completed_at: null,
      checkins_at_start: 0,
    },
    leaderboard: [
      { week_start: prevMonday(), xp_this_week: 20, xp_prev_week: 100, streak: 3, rank_overall: 3, rank_improved: 2, rank_streak: 5, comeback_flag: true },
      { week_start: currentMonday(), xp_this_week: 10, xp_prev_week: 20, streak: 3, rank_overall: 3, rank_improved: 2, rank_streak: 5, comeback_flag: true },
    ],
  },

  // 5. CARLOS — 15yo NY, Standard, guardian track, first boss completed
  {
    first_name: 'Carlos',
    phone: qphone('0005'),
    phase: 1,
    status: 'active',
    enrolled_at: daysAgo(21),
    phase_started_at: daysAgo(20),
    last_inbound_at: daysAgo(2),
    date_of_birth: dobForAge(15),
    state: 'NY',
    consent_type: 'minor_parent',
    guardian_name: 'Rosa Martinez',
    guardian_phone: qphone('G003'),
    quest_handle: '@boldtrack',
    quest_xp: 130,
    quest_level: 2,
    quest_streak: 7,
    quest_monthly_xp: 130,
    quest_reward_category: 'gamer',
    quest_intensity: 'standard',
    quest_power_week: false,
    quest_checkin_at: daysAgo(2),
    squad: 'alpha',
    messages: [
      { direction: 'outbound', body: "You're in, Carlos. Handle: @boldtrack. Standard Mode. Reply YES to begin.", template_key: 'quest.welcome', sent_at: daysAgo(21, 9) },
      { direction: 'inbound', body: 'YES', sent_at: daysAgo(21, replyHour(21)) },
      { direction: 'outbound', body: "Guardian update: Carlos joined the Quest program today. We'll keep you posted.", template_key: 'quest.guardian_welcome', sent_at: daysAgo(21, 9) },
      { direction: 'outbound', body: "Day 1 check-in. Protein goal + one health win. Reply DONE.", template_key: 'quest.checkin.standard', sent_at: daysAgo(20, 9) },
      { direction: 'inbound', body: 'done', sent_at: daysAgo(20, replyHour(20)) },
      { direction: 'outbound', body: "+10 XP. @boldtrack: 10 total. 90 to go until Contender.", template_key: 'quest.xp_confirm', sent_at: daysAgo(20, replyHour(20) + 1) },
      { direction: 'outbound', body: "LEVEL UP. @boldtrack is now Contender. 100 XP crossed. Boss challenge unlocks Monday.", template_key: 'quest.level_up', sent_at: daysAgo(11, 9) },
      { direction: 'inbound', body: 'what is boss challenge', sent_at: daysAgo(11, 11) },
      { direction: 'outbound', body: "Weekly mission. 5 check-ins before Sunday = 30 XP. High stakes, high reward. Starts Monday.", template_key: 'quest.boss_explain', sent_at: daysAgo(11, 11) },
      { direction: 'outbound', body: "Boss challenge: 5 check-ins this week. 30 XP stake. Reply YES to accept.", template_key: 'quest.boss_challenge', sent_at: daysAgo(14, 9) },
      { direction: 'inbound', body: 'YES', sent_at: daysAgo(14, replyHour(14)) },
      { direction: 'outbound', body: "BOSS DEFEATED. 5/5. +30 XP. @boldtrack: 130 total.", template_key: 'quest.boss_completed', sent_at: daysAgo(7, 9) },
      { direction: 'outbound', body: "Guardian update: Carlos completed his first Boss Challenge this week. 5 straight check-ins.", template_key: 'quest.guardian_update', sent_at: daysAgo(7, 9) },
      { direction: 'outbound', body: "Standard check-in. Protein + one win. Reply DONE.", template_key: 'quest.checkin.standard', sent_at: daysAgo(2, 9) },
      { direction: 'inbound', body: 'done hit protein today', sent_at: daysAgo(2, replyHour(2)) },
      { direction: 'outbound', body: "+10 XP. Streak: 7. @boldtrack: 130 total.", template_key: 'quest.xp_confirm', sent_at: daysAgo(2, replyHour(2) + 1) },
    ],
    boss: {
      week_start: currentMonday(),
      challenge_text: 'Week 2 Boss: 5 check-ins before Sunday. 30 XP. Reply YES.',
      target_checkins: 5,
      xp_stake: 30,
      status: 'pending_opt_in',
      opted_in_at: null,
      completed_at: null,
      checkins_at_start: 0,
    },
    leaderboard: [
      { week_start: currentMonday(), xp_this_week: 10, xp_prev_week: 0, streak: 7, rank_overall: 4, rank_improved: 3, rank_streak: 3, comeback_flag: false },
    ],
  },
];

export async function reseedQuestDemo(opts: ReseedOptions): Promise<ReseedResult> {
  const { clinicId } = opts;

  // Wipe existing Quest data for this clinic
  await query(`delete from patients where clinic_id = $1 and modality = 'quest'`, [clinicId]);
  await query(`delete from quest_squads where clinic_id = $1`, [clinicId]);

  // Create squads
  const alphaRow = await queryOne<{ id: string }>(
    `insert into quest_squads (clinic_id, name, week_xp) values ($1, 'Squad Alpha', 0) returning id`,
    [clinicId]
  );
  const betaRow = await queryOne<{ id: string }>(
    `insert into quest_squads (clinic_id, name, week_xp) values ($1, 'Squad Beta', 0) returning id`,
    [clinicId]
  );
  const squadIds = {
    alpha: alphaRow!.id,
    beta: betaRow!.id,
  };

  let totalMessages = 0;
  const bucketCounts: Record<string, number> = {
    engaged: 0, building: 0, comeback: 0, guardian_alert: 0,
  };

  for (const p of QUEST_PATIENTS) {
    const squadId = squadIds[p.squad];

    const row = await queryOne<{ id: string }>(
      `insert into patients (
         clinic_id, phone, first_name, enrolled_at, current_phase, phase_started_at,
         status, last_inbound_at, modality,
         date_of_birth, state, guardian_name, guardian_phone,
         consent_type, consent_status,
         quest_handle, quest_xp, quest_level, quest_streak, quest_monthly_xp,
         quest_reward_category, quest_intensity, quest_power_week, quest_checkin_at,
         quest_squad_id
       )
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
       returning id`,
      [
        clinicId, p.phone, p.first_name, p.enrolled_at,
        p.phase, p.phase_started_at, p.status, p.last_inbound_at,
        'quest',
        p.date_of_birth, p.state, p.guardian_name, p.guardian_phone,
        p.consent_type, 'obtained',
        p.quest_handle, p.quest_xp, p.quest_level, p.quest_streak, p.quest_monthly_xp,
        p.quest_reward_category, p.quest_intensity, p.quest_power_week, p.quest_checkin_at,
        squadId,
      ]
    );
    if (!row) continue;
    const pid = row.id;

    // Enrollment event
    await query(
      `insert into events (patient_id, kind, payload, created_at)
       values ($1, 'enrolled', $2, $3)`,
      [pid, JSON.stringify({ source: 'quest_demo', handle: p.quest_handle }), p.enrolled_at]
    );

    // Consent log entry
    await query(
      `insert into quest_consent_log (patient_id, clinic_id, event_type, track, consent_type, state, notes, created_at)
       values ($1, $2, 'consent_obtained', $3, $4, $5, 'Demo seed', $6)`,
      [
        pid, clinicId,
        p.consent_type === 'minor_self' ? 'teen' : 'guardian',
        p.consent_type, p.state, p.enrolled_at,
      ]
    );

    // Messages
    for (const m of p.messages) {
      await query(
        `insert into messages
           (patient_id, direction, template_key, body, sent_at, twilio_sid, status, created_at)
         values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          pid, m.direction, m.template_key ?? null, m.body, m.sent_at,
          m.direction === 'outbound' ? `DEMO_QUEST_${pid.slice(0, 8)}_${totalMessages}` : null,
          m.direction === 'outbound' ? 'sent' : 'received',
          m.sent_at,
        ]
      );
      totalMessages++;
    }

    // Boss challenge
    if (p.boss) {
      const b = p.boss;
      await query(
        `insert into quest_boss_challenges
           (patient_id, week_start, challenge_text, target_checkins, xp_stake,
            status, opted_in_at, completed_at, checkins_at_start)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         on conflict (patient_id, week_start) do nothing`,
        [
          pid, b.week_start, b.challenge_text, b.target_checkins, b.xp_stake,
          b.status, b.opted_in_at, b.completed_at, b.checkins_at_start,
        ]
      );

      // Previous week completed boss (Jordan + Carlos completed last week)
      if (p.first_name === 'Jordan' || p.first_name === 'Carlos') {
        await query(
          `insert into quest_boss_challenges
             (patient_id, week_start, challenge_text, target_checkins, xp_stake,
              status, opted_in_at, completed_at, checkins_at_start)
           values ($1, $2, $3, $4, $5, 'completed', $6, $7, 0)
           on conflict (patient_id, week_start) do nothing`,
          [
            pid, prevMonday(),
            'Boss challenge: 5 check-ins before Sunday. 30 XP on the line. Reply YES to accept.',
            5, 30,
            daysAgo(14, replyHour(14)),
            daysAgo(7, 9),
          ]
        );
      }

      // Aisha's failed boss last week
      if (p.first_name === 'Aisha') {
        await query(
          `insert into quest_boss_challenges
             (patient_id, week_start, challenge_text, target_checkins, xp_stake,
              status, opted_in_at, completed_at, checkins_at_start)
           values ($1, $2, $3, $4, $5, 'failed', $6, null, 0)
           on conflict (patient_id, week_start) do nothing`,
          [
            pid, prevMonday(),
            'Boss challenge: 5 check-ins before Sunday. 30 XP stake.',
            5, 30,
            daysAgo(14, replyHour(14)),
          ]
        );
      }
    }

    // Leaderboard rows
    for (const lr of p.leaderboard) {
      await query(
        `insert into quest_leaderboard
           (clinic_id, patient_id, week_start, handle, xp_this_week, xp_prev_week,
            streak, rank_overall, rank_improved, rank_streak, comeback_flag)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         on conflict (clinic_id, patient_id, week_start) do nothing`,
        [
          clinicId, pid, lr.week_start, p.quest_handle,
          lr.xp_this_week, lr.xp_prev_week, lr.streak,
          lr.rank_overall, lr.rank_improved, lr.rank_streak, lr.comeback_flag,
        ]
      );
    }

    // Phase advancement events
    for (let ph = 1; ph <= p.phase; ph++) {
      const advanceAt = new Date(
        p.enrolled_at.getTime() +
          (ph === 1 ? 1 : ph === 2 ? 7 : ph === 3 ? 21 : 51) * 86_400_000
      );
      if (advanceAt.getTime() < Date.now()) {
        await query(
          `insert into events (patient_id, kind, payload, created_at)
           values ($1, 'phase_advanced', $2, $3)`,
          [pid, JSON.stringify({ to: ph, modality: 'quest' }), advanceAt]
        );
      }
    }

    // Bucket
    if (p.quest_streak >= 14) bucketCounts.engaged++;
    else if (p.boss?.status === 'failed') bucketCounts.comeback++;
    else if (p.consent_type === 'minor_parent') bucketCounts.guardian_alert++;
    else bucketCounts.building++;
  }

  // Update squad week_xp totals
  for (const [, squadId] of Object.entries(squadIds)) {
    await query(
      `update quest_squads
       set week_xp = (
         select coalesce(sum(quest_xp), 0)
         from patients
         where quest_squad_id = $1 and status = 'active'
       )
       where id = $1`,
      [squadId]
    );
  }

  return {
    clinicId,
    totalPatients: QUEST_PATIENTS.length,
    totalMessages,
    bucketCounts,
  };
}
