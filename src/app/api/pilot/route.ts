import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

/**
 * POST /api/pilot
 *
 * Accepts a pilot-request submission from the public marketing site and
 * forwards it to the Adherix team over email (Resend).
 *
 * Conservative by design:
 *   - No database writes (we keep the public API surface small)
 *   - Basic input validation + length caps
 *   - Quiet no-op in dry-run (no RESEND_API_KEY) so local dev doesn't break
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PILOT_INBOX =
  process.env.PILOT_INBOX_EMAIL ||
  process.env.ADHERIX_CONTACT_EMAIL ||
  'seanjohnsonclt@gmail.com';

type PilotPayload = {
  fullName?: string;
  email?: string;
  clinicName?: string;
  role?: string;
  phone?: string;
  patients?: string;
  notes?: string;
};

const MAX_LEN = 2000;

function clean(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, MAX_LEN);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: Request) {
  let body: PilotPayload;
  try {
    body = (await req.json()) as PilotPayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const fullName   = clean(body.fullName);
  const email      = clean(body.email);
  const clinicName = clean(body.clinicName);
  const role       = clean(body.role);
  const phone      = clean(body.phone);
  const patients   = clean(body.patients);
  const notes      = clean(body.notes);

  if (!fullName || !email || !clinicName) {
    return NextResponse.json(
      { ok: false, error: 'Name, email, and clinic name are required.' },
      { status: 400 },
    );
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: 'Please provide a valid email address.' },
      { status: 400 },
    );
  }

  const rows: Array<[string, string]> = [
    ['Name', fullName],
    ['Email', email],
    ['Clinic', clinicName],
    ['Role', role || '—'],
    ['Phone', phone || '—'],
    ['Active GLP-1 patients', patients || '—'],
  ];

  const rowsHtml = rows
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e6e5df;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#6b6b66;width:180px;">${escapeHtml(k)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e6e5df;font-size:15px;color:#0b2540;">${escapeHtml(v)}</td>
      </tr>`,
    )
    .join('');

  const notesHtml = notes
    ? `
      <div style="margin-top:18px;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#6B7878;margin-bottom:6px;">
          What they want to prove
        </div>
        <div style="background:#fff;border:1px solid #E0D9CA;border-radius:6px;padding:14px 16px;font-size:14.5px;line-height:1.6;white-space:pre-wrap;color:#1F2A2A;">
          ${escapeHtml(notes)}
        </div>
      </div>`
    : '';

  const subject = `Adherix — Demo request from ${fullName} (${clinicName})`;
  const html = `
    <div style="font-family:Geist,system-ui,sans-serif;max-width:640px;margin:0 auto;padding:28px 24px;background:#F4EFE6;">
      <div style="font-family:Fraunces,Georgia,serif;font-size:24px;font-weight:400;margin-bottom:18px;color:#1F2A2A;letter-spacing:-0.02em;">
        Adherix
      </div>
      <p style="font-size:15px;color:#1F2A2A;margin:0 0 18px;">
        New demo request from <strong>${escapeHtml(fullName)}</strong> at <strong>${escapeHtml(clinicName)}</strong>.
      </p>

      <table style="width:100%;border-collapse:collapse;background:white;border:1px solid #E0D9CA;border-radius:6px;overflow:hidden;">
        <tbody>${rowsHtml}</tbody>
      </table>

      ${notesHtml}

      <p style="margin-top:28px;font-size:12px;color:#6B7878;border-top:1px solid #E0D9CA;padding-top:14px;">
        Submitted from the Adherix Health marketing site (/pilot).
      </p>
    </div>
  `;

  try {
    await sendEmail({ to: PILOT_INBOX, subject, html });
  } catch (err) {
    console.error('[api/pilot] email send failed:', err);
    // Non-fatal to the user: log and keep 200 so the form doesn't look
    // broken in the rare case Resend is down.
  }

  return NextResponse.json({ ok: true });
}
