// Adherix Quest — compliance-first consent layer
// Determines consent_type based on patient age and state.
// Called at enrollment and checked before every message send.
//
// COPPA:  under-13  -> parent-primary. Teen cannot self-consent.
// HIPAA minor consent varies by state:
//   - Most states: 18 is the age of medical consent
//   - WA, CA, OR, IL, ME, NV: 13+ can consent independently
//   - Some states: 14+, 16+
// This table is conservative. Legal review required before launch.

export type ConsentType = 'coppa_parent' | 'minor_self' | 'minor_parent';
export type Track = 'teen' | 'guardian' | 'both';
export type Sensitivity = 'low' | 'medium' | 'high';

// States where 13+ can consent to their own healthcare / mental health treatment.
// Source: Guttmacher Institute minor consent policy review (2024).
// NOTE: This is not legal advice. Verify with counsel before launch.
const MINOR_SELF_CONSENT_STATES_13 = new Set([
  'WA', 'CA', 'OR', 'IL', 'ME', 'NV', 'AK', 'MT',
]);

const MINOR_SELF_CONSENT_STATES_14 = new Set([
  'CO', 'MI', 'MN',
]);

const MINOR_SELF_CONSENT_STATES_16 = new Set([
  'NY', 'FL', 'TX', 'GA', 'NC', 'OH', 'PA', 'VA',
]);

export function getConsentType(age: number, state: string): ConsentType {
  const s = state.toUpperCase();
  if (age < 13) return 'coppa_parent';
  if (age >= 18) return 'minor_self'; // legal adult
  if (MINOR_SELF_CONSENT_STATES_13.has(s) && age >= 13) return 'minor_self';
  if (MINOR_SELF_CONSENT_STATES_14.has(s) && age >= 14) return 'minor_self';
  if (MINOR_SELF_CONSENT_STATES_16.has(s) && age >= 16) return 'minor_self';
  // Default: parent consent required
  return 'minor_parent';
}

export function getPatientAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

// Which tracks are active for this consent type
export function getActiveTracks(consentType: ConsentType): Track[] {
  if (consentType === 'coppa_parent') return ['guardian']; // parent-primary under 13
  if (consentType === 'minor_parent') return ['teen', 'guardian'];
  return ['teen', 'guardian']; // minor_self: teen drives, guardian gets summary
}

// Whether a message at a given sensitivity level should be suppressed
// based on consent type and recipient track
export function shouldSuppress(
  sensitivity: Sensitivity,
  track: Track,
  consentType: ConsentType,
): boolean {
  // Under 13: all messages go to guardian only, teen track fully suppressed
  if (consentType === 'coppa_parent' && track === 'teen') return true;
  // High-sensitivity messages to guardian only if teen can self-consent
  // (guardian still gets low/medium summaries, not clinical detail)
  if (sensitivity === 'high' && track === 'guardian' && consentType === 'minor_self') return true;
  return false;
}

// Message body sanitization - strip PHI from guardian-track messages
// Guardian sees summary and level, not clinical content
export function sanitizeForGuardian(body: string): string {
  // Remove weight references
  body = body.replace(/\b\d+\s*(lbs?|pounds?|kg)\b/gi, '[weight]');
  // Remove dose references
  body = body.replace(/\b\d+(\.\d+)?\s*(mg|mcg|ml|units?)\b/gi, '[dose]');
  return body;
}
