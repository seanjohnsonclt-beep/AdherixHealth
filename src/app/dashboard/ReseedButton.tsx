'use client';

import { useState } from 'react';

/**
 * One-click demo data refresh. Calls /api/demo/reseed (GET, auth-gated),
 * then reloads the page so the dashboard reflects the new distribution.
 *
 * Only shown in demo mode — hide or remove before real clinic onboarding.
 */
export function ReseedButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function handleClick() {
    setState('loading');
    try {
      const res = await fetch('/api/demo/reseed');
      if (!res.ok) throw new Error('reseed failed');
      setState('done');
      // Brief pause so "Done" is visible, then hard reload
      setTimeout(() => window.location.reload(), 800);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }

  const label =
    state === 'loading' ? 'Refreshing…' :
    state === 'done'    ? 'Done ✓' :
    state === 'error'   ? 'Failed — retry' :
    'Refresh demo data';

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading' || state === 'done'}
      title="Wipe and regenerate demo patients (admin only)"
      style={{
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: 6,
        border: '1px solid var(--border)',
        background: 'transparent',
        color: state === 'error' ? 'var(--accent)' : 'var(--text-muted)',
        cursor: state === 'loading' || state === 'done' ? 'default' : 'pointer',
        opacity: state === 'loading' ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      {label}
    </button>
  );
}
