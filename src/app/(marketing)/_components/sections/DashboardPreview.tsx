'use client';

import { FadeRise, StaggerGroup } from '../animation/MotionPrimitives';

/**
 * Section 6 — Dashboard preview.
 *
 * Browser-frame mockup of the clinic dashboard. Anchor target for the hero's
 * "See the platform" CTA. KPI strip + patient table with engagement
 * sparklines. Data is illustrative.
 */

const kpis = [
  { label: 'Active patients', value: '142' },
  { label: 'In Activation', value: '38' },
  { label: 'Flagged', value: '6' },
  { label: 'Replies (7d)', value: '412' },
];

type Trend = 'up' | 'flat' | 'down';

const rows: { name: string; phase: string; days: string; trend: Trend; status: string }[] = [
  { name: 'P. Alvarez', phase: 'Onboarding', days: '4d', trend: 'up', status: 'On track' },
  { name: 'M. Chen', phase: 'Activation', days: '11d', trend: 'up', status: 'On track' },
  { name: 'J. Rivera', phase: 'Momentum', days: '23d', trend: 'flat', status: 'Watch' },
  { name: 'L. Okafor', phase: 'Plateau', days: '47d', trend: 'down', status: 'Flagged' },
  { name: 'S. Kim', phase: 'Activation', days: '9d', trend: 'up', status: 'On track' },
  { name: 'D. Patel', phase: 'Momentum', days: '31d', trend: 'flat', status: 'On track' },
];

export function DashboardPreview() {
  return (
    <section className="mkt-r-section" id="dashboard-preview">
      <div className="mkt-container">
        <div className="mkt-r-section__head">
          <FadeRise as="span" className="mkt-eyebrow">
            The platform
          </FadeRise>
          <FadeRise as="h2" className="mkt-h2">
            One view. Every patient. Where they are, and what&rsquo;s next.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead" delay={0.1}>
            The clinic dashboard surfaces drift before it becomes churn.
            Coordinators see who needs a human, who&rsquo;s on rails, and what
            the engine has already done on their behalf.
          </FadeRise>
        </div>

        <FadeRise className="mkt-r-dash__frame">
          <div className="mkt-r-dash__chrome">
            <div className="mkt-r-dash__dots">
              <span />
              <span />
              <span />
            </div>
            <div className="mkt-r-dash__url">app.adherixhealth.com</div>
          </div>

          {/* In-app top nav */}
          <div className="mkt-r-dash__topnav">
            <div className="mkt-r-dash__topnav-logo">Adherix</div>
            <div className="mkt-r-dash__topnav-clinic">Johnson Clinic</div>
            <div className="mkt-r-dash__topnav-right">
              <span className="mkt-r-dash__topnav-dot" />
              <span className="mkt-r-dash__topnav-live">Live</span>
            </div>
          </div>

          <div className="mkt-r-dash__body">
            <StaggerGroup className="mkt-r-dash__kpis" stagger={0.06} amount={0.2}>
              {kpis.map((k) => (
                <div key={k.label} className="mkt-r-dash__kpi">
                  <div className="mkt-r-dash__kpi-value">{k.value}</div>
                  <div className="mkt-r-dash__kpi-label">{k.label}</div>
                </div>
              ))}
            </StaggerGroup>

            <div className="mkt-r-dash__table" role="table" aria-label="Sample patient list">
              <div className="mkt-r-dash__row mkt-r-dash__row--head" role="row">
                <div role="columnheader">Patient</div>
                <div role="columnheader">Phase</div>
                <div role="columnheader">Day in phase</div>
                <div role="columnheader">Engagement</div>
                <div role="columnheader">Status</div>
              </div>
              {rows.map((r) => (
                <div key={r.name} className="mkt-r-dash__row" role="row">
                  <div role="cell">{r.name}</div>
                  <div role="cell">{r.phase}</div>
                  <div role="cell">{r.days}</div>
                  <div role="cell">
                    <Trendline trend={r.trend} />
                  </div>
                  <div role="cell">
                    <span
                      className={`mkt-r-dash__chip mkt-r-dash__chip--${r.status
                        .toLowerCase()
                        .replace(/\s/g, '-')}`}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeRise>
      </div>
    </section>
  );
}

function Trendline({ trend }: { trend: Trend }) {
  // Simple inline SVG sparkline. Same width across rows for alignment.
  const paths: Record<Trend, string> = {
    up: 'M 2 14 L 12 11 L 22 12 L 32 8 L 42 5 L 52 4',
    flat: 'M 2 9 L 12 10 L 22 8 L 32 9 L 42 9 L 52 8',
    down: 'M 2 4 L 12 6 L 22 7 L 32 10 L 42 12 L 52 14',
  };
  const colorClass: Record<Trend, string> = {
    up: 'mkt-r-dash__spark--up',
    flat: 'mkt-r-dash__spark--flat',
    down: 'mkt-r-dash__spark--down',
  };
  return (
    <svg
      className={`mkt-r-dash__spark ${colorClass[trend]}`}
      width="56"
      height="18"
      viewBox="0 0 56 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[trend]} />
    </svg>
  );
}
