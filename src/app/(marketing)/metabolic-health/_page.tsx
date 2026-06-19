'use client';

import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

const steps = [
  {
    n: '01',
    title: 'Establish the baseline',
    body: 'Two weeks of carb awareness, sleep tracking, and post-meal walk introduction. Behavioral snapshot before targets are set - so the habits that follow are grounded in what is actually happening.',
  },
  {
    n: '02',
    title: 'Deliver the specific habits',
    body: 'Post-meal walks (25% glucose spike reduction). Protein at breakfast. Carb quality swaps. Sleep targeting. One habit per message - no tracking apps, no overwhelm.',
  },
  {
    n: '03',
    title: 'Track the number that matters',
    body: 'Quarterly A1c lab reminder built into the maintenance phase. A 0.5% reduction in A1c cuts T2D progression risk by ~30%. Patients need to see the number to believe the change.',
  },
];

export function MetabolicHealthPage() {
  return (
    <>
      <section className="dc-hero">
        <div className="mkt-container dc-hero__inner">
          <FadeRise as="span" className="dc-hero__eyebrow">Adherix Metabolic - Metabolic Health</FadeRise>
          <FadeRise as="h1" className="dc-hero__title" delay={0.06}>
            88 million Americans have pre-diabetes.
            <br />Few have a plan.
          </FadeRise>
          <FadeRise as="p" className="dc-hero__sub" delay={0.1}>
            Pre-diabetes is reversible. But only with consistent behavioral intervention between clinic
            visits - not a pamphlet and a recommendation to eat better. Adherix Metabolic delivers
            the specific habits that move A1c in the right direction, automatically, via SMS.
          </FadeRise>
          <FadeRise className="dc-hero__stats" delay={0.14}>
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">88M</span>
              <span className="dc-hero__stat-l">Americans with pre-diabetes - the largest untapped patient pool in metabolic care</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">&gt;50%</span>
              <span className="dc-hero__stat-l">reduction in T2D progression with consistent lifestyle intervention</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">90 days</span>
              <span className="dc-hero__stat-l">to a measurable A1c change - the window this program targets</span>
            </div>
          </FadeRise>
          <FadeRise className="dc-hero__ctas" delay={0.2}>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">Book a demo</Link>
            <Link href="/platform" className="mkt-btn mkt-btn--ghost mkt-btn--lg">See the platform</Link>
          </FadeRise>
        </div>
      </section>

      <section className="mkt-v2-section mkt-v2-section--alt">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The problem</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Pre-diabetes gets flagged. Then nothing happens.</FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              Most practices identify pre-diabetes at an annual lab and have nowhere to send the patient.
              No structured follow-up. No between-visit contact. By the time the next lab comes back,
              the window has closed - and A1c has crossed into T2D range. Every practice has these
              patients. Most have no active program for them.
            </FadeRise>
          </div>
        </div>
      </section>

      <section className="mkt-v2-section">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">How it works</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Three steps. Lab result to lasting habit change.</FadeRise>
          </div>
          <StaggerGroup className="prod-step-grid" stagger={0.07} amount={0.2}>
            {steps.map(s => (
              <div key={s.n} className="prod-step-card">
                <span className="prod-step-card__n">{s.n}</span>
                <h3 className="prod-step-card__title">{s.title}</h3>
                <p className="prod-step-card__body">{s.body}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="mkt-v2-section mkt-v2-section--ink">
        <div className="mkt-container mkt-v2-trust">
          <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">Turn a lab result into a 90-day intervention.</FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Every practice has pre-diabetic patients with no active program. Adherix Metabolic closes that gap automatically.
          </FadeRise>
          <FadeRise className="mkt-v2-trust__cta" delay={0.15}>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">Book a demo</Link>
            <Link href="/platform" className="mkt-btn mkt-btn--ghost mkt-btn--ghost-on-dark mkt-btn--lg">See the platform</Link>
          </FadeRise>
        </div>
      </section>
    </>
  );
}
