// Tiny CSV utility — RFC 4180-ish. No external deps.
//
// Policy:
// - Values are coerced to strings; null / undefined → empty.
// - Fields are quoted when they contain comma, quote, CR, LF, or leading/trailing whitespace.
// - Embedded quotes are doubled inside quoted fields.
// - Rows are CRLF-separated to be Excel-friendly.

export type CsvRow = Record<string, string | number | boolean | null | undefined | Date>;

function escapeField(v: unknown): string {
  if (v === null || v === undefined) return '';
  let s: string;
  if (v instanceof Date) {
    s = isNaN(v.getTime()) ? '' : v.toISOString();
  } else {
    s = String(v);
  }
  // Quote if any of these are present
  const needsQuote = /[",\r\n]/.test(s) || /^\s|\s$/.test(s);
  if (needsQuote) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function toCsv(rows: CsvRow[], columns?: string[]): string {
  if (rows.length === 0) {
    return (columns ?? []).join(',') + '\r\n';
  }
  const cols = columns ?? Object.keys(rows[0]);
  const header = cols.join(',');
  const body = rows
    .map((row) => cols.map((c) => escapeField(row[c])).join(','))
    .join('\r\n');
  return header + '\r\n' + body + '\r\n';
}

// Build a filename with the clinic slug + today's date.
export function csvFilename(base: string, clinicName: string): string {
  const slug = clinicName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const today = new Date().toISOString().slice(0, 10);
  return `${slug || 'clinic'}-${base}-${today}.csv`;
}
