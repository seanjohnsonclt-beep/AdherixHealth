// AI message personalization layer.
//
// Rewrites outbound SMS bodies using the full patient behavioral context
// already tracked by the engine: phase, trajectory, medication category,
// titration timing, adherence signals, injection streak, and recent reply history.
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
};

export async function personalizeMessage(params: PersonalizeParams): Promise<{ body: string; personalized: boolean }> {
  const ai = client();
  if (!ai) return { body: params.body, personalized: false };

  const {
    body, firstName, phaseName, daysInPhase, recentReplies,
    engagementTrajectory, medicationKey, modality,
    daysSinceTitration, consecutiveMisses, injectionStreak, daysEnrolled,
  } = params;

  const treatmentType = medicationCategory(medicationKey);
  const programType = modalityLabel(modality);

  const replyContext = recentReplies.length > 0
    ? `Recent patient replies: "${recentReplies.slice(0, 3).join('" | "')}"`
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

  // Streak note: only mention if meaningful (3+). Let the AI celebrate the behavior,
  // not the outcome - that's what Gauge is for.
  const streakNote = injectionStreak >= 3
    ? `Patient has confirmed ${injectionStreak} consecutive doses in a row - you can acknowledge this consistency naturally if it fits the message.`
    : '';

  const tenureNote = daysEnrolled > 0
    ? `Patient has been in the program for ${daysEnrolled} days.`
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

Original message:
${body}

Rules:
- Stay under 160 characters total
- Keep the same call to action and any reply format (Y/N, YES/NO, a number, etc.)
- No medication names, drug names, or dose amounts
- Tone should match the patient's engagement pattern
- If the patient has a streak, you may acknowledge the behavior naturally - but don't make it sound like a trophy ceremony
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
