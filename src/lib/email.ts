// Lightweight alert email via Resend REST API.
// No npm package — just fetch.
//
// Setup:
//   1. Sign up at resend.com (free tier: 100 emails/day)
//   2. Create an API key
//   3. Add RESEND_API_KEY to Vercel env vars
//   4. Optionally add RESEND_FROM once you verify a domain (e.g. alerts@adherix.health)
//      Until then, Resend's shared sender is used automatically.
//
// If RESEND_API_KEY is not set, emails are logged but not sent (safe for dry-run).

const FROM = process.env.RESEND_FROM || 'Adherix Alerts <onboarding@resend.dev>';
const APP_URL = process.env.APP_URL || 'https://adherix-health.vercel.app';

type Email = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: Email): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email] no RESEND_API_KEY — skipping alert to ${to}: ${subject}`);
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] send failed (${res.status}): ${body}`);
    } else {
      console.log(`[email] sent to ${to}: ${subject}`);
    }
  } catch (err) {
    console.error('[email] network error:', err);
  }
}

// ─── Alert templates ──────────────────────────────────────────────────────────

export type FailureRecord = {
  messageId: string;
  patientId: string;
  firstName: string | null;
  templateKey: string | null;
  error: string;
};

export async function sendDeliveryFailureAlert({
  to,
  clinicName,
  failures,
}: {
  to: string;
  clinicName: string;
  failures: FailureRecord[];
}): Promise<void> {
  const count = failures.length;
  const subject = `Adherix — ${count} message delivery failure${count > 1 ? 's' : ''} for ${clinicName}`;

  const rows = failures
    .map(
      (f) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e6e5df;font-size:14px;">
          ${f.firstName || 'Unknown'}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e6e5df;font-size:13px;font-family:monospace;color:#6b6b66;">
          ${f.templateKey || '—'}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e6e5df;font-size:13px;color:#c8341c;">
          ${f.error}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #e6e5df;font-size:13px;">
          <a href="${APP_URL}/patients/${f.patientId}" style="color:#111110;">View patient →</a>
        </td>
      </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:640px;margin:0 auto;padding:32px 24px;background:#fafaf7;">
      <div style="font-family:Georgia,serif;font-size:22px;font-weight:500;margin-bottom:24px;">
        Adherix<sup style="font-size:11px;color:#6b6b66;">℞</sup>
      </div>

      <p style="font-size:15px;color:#111110;margin-bottom:8px;">
        <strong>${count} message${count > 1 ? 's' : ''} failed to deliver</strong> for <strong>${clinicName}</strong>.
      </p>
      <p style="font-size:14px;color:#6b6b66;margin-bottom:24px;">
        The patients listed below did not receive their scheduled texts.
        Log in to review and take action.
      </p>

      <table style="width:100%;border-collapse:collapse;background:white;border:1px solid #e6e5df;">
        <thead>
          <tr style="background:#f5f5f0;">
            <th style="text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6b6b66;font-weight:500;">Patient</th>
            <th style="text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6b6b66;font-weight:500;">Template</th>
            <th style="text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6b6b66;font-weight:500;">Error</th>
            <th style="text-align:left;padding:8px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6b6b66;font-weight:500;"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="margin-top:24px;">
        <a href="${APP_URL}"
           style="display:inline-block;padding:10px 20px;background:#111110;color:#fafaf7;font-size:14px;font-weight:500;text-decoration:none;">
          Open Adherix →
        </a>
      </div>

      <p style="margin-top:32px;font-size:12px;color:#a5a5a0;border-top:1px solid #e6e5df;padding-top:16px;">
        This alert was sent because one or more outbound messages failed during the last engine tick.
        You are receiving this because you are the admin for ${clinicName}.
      </p>
    </div>
  `;

  await sendEmail({ to, subject, html });
}
