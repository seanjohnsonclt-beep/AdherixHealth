'use client';

import { FadeRise, StaggerGroup } from '../animation/MotionPrimitives';

/**
 * Homepage Pillars — v2
 *
 * Three-column grid. Each pillar has a monospaced number, Fraunces title,
 * and a specific (not generic) body. The grid is bordered and flush — feels
 * like a table rather than floating cards.
 */

const pillars = [
  {
    num: '01',
    title: 'Behavioral signals',
    body: 'Detect subtle disengagement before churn happens. Reply cadence, dose timing, silence patterns — evaluated every 60 seconds across your entire panel.',
  },
  {
    num: '02',
    title: 'Smart interventions',
    body: 'Right outreach, right timing, right patient. Phase-aware SMS that knows when to automate and when to route a patient to your care team.',
  },
  {
    num: '03',
    title: 'Retention intelligence',
    body: 'Know where revenue risk lives across your roster. Weekly digests, clinic alerts, and exportable reports give operators the full picture.',
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
              <div className="mkt-v2-pillar__num">{p.num}</div>
              <h3 className="mkt-v2-pillar__title">{p.title}</h3>
              <p className="mkt-v2-pillar__body">{p.body}</p>
            </article>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
