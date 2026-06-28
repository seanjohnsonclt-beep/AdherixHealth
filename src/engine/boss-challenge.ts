// Adherix Quest - Boss Challenge engine
//
// Weekly opt-in gamification challenge for Quest teens.
// Monday 9am: AI-generated challenge sent via SMS, teen replies YES/NO.
// Sunday: completion check - award or deduct XP based on outcome.
//
// XP economy:
//   500 XP  = $5 gift card
//   1000 XP = $10 gift card
//   2500 XP = $25 gift card
//
// Reward categories (set at enrollment, drives gift card selection):
//   'gamer'    - Roblox, Fortnite, PSN, Xbox, 2K/Madden
//   'wellness' - Smoothie King
//   'reader'   - Barnes & Noble
//
// Monthly XP (quest_monthly_xp) is the reward ledger.
// Total XP (quest_xp) drives leaderboard - never decremented.
// Only quest_monthly_xp is adjusted on failure.

import Anthropic from '@anthropic-ai/sdk';
import { query, queryOne } from '@/lib/db';
import { awardXp, XP, getLevelFromXp } from './quest-game';

// ── AI challenge generation ───────────────────────────────────────────────────

let _client: Anthropic | null = null;
function aiClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

const INTENSITY_TARGETS: Record<string, number> = {
  chill:    3,
  standard: 5,
  beast:    7,
};

const LEVEL_NAMES: Record<number, string> = {
  1: 'Rookie',
  2: 'Contender',
  3: 'Athlete',
  4: 'Champion',
  5: 'Elite',
};

