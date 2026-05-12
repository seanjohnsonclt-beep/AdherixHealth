'use client';

import { FadeRise, StaggerGroup } from '../animation/MotionPrimitives';

const kpis = [
  { label: 'Active patients', value: '142' },
  { label: 'In Activation', value: '38' },
  { label: 'Flagged', value: '6' },
  { label: 'Replies (7d)', value: '412' },
];

type Trend = 'up' | 'flat' | 'down';

const rows: { name: string; phase: string; days: string; trend: Trend; status: string }[] = [
  { name: 'P. Alvarez', phase: 'Onboarding',  days: '4d',  trend: 'up',   status: 'On track' },
  { name: 'M. Chen',    phase: 'Activation',  days: '11d', trend: 'up',   status: 'On track' },
  { name: 'J. Rivera',  phase: 'Momentum',    days: '23d', trend: 'flat', status: 'Watch'    },
  { name: 'L. Okafor',  phase: 'Plateau',     days: '47d', trend: 'down', status: 'Flagged'  },
  { name: 'S. Kim',     phase: 'Activation',  days: '9d',  trend: 'up',   status: 'On track' },
  { name: 'D. Patel',   phase: 'Momentum',    days: '31d', trend: 'flat', status: 'On track' },
];

export function DashboardPreview() {
  return (
    <section className="mkt-r-section" id="dashboard-preview">
      <div className="mkt-container">
        <div className="mkt-r-section__head">
          <FadeRise as="span" className="mkt-eyebrow">
            Clinic dashboard
          </FadeRise>
          <FadeRise as="h2" className="mkt-h2">
            One view. Every patient. Where they are, and what&rsquo;s next.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead" delay={0.1}>
            The clinic dashboard surfaces drift before it becomes churn.
            Coordinators see who needs a call, who&rsquo;s on rails, and what
            the engine has already done on their behalf.
          </FadeRise>
        </div>

        <FadeRise className="mkt-r-dash__frame">
          <div className="mkt-r-dash__chrome">
            <div className="mkt-r-dash__dots">
              <span /><span /><span />
            </div>
            <div className="mkt-r-dash__url">adherixhealth.com</div>
          </div>

          {/* In-app top nav */}
          <div className="mkt-r-dash__topnav">
            <div className="mkt-r-dash__topnav-logo">Adherix</div>
            <div className="mkt-r-dash__topnav-links">
              <span className="mkt-r-dash__topnav-link mkt-r-dash__topnav-link--active">Patients</span>
              <span className="mkt-r-dash__topnav-link">Reports</span>
              <span className="mkt-r-dash__topnav-link">Settings</span>
            </div>
          </div>

          {/* KPI strip */}
          <div className="mkt-r-dash__kpis">
            {kpis.map((k) => (
              <div key={k.label} className="mkt-r-dash__kpi">
                <div className="mkt-r-dash__kpi-val">{k.value}</div>
                <div className="mkt-r-dash__kpi-lbl">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Patient table */}
          <div className="mkt-r-dash__table">
            <div className="mkt-r-dash__row mkt-r-dash__row--head">
              <span>Patient</span>
              <span>Phase</span>
              <span>Days</span>
              <span>Engagement</span>
              <span>Status</span>
            </div>
            {rows.map((r) => (
              <div key={r.name} className={`mkt-r-dash__row${r.status === 'Flagged' ? ' mkt-r-dash__row--flagged' : ''}`}>
                <span className="mkt-r-dash__name">{r.name}</span>
                <span className="mkt-r-dash__phase">{r.phase}</span>
                <span className="mkt-r-dash__days mkt-r-dash__mono">{r.days}</span>
                <span className="mkt-r-dash__spark-wrap">
                  <Trendline trend={r.trend} />
                </span>
                <span className={`mkt-r-dash__status mkt-r-dash__status--${r.status === 'Flagged' ? 'flagged' : r.status === 'Watch' ? 'watch' : 'ok'}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </FadeRise>
      </div>
    </section>
  );
}

function Trendline({ trend }: { trend: Trend }) {
  const paths: Record<Trend, string> = {
    up:   'M 2 14 L 12 11 L 22 12 L 32 8 L 42 5 L 52 4',
    flat: 'M 2 9 L 12 10 L 22 8 L 32 9 L 42 9 L 52 8',
    down: 'M 2 4 L 12 6 L 22 7 L 32 10 L 42 12 L 52 14',
  };
  const colorClass: Record<Trend, string> = {
    up:   'mkt-r-dash__spark--up',
    flat: 'mkt-r-dash__spark--flat',
    down: 'mkt-r-dash__spark--down',
  };
  return (
    <svg
      viewBox="0 0 54 18"
      width="54"
      height="18"
      className={`mkt-r-dash__spark ${colorClass[trend]}`}
      aria-hidden="true"
    >
      <path d={paths[trend]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
