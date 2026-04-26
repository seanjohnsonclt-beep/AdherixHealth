'use client';

import { FadeRise, ScrollWidth, StaggerGroup } from '../animation/MotionPrimitives';

/**
 * Section 4 — Behavioral adherence intelligence.
 *
 * Three pillar cards (Phase-aware, Trigger-driven, Clinic routing) plus a
 * horizontal phase timeline that animates its bars on scroll.
 *
 * Phase widths are weighted to reflect duration intent (1d / 7d / 14d / 30d /
 * 30d / ongoing). Maintenance is given a soft fade tail.
 */

const pillars = [
  {
    title: 'Phase-aware progression',
    body:
      'Six clinical phases — Initiation, Onboarding, Activation, Momentum, Plateau, Maintenance — each with their own message cadence, voice, and reply gates.',
  },
  {
    title: 'Trigger-driven outreach',
    body:
      'Predicates evaluated every 60 seconds: drift after 48 hours, escalation after 5 days, plateau acknowledgement, manual flag. Same trigger never fires twice in a day.',
  },
  {
    title: 'Clinic routing',
    body:
      'When behavior crosses a threshold, the patient is flagged and the clinic is alerted by email — one summary per clinic per tick, not a flood of single failures.',
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
            The platform
          </FadeRise>
          <FadeRise as="h2" className="mkt-h2">
            Behavioral adherence intelligence, not another reminder app.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead" delay={0.1}>
            Adherix runs a six-phase behavioral engine on top of SMS. It knows
            where every patient is, when they last replied, and what should
            happen next without anyone in the clinic having to think about it.
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
