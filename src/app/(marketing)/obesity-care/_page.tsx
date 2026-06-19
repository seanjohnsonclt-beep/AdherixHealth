'use client';

import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

const steps = [
  {
    n: 'Weeks 1-6',
    title: 'The anatomy changed. The behavioral environment did not.',
    body: 'Protein deficiency, supplement non-adherence, and grazing begin within the first six weeks - before the first follow-up visit. Grazing behavior is present in roughly half of post-op patients and is the single strongest predictor of long-term regain. The engine surfaces it through reply pattern detection before it becomes clinical.',
  },
  {
    n: 'Months 2-6',
    title: 'Habit formation - the window that determines year-two outcomes',
    body: 'Patients who hit consistent protein targets and build movement habits in months two through six have significantly better outcomes at year two. This is the window most programs treat as stable. It is not. Adherix Bridge maintains daily behavioral contact through it.',
  },
  {
    n: 'Month 12+',
    title: 'Rebound begins quietly - long before the scale shows it',
    body: 'Weight regain typically begins month 12-18, when most programs have stopped active outreach. The behavioral signals arrive first - lower protein, fewer replies, skipped supplements. The engine detects the drift and corrects it before the number moves.',
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
            The operation produces rapid, significant weight loss. What happens in the two years
            after discharge determines whether it lasts. Most programs cannot staff the behavioral
            contact that long-term outcomes require. Adherix Bridge does it automatically.
          </FadeRise>
          <FadeRise className="dc-hero__stats" delay={0.14}>
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">~40%</span>
              <span className="dc-hero__stat-l">of bariatric patients regain significant weight within 5 years</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">Week 1</span>
              <span className="dc-hero__stat-l">is when behavioral drift begins - before most programs have their first follow-up</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">0 staff</span>
              <span className="dc-hero__stat-l">required to run the between-visit behavioral program</span>
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
          <div className="mkt-v2-problem">
            <div className="mkt-v2-problem__copy">
              <FadeRise as="span" className="mkt-eyebrow">The problem</FadeRise>
              <FadeRise as="h2" className="mkt-h2" delay={0.05}>Your patient left the OR with a changed anatomy and an unchanged environment.</FadeRise>
              <FadeRise as="div" className="mkt-v2-problem__body" delay={0.1}>
                <p>The surgery is a tool. The behavioral work that follows determines the long-term outcome. Protein targets, supplement adherence, grazing patterns, stress responses - these are not things a six-week follow-up visit can monitor. Most programs discharge patients into a behavioral gap. Adherix Bridge closes it.</p>
              </FadeRise>
            </div>
            <FadeRise className="mkt-v2-problem__visual" delay={0.06} amount={0.2}>
              <div className="mkt-v2-problem__pull">
                <div className="mkt-v2-problem__pull-num">~40%</div>
                <div className="mkt-v2-problem__pull-text">of bariatric patients regain significant weight within 5 years. The surgery holds. The behavioral support after it does not.</div>
              </div>
            </FadeRise>
          </div>
        </div>
      </section>

      <section className="mkt-v2-section">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">How we fix it</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Three windows where outcomes are won or lost.</FadeRise>
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
          <FadeRise as="h2" className="mkt-v2-trust__title" style={{fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, color: 'var(--mkt-paper)', lineHeight: 1.1, marginBottom: 20}}>Protect the outcome your patients worked for.</FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Adherix Bridge runs post-op behavioral support from discharge through year two. No staff overhead. No portal.
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
