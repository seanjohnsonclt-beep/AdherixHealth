// Builds a realistic, believable demo dataset for a clinic.
// Wipes existing patients in that clinic, then inserts ~100 patients with:
//   - mixed phases (0..5) weighted toward steady-state 2-4
//   - mixed statuses (active / flagged / paused / churned / recovered)
//   - realistic enrollment spread over the last ~8 months
//   - outbound + inbound messages with realistic response rates
//   - trigger_firings rows so "recovered" counts correctly
//   - events rows so the behavioral log looks lived-in
//
// All messages are inserted with status='sent' (or 'failed' in < 2% of cases)
// — no Twilio calls are made. Scheduled-for is always in the past.

import { query, queryOne } from '@/lib/db';

// ─── Names (diverse, non-PII obviously — all synthetic) ────────────────────────
const FIRST_NAMES = [
  'Alex','Jordan','Taylor','Morgan','Casey','Riley','Avery','Quinn','Parker','Rowan',
  'Emma','Olivia','Ava','Isabella','Sophia','Mia','Amelia','Harper','Evelyn','Abigail',
  'Liam','Noah','Ethan','Mason','Lucas','Henry','Benjamin','James','Michael','Daniel',
  'Priya','Aisha','Zara','Leila','Yara','Fatima','Noor','Amara','Imani','Nia',
  'Diego','Mateo','Santiago','Sofia','Camila','Valentina','Gabriela','Isabela','Lucia','Elena',
  'Wei','Mei','Jin','Hiro','Yuki','Ryo','Kai','Aiko','Haruki','Sakura',
  'Jamal','Tariq','Malik','Jasmine','Aaliyah','Zuri','Simone','Imara','Darius','Kofi',
  'Chloe','Grace','Lily','Zoe','Stella','Hazel','Violet','Aurora','Layla','Nora',
  'Ryan','Caleb','Isaac','Owen','Dylan','Nathan','Eli','Wyatt','Adrian','Levi',
  'Aanya','Diya','Kavya','Saanvi','Ishaan','Arjun','Kabir','Vihaan','Reyansh','Aarav',
  'Nikolai','Anastasia','Viktor','Dmitri','Svetlana','Irina','Oksana','Mikhail','Yelena','Sergei',
  'Hana','Minji','Seojun','Jiwon','Doyun','Hyejin','Yuna','Taeyang','Somin','Chanwoo',
];

// ─── Distribution knobs ────────────────────────────────────────────────────────
// Weights sum to any positive number; pickWeighted normalizes.
const PHASE_WEIGHTS: Array<[number, number]> = [
  [0, 6],   // Initiation (just enrolled)
  [1, 16],  // Dose Stabilization
  [2, 24],  // Adherence Building
  [3, 28],  // Risk Window / Momentum (biggest cohort)
  [4, 16],  // Taper Management
  [5, 10],  // Maintenance
];

// Status buckets AFTER phase is decided. Drives how we render last_inbound_at,
// message history, and trigger_firings.
type Bucket =
  | 'healthy'      // active, replies frequently, never flagged
  | 'light'        // active, sporadic replies, never flagged
  | 'recovered'    // active now, but was flagged earlier → we insert a trigger_firing before last reply
  | 'drifting'     // active, no reply 3-5 days, starting to slip
  | 'flagged'      // flagged status, no reply 5-9 days
  | 'paused'       // patient-initiated pause
  | 'churned';     // churned, haven't heard from them in 14+ days

