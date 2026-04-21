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
    <div style="font-family:Geist,system-ui,sans-serif;max-width:640px;margin:0 auto;padding:32px 24px;background:#F4EFE6;">
      <div style="font-family:Fraunces,Georgia,serif;font-size:24px;font-weight:400;margin-bottom:24px;color:#1F2A2A;letter-spacing:-0.02em;">
        MyAdherix
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
           style="display:inline-block;padding:10px 20px;background:#3D7670;color:#F4EFE6;font-size:14px;font-weight:500;text-decoration:none;border-radius:6px;">
          Open MyAdherix →
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

// ─── Weekly clinic digest ────────────────────────────────────────────────────

export type WeeklyDigestData = {
  clinicName: string;
  weekStart: string;       // e.g. "April 13"
  weekEnd: string;         // e.g. "April 19"
  recoveredThisWeek: number;
  driftingNow: number;
  needStaffOutreach: number;
  revenueProtected30d: number;
  revenueProtectedIsModeled: boolean;
  outboundSent: number;
  inboundReceived: number;
};

export async function sendWeeklyDigest({
  to,
  data,
}: {
  to: string;
  data: WeeklyDigestData;
}): Promise<void> {
  const subject = `${data.clinicName} · Weekly retention summary — ${data.weekStart}–${data.weekEnd}`;

  const revenueSub = data.revenueProtectedIsModeled ? 'projected · last 30 days' : 'modeled · last 30 days';
  const outreachLine =
    data.needStaffOutreach > 0
      ? `<strong style="color:#c2953a;">${data.needStaffOutreach} patient${data.needStaffOutreach === 1 ? '' : 's'}</strong> need${data.needStaffOutreach === 1 ? 's' : ''} staff outreach today.`
      : `<span style="color:#4a7c5c;">No patients require staff outreach today.</span>`;

  const html = `
    <div style="font-family:Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:620px;margin:0 auto;padding:32px 24px;background:#F4EFE6;color:#1F2A2A;">
      <div style="font-family:Fraunces,Georgia,serif;font-size:24px;font-weight:400;margin-bottom:8px;color:#1F2A2A;letter-spacing:-0.02em;">
        MyAdherix · Weekly summary
      </div>
      <div style="font-size:13px;color:#6B7878;margin-bottom:28px;">
        ${data.clinicName} · ${data.weekStart}–${data.weekEnd}
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:16px 18px;background:#1e3a5f;color:white;width:50%;vertical-align:top;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.8;margin-bottom:6px;">Revenue protected</div>
            <div style="font-family:Georgia,serif;font-size:28px;line-height:1;">$${data.revenueProtected30d.toLocaleString()}</div>
            <div style="font-size:11px;opacity:0.8;margin-top:6px;">${revenueSub}</div>
          </td>
          <td style="padding:16px 18px;background:white;border:1px solid #e6e5df;width:50%;vertical-align:top;">
            <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#6b6b66;margin-bottom:6px;">Patients recovered</div>
            <div style="font-family:Georgia,serif;font-size:28px;line-height:1;color:#1e3a5f;">${data.recoveredThisWeek}</div>
            <div style="font-size:11px;color:#6b6b66;margin-top:6px;">this week</div>
          </td>
        </tr>
      </table>

      <p style="font-size:15px;line-height:1.6;margin:0 0 14px;">
        ${outreachLine}
      </p>
      <p style="font-size:14px;line-height:1.6;color:#475569;margin:0 0 22px;">
        ${data.driftingNow} patient${data.driftingNow === 1 ? '' : 's'} currently drifting · ${data.outboundSent} outbound, ${data.inboundReceived} inbound messages this week.
      </p>

      <div style="margin-top:8px;">
        <a href="${APP_URL}"
           style="display:inline-block;padding:11px 22px;background:#1e3a5f;color:white;font-size:13px;font-weight:500;text-decoration:none;margin-right:8px;">
          Open dashboard →
        </a>
        <a href="${APP_URL}/reports"
           style="display:inline-block;padding:11px 22px;background:white;color:#1e3a5f;border:1px solid #1e3a5f;font-size:13px;font-weight:500;text-decoration:none;">
          View reports
        </a>
      </div>

      <p style="margin-top:36px;font-size:11px;color:#a5a5a0;border-top:1px solid #e6e5df;padding-top:14px;line-height:1.5;">
        You are receiving this because you are the admin for ${data.clinicName}.
        Revenue figures are modeled based on $600/mo program value × 35% churn-without-intervention × 3.4 months protected tenure per recovery.
      </p>
    </div>
  `;

  await sendEmail({ to, subject, html });
}