async function generateChallengeText(params: {
  firstName:  string;
  levelName:  string;
  intensity:  string;
  target:     number;
  xpStake:    number;
}): Promise<string> {
  const ai = aiClient();
  const { firstName, levelName, intensity, target, xpStake } = params;

  const fallback =
    `Boss challenge this week: complete ${target} check-ins by Sunday. Reply YES to accept - ${xpStake} XP on the line.`;

  if (!ai) return fallback;

  try {
    const resp = await ai.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Write a short, hype Boss Challenge SMS for a ${levelName}-level teen (${intensity} mode).
The challenge: complete ${target} health check-ins before Sunday.
Stakes: ${xpStake} XP.
Patient first name: ${firstName}.

Rules:
- One sentence challenge + one sentence stakes. Under 140 chars total.
- Gaming/sports energy. Not medical. No medication mentions.
- End with: Reply YES to accept.
- Return ONLY the SMS text, no quotes.`,
      }],
    });

    const text = (resp.content[0] as Anthropic.TextBlock).text?.trim();
    if (!text || text.length > 200) return fallback;
    return text;
  } catch {
    return fallback;
  }
}

// ── Monday send ───────────────────────────────────────────────────────────────
// Called each Monday. Idempotent - skips patients who already have a boss row this week.

export async function sendWeeklyBossChallenge(): Promise<void> {
  const now  = new Date();
  const isMonday = now.getDay() === 1;
  const hour = now.getHours(); // server UTC - callers should check local time if needed
  if (!isMonday) return;

  const weekStart = getMondayDate(now);

  // Pull all active Quest patients in phase >= 2 (Habit Lock+) who don't already have a boss row this week
  const patients = await query<{
    id:                  string;
    first_name:          string | null;
    quest_level:         number;
    quest_xp:            number;
    quest_intensity:     string | null;
    quest_monthly_xp:    number;
    clinic_id:           string;
    phone:               string;
    timezone:            string | null;
  }>(
    `SELECT p.id, p.first_name, p.quest_level, p.quest_xp, p.quest_intensity,
            COALESCE(p.quest_monthly_xp, 0) as quest_monthly_xp,
            p.clinic_id, p.phone,
            COALESCE(p.timezone, 'America/New_York') as timezone
     FROM patients p
     LEFT JOIN quest_boss_challenges qb
       ON qb.patient_id = p.id AND qb.week_start = $1
     WHERE p.modality = 'quest'
       AND p.status = 'active'
       AND p.current_phase >= 2
       AND qb.id IS NULL`,
    [weekStart]
  );

  console.log(`[boss] Monday send: ${patients.length} eligible Quest patients for week ${weekStart}`);

  for (const p of patients) {
    try {
      const intensity  = p.quest_intensity ?? 'standard';
      const target     = INTENSITY_TARGETS[intensity] ?? 5;
      const level      = getLevelFromXp(p.quest_xp);
      const xpStake    = XP.BOSS_CHALLENGE; // 30 XP
      const firstName  = p.first_name ?? 'there';

      // Snapshot check-ins at start of week (count completed check-ins this calendar month)
      const checkinCount = await queryOne<{ cnt: string }>(
        `SELECT COUNT(*)::text as cnt FROM events
         WHERE patient_id = $1
           AND kind IN ('quest_checkin', 'injection_confirmed')
           AND created_at >= date_trunc('month', now())`,
        [p.id]
      );
      const checkinsAtStart = parseInt(checkinCount?.cnt ?? '0', 10);

      const challengeText = await generateChallengeText({
        firstName,
        levelName: LEVEL_NAMES[level.level] ?? level.name,
        intensity,
        target,
        xpStake,
      });

      // Insert boss challenge row
      await query(
        `INSERT INTO quest_boss_challenges
           (patient_id, week_start, challenge_text, target_checkins, xp_stake, status, checkins_at_start)
         VALUES ($1, $2, $3, $4, $5, 'pending_opt_in', $6)
         ON CONFLICT (patient_id, week_start) DO NOTHING`,
        [p.id, weekStart, challengeText, target, xpStake, checkinsAtStart]
      );

      // Queue the SMS
      await query(
        `INSERT INTO messages
           (patient_id, direction, template_key, body, scheduled_for, status)
         VALUES ($1, 'outbound', 'quest.boss_challenge', $2, now(), 'pending')`,
        [p.id, challengeText]
      );

      // Set flag so inbound YES/NO gets routed to boss handler
      await query(
        `UPDATE patients SET boss_challenge_pending = TRUE WHERE id = $1`,
        [p.id]
      );

      console.log(`[boss] queued challenge for ${p.id} (${intensity}, target: ${target})`);
    } catch (err) {
      console.error(`[boss] failed to queue challenge for ${p.id}:`, err);
    }
  }
}

// ── Inbound YES/NO opt-in ─────────────────────────────────────────────────────
// Called from inbound webhook when patient.boss_challenge_pending = true.
// Returns a response body to send back to the patient, or null if no action taken.

export async function handleBossReply(
  patientId: string,
  yesNo: 'yes' | 'no'
): Promise<void> {
  const weekStart = getMondayDate(new Date());

  const boss = await queryOne<{ id: string; xp_stake: number; status: string }>(
    `SELECT id, xp_stake, status FROM quest_boss_challenges
     WHERE patient_id = $1 AND week_start = $2`,
    [patientId, weekStart]
  );

  if (!boss || boss.status !== 'pending_opt_in') {
    // No pending boss or already responded - clear flag and bail
    await query(`UPDATE patients SET boss_challenge_pending = FALSE WHERE id = $1`, [patientId]);
    return;
  }

  if (yesNo === 'yes') {
    await query(
      `UPDATE quest_boss_challenges
       SET status = 'accepted', opted_in_at = now()
       WHERE id = $1`,
      [boss.id]
    );

    // Queue acceptance confirmation SMS
    const patient = await queryOne<{ first_name: string | null; quest_level: number; quest_xp: number }>(
      `SELECT first_name, quest_level, quest_xp FROM patients WHERE id = $1`,
      [patientId]
    );
    const level = getLevelFromXp(patient?.quest_xp ?? 0);
    const name  = patient?.first_name ?? 'there';

    const confirmBody = `Boss accepted, ${name}. ${boss.xp_stake} XP on the line. Show up this week.`;

    await query(
      `INSERT INTO messages (patient_id, direction, template_key, body, scheduled_for, status)
       VALUES ($1, 'outbound', 'quest.boss_accepted', $2, now(), 'pending')`,
      [patientId, confirmBody]
    );

    await query(
      `INSERT INTO events (patient_id, kind, payload)
       VALUES ($1, 'boss_challenge_accepted', $2)`,
      [patientId, JSON.stringify({ week_start: weekStart, xp_stake: boss.xp_stake })]
    );

  } else {
    // Declined
    await query(
      `UPDATE quest_boss_challenges SET status = 'declined' WHERE id = $1`,
      [boss.id]
    );

    // Notify guardian if patient has one
    const patient = await queryOne<{
      first_name: string | null;
      guardian_phone: string | null;
      guardian_name: string | null;
      clinic_id: string;
    }>(
      `SELECT first_name, guardian_phone, guardian_name, clinic_id
       FROM patients WHERE id = $1`,
      [patientId]
    );

    if (patient?.guardian_phone) {
      const guardianBody =
        `Hi${patient.guardian_name ? ` ${patient.guardian_name}` : ''}, ` +
        `${patient.first_name ?? 'your teen'} skipped this week's Boss Challenge. ` +
        `Encourage them to stay in the game.`;

      await query(
        `INSERT INTO messages (patient_id, direction, template_key, body, scheduled_for, status)
         VALUES ($1, 'outbound', 'quest.boss_declined_guardian', $2, now(), 'pending')`,
        [patientId, guardianBody]
      );
      // Override `to` phone - sender will use patient phone by default.
      // We store guardian_phone in body metadata via a special template_key pattern.
      // The sender checks for quest.boss_declined_guardian and sends to guardian_phone.
    }

    await query(
      `INSERT INTO events (patient_id, kind, payload)
       VALUES ($1, 'boss_challenge_declined', $2)`,
      [patientId, JSON.stringify({ week_start: weekStart })]
    );
  }

  // Clear the pending flag either way
  await query(`UPDATE patients SET boss_challenge_pending = FALSE WHERE id = $1`, [patientId]);
}

