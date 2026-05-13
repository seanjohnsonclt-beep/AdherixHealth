'use client';

import { FadeRise, ScrollWidth, StaggerGroup } from '../animation/MotionPrimitives';

const pillars = [
  {
    title: 'Phase-aware progression',
    body:
      'Six clinical phases  -  Initiation, Onboarding, Activation, Momentum, Plateau, Maintenance  -  each with their own message cadence, voice, and reply gates.',
  },
  {
    title: 'Trigger-driven outreach',
    body:
      'Behavioral predicates evaluated every 60 seconds: drift after 48 hours, escalation after 5 days, plateau acknowledgement, phase advancement. Same trigger never fires twice in a day.',
  },
  {
    title: 'Closed-loop correction',
    body:
      'When a patient drifts, the engine detects the pattern, sends a targeted correction, and tracks the response. Auto-resolves on reply. Escalates to the clinic if silence crosses the threshold  -  no manual monitoring required.',
  },
];

const phases = [
  { label: 'Initiation', sub: '1 day', weight: 4 },
  { label: 'Onboarding', sub: '7 days', weight: 8 },
  { label: 'Activation', sub: '14 days', weight: 14 },
  { label: 'Momentum', sub: '30 days', weight: 22 },
  { label: 'Plateau', sub: '30 days', weight: 22 },
  { label: 'Maintenance', sub: 'ongoing', weight: 30 },
];

export function Engine() {
  const totalWeight = phases.reduce((sum, p) => sum + p.weight, 0);

  return (
    <section className="mkt-r-section" id="platform">
      <div className="mkt-container">
        <div className="mkt-r-section__head">
          <FadeRise as="span" className="mkt-eyebrow">
            How it works
          </FadeRise>
          <FadeRise as="h2" className="mkt-h2">
            Six phases. Every patient, on their own clock.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead" delay={0.1}>
            Each phase has its own message cadence, reply gates, and behavioral triggers. The engine advances patients automatically  -  no coordinator involvement required.
          </FadeRise>
        </div>

        <StaggerGroup className="mkt-r-engine__grid" stagger={0.08} amount={0.25}>
          {pillars.map((p) => (
            <article key={p.title} className="mkt-r-engine__card">
              <h3 className="mkt-h3">{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </StaggerGroup>

        <FadeRise className="mkt-r-engine__timeline-wrap">
          <div className="mkt-r-engine__timeline-head">
            <span className="mkt-eyebrow">Patient journey</span>
            <p>
              Every patient progresses on their own clock. The engine schedules
              against the patient&rsquo;s timezone, gates on replies, and
              advances automatically when a phase completes.
            </p>
          </div>
          <div className="mkt-r-engine__timeline" role="img" aria-label="Phase timeline">
            {phases.map((phase, i) => {
              const widthPct = (phase.weight / totalWeight) * 100;
              return (
                <div
                  key={phase.label}
                  className="mkt-r-engine__phase"
                  style={{ flexBasis: `${widthPct}%` }}
                >
                  <div className="mkt-r-engine__phase-bar-track">
                    <ScrollWidth
                      className={`mkt-r-engine__phase-bar mkt-r-engine__phase-bar--${i}`}
                      delay={0.08 * i}
                      duration={0.7}
                    />
                  </div>
                  <div className="mkt-r-engine__phase-meta">
                    <div className="mkt-r-engine__phase-label">{phase.label}</div>
                    <div className="mkt-r-engine__phase-sub">{phase.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeRise>
      </div>
    </section>
  );
}
