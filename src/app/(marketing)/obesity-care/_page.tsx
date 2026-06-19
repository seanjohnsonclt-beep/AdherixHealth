'use client';

import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

const steps = [
  {
    n: '01',
    title: 'Discharge through week six',
    body: 'Supplement adherence, protein targets, hydration, and wound healing cues. The first six weeks are when behavioral habits form - and when patients are most likely to slip without contact.',
  },
  {
    n: '02',
    title: 'Diet advancement and habit building',
    body: 'Stage-by-stage diet progression cues. Protein-first framing. Grazing detection via reply patterns. Patients who build the habit in months two and three sustain it through year one.',
  },
  {
    n: '03',
    title: 'Rebound prevention through long-term maintenance',
    body: 'Month 12-24 is when regain begins. The engine flags the pattern early - before the scale moves significantly - and prompts corrective action before it becomes a clinical problem.',
  },
];

export function ObesityCarePage() {
  return (
    <>
      <section className="dc-hero" id="bridge-hero">
        <div className="mkt-container dc-hero__inner">
          <FadeRise as="span" className="dc-hero__eyebrow">Adherix Bridge - Bariatric Surgery Support</FadeRise>
          <FadeRise as="h1" className="dc-hero__title" delay={0.06}>
            Bariatric surgery works.
            <br />Post-op behavior is the variable.
          </FadeRise>
          <FadeRise as="p" className="dc-hero__sub" delay={0.1}>
            The anatomy changes. The behavioral environment does not.
            Most programs discharge patients with a pamphlet and a follow-up in six weeks.
            Adherix Bridge runs structured post-op behavioral support automatically - from discharge
            through long-term maintenance.
          </FadeRise>
          <FadeRise className="dc-hero__stats" delay={0.14}>
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">~40%</span>
              <span className="dc-hero__stat-l">of bariatric patients regain significant weight within 5 years</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">6</span>
              <span className="dc-hero__stat-l">phases from pre-op through long-term maintenance</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">SMS</span>
              <span className="dc-hero__stat-l">first - no app, no portal, no friction</span>
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
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>The surgery holds. The behavioral support after it does not.</FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              Bariatric surgery produces significant, rapid weight loss. The long-term outcome depends on
              what the patient does with food, movement, supplements, and stress for the next two years.
              Most programs have limited capacity for the between-visit contact that behavioral maintenance requires.
              Adherix Bridge runs it automatically.
            </FadeRise>
          </div>
        </div>
      </section>

      <section className="mkt-v2-section">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">How it works</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Three critical windows. Covered from day one.</FadeRise>
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
          <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">Protect the outcome your patients worked for.</FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Adherix Bridge runs post-op behavioral support automatically - from discharge through year two.
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
