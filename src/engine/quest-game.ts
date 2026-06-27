// Adherix Quest — gamification engine
// XP, levels, streaks, squads, leaderboard mechanics
// All state stored in DB. This module computes and updates it.

import { query } from '@/lib/db';

// ── Level thresholds ──────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, name: 'Rookie',      minXp: 0    },
  { level: 2, name: 'Contender',   minXp: 100  },
  { level: 3, name: 'Athlete',     minXp: 250  },
  { level: 4, name: 'Champion',    minXp: 500  },
  { level: 5, name: 'Elite',       minXp: 1000 },
];

export function getLevelFromXp(xp: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i];
  }
  return LEVELS[0];
}

// ── XP values ─────────────────────────────────────────────────────────────────
export const XP = {
  CHECKIN_REPLY:       10,
  STREAK_BONUS_5:      15,   // bonus at 5-day streak
  STREAK_BONUS_10:     25,   // bonus at 10-day streak
  STREAK_BONUS_21:     50,
  BOSS_CHALLENGE:      30,
  COMEBACK:            20,   // replied to recovery prompt
  POWER_WEEK_MULT:     2.0,  // doubles all XP during power week
  BEAST_MODE_MULT:     1.5,  // Beast Mode intensity multiplier
};

// ── Handle generator ──────────────────────────────────────────────────────────
const ADJECTIVES = [
  'quick','silent','bright','swift','bold','steady','calm','sharp',
  'iron','ghost','neon','dark','wild','solar','arctic','laser',
];
const NOUNS = [
  'hawk','wolf','peak','ridge','bolt','tide','spark','force',
  'runner','track','climb','drive','rise','quest','path','pulse',
];

export function generateHandle(): string {
  const adj  = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `@${adj}${noun}`;
}

// ── Award XP + check level up ─────────────────────────────────────────────────
export async function awardXp(
  patientId: string,
  baseXp: number,
  opts: { powerWeek?: boolean; intensity?: string } = {},
): Promise<{ newXp: number; newLevel: number; leveledUp: boolean; levelName: string }> {
  let xp = baseXp;
  if (opts.powerWeek) xp = Math.round(xp * XP.POWER_WEEK_MULT);
  if (opts.intensity === 'beast') xp = Math.round(xp * XP.BEAST_MODE_MULT);

  const result = await query<{ quest_xp: number; quest_level: number }>(
    `UPDATE patients
     SET quest_xp = COALESCE(quest_xp, 0) + $1
     WHERE id = $2
     RETURNING quest_xp, quest_level`,
    [xp, patientId]
  );

  const row = result[0];
  const current = getLevelFromXp(row.quest_xp);
  const leveledUp = current.level > row.quest_level;

  if (leveledUp) {
    await query(
      `UPDATE patients SET quest_level = $1 WHERE id = $2`,
      [current.level, patientId]
    );
  }

  return {
    newXp: row.quest_xp,
    newLevel: current.level,
    leveledUp,
    levelName: current.name,
  };
}

// ── Streak management ─────────────────────────────────────────────────────────
export async function recordCheckin(patientId: string): Promise<{
  streak: number;
  streakBonus: number;
  powerWeek: boolean;
}> {
  const rows = await query<{
    quest_streak: number;
    quest_checkin_at: string | null;
    quest_power_week: boolean;
  }>(
    `SELECT quest_streak, quest_checkin_at, quest_power_week FROM patients WHERE id = $1`,
    [patientId]
  );
  const p = rows[0];
  const lastCheckin = p.quest_checkin_at ? new Date(p.quest_checkin_at) : null;
  const now = new Date();
  const hoursSince = lastCheckin
    ? (now.getTime() - lastCheckin.getTime()) / 3_600_000
    : 999;

  // Streak continues if last checkin was within 36h (gives a cushion)
  const streak = hoursSince <= 36 ? (p.quest_streak || 0) + 1 : 1;

  let streakBonus = 0;
  if (streak === 5)  streakBonus = XP.STREAK_BONUS_5;
  if (streak === 10) streakBonus = XP.STREAK_BONUS_10;
  if (streak === 21) streakBonus = XP.STREAK_BONUS_21;

  await query(
    `UPDATE patients SET quest_streak = $1, quest_checkin_at = now() WHERE id = $2`,
    [streak, patientId]
  );

  return { streak, streakBonus, powerWeek: p.quest_power_week };
}

