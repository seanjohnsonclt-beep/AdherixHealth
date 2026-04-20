// Builds a realistic, believable demo dataset for a clinic.
// Wipes existing patients in that clinic, then inserts 87 patients tuned to
// hit the executive-demo targets the clinic owner sees on the homepage:
//
//   - 87 patients total
//   - 12 drifting (active, last reply 3–5 days ago)
//   - 7 recovered THIS WEEK (trigger fired, then inbound within 7d)
//   - 20 recovered THIS MONTH (trigger fired, then inbound within 30d)
//   - ~$14,250 revenue protected (computed downstream from the 20 recoveries)
//
// Numbers are intentionally deterministic enough that the dashboard never
// looks empty or uncertain in demos, while the behaviour of each seeded
// patient remains believable (real message cadence, realistic reply rates,
// trigger firings before recovery replies, phase advancement events).
//
// All messages are inserted with status='sent' (or 'failed' in ~1.5% of
// cases) — no Twilio calls are made. scheduled_for is always in the past.

import { query, queryOne } from '@/lib/db';

// ─── Names (synthetic, diverse) ────────────────────────────────────────────────
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

// ─── Bucket plan ───────────────────────────────────────────────────────────────
type Bucket =
  | 'healthy'           // active, replied <2d ago, no trigger history
  | 'light'             // active, replied 2-4d ago, no trigger history
  | 'recovered_fresh'   // active, trigger fired then reply in last 7d
  | 'recovered_older'   // active, trigger fired then reply 8-30d ago
  | 'drifting'          // active, replied 3-5d ago, no trigger yet
  | 'flagged'           // status=flagged, reply 5-9d ago
  | 'paused'            // status=paused
  | 'churned';          // status=churned

// Target for an 87-patient demo clinic. Each entry = bucket → exact count.
// Sum = 87. If caller requests a different target, counts scale proportionally
// (rounded) and the 'healthy' bucket absorbs the remainder.
const DEMO_TARGETS_87: Record<Bucket, number> = {
  recovered_fresh: 7,
  recovered_older: 13,
  drifting:        12,
  flagged:          8,
  paused:           4,
  churned:          6,
  healthy:         30,
  light:            7,
};

// Phase weight per bucket (so recovered patients cluster mid-program, etc.)
const PHASE_WEIGHTS_BY_BUCKET: Record<Bucket, Array<[number, number]>> = {
  healthy:         [[0,4],[1,12],[2,22],[3,28],[4,20],[5,14]],
  light:           [[0,2],[1,10],[2,22],[3,30],[4,22],[5,14]],
  recovered_fresh: [[1,8],[2,26],[3,36],[4,22],[5,8]],
  recovered_older: [[1,6],[2,24],[3,38],[4,22],[5,10]],
  drifting:        [[1,10],[2,26],[3,32],[4,22],[5,10]],
  flagged:         [[1,14],[2,28],[3,32],[4,18],[5,8]],
  paused:          [[2,24],[3,36],[4,28],[5,12]],
  churned:         [[1,30],[2,34],[3,24],[4,10],[5,2]],
};

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

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Fake phone in E.164, area code 555 (non-routable).
function fakePhone(i: number): string {
  const last4 = String(1000 + i).padStart(4, '0');
  const mid = String(100 + (i % 900)).padStart(3, '0');
  return `+1555${mid}${last4}`;
}

// Build the exact bucket-per-patient list for a given target count.
// For target = 87 we use DEMO_TARGETS_87 literally. For other counts we
// scale by ratio, then absorb any rounding remainder into 'healthy'.
function buildBucketPlan(target: number): Bucket[] {
  let counts: Record<Bucket, number>;

  if (target === 87) {
    counts = { ...DEMO_TARGETS_87 };
  } else {
    const ratio = target / 87;
    counts = {
      recovered_fresh: Math.round(DEMO_TARGETS_87.recovered_fresh * ratio),
      recovered_older: Math.round(DEMO_TARGETS_87.recovered_older * ratio),
      drifting:        Math.round(DEMO_TARGETS_87.drifting * ratio),
      flagged:         Math.round(DEMO_TARGETS_87.flagged * ratio),
      paused:          Math.round(DEMO_TARGETS_87.paused * ratio),
      churned:         Math.round(DEMO_TARGETS_87.churned * ratio),
      light:           Math.round(DEMO_TARGETS_87.light * ratio),
      healthy: 0, // absorbs the remainder below
    };
    const assigned = Object.values(counts).reduce((s, v) => s + v, 0);
    counts.healthy = Math.max(0, target - assigned);
  }

  const plan: Bucket[] = [];
  (Object.keys(counts) as Bucket[]).forEach((b) => {
    for (let i = 0; i < counts[b]; i++) plan.push(b);
  });
  return shuffle(plan);
}