const BUCKET_WEIGHTS: Array<[Bucket, number]> = [
  ['healthy',   52],
  ['light',     12],
  ['recovered',  9],
  ['drifting',   8],
  ['flagged',    8],
  ['paused',     4],
  ['churned',    7],
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function pickWeighted<T>(weights: Array<[T, number]>): T {
  const total = weights.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of weights) {
    r -= w;
    if (r <= 0) return v;
  }
  return weights[weights.length - 1][0];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Fake phone in E.164, last 4 randomized, area code 555 (non-routable).
function fakePhone(i: number): string {
  const last4 = String(1000 + i).padStart(4, '0');
  const mid = String(100 + (i % 900)).padStart(3, '0');
  return `+1555${mid}${last4}`;
}

// ─── Outbound template bodies (phase-keyed, de-identified) ─────────────────────
// Kept short & directive to match Adherix voice.
const OUTBOUND: Record<string, string[]> = {
  'phase0.welcome':       ['Hi {name}, welcome to your program. One short text a day. Reply YES to start.'],
  'phase0.confirmed':     ['Locked in. First goal tomorrow morning: 16oz of water before anything else.'],
  'phase1.day1.morning':  ['Today\'s one thing: 30g protein at breakfast. Reply DONE when you eat it.'],
  'phase1.day3.checkin':  ['Day 3 check. How\'s the first dose feeling? Reply OK or ROUGH.'],
  'phase1.day5.hydrate':  ['Reminder: keep water up. Aim 64oz today. Reply DONE at the end of the day.'],
  'phase2.day1.habit':    ['Week 2. Pick one protein-forward meal today. Reply DONE when it\'s in.'],
  'phase2.day4.log':      ['Quick log: what did you eat today that had protein? Reply in 5 words.'],
  'phase2.day7.review':   ['You\'re 2 weeks in. Reply Y if protein is sticking, N if slipping.'],
  'phase3.day3.mov':      ['Add 10 mins of movement today — walk counts. Reply DONE.'],
  'phase3.day10.streak':  ['Streak check: how many days this week hit your protein goal? Reply 0-7.'],
  'phase3.day20.plateau': ['Scale can stall around now. Normal. Keep protein + water dialed. Reply OK.'],
  'phase4.day5.taper':    ['Moving to steady-state. Same rules, lighter cadence. Reply Y to confirm.'],
  'phase4.day15.anchor':  ['Anchor habit check. Which is strongest: protein, water, or movement? Reply one.'],
  'phase5.weekly_checkin':['Weekly check: protein still a habit? Reply Y or N.'],
  'phase5.weekly_rate':   ['How\'s this week on a 1-5 scale? Reply a number.'],
  'trigger.no_response_48h':['Haven\'t heard from you in 2 days. Everything ok? One word is enough.'],
  'trigger.no_response_5d':['5 days quiet. We want to keep you on plan. Reply anything and we\'ll pick up where you left off.'],
};

const INBOUND_REPLIES = [
  'DONE', 'done', 'Y', 'YES', 'yes', 'yep', 'OK', 'ok', 'good', 'N', 'NO', 'ROUGH',
  'a little', '3', '4', '5', 'eggs + yogurt', 'protein bar', 'chicken', 'walking today',
  'feeling good', 'tired but ok', 'rough week', 'scale up a bit', 'on it', 'will do',
  'missed breakfast', 'back on it', 'yes protein', 'nausea a bit', 'stalled', 'back',
];

function pickOutboundKey(phase: number): string {
  const keys = Object.keys(OUTBOUND).filter((k) => {
    if (k.startsWith('trigger.')) return false;
    const m = k.match(/^phase(\d+)\./);
    return m ? parseInt(m[1]) === phase : false;
  });
  return keys.length ? pick(keys) : 'phase0.welcome';
}

// ─── Main reseed ───────────────────────────────────────────────────────────────

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

export async function reseedDemo(opts: ReseedOptions): Promise<ReseedResult> {
  const { clinicId } = opts;
  const target = opts.targetCount ?? randInt(96, 128);

  // Wipe existing patients (cascades to messages / events / trigger_firings)
  await query(`delete from patients where clinic_id = $1`, [clinicId]);

  const bucketCounts: Record<string, number> = {};
  let totalMessages = 0;
  const now = Date.now();

  for (let i = 0; i < target; i++) {
    const phase = pickWeighted(PHASE_WEIGHTS);
    const bucket = pickWeighted(BUCKET_WEIGHTS);
    bucketCounts[bucket] = (bucketCounts[bucket] ?? 0) + 1;

    const firstName = pick(FIRST_NAMES);
    const phone = fakePhone(i);

    // Enrolled somewhere between 2 and 240 days ago, weighted toward older
    // for later phases so "days on program" feels right.
    const minDaysAgo =
      phase === 0 ? 0 :
      phase === 1 ? 3 :
      phase === 2 ? 12 :
      phase === 3 ? 30 :
      phase === 4 ? 75 :
                   110;
    const maxDaysAgo =
      phase === 0 ? 1 :
      phase === 1 ? 10 :
      phase === 2 ? 28 :
      phase === 3 ? 75 :
      phase === 4 ? 130 :
                   240;
    const enrolledDaysAgo = randInt(minDaysAgo, maxDaysAgo);
    const enrolledAt = new Date(now - enrolledDaysAgo * 86400 * 1000);

    // Phase started: recent for late phases, near enrollment for early phases.
    const phaseStartedDaysAgo = Math.min(
      enrolledDaysAgo,
      phase === 0 ? randInt(0, 1) :
      phase === 1 ? randInt(0, 6) :
      phase === 2 ? randInt(0, 13) :
      phase === 3 ? randInt(0, 28) :
      phase === 4 ? randInt(0, 28) :
                   randInt(0, 40)
    );
    const phaseStartedAt = new Date(now - phaseStartedDaysAgo * 86400 * 1000);

    // Status + last_inbound by bucket
    let status: 'active' | 'flagged' | 'paused' | 'churned' = 'active';
    let lastInboundDaysAgo: number | null;

    switch (bucket) {
      case 'healthy':
        status = 'active';
        lastInboundDaysAgo = randInt(0, 2);
        break;
      case 'light':
        status = 'active';
        lastInboundDaysAgo = randInt(2, 4);
        break;
      case 'recovered':
        status = 'active';
        lastInboundDaysAgo = randInt(0, 3);  // recently replied
        break;
      case 'drifting':
        status = 'active';
        lastInboundDaysAgo = randInt(3, 5);
        break;
      case 'flagged':
        status = 'flagged';
        lastInboundDaysAgo = randInt(5, 9);
        break;
      case 'paused':
        status = 'paused';
        lastInboundDaysAgo = enrolledDaysAgo > 20 ? randInt(10, 20) : null;
        break;
      case 'churned':
        status = 'churned';
        lastInboundDaysAgo = randInt(14, Math.max(14, enrolledDaysAgo));
        break;
    }

    // Never-responders (5% of light + a sliver of churned) have null inbound
    if (bucket === 'light' && Math.random() < 0.08) lastInboundDaysAgo = null;

    const lastInboundAt =
      lastInboundDaysAgo === null ? null : new Date(now - lastInboundDaysAgo * 86400 * 1000);

    // Insert patient
    const patientRow = await queryOne<{ id: string }>(
      `insert into patients
         (clinic_id, phone, first_name, enrolled_at, current_phase,
          phase_started_at, status, last_inbound_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       returning id`,
      [clinicId, phone, firstName, enrolledAt, phase, phaseStartedAt, status, lastInboundAt]
    );
    if (!patientRow) continue;
    const patientId = patientRow.id;

    // Insert enrollment event
    await query(
      `insert into events (patient_id, kind, payload, created_at)
       values ($1, 'enrolled', $2, $3)`,
      [patientId, JSON.stringify({ phone_last4: phone.slice(-4) }), enrolledAt]
    );

    // Generate message history. Roughly 1 outbound every 2-3 days since enroll.
    const totalOutbound = Math.max(
      1,
      Math.min(60, Math.floor(enrolledDaysAgo / randInt(2, 3)) + randInt(0, 2))
    );

    // How responsive is this patient? Used to decide per-message reply probability.
    const replyProbability =
      bucket === 'healthy'   ? 0.75 :
      bucket === 'light'     ? 0.35 :
      bucket === 'recovered' ? 0.55 :
      bucket === 'drifting'  ? 0.40 :
      bucket === 'flagged'   ? 0.20 :
      bucket === 'paused'    ? 0.30 :
                              0.15;

    // Walk forward from enrollment, spacing messages ~2-3 days apart.
    let cursorDaysAgo = enrolledDaysAgo;
    let lastOutboundTime: Date | null = null;
    let messagesInserted = 0;

    for (let m = 0; m < totalOutbound && cursorDaysAgo > 0; m++) {
      const step = randInt(2, 4);
      cursorDaysAgo = Math.max(0, cursorDaysAgo - step);
      const sentAt = new Date(now - cursorDaysAgo * 86400 * 1000 + randInt(0, 8) * 3600 * 1000);

      // Decide template: bias toward current phase for most, earlier phases for early ones
      const templatePhase = Math.min(phase, Math.floor((m / totalOutbound) * (phase + 1)));
      const key = pickOutboundKey(templatePhase);
      const body = OUTBOUND[key][0].replace('{name}', firstName);

      // 1.5% failed to make deliverability look honest-but-not-alarmist
      const failed = Math.random() < 0.015;

      await query(
        `insert into messages
           (patient_id, direction, template_key, body, scheduled_for, sent_at,
            twilio_sid, status, created_at)
         values ($1, 'outbound', $2, $3, $4, $5, $6, $7, $8)`,
        [
          patientId,
          key,
          body,
          sentAt,
          failed ? null : sentAt,
          failed ? null : `DEMO_${patientId.slice(0, 8)}_${m}`,
          failed ? 'failed' : 'sent',
          sentAt,
        ]
      );
      messagesInserted++;
      lastOutboundTime = sentAt;

      // Maybe patient replies
      if (!failed && Math.random() < replyProbability) {
        // Reply arrives 20 minutes to 18 hours later
        const replyDelayMin = randInt(20, 18 * 60);
        const replyAt = new Date(sentAt.getTime() + replyDelayMin * 60 * 1000);
        // Don't schedule replies in the future
        if (replyAt.getTime() <= now) {
          await query(
            `insert into messages
               (patient_id, direction, body, status, created_at)
             values ($1, 'inbound', $2, 'received', $3)`,
            [patientId, pick(INBOUND_REPLIES), replyAt]
          );
          messagesInserted++;
        }
      }
    }

    // Trigger firings & events for buckets that need them
    if (bucket === 'recovered' && lastInboundAt) {
      // Fire a no_response_48h trigger 1-2 days BEFORE the recent reply
      const firedAt = new Date(lastInboundAt.getTime() - randInt(1, 3) * 86400 * 1000);
      await query(
        `insert into trigger_firings (patient_id, trigger_key, dedupe_key, fired_at)
         values ($1, 'no_response_48h', $2, $3)
         on conflict do nothing`,
        [
          patientId,
          `no_response_48h:${firedAt.toISOString().slice(0, 10)}`,
          firedAt,
        ]
      );
      // Also insert the trigger outbound message
      await query(
        `insert into messages
           (patient_id, direction, template_key, body, sent_at, twilio_sid, status, created_at)
         values ($1, 'outbound', 'trigger.no_response_48h', $2, $3, $4, 'sent', $5)`,
        [
          patientId,
          OUTBOUND['trigger.no_response_48h'][0],
          firedAt,
          `DEMO_TRG_${patientId.slice(0, 8)}`,
          firedAt,
        ]
      );
      // And the recovery event
      await query(
        `insert into events (patient_id, kind, payload, created_at)
         values ($1, 'patient_unflagged', $2, $3)`,
        [patientId, JSON.stringify({ reason: 'inbound_reply' }), lastInboundAt]
      );
      messagesInserted++;
    }

    if (bucket === 'flagged' && lastInboundAt) {
      const firedAt = new Date(lastInboundAt.getTime() + randInt(3, 5) * 86400 * 1000);
      if (firedAt.getTime() < now) {
        await query(
          `insert into trigger_firings (patient_id, trigger_key, dedupe_key, fired_at)
           values ($1, 'no_response_5d', $2, $3)
           on conflict do nothing`,
          [
            patientId,
            `no_response_5d:${firedAt.toISOString().slice(0, 10)}`,
            firedAt,
          ]
        );
        await query(
          `insert into events (patient_id, kind, payload, created_at)
           values ($1, 'patient_flagged', $2, $3)`,
          [patientId, JSON.stringify({ reason: 'no_response_5d' }), firedAt]
        );
      }
    }

    // Record phase advances as events (for lived-in behavioral log)
    for (let p = 1; p <= phase; p++) {
      const advanceAt = new Date(
        enrolledAt.getTime() +
          (p === 1 ? 1 : p === 2 ? 7 : p === 3 ? 21 : p === 4 ? 51 : 81) * 86400 * 1000
      );
      if (advanceAt.getTime() < now) {
        await query(
          `insert into events (patient_id, kind, payload, created_at)
           values ($1, 'phase_advanced', $2, $3)`,
          [patientId, JSON.stringify({ to: p }), advanceAt]
        );
      }
    }

    totalMessages += messagesInserted;
    // Suppress unused-var warnings
    void lastOutboundTime;
  }

  return {
    clinicId,
    totalPatients: target,
    totalMessages,
    bucketCounts,
  };
}
