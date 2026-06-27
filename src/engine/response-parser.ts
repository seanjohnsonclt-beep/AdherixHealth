// Centralized inbound SMS response parser.
// Used by inbound webhook, Quest check-in handler, and any future reply-gate logic.
// Single source of truth for how patient/guardian text replies are classified.

export type YesNo = 'yes' | 'no' | 'other';
export type QuestIntensity = 'chill' | 'standard' | 'beast';

const STOP_WORDS = new Set([
  'STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'HELP',
]);

/** Classify a raw SMS body as yes / no / other. */
export function parseYesNo(raw: string): YesNo {
  const first = raw.trim().split(/\s+/)[0]?.toUpperCase() ?? '';
  if (!first || STOP_WORDS.has(first)) return 'other';

  if (/^(YES|YEP|YUP|YA|YEAH|DONE|CONFIRMED|TOOK|DID|INJECTED|Y|1)$/.test(first)) return 'yes';
  if (/^(NO|NOPE|MISSED|SKIP|SKIPPED|DIDNT|DIDN|N|2)$/.test(first)) return 'no';

  return 'other';
}

/** Parse a Quest intensity selection reply. */
export function parseQuestIntensity(raw: string): QuestIntensity | null {
  const norm = raw.trim().toUpperCase();
  if (/^(1|CHILL|C|EASY|LOW)$/.test(norm))           return 'chill';
  if (/^(2|STANDARD|S|NORMAL|MED|MEDIUM)$/.test(norm)) return 'standard';
  if (/^(3|BEAST|B|HARD|MAX|FULL)$/.test(norm))       return 'beast';
  return null;
}

/** Parse a 1-5 rating reply (weekly check-in "how are you doing" scale). */
export function parseRating(raw: string): number | null {
  const trimmed = raw.trim();
  const n = parseInt(trimmed, 10);
  if (!isNaN(n) && n >= 1 && n <= 5 && String(n) === trimmed) return n;
  return null;
}

/** True if the reply is a Twilio opt-out keyword (we should not respond). */
export function isOptOut(raw: string): boolean {
  return STOP_WORDS.has(raw.trim().toUpperCase());
}
