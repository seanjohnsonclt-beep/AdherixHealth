'use client';

import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

const steps = [
  {
    n: 'The move',
    title: 'A 10-minute walk after eating reduces glucose spikes by up to 25%',
    body: 'No gym. No equipment. No willpower required beyond timing. The post-meal walk is the highest-leverage, lowest-friction metabolic intervention available - and most pre-diabetic patients have never been told this.',
  },
  {
    n: 'The number',
    title: 'A 0.5% A1c reduction cuts T2D progression risk by ~30%',
    body: 'That shift is achievable with lifestyle change alone for most pre-diabetic patients. Adherix Metabolic builds the quarterly lab reminder into the program so patients see the number - and believe the change is real.',
  },
  {
    n: 'The gap',
    title: 'Sleep under 7 hours raises fasting glucose the next day',
    body: 'Cortisol from poor sleep triggers direct glucose release. Most pre-diabetic patients have never connected their sleep to their A1c. The engine surfaces this as a metabolic signal - not a wellness tip.',
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
            Pre-diabetes is reversible - but only with consistent behavioral intervention between
            clinic visits. Most practices flag it at an annual lab and have nothing to offer next.
            Adherix Metabolic turns that lab result into a 90-day behavioral program, automatically.
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
          <div className="mkt-v2-section__head mkt-v2-section__head--lg">
            <FadeRise as="span" className="mkt-eyebrow">The problem</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Pre-diabetes gets flagged. The patient leaves with a pamphlet. Then nothing.
            </FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              Every practice has these patients. Most have no structured follow-up to offer them.
              The annual visit schedule cannot carry the frequency of contact that behavior change requires.
              Without a between-visit program, A1c drifts - and by the time the next lab comes back,
              the pre-diabetes window has closed. Adherix Metabolic is that program.
            </FadeRise>
          </div>
        </div>
      </section>

      <section className="mkt-v2-section">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">How we fix it</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Three specific, evidence-based levers. Delivered via SMS.</FadeRise>
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
          <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">Turn every pre-diabetes diagnosis into an active intervention.</FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            No staff overhead. No portal. Just the specific habits that move A1c - delivered automatically.
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