// ─── Template catalog (phase-keyed, short & directive) ─────────────────────────
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
  const target = opts.targetCount ?? 87;

  // Wipe existing patients (cascades to messages / events / trigger_firings)
  await query(`delete from patients where clinic_id = $1`, [clinicId]);

  const plan = buildBucketPlan(target);
  const bucketCounts: Record<string, number> = {};
  let totalMessages = 0;
  const now = Date.now();

  for (let i = 0; i < plan.length; i++) {
    const bucket = plan[i];
    bucketCounts[bucket] = (bucketCounts[bucket] ?? 0) + 1;

    const phase = pickWeighted(PHASE_WEIGHTS_BY_BUCKET[bucket]);
    const firstName = pick(FIRST_NAMES);
    const phone = fakePhone(i);

    // Enrolled: biased toward older for later phases.
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

    // Status + last_inbound — tuned per bucket to hit exact metric targets.
    let status: 'active' | 'flagged' | 'paused' | 'churned' = 'active';
    let lastInboundDaysAgo: number | null;

    switch (bucket) {
      case 'healthy':
        status = 'active';
        lastInboundDaysAgo = randInt(0, 1);
        break;
      case 'light':
        status = 'active';
        lastInboundDaysAgo = randInt(2, 4);
        break;
      case 'recovered_fresh':
        // Replied within last 7d (counts as recoveredThisWeek)
        status = 'active';
        lastInboundDaysAgo = randInt(0, 6);
        break;
      case 'recovered_older':
        // Replied 8-30d ago (counts as recoveredThisMonth only)
        status = 'active';
        lastInboundDaysAgo = randInt(8, 28);
        break;
      case 'drifting':
        // Critical for the "12 drifting" homepage number — keep 3-5d window
        status = 'active';
        lastInboundDaysAgo = randInt(3, 4);
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

    // Enrollment event
    await query(
      `insert into events (patient_id, kind, payload, created_at)
       values ($1, 'enrolled', $2, $3)`,
      [patientId, JSON.stringify({ phone_last4: phone.slice(-4) }), enrolledAt]
    );

    // Outbound message history — roughly one every 2-3 days since enrollment.
    const totalOutbound = Math.max(
      1,
      Math.min(60, Math.floor(enrolledDaysAgo / randInt(2, 3)) + randInt(0, 2))
    );

    const replyProbability =
      bucket === 'healthy'         ? 0.75 :
      bucket === 'light'           ? 0.35 :
      bucket === 'recovered_fresh' ? 0.55 :
      bucket === 'recovered_older' ? 0.55 :
      bucket === 'drifting'        ? 0.40 :
      bucket === 'flagged'         ? 0.20 :
      bucket === 'paused'          ? 0.30 :
                                     0.15;

    let cursorDaysAgo = enrolledDaysAgo;
    let messagesInserted = 0;

    for (let m = 0; m < totalOutbound && cursorDaysAgo > 0; m++) {
      const step = randInt(2, 4);
      cursorDaysAgo = Math.max(0, cursorDaysAgo - step);
      const sentAt = new Date(now - cursorDaysAgo * 86400 * 1000 + randInt(0, 8) * 3600 * 1000);

      const templatePhase = Math.min(phase, Math.floor((m / totalOutbound) * (phase + 1)));
      const key = pickOutboundKey(templatePhase);
      const body = OUTBOUND[key][0].replace('{name}', firstName);

      // ~1.5% failed to keep deliverability honest-but-not-alarmist
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

      if (!failed && Math.random() < replyProbability) {
        const replyDelayMin = randInt(20, 18 * 60);
        const replyAt = new Date(sentAt.getTime() + replyDelayMin * 60 * 1000);
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

    // ── Trigger firings + events per bucket ──────────────────────────────────
    if ((bucket === 'recovered_fresh' || bucket === 'recovered_older') && lastInboundAt) {
      // Trigger fired 1-3 days BEFORE the recent reply → counts as a recovery.
      const firedAt = new Date(lastInboundAt.getTime() - randInt(1, 3) * 86400 * 1000);
      const triggerKey = Math.random() < 0.6 ? 'no_response_48h' : 'no_response_5d';
      await query(
        `insert into trigger_firings (patient_id, trigger_key, dedupe_key, fired_at)
         values ($1, $2, $3, $4)
         on conflict do nothing`,
        [
          patientId,
          triggerKey,
          `${triggerKey}:${firedAt.toISOString().slice(0, 10)}`,
          firedAt,
        ]
      );
      await query(
        `insert into messages
           (patient_id, direction, template_key, body, sent_at, twilio_sid, status, created_at)
         values ($1, 'outbound', $2, $3, $4, $5, 'sent', $6)`,
        [
          patientId,
          `trigger.${triggerKey}`,
          OUTBOUND[`trigger.${triggerKey}`][0],
          firedAt,
          `DEMO_TRG_${patientId.slice(0, 8)}`,
          firedAt,
        ]
      );
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

    // Phase advancement events
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
  }

  return {
    clinicId,
    totalPatients: plan.length,
    totalMessages,
    bucketCounts,
  };
}
