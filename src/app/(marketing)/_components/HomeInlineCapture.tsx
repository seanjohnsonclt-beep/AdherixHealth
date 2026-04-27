'use client';

import { useState } from 'react';

/**
 * Inline homepage lead capture — compact 3-field form.
 * Lives in the HomeTrustCta dark band as a low-friction alternative
 * to the full /pilot form.
 *
 * To activate:
 *   1. Create a form at formspree.io named "Adherix - Quick Capture"
 *   2. Add NEXT_PUBLIC_FORMSPREE_CAPTURE_ID=<your_form_id> to:
 *      - Vercel project env vars (Settings → Environment Variables)
 *      - .env.local for local dev
 *   3. Redeploy — no code changes needed.
 */

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_CAPTURE_ID ?? '';
const ENDPOINT = FORMSPREE_ID
  ? `https://formspree.io/f/${FORMSPREE_ID}`
  : null;

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function HomeInlineCapture() {
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ENDPOINT) return;

    setStatus('submitting');
    const form = e.currentTarget;
    const data = new FormData(form);

    const name   = String(data.get('name')   || '').trim();
    const email  = String(data.get('email')  || '').trim();
    const clinic = String(data.get('clinic') || '').trim();

    if (!name || !email) { setStatus('idle'); return; }

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          'Name':   name,
          'Email':  email,
          'Clinic': clinic || '—',
          _replyto: email,
          _subject: `Quick capture — ${name}${clinic ? ` (${clinic})` : ''}`,
        }),
      });

      if (!res.ok) throw new Error();
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="mkt-capture__success">
        <strong>You're in.</strong> We'll be in touch within 24 hours.
      </div>
    );
  }

  // If no Formspree ID is set yet, render nothing (falls back to the /pilot link)
  if (!ENDPOINT) return null;

  return (
    <form className="mkt-capture" onSubmit={onSubmit} noValidate>
      <div className="mkt-capture__fields">
        <input
          className="mkt-capture__input"
          name="name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          required
        />
        <input
          className="mkt-capture__input"
          name="email"
          type="email"
          placeholder="Work email"
          autoComplete="email"
          required
        />
        <input
          className="mkt-capture__input"
          name="clinic"
          type="text"
          placeholder="Clinic name"
          autoComplete="organization"
        />
        <button
          type="submit"
          className="mkt-btn mkt-btn--primary mkt-capture__btn"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Sending…' : 'Book a demo'}
        </button>
      </div>
      {status === 'error' && (
        <p className="mkt-capture__error">
          Something went wrong — try <a href="/pilot">the full form</a>.
        </p>
      )}
      <p className="mkt-capture__note">
        No spam. A real person responds within one business day.
      </p>
    </form>
  );
}
