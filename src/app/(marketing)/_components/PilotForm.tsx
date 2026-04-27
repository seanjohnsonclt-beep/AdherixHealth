'use client';

import { useState } from 'react';

/**
 * Request a Demo form — powered by Formspree.
 *
 * To activate:
 *   1. Create a form at formspree.io named "Adherix - Demo Request"
 *   2. Add NEXT_PUBLIC_FORMSPREE_PILOT_ID=<your_form_id> to:
 *      - Vercel project env vars (Settings → Environment Variables)
 *      - .env.local for local dev
 *   3. Redeploy — no code changes needed.
 *
 * Formspree handles: email notification, spam filtering, submission history, CSV export.
 */

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_PILOT_ID ?? '';
const ENDPOINT = FORMSPREE_ID
  ? `https://formspree.io/f/${FORMSPREE_ID}`
  : '/api/pilot'; // fallback to old route until ID is set

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function PilotForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setStatus('submitting');

    const form = e.currentTarget;
    const data = new FormData(form);

    const fullName   = String(data.get('fullName')   || '').trim();
    const email      = String(data.get('email')      || '').trim();
    const clinicName = String(data.get('clinicName') || '').trim();
    const role       = String(data.get('role')       || '').trim();
    const phone      = String(data.get('phone')      || '').trim();
    const patients   = String(data.get('patients')   || '').trim();
    const notes      = String(data.get('notes')      || '').trim();

    if (!fullName || !email || !clinicName) {
      setStatus('error');
      setErrorMsg('Please fill in your name, email, and clinic name.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setStatus('error');
      setErrorMsg('That email doesn\u2019t look right. Double-check it?');
      return;
    }

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          // Human-readable field names for Formspree email notifications
          'Full name':     fullName,
          'Work email':    email,
          'Clinic':        clinicName,
          'Role':          role,
          'Phone':         phone || '—',
          'Patient count': patients || '—',
          'Notes':         notes || '—',
          // Formspree magic fields
          _replyto:        email,
          _subject:        `Demo request — ${fullName} (${clinicName})`,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error((body as any)?.error || `Request failed (${res.status})`);
      }

      setStatus('success');
      form.reset();
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Try emailing demos@adherixhealth.com directly.');
    }
  }

  if (status === 'success') {
    return (
      <div className="mkt-form__success">
        <strong>Thanks — your request is in.</strong>
        <div style={{ marginTop: 6, fontSize: 14 }}>
          Someone from the Adherix team will be in touch within one business day to schedule a demo.
        </div>
      </div>
    );
  }

  return (
    <form className="mkt-form" onSubmit={onSubmit} noValidate>
      <div className="mkt-form__row">
        <div>
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="Dr. Jane Morrison"
          />
        </div>
        <div>
          <label htmlFor="email">Work email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="jane@yourclinic.com"
          />
        </div>
      </div>

      <div className="mkt-form__row">
        <div>
          <label htmlFor="clinicName">Clinic or program</label>
          <input
            id="clinicName"
            name="clinicName"
            type="text"
            autoComplete="organization"
            required
            placeholder="Wellspring Metabolic"
          />
        </div>
        <div>
          <label htmlFor="role">Your role</label>
          <select id="role" name="role" defaultValue="">
            <option value="" disabled>Select one</option>
            <option value="owner">Owner / founder</option>
            <option value="clinician">Clinician / MD / NP</option>
            <option value="ops">Operations / practice manager</option>
            <option value="marketing">Marketing / growth</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="mkt-form__row">
        <div>
          <label htmlFor="phone">Phone (optional)</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(555) 555-0123"
          />
        </div>
        <div>
          <label htmlFor="patients">Approx. active GLP-1 patients</label>
          <select id="patients" name="patients" defaultValue="">
            <option value="" disabled>Select a range</option>
            <option value="&lt;50">Fewer than 50</option>
            <option value="50-150">50 – 150</option>
            <option value="150-500">150 – 500</option>
            <option value="500-1500">500 – 1,500</option>
            <option value="1500+">1,500+</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="notes">What would you want the pilot to prove? (optional)</label>
        <textarea
          id="notes"
          name="notes"
          placeholder="e.g., cut 90-day drop-off, flag drifters sooner, free up staff time&hellip;"
        />
      </div>

      {status === 'error' && errorMsg && (
        <div className="mkt-form__error">{errorMsg}</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <button
          type="submit"
          className="mkt-btn mkt-btn--primary"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Sending\u2026' : 'Book a demo'}
        </button>
        <span style={{ fontSize: 13, color: 'var(--mkt-muted)' }}>
          No spam, no sales auto-drip. A real person replies.
        </span>
      </div>
    </form>
  );
}
