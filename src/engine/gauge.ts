// Adherix Gauge - weight tracking engine
//
// Handles weight reply parsing and milestone detection.
// Called from the inbound SMS handler when a patient texts back a weight.
//
// Flow:
//   1. Patient receives gauge.weekly_checkin prompt
//   2. Patient replies with a number (e.g. "185" or "185.5")
//   3. inbound handler calls parseWeightReply() to detect it
//   4. inbound handler calls handleWeightReply() to log + check milestones
//   5. gauge queues a congratulatory or supportive SMS if milestone hit

import { query, queryOne } from '@/lib/db';

// --- Weight parsing -----------------------------------------------------------

/**
 * Returns a weight in lbs if the SMS body looks like a weight reply.
 * Accepts: "185", "185.5", "185 lbs", "185.5 pounds", "185lb"
 * Rejects: scale replies (single digit 1-5), "YES", "NO", etc.
 */
export function parseWeightReply(body: string): number | null {
  const trimmed = body.trim().toLowerCase();

  // Strip optional unit suffix
  const stripped = trimmed
    .replace(/\s*(lbs?|pounds?)\s*$/i, '')
    .trim();

  // Must be a pure decimal number
  if (!/^\d{2,3}(\.\d)?$/.test(stripped)) return null;

  const val = parseFloat(stripped);

  // Sanity range: 80-500 lbs covers virtually all patients
  if (val < 80 || val > 500) return null;

  return val;
}

/**
 * Returns true if the patient has a pending gauge check-in sent within the
 * last 48 hours. Prevents random number replies from being logged as weight.
 */
export async function hasPendingGaugeCheckin(patientId: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    `select id from messages
     where patient_id = $1
       and direction   = 'outbound'
       and template_key = 'gauge.weekly_checkin'
       and sent_at > now() - interval '48 hours'
     limit 1`,
    [patientId]
  );
  return !!row;
}

// --- Milestone detection ------------------------------------------------------

type WeightStats = {
  startingWeight:  number;
  currentWeight:   number;
  lbsLost:         number;
  totalLogs:       number;
  weeklyAvgLoss:   number | null; // null if < 3 weeks of data
};

async function getWeightStats(patientId: string, newWeight: number): Promise<WeightStats | null> {
  const patient = await queryOne<{
    starting_weight_lbs: string | null;
  }>(
    `select starting_weight_lbs from patients where id = $1`,
    [patientId]
  );

  if (!patient?.starting_weight_lbs) return null;

  const startingWeight = parseFloat(patient.starting_weight_lbs);
  const lbsLost = parseFloat((startingWeight - newWeight).toFixed(1));

  // Count prior logs for weekly average
  const logRows = await query<{ weight_lbs: string; logged_at: string }>(
    `select weight_lbs, logged_at from weight_logs
     where patient_id = $1
     order by logged_at asc`,
    [patientId]
  );

  const totalLogs = logRows.length + 1; // +1 for the one we're about to insert

  let weeklyAvgLoss: number | null = null;
  if (logRows.length >= 2) {
    const firstLog = logRows[0];
    const firstWeight = parseFloat(firstLog.weight_lbs);
    const firstDate = new Date(firstLog.logged_at);
    const weeksElapsed = (Date.now() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000);
    if (weeksElapsed >= 1) {
      weeklyAvgLoss = parseFloat(((firstWeight - newWeight) / weeksElapsed).toFixed(1));
    }
  }

  return { startingWeight, currentWeight: newWeight, lbsLost, totalLogs, weeklyAvgLoss };
}

type Milestone =
  | 'first_log'
  | 'lbs_5'
  | 'lbs_10'
  | 'lbs_25'
  | 'pct_10'
  | 'pct_20'
  | 'weekly_avg_strong'
  | 'plateau';

/**
 * Determines which milestone (if any) to celebrate.
 * Returns only the highest-value milestone to avoid message overload.
 */
function detectMilestone(stats: WeightStats, isFirstLog: boolean): Milestone | null {
  if (isFirstLog) return 'first_log';

  const { lbsLost, startingWeight, totalLogs, weeklyAvgLoss } = stats;
  const pctLost = (lbsLost / startingWeight) * 100;

  // Plateau: scale hasn't moved at all (or gained) since last log
  if (lbsLost <= 0 && totalLogs >= 3) return 'plateau';

  // Highest-value milestone first
  if (pctLost >= 20)   return 'pct_20';
  if (pctLost >= 10)   return 'pct_10';
  if (lbsLost >= 25)   return 'lbs_25';
  if (lbsLost >= 10)   return 'lbs_10';
  if (lbsLost >= 5)    return 'lbs_5';

  // Strong weekly average: 3+ logs, averaging 1.5+ lbs/week
  if (totalLogs >= 3 && weeklyAvgLoss !== null && weeklyAvgLoss >= 1.5) {
    return 'weekly_avg_strong';
  }

  return null;
}