// ── Weekly leaderboard rebuild ────────────────────────────────────────────────
// Called by a weekly cron (Sunday midnight). Snapshots the week.
export async function rebuildLeaderboard(clinicId: string): Promise<void> {
  const weekStart = getWeekStart();

  // Pull all quest patients for this clinic
  const patients = await query<{
    id: string;
    quest_handle: string;
    quest_xp: number;
    quest_streak: number;
  }>(
    `SELECT id, quest_handle, quest_xp, quest_streak
     FROM patients
     WHERE clinic_id = $1 AND modality = 'quest' AND status = 'active'`,
    [clinicId]
  );

  if (!patients.length) return;

  // Pull previous week XP from leaderboard
  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);
  const prevRows = await query<{ patient_id: string; xp_this_week: number }>(
    `SELECT patient_id, xp_this_week FROM quest_leaderboard
     WHERE clinic_id = $1 AND week_start = $2`,
    [clinicId, prevWeekStart.toISOString().slice(0, 10)]
  );
  const prevXpMap = new Map(prevRows.map(r => [r.patient_id, r.xp_this_week]));

  // Rank by total XP (overall)
  const sorted = [...patients].sort((a, b) => b.quest_xp - a.quest_xp);

  // Rank by improvement (this week XP - last week XP)
  const byImproved = [...patients].sort((a, b) => {
    const gainA = a.quest_xp - (prevXpMap.get(a.id) || 0);
    const gainB = b.quest_xp - (prevXpMap.get(b.id) || 0);
    return gainB - gainA;
  });

  // Rank by streak
  const byStreak = [...patients].sort((a, b) => b.quest_streak - a.quest_streak);

  // Detect dark horse: top 30% improvement, bottom 50% overall last week
  const darkHorseIds = new Set<string>();
  const prevSortedIds = [...patients]
    .sort((a, b) => (prevXpMap.get(b.id)||0) - (prevXpMap.get(a.id)||0))
    .map(p => p.id);
  const bottomHalfPrev = new Set(prevSortedIds.slice(Math.floor(prevSortedIds.length / 2)));
  const topImproved = byImproved.slice(0, Math.ceil(byImproved.length * 0.3)).map(p => p.id);
  topImproved.forEach(id => { if (bottomHalfPrev.has(id)) darkHorseIds.add(id); });

  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    const rankOverall  = i + 1;
    const rankImproved = byImproved.findIndex(x => x.id === p.id) + 1;
    const rankStreak   = byStreak.findIndex(x => x.id === p.id) + 1;
    const xpPrev       = prevXpMap.get(p.id) || 0;
    // Comeback: was in bottom 30% last week, now improved
    const prevRank     = prevSortedIds.indexOf(p.id);
    const comebackFlag = prevRank >= Math.floor(patients.length * 0.7) && rankImproved <= 3;

    await query(
      `INSERT INTO quest_leaderboard
         (clinic_id, patient_id, week_start, handle, xp_this_week, xp_prev_week,
          streak, rank_overall, rank_improved, rank_streak, comeback_flag, dark_horse_flag)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (clinic_id, patient_id, week_start)
       DO UPDATE SET
         xp_this_week = EXCLUDED.xp_this_week,
         streak = EXCLUDED.streak,
         rank_overall = EXCLUDED.rank_overall,
         rank_improved = EXCLUDED.rank_improved,
         rank_streak = EXCLUDED.rank_streak,
         comeback_flag = EXCLUDED.comeback_flag,
         dark_horse_flag = EXCLUDED.dark_horse_flag`,
      [
        clinicId, p.id, weekStart, p.quest_handle, p.quest_xp, xpPrev,
        p.quest_streak, rankOverall, rankImproved, rankStreak,
        comebackFlag, darkHorseIds.has(p.id),
      ]
    );
  }
}

// ── Weekly recap message builder ──────────────────────────────────────────────
// Returns the text snippet to append to individual weekly texts
export async function buildWeeklyRecap(
  clinicId: string,
  patientId: string,
): Promise<string> {
  const weekStart = getWeekStart();
  const rows = await query<{
    rank_overall: number;
    rank_improved: number;
    rank_streak: number;
    comeback_flag: boolean;
    dark_horse_flag: boolean;
    total_patients: number;
  }>(
    `SELECT l.rank_overall, l.rank_improved, l.rank_streak,
            l.comeback_flag, l.dark_horse_flag,
            (SELECT COUNT(*) FROM quest_leaderboard
             WHERE clinic_id = $1 AND week_start = $3) as total_patients
     FROM quest_leaderboard l
     WHERE l.clinic_id = $1 AND l.patient_id = $2 AND l.week_start = $3`,
    [clinicId, patientId, weekStart]
  );

  if (!rows.length) return '';
  const r = rows[0];
  const total = Number(r.total_patients);

  // Invisible floor - don't show rank if bottom 20%
  const showRank = r.rank_overall <= Math.ceil(total * 0.8);

  let recap = '';
  if (r.comeback_flag)   recap += ' Comeback of the week.';
  if (r.dark_horse_flag) recap += ' Dark horse alert.';
  if (showRank)          recap += ` You are #${r.rank_overall} of ${total}.`;
  else                   recap += ' Keep going - you are building your rank.';

  return recap.trim();
}

