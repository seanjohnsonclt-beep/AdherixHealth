'use client';

import { useState, useRef, useEffect } from 'react';

interface DownloadGateProps {
  resourceKey: 'checklist' | 'workflow';
  children: React.ReactNode;
}

export default function DownloadGate({ resourceKey, children }: DownloadGateProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', clinic_name: '', email: '' });
  const emailRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Trap focus inside modal when open
  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
      emailRef.current?.focus();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/download-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, resource_key: resourceKey }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        setError('Something went wrong. Please try again.');
        return;
      }

      // Trigger download
      const a = document.createElement('a');
      a.href = data.url;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setOpen(false);
      setForm({ name: '', clinic_name: '', email: '' });
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Render children as a clickable wrapper */}
      <div
        className="dl-gate-trigger"
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpen(true); }}
      >
        {children}
      </div>

      {/* Modal */}
      <dialog
        ref={dialogRef}
        className="dl-modal"
        onClose={() => setOpen(false)}
        onClick={e => { if (e.target === dialogRef.current) setOpen(false); }}
      >
        <div className="dl-modal__inner">
          <button
            className="dl-modal__close"
            aria-label="Close"
            onClick={() => setOpen(false)}
            type="button"
          >
            &times;
          </button>
          <p className="dl-modal__eyebrow">Free download</p>
          <h2 className="dl-modal__title">
            {resourceKey === 'checklist'
              ? 'Clinic Bridge Readiness Checklist'
              : 'Bridge Patient Onboarding Workflow'}
          </h2>
          <p className="dl-modal__sub">
            Enter your info and the PDF downloads instantly - no account required.
          </p>
          <form onSubmit={handleSubmit} noValidate>
            <div className="dl-modal__field">
              <label htmlFor="dl-name">Your name</label>
              <input
                id="dl-name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Dr. Jane Smith"
                required
              />
            </div>
            <div className="dl-modal__field">
              <label htmlFor="dl-clinic">Clinic name <span className="dl-modal__optional">(optional)</span></label>
              <input
                id="dl-clinic"
                name="clinic_name"
                type="text"
                autoComplete="organization"
                value={form.clinic_name}
                onChange={handleChange}
                placeholder="Piedmont Weight Management"
              />
            </div>
            <div className="dl-modal__field">
              <label htmlFor="dl-email">Work email</label>
              <input
                id="dl-email"
                ref={emailRef}
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jane@yourpractice.com"
                required
              />
            </div>
            {error && <p className="dl-modal__error">{error}</p>}
            <button
              type="submit"
              className="dl-modal__submit mkt-btn mkt-btn--primary"
              disabled={loading}
            >
              {loading ? 'Preparing download...' : 'Download PDF'}
            </button>
          </form>
          <p className="dl-modal__privacy">
            We will never share your information or add you to a list without asking.
          </p>
        </div>
      </dialog>
    </>
  );
}