function buildMilestoneMessage(milestone: Milestone, stats: WeightStats, firstName: string): string {
  const { lbsLost, startingWeight, weeklyAvgLoss } = stats;
  const pctLost = Math.round((lbsLost / startingWeight) * 100);

  switch (milestone) {
    case 'first_log':
      return `Got it, ${firstName}. Starting weight locked in. Text your weight every week and we'll track your progress together.`;

    case 'lbs_5':
      return `${firstName} - down ${lbsLost} lbs since you started. The medication is doing its job. Keep going.`;

    case 'lbs_10':
      return `10 lbs down, ${firstName}. Most people notice a real difference at this point. Stay consistent - this is where it compounds.`;

    case 'lbs_25':
      return `${firstName} - ${lbsLost} lbs. That's a meaningful number. The habits you've built are carrying this now.`;

    case 'pct_10':
      return `${firstName} - you've lost ${pctLost}% of your starting weight. That's the threshold where health outcomes actually shift. You're there.`;

    case 'pct_20':
      return `${firstName} - ${pctLost}% of your starting weight gone. That's exceptional. You're in rare company. Keep the same habits that got you here.`;

    case 'weekly_avg_strong':
      return `${firstName} - averaging ${weeklyAvgLoss} lbs/week. That's above the typical range for this medication. The consistency is showing.`;

    case 'plateau':
      return `Scale holding steady this week, ${firstName} - that's normal on GLP-1s. Plateaus break when you stay consistent. Same habits, same check-ins.`;
  }
}

// --- Milestone dedup ---------------------------------------------------------
// Prevents the same milestone firing twice. Uses trigger_firings with a
// very long dedupe window (8760h = 1 year) so milestones fire once each.

async function milestoneAlreadyFired(patientId: string, milestone: Milestone): Promise<boolean> {
  const key = `gauge_milestone_${milestone}`;
  const rows = await query<{ count: string }>(
    `select count(*)::text from trigger_firings
     where patient_id = $1 and trigger_key = $2`,
    [patientId, key]
  );
  return Number(rows[0].count) > 0;
}

async function recordMilestoneFiring(patientId: string, milestone: Milestone) {
  const key = `gauge_milestone_${milestone}`;
  const dedupe = `${key}:${new Date().toISOString().slice(0, 10)}`;
  await query(
    `insert into trigger_firings (patient_id, trigger_key, dedupe_key)
     values ($1, $2, $3)
     on conflict (patient_id, dedupe_key) do nothing`,
    [patientId, key, dedupe]
  );
}

// --- Main entry point ---------------------------------------------------------

export async function handleWeightReply(patientId: string, weightLbs: number): Promise<void> {
  const patient = await queryOne<{
    first_name:          string | null;
    starting_weight_lbs: string | null;
  }>(
    `select first_name, starting_weight_lbs from patients where id = $1`,
    [patientId]
  );

  if (!patient) return;
  const firstName = patient.first_name ?? 'there';
  const isFirstLog = !patient.starting_weight_lbs;

  // Set starting weight on first log
  if (isFirstLog) {
    await query(
      `update patients set starting_weight_lbs = $1 where id = $2`,
      [weightLbs, patientId]
    );
  }

  // Insert weight log
  const startingWeight = isFirstLog ? weightLbs : parseFloat(patient.starting_weight_lbs!);
  const lbsLostAtLog = parseFloat((startingWeight - weightLbs).toFixed(1));

  await query(
    `insert into weight_logs (patient_id, weight_lbs, lbs_lost_at_log)
     values ($1, $2, $3)`,
    [patientId, weightLbs, lbsLostAtLog]
  );

  // Update last_weight_logged_at on patient
  await query(
    `update patients set last_weight_logged_at = now() where id = $1`,
    [patientId]
  );

  // Log event for analytics
  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'weight_logged', $2)`,
    [patientId, JSON.stringify({ weight_lbs: weightLbs, lbs_lost: lbsLostAtLog })]
  );

  // Get stats for milestone detection
  const stats = await getWeightStats(patientId, weightLbs);

  // Detect and queue milestone message
  const milestone = stats ? detectMilestone(stats, isFirstLog) : (isFirstLog ? 'first_log' : null);

  if (milestone) {
    const alreadyFired = await milestoneAlreadyFired(patientId, milestone);
    if (!alreadyFired) {
      const messageBody = buildMilestoneMessage(
        milestone,
        stats ?? { startingWeight: weightLbs, currentWeight: weightLbs, lbsLost: 0, totalLogs: 1, weeklyAvgLoss: null },
        firstName
      );

      await query(
        `insert into messages (patient_id, direction, template_key, body, scheduled_for, status)
         values ($1, 'outbound', $2, $3, now(), 'pending')`,
        [patientId, `gauge.milestone_${milestone}`, messageBody]
      );

      await recordMilestoneFiring(patientId, milestone);
      console.log(`[gauge] milestone ${milestone} queued for patient ${patientId}`);
    }
  }

  console.log(`[gauge] weight ${weightLbs} lbs logged for patient ${patientId}`);
}
