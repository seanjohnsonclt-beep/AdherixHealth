'use client';

import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

const steps = [
  {
    n: 'Week 1-2',
    stat: 'Day 9',
    title: 'The nausea window',
    body: 'Nausea peaks at days 7-14 on most weight loss medications. Patients who receive context before it hits are significantly less likely to stop. The engine sends it automatically - before the symptom, not after the dropout.',
  },
  {
    n: 'Day 21',
    stat: '30-day',
    title: 'The refill window',
    body: 'Every 30-day supply cycle is a dropout opportunity. For controlled substances requiring a monthly Rx, missing the window means going without. Adherix Rx flags the refill at day 21 - before the gap opens.',
  },
  {
    n: 'Month 3',
    stat: '85%',
    title: 'The plateau moment',
    body: 'The scale stalls around month 3 for most patients. 85% interpret this as treatment failure and quietly stop. The engine sends plateau framing before the stall hits - reframing it as expected, not a reason to quit.',
  },
];

export function PharmacotherapyPage() {
  return (
    <>
      <section className="dc-hero">
        <div className="mkt-container dc-hero__inner">
          <FadeRise as="span" className="dc-hero__eyebrow">Adherix Rx - Pharmacotherapy</FadeRise>
          <FadeRise as="h1" className="dc-hero__title" delay={0.06}>
            The prescription gets filled.
            <br />The behavior determines what happens next.
          </FadeRise>
          <FadeRise as="p" className="dc-hero__sub" delay={0.1}>
            Weight loss medications work when patients take them consistently, manage side effects early,
            and push through the plateau. Most do not. Adherix Rx runs the behavioral support layer
            automatically - no staff involvement, no portal, no extra overhead.
          </FadeRise>
          <FadeRise className="dc-hero__stats" delay={0.14}>
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">~50%</span>
              <span className="dc-hero__stat-l">of patients stop weight loss medication within 3 months</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">3 windows</span>
              <span className="dc-hero__stat-l">where most patients quit - nausea, refill gap, plateau</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">0 calls</span>
              <span className="dc-hero__stat-l">required from your staff - the engine handles it</span>
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
              <FadeRise as="h2" className="mkt-h2" delay={0.05}>On day 9, the nausea hits. The patient does not call. They just stop taking it.</FadeRise>
              <FadeRise as="div" className="mkt-v2-problem__body" delay={0.1}>
                <p>The pharmacology is sound. What breaks down is the patient experience between prescriptions. Side effects go unaddressed. Refill windows get missed. The plateau arrives and patients assume the drug stopped working. None of this requires a clinician to fix - it requires a timely, specific response that no practice can deliver manually at scale.</p>
              </FadeRise>
            </div>
            <FadeRise className="mkt-v2-problem__visual" delay={0.06} amount={0.2}>
              <div className="mkt-v2-problem__pull">
                <div className="mkt-v2-problem__pull-num">~50%</div>
                <div className="mkt-v2-problem__pull-text">of patients discontinue weight loss medication within 3 months. Side effects and the month-3 plateau are the top two reasons.</div>
              </div>
            </FadeRise>
          </div>
        </div>
      </section>

      <section className="mkt-v2-section">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">How we fix it</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Three dropout windows. Covered before they open.</FadeRise>
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
          <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">Your patients stay on it. Without your staff lifting a finger.</FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Adherix Rx runs from first fill through year one. Automatically.
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
