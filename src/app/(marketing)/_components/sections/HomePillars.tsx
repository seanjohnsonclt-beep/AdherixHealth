'use client';

import { FadeRise, StaggerGroup } from '../animation/MotionPrimitives';

const pillars = [
  {
    num: 'Detect',
    title: 'Behavioral signals',
    body: 'Detect subtle disengagement before churn happens. Reply cadence, dose timing, silence patterns — scored every 60 seconds across your entire panel.',
  },
  {
    num: 'Correct',
    title: 'Targeted intervention',
    body: 'When a patient drifts, the engine identifies the pattern — side effect, missed dose, withdrawal, plateau — and sends a precise, locked correction message. No generic nudges.',
  },
  {
    num: 'Close the loop',
    title: 'Tracked resolution',
    body: 'Every correction is tracked. If the patient responds, it resolves automatically. If they go silent past the threshold, the clinic is alerted — one call, right patient, right moment.',
  },
];

export function HomePillars() {
  return (
    <section className="mkt-v2-section" id="pillars">
      <div className="mkt-container">
        <div className="mkt-v2-section__head">
          <FadeRise as="span" className="mkt-eyebrow">
            How Adherix works
          </FadeRise>
          <FadeRise as="h2" className="mkt-h2" delay={0.05}>
            Behavioral adherence intelligence, built for the moments retention is
            won or lost.
          </FadeRise>
        </div>

        <StaggerGroup className="mkt-v2-pillars" stagger={0.1} amount={0.25}>
          {pillars.map((p) => (
            <article key={p.num} className="mkt-v2-pillar">
              <div className="mkt-v2-pillar__tag">{p.num}</div>
              <h3 className="mkt-v2-pillar__title">{p.title}</h3>
              <p className="mkt-v2-pillar__body">{p.body}</p>
            </article>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