// ── Sunday completion check ───────────────────────────────────────────────────
// Called Sunday evening. Checks accepted bosses - did they hit their target?

export async function runSundayBossCheck(): Promise<void> {
  const now = new Date();
  if (now.getDay() !== 0) return; // only Sunday

  const weekStart = getMondayDate(now);

  // All accepted boss challenges for this week not yet resolved
  const accepted = await query<{
    id:               string;
    patient_id:       string;
    target_checkins:  number;
    xp_stake:         number;
    checkins_at_start: number;
    first_name:       string | null;
    quest_xp:         number;
    quest_level:      number;
    clinic_id:        string;
  }>(
    `SELECT qb.id, qb.patient_id, qb.target_checkins, qb.xp_stake, qb.checkins_at_start,
            p.first_name, COALESCE(p.quest_xp, 0) as quest_xp,
            COALESCE(p.quest_level, 1) as quest_level, p.clinic_id
     FROM quest_boss_challenges qb
     JOIN patients p ON p.id = qb.patient_id
     WHERE qb.week_start = $1 AND qb.status = 'accepted'`,
    [weekStart]
  );

  console.log(`[boss] Sunday check: ${accepted.length} accepted challenges for week ${weekStart}`);

  for (const row of accepted) {
    try {
      // Count check-ins this week (since Monday)
      const checkinResult = await queryOne<{ cnt: string }>(
        `SELECT COUNT(*)::text as cnt FROM events
         WHERE patient_id = $1
           AND kind IN ('quest_checkin', 'injection_confirmed')
           AND created_at >= $2::date`,
        [row.patient_id, weekStart]
      );
      const weekCheckins = parseInt(checkinResult?.cnt ?? '0', 10);
      const completed = weekCheckins >= row.target_checkins;

      if (completed) {
        // Win: award XP to both total and monthly ledger
        const { newXp, leveledUp, levelName } = await awardXp(row.patient_id, row.xp_stake);

        await query(
          `UPDATE patients
           SET quest_monthly_xp = COALESCE(quest_monthly_xp, 0) + $1
           WHERE id = $2`,
          [row.xp_stake, row.patient_id]
        );

        await query(
          `UPDATE quest_boss_challenges
           SET status = 'completed', completed_at = now()
           WHERE id = $1`,
          [row.id]
        );

        const winLines = [
          `Boss defeated, ${row.first_name ?? 'there'}. +${row.xp_stake} XP.`,
          leveledUp ? ` You hit ${levelName}.` : '',
          ` Total: ${newXp} XP.`,
        ];
        const winBody = winLines.join('').trim();

        await query(
          `INSERT INTO messages (patient_id, direction, template_key, body, scheduled_for, status)
           VALUES ($1, 'outbound', 'quest.boss_won', $2, now(), 'pending')`,
          [row.patient_id, winBody]
        );

        await query(
          `INSERT INTO events (patient_id, kind, payload)
           VALUES ($1, 'boss_challenge_completed', $2)`,
          [row.patient_id, JSON.stringify({
            week_start:      weekStart,
            xp_earned:       row.xp_stake,
            checkins_completed: weekCheckins,
          })]
        );

      } else {
        // Loss: deduct XP from monthly ledger only (total XP never goes down)
        const deduct = Math.min(row.xp_stake, row.xp_stake); // same stake
        await query(
          `UPDATE patients
           SET quest_monthly_xp = GREATEST(0, COALESCE(quest_monthly_xp, 0) - $1)
           WHERE id = $2`,
          [deduct, row.patient_id]
        );

        await query(
          `UPDATE quest_boss_challenges SET status = 'failed' WHERE id = $1`,
          [row.id]
        );

        const lossBody =
          `The boss won this week, ${row.first_name ?? 'there'}. ` +
          `${weekCheckins}/${row.target_checkins} check-ins. Rematch next Monday.`;

        await query(
          `INSERT INTO messages (patient_id, direction, template_key, body, scheduled_for, status)
           VALUES ($1, 'outbound', 'quest.boss_lost', $2, now(), 'pending')`,
          [row.patient_id, lossBody]
        );

        await query(
          `INSERT INTO events (patient_id, kind, payload)
           VALUES ($1, 'boss_challenge_failed', $2)`,
          [row.patient_id, JSON.stringify({
            week_start:  weekStart,
            xp_deducted: deduct,
            checkins_completed: weekCheckins,
            target:      row.target_checkins,
          })]
        );
      }

      console.log(`[boss] ${row.patient_id}: ${completed ? 'WON' : 'LOST'} (${weekCheckins}/${row.target_checkins})`);
    } catch (err) {
      console.error(`[boss] completion check failed for ${row.patient_id}:`, err);
    }
  }
}

