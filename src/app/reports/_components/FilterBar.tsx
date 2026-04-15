'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

const PHASES = [
  { id: 0, name: 'Onboarding' },
  { id: 1, name: 'Activation' },
  { id: 2, name: 'Momentum' },
  { id: 3, name: 'Plateau' },
  { id: 4, name: 'Transition' },
  { id: 5, name: 'Maintenance' },
];

export type FilterState = {
  phase: string;
  status: string;
  from: string;
  to: string;
  response: string;
};

export function FilterBar({ current }: { current: FilterState }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const hasFilters =
    current.phase || current.status || current.from || current.to || current.response;

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 32, opacity: isPending ? 0.6 : 1, transition: 'opacity 0.15s' }}>
      <div>
        <div className="label" style={{ marginBottom: 4 }}>Phase</div>
        <select
          className="select"
          style={{ width: 160 }}
          value={current.phase}
          onChange={(e) => update('phase', e.target.value)}
        >
          <option value="">All phases</option>
          {PHASES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id}. {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="label" style={{ marginBottom: 4 }}>Status</div>
        <select
          className="select"
          style={{ width: 140 }}
          value={current.status}
          onChange={(e) => update('status', e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="flagged">Flagged</option>
          <option value="paused">Paused</option>
          <option value="churned">Churned</option>
        </select>
      </div>

      <div>
        <div className="label" style={{ marginBottom: 4 }}>Enrolled from</div>
        <input
          type="date"
          className="input"
          style={{ width: 148 }}
          value={current.from}
          onChange={(e) => update('from', e.target.value)}
        />
      </div>

      <div>
        <div className="label" style={{ marginBottom: 4 }}>Enrolled to</div>
        <input
          type="date"
          className="input"
          style={{ width: 148 }}
          value={current.to}
          onChange={(e) => update('to', e.target.value)}
        />
      </div>

      <div>
        <div className="label" style={{ marginBottom: 4 }}>Response</div>
        <select
          className="select"
          style={{ width: 180 }}
          value={current.response}
          onChange={(e) => update('response', e.target.value)}
        >
          <option value="">All patients</option>
          <option value="active7d">Replied last 7 days</option>
          <option value="silent7d">Silent 7+ days</option>
          <option value="never">Never replied</option>
        </select>
      </div>

      {hasFilters && (
        <div style={{ paddingBottom: 1 }}>
          <a
            href="/reports"
            className="btn ghost"
            style={{ fontSize: 13, padding: '9px 14px' }}
          >
            Reset
          </a>
        </div>
      )}

      {isPending && (
        <div style={{ paddingBottom: 4, fontSize: 12, color: 'var(--fg-faint)', fontFamily: 'var(--mono)' }}>
          loading…
        </div>
      )}
    </div>
  );
}
