import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/patients/parse-import
 *
 * Accepts a PDF file (multipart/form-data, field "file").
 * Extracts text and heuristically parses patient rows:
 *   - Looks for phone number patterns (10-digit US numbers)
 *   - Tries to grab a name from the same or adjacent line
 *
 * Returns: { rows: Array<{ first_name, phone }> }
 * The client shows a preview for the user to review and edit before importing.
 */

// Phone number patterns we recognise
const PHONE_RE = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;

function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return digits.length >= 10 ? `+${digits}` : '';
}

function extractName(line: string, phonePart: string): string {
  // Remove the phone substring and any surrounding punctuation/whitespace
  const cleaned = line.replace(phonePart, '').replace(/[,|:;\t]+/g, ' ').trim();
  // If what's left looks like a name (2–40 chars, mostly letters/spaces), keep it
  if (cleaned.length >= 2 && cleaned.length <= 40 && /^[a-zA-Z\s'-]+$/.test(cleaned)) {
    return cleaned;
  }
  return '';
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    // Try to parse as PDF using dynamic import of pdf-parse
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const parsed = await pdfParse(buffer);
      text = parsed.text;
    } catch {
      // pdf-parse not installed or not a valid PDF — try treating as plain text
      text = buffer.toString('utf-8');
    }

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const rows: { first_name: string; phone: string }[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const matches = [...line.matchAll(PHONE_RE)];

      for (const match of matches) {
        const phone = normalisePhone(match[0]);
        if (!phone || seen.has(phone)) continue;
        seen.add(phone);

        // Try to extract name from same line
        let firstName = extractName(line, match[0]);

        // If not found on same line, check the line above
        if (!firstName && i > 0) {
          const prev = lines[i - 1];
          if (/^[a-zA-Z\s'-]+$/.test(prev) && prev.length <= 40) {
            firstName = prev.trim();
          }
        }

        rows.push({ first_name: firstName, phone });
      }
    }

    return NextResponse.json({ rows });
  } catch (err) {
    console.error('[parse-import]', err);
    return NextResponse.json({ error: 'Failed to parse file' }, { status: 500 });
  }
}
