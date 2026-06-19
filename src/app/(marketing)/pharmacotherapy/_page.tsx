'use client';

import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

const steps = [
  {
    n: '01',
    title: 'First dose — anchored',
    body: 'Patient picks a daily time and commits to it in the first 48 hours. Same time every day is the single strongest predictor of long-term pill adherence.',
  },
  {
    n: '02',
    title: 'Side effects — addressed early',
    body: 'Patients who understand what to expect in the first two weeks stay on medication at significantly higher rates. The engine sends context before they quit silently.',
  },
  {
    n: '03',
    title: 'Refill windows — covered',
    body: 'Day-21 refill reminder on every 30-day supply. For controlled substances, the monthly Rx window is flagged before patients run out between visits.',
  },
  {
    n: '04',
    title: 'Plateau — reframed',
    body: 'Month 3 is when confidence drops and patients assume the medication stopped working. The engine sends plateau framing before the stall hits.',
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
            and stay on through the plateau. Most do not. Adherix Rx runs the behavioral support layer
            automatically - no staff involvement required.
          </FadeRise>
          <FadeRise className="dc-hero__stats" delay={0.14}>
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">~50%</span>
              <span className="dc-hero__stat-l">of patients stop weight loss medication within 3 months</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">Month 3</span>
              <span className="dc-hero__stat-l">is when the plateau hits and most practices have no touchpoint</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">SMS</span>
              <span className="dc-hero__stat-l">first - no app, no portal, no friction for the patient</span>
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
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Adherence is a behavioral problem, not a clinical one.</FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              The pharmacology works. What breaks down is what happens between prescriptions.
              Side effects go unaddressed. Refills get missed. The plateau hits and patients assume
              the medication stopped working. None of this requires a clinician to fix - it requires
              a consistent, timely response that no practice can staff at scale.
            </FadeRise>
          </div>
        </div>
      </section>

      <section className="mkt-v2-section">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">How it works</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Four critical windows. Covered automatically.</FadeRise>
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
          <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">Close the adherence gap - automatically.</FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Adherix Rx runs from first fill through year one with no coordinator overhead.
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