// ── Monthly XP reset ──────────────────────────────────────────────────────────
// Call on the 1st of each month after rewards are fulfilled.

export async function resetMonthlyXp(): Promise<void> {
  const day = new Date().getDate();
  if (day !== 1) return;

  await query(
    `UPDATE patients SET quest_monthly_xp = 0
     WHERE modality = 'quest' AND status = 'active'`
  );
  console.log('[boss] monthly XP reset');
}

// ── Reward thresholds ─────────────────────────────────────────────────────────

export const REWARD_TIERS = [
  { xp: 500,  label: '$5',  value: 5  },
  { xp: 1000, label: '$10', value: 10 },
  { xp: 2500, label: '$25', value: 25 },
];

export function getRewardTier(monthlyXp: number) {
  for (let i = REWARD_TIERS.length - 1; i >= 0; i--) {
    if (monthlyXp >= REWARD_TIERS[i].xp) return REWARD_TIERS[i];
  }
  return null;
}

export const REWARD_CATEGORY_LABELS: Record<string, string> = {
  gaming:    'Gaming',
  food_drink: 'Food & Drink',
  music:     'Music & Streaming',
  fashion:   'Fashion & Kicks',
  beauty:    'Beauty & Self-Care',
  experience: 'Experience',
};

// Specific brands inside each category - used for admin fulfillment display
// and for the redemption-time brand pick SMS
export const REWARD_CATEGORY_OPTIONS: Record<string, string[]> = {
  gaming:    ['Roblox', 'Steam', 'PSN', 'Xbox', 'Nintendo eShop'],
  food_drink: ['Chick-fil-A', 'Chipotle', 'Starbucks', 'Dutch Bros'],
  music:     ['Spotify', 'Apple Music', 'YouTube Premium'],
  fashion:   ['Nike', 'Foot Locker', 'Amazon'],
  beauty:    ['Sephora', 'Ulta', 'Target'],
  experience: ['AMC/Fandango', "Dave & Buster's", 'Top Golf'],
};

// SMS-safe short labels for the onboarding category pick message
export const REWARD_CATEGORY_SMS: Record<string, string> = {
  gaming:     'Gaming (Roblox, Xbox, Nintendo)',
  food_drink: 'Food & Drink (Chick-fil-A, Starbucks, Chipotle)',
  music:      'Music (Spotify, Apple Music, YouTube)',
  fashion:    'Fashion (Nike, Foot Locker, Amazon)',
  beauty:     'Beauty (Sephora, Ulta, Target)',
  experience: 'Experiences (Movies, Dave & Busters, Top Golf)',
};

// Map reply digit to category key
export const REWARD_CATEGORY_BY_NUMBER: Record<string, string> = {
  '1': 'gaming',
  '2': 'food_drink',
  '3': 'music',
  '4': 'fashion',
  '5': 'beauty',
  '6': 'experience',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMondayDate(d: Date): string {
  const day  = d.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day; // go back to Monday
  const mon  = new Date(d);
  mon.setDate(d.getDate() + diff);
  return mon.toISOString().slice(0, 10);
}

// ── Power week activation ─────────────────────────────────────────────────────
// Monday: activate power week (2x XP) for Quest patients with streak >= 10.
// Sunday: deactivate for everyone after boss check resolves.
// Power week is visible to patients via the check-in XP multiplier only -
// no SMS sent here (boss-challenge message already mentions the stakes).

export async function activatePowerWeek(): Promise<void> {
  const tz = process.env.DEFAULT_TIMEZONE ?? 'America/New_York';
  const now = new Date();
  const day = new Date(now.toLocaleString('en-US', { timeZone: tz })).getDay();
  if (day !== 1) return; // Monday only

  await query(
    `UPDATE patients
     SET quest_power_week = TRUE
     WHERE modality = 'quest'
       AND status   = 'active'
       AND COALESCE(quest_streak, 0) >= 10`,
    []
  );

  console.log('[boss] power week activated for qualifying Quest patients');
}

export async function deactivatePowerWeek(): Promise<void> {
  const tz = process.env.DEFAULT_TIMEZONE ?? 'America/New_York';
  const now = new Date();
  const day = new Date(now.toLocaleString('en-US', { timeZone: tz })).getDay();
  if (day !== 0) return; // Sunday only

  await query(
    `UPDATE patients SET quest_power_week = FALSE
     WHERE modality = 'quest' AND status = 'active'`,
    []
  );

  console.log('[boss] power week deactivated (Sunday reset)');
}