function getWeekStart(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d.toISOString().slice(0, 10);
}

// ── Boss challenge opt-in ─────────────────────────────────────────────────────
export async function handleBossOptIn(patientId: string): Promise<string> {
  await query(
    `INSERT INTO trigger_firings (patient_id, trigger_key, fired_on)
     VALUES ($1, 'quest.boss_accepted', CURRENT_DATE)
     ON CONFLICT DO NOTHING`,
    [patientId]
  );
  const { newXp, levelName, leveledUp } = await awardXp(patientId, XP.BOSS_CHALLENGE);
  let msg = `Boss challenge locked in. ${XP.BOSS_CHALLENGE} XP on the line.`;
  if (leveledUp) msg += ` You just hit ${levelName}.`;
  return msg;
}

// ── Weekly recap SMS sender ───────────────────────────────────────────────────
// Called Sunday after rebuildLeaderboard(). Sends each active Quest teen
// a short rank/streak recap text queued as a pending outbound message.
export async function sendWeeklyQuestRecap(clinicId: string): Promise<void> {
  const { query: dbQuery } = await import('@/lib/db');

  const patients = await dbQuery<{ id: string; first_name: string | null }>(
    `SELECT id, first_name FROM patients
     WHERE clinic_id = $1 AND modality = 'quest' AND status = 'active'`,
    [clinicId]
  );

  for (const p of patients) {
    const recap = await buildWeeklyRecap(clinicId, p.id);
    if (!recap) continue;

    const name = p.first_name ? `${p.first_name}, ` : '';
    const body = `${name}weekly Quest recap:${recap}`;

    await dbQuery(
      `INSERT INTO messages (patient_id, direction, template_key, body, scheduled_for, status)
       VALUES ($1, 'outbound', 'quest.weekly_recap', $2, now(), 'pending')`,
      [p.id, body]
    );
  }
}

// ── Squad assignment ──────────────────────────────────────────────────────────
// On enrollment: finds a squad with < 5 active members or creates a new one.
// Squads are named Squad A, B, C... per clinic.
export async function assignToSquad(patientId: string, clinicId: string): Promise<string> {
  const { query: dbQuery, queryOne: dbQueryOne } = await import('@/lib/db');

  // Find a squad with room
  const existing = await dbQueryOne<{ id: string }>(
    `SELECT qs.id FROM quest_squads qs
     WHERE qs.clinic_id = $1
       AND (SELECT COUNT(*) FROM patients WHERE quest_squad_id = qs.id AND status = 'active') < 5
     ORDER BY qs.created_at ASC
     LIMIT 1`,
    [clinicId]
  );

  let squadId: string;
  if (existing) {
    squadId = existing.id;
  } else {
    const countRow = await dbQueryOne<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM quest_squads WHERE clinic_id = $1`,
      [clinicId]
    );
    const letter = String.fromCharCode(65 + (countRow?.count ?? 0)); // A, B, C...
    const newSquad = await dbQueryOne<{ id: string }>(
      `INSERT INTO quest_squads (clinic_id, name) VALUES ($1, $2) RETURNING id`,
      [clinicId, `Squad ${letter}`]
    );
    squadId = newSquad!.id;
  }

  await dbQuery(
    `UPDATE patients SET quest_squad_id = $1 WHERE id = $2`,
    [squadId, patientId]
  );

  return squadId;
}

// ── Squad XP sync ─────────────────────────────────────────────────────────────
// Called Sunday. Sums current quest_xp of all active squad members.
export async function updateSquadXp(clinicId: string): Promise<void> {
  const { query: dbQuery } = await import('@/lib/db');

  await dbQuery(
    `UPDATE quest_squads qs
     SET week_xp = (
       SELECT COALESCE(SUM(p.quest_xp), 0)
       FROM patients p
       WHERE p.quest_squad_id = qs.id AND p.status = 'active'
     )
     WHERE qs.clinic_id = $1`,
    [clinicId]
  );
}
