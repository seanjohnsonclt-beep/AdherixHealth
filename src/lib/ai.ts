// AI message personalization layer.
//
// Rewrites outbound SMS bodies using the full patient behavioral context
// already tracked by the engine: phase, trajectory, medication category,
// titration timing, adherence signals, injection streak, weight progress,
// and recent reply history.
//
// Runs at SEND TIME (not schedule time) so context is always current.
// Falls back to the original template body on any failure.
// No ANTHROPIC_API_KEY = silent passthrough.

import Anthropic from '@anthropic-ai/sdk';
import { query } from './db';

let _client: Anthropic | null = null;

function client(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

// Map specific medication keys to de-identified treatment categories.
// Never sends drug names or doses to the AI.
function medicationCategory(medication: string | null): string {
  if (!medication) return 'weight management program';
  const m = medication.toLowerCase();
  if (m.includes('oral') || m.includes('rybelsus')) return 'daily oral medication';
  if (m.includes('liraglutide') || m.includes('saxenda') || m.includes('victoza')) return 'daily injectable';
  if (m.includes('phentermine') || m.includes('topiramate') || m.includes('qsymia') ||
      m.includes('contrave') || m.includes('orlistat') || m.includes('berberine') ||
      m.includes('metformin')) return 'daily oral weight management medication';
  if (m.includes('bariatric') || m.includes('supplement') || m.includes('protein')) return 'post-surgical nutrition protocol';
  // Default: weekly injectable (covers semaglutide, tirzepatide, dulaglutide, exenatide)
  return 'weekly injectable';
}

function modalityLabel(modality: string | null): string {
  switch (modality) {
    case 'bariatric':         return 'bariatric surgery recovery';
    case 'pharmacotherapy':   return 'weight management pharmacotherapy';
    case 'behavioral_therapy':return 'behavioral weight therapy';
    case 'metabolic_health':  return 'metabolic health / pre-diabetes prevention';
    default:                  return 'GLP-1 weight management';
  }
}

export type PersonalizeParams = {
  body: string;
  firstName: string;
  phaseName: string;
  daysInPhase: number;
  recentReplies: string[];
  // Rich context from existing engine signals
  engagementTrajectory: 'responsive' | 'inconsistent' | 'declining' | null;
  medicationKey: string | null;
  modality: string | null;
  daysSinceTitration: number | null;
  consecutiveMisses: number;
  injectionStreak: number;
  daysEnrolled: number;
  // Gauge weight context
  lbsLost: number | null;
  pctLost: number | null;
  recentMilestone: string | null;
};

export async function personalizeMessage(params: PersonalizeParams): Promise<{ body: string; personalized: boolean }> {
  const ai = client();
  if (!ai) return { body: params.body, personalized: false };

  const {
    body, firstName, phaseName, daysInPhase, recentReplies,
    engagementTrajectory, medicationKey, modality,
    daysSinceTitration, consecutiveMisses, injectionStreak, daysEnrolled,
    lbsLost, pctLost, recentMilestone,
  } = params;

  const treatmentType = medicationCategory(medicationKey);
  const programType = modalityLabel(modality);

  const replyContext = recentReplies.length > 0
    ? `Recent patient replies: "${recentReplies.slice(0, 3).join(' | ')}"`
    : 'No recent replies from patient yet.';

  const trajectoryNote = engagementTrajectory === 'declining'
    ? 'Patient engagement is declining - fewer replies recently. Keep tone low-pressure and non-judgmental.'
    : engagementTrajectory === 'inconsistent'
    ? 'Patient replies are inconsistent - engaged sometimes, quiet other times.'
    : engagementTrajectory === 'responsive'
    ? 'Patient has been consistently responsive and engaged.'
    : '';

  const titrationNote = daysSinceTitration !== null && daysSinceTitration <= 7
    ? `Patient recently had a dose adjustment (${daysSinceTitration} days ago) - they may be in an adjustment window.`
    : '';

  const missNote = consecutiveMisses >= 2
    ? `Patient has missed ${consecutiveMisses} consecutive doses - keep tone supportive, not pressuring.`
    : '';

  const streakNote = injectionStreak >= 3
    ? `Patient has confirmed ${injectionStreak} consecutive doses in a row - you can acknowledge this consistency naturally if it fits the message.`
    : '';

  const tenureNote = daysEnrolled > 0
    ? `Patient has been in the program for ${daysEnrolled} days.`
    : '';

  // Weight progress context - never mention specific numbers unless milestone just fired
  const weightNote = recentMilestone
    ? `Patient just hit a weight milestone (${recentMilestone}) - you may reference their progress naturally if it fits.`
    : lbsLost !== null && lbsLost >= 5
    ? `Patient has made meaningful weight progress (${Math.round(lbsLost)} lbs lost${pctLost ? ', ' + pctLost.toFixed(1) + '% of starting weight' : ''}).`
    : '';

  try {
    const response = await ai.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 120,
      messages: [{
        role: 'user',
        content: `You are the message engine for a ${programType} adherence program. Rewrite this SMS to feel more relevant to this specific patient while keeping the exact same intent and reply format.

Patient: ${firstName}
Treatment type: ${treatmentType}
Program phase: ${phaseName} (day ${daysInPhase})
${tenureNote}
${replyContext}
${trajectoryNote}
${titrationNote}
${missNote}
${streakNote}
${weightNote}

Original message:
${body}

Rules:
- Stay under 160 characters total
- Keep the same call to action and any reply format (Y/N, YES/NO, a number, etc.)
- No medication names, drug names, or dose amounts
- Tone should match the patient's engagement pattern
- If the patient has a streak or weight progress, you may acknowledge naturally - but don't make it sound like a trophy ceremony
- Direct and specific - not motivational-speaker-y
- Return ONLY the final SMS text. No quotes, no explanation.`,
      }],
    });

    const text = (response.content[0] as Anthropic.TextBlock).text?.trim();

    if (!text || text.length > 220 || text.length < 10) {
      console.warn('[ai] personalization returned unexpected length, using template');
      return { body, personalized: false };
    }

    return { body: text, personalized: true };
  } catch (err) {
    console.error('[ai] personalization failed, using template:', err instanceof Error ? err.message : err);
    return { body, personalized: false };
  }
}

export async function fetchRecentReplies(patientId: string, limit = 4): Promise<string[]> {
  const rows = await query<{ body: string }>(
    `select body from messages
     where patient_id = $1 and direction = 'inbound'
     order by created_at desc
     limit $2`,
    [patientId, limit]
  );
  return rows.map(r => r.body);
}

export async function fetchWeightContext(patientId: string): Promise<{
  lbsLost: number | null;
  pctLost: number | null;
  recentMilestone: string | null;
}> {
  try {
    const patient = await query<{ starting_weight_lbs: string | null }>(
      `select starting_weight_lbs from patients where id = $1`,
      [patientId]
    );
    const startingWeight = patient[0]?.starting_weight_lbs
      ? parseFloat(patient[0].starting_weight_lbs)
      : null;

    if (!startingWeight) return { lbsLost: null, pctLost: null, recentMilestone: null };

    // Most recent weight log
    const logs = await query<{ weight_lbs: string; logged_at: string }>(
      `select weight_lbs, logged_at from weight_logs
       where patient_id = $1
       order by logged_at desc
       limit 1`,
      [patientId]
    );
    if (!logs.length) return { lbsLost: null, pctLost: null, recentMilestone: null };

    const currentWeight = parseFloat(logs[0].weight_lbs);
    const lbsLost = startingWeight - currentWeight;
    const pctLost = (lbsLost / startingWeight) * 100;

    // Check if a gauge milestone fired in the last 7 days
    const recentFiring = await query<{ trigger_key: string }>(
      `select trigger_key from trigger_firings
       where patient_id = $1
         and trigger_key like 'gauge_milestone_%'
         and fired_on >= current_date - interval '7 days'
       order by fired_on desc
       limit 1`,
      [patientId]
    );

    const milestoneMap: Record<string, string> = {
      gauge_milestone_first_log:    'first weight logged',
      gauge_milestone_lbs_5:        '5 lbs lost',
      gauge_milestone_lbs_10:       '10 lbs lost',
      gauge_milestone_lbs_25:       '25 lbs lost',
      gauge_milestone_pct_10:       '10% body weight lost',
      gauge_milestone_pct_20:       '20% body weight lost',
    };

    const recentMilestone = recentFiring.length
      ? (milestoneMap[recentFiring[0].trigger_key] ?? null)
      : null;

    return { lbsLost, pctLost, recentMilestone };
  } catch {
    return { lbsLost: null, pctLost: null, recentMilestone: null };
  }
}
