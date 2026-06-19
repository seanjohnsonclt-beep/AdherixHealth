'use client';

import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

const steps = [
  {
    n: 'Month 1',
    title: 'Daily contact - unstaffable without automation',
    body: 'Daily behavioral contact in the first 30 days predicts 12-month outcomes more strongly than any other single factor in IBT research. No practice can staff that frequency manually. Adherix IBT delivers it automatically via SMS.',
  },
  {
    n: 'Months 2-6',
    title: 'Between every visit - the gap where behavior drifts',
    body: 'Patients who engage with behavioral prompts 3+ days per week between visits lose significantly more weight than those who do not. The biweekly visit cadence alone cannot carry this. The engine fills every gap.',
  },
  {
    n: 'Months 7-12',
    title: 'Year-one retention - where most programs go silent',
    body: 'Without structured follow-up after month 6, most IBT patients show no measurable behavioral change by the end of year one. Weekly SMS check-ins and visit prep keep the habit alive - and the reimbursement justified.',
  },
];

export function BehavioralTherapyPage() {
  return (
    <>
      <section className="dc-hero">
        <div className="mkt-container dc-hero__inner">
          <FadeRise as="span" className="dc-hero__eyebrow">Adherix IBT - Intensive Behavioral Therapy</FadeRise>
          <FadeRise as="h1" className="dc-hero__title" delay={0.06}>
            Medicare covers 22 IBT visits.
            <br />Most practices deliver 4.
          </FadeRise>
          <FadeRise as="p" className="dc-hero__sub" delay={0.1}>
            The reimbursement is there. The clinical evidence is strong. What most programs are missing
            is the daily behavioral contact that keeps patients on track between appointments.
            Adherix IBT fills every gap - automatically, via SMS, with zero coordinator overhead.
          </FadeRise>
          <FadeRise className="dc-hero__stats" delay={0.14}>
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">22</span>
              <span className="dc-hero__stat-l">Medicare-covered visits per year - most programs use fewer than 5</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">Daily</span>
              <span className="dc-hero__stat-l">contact in month one predicts year-one outcomes - no practice can staff this manually</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">Zero</span>
              <span className="dc-hero__stat-l">additional coordinator hours to run the between-visit program</span>
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
              The visits exist. The between-visit program does not.
            </FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              IBT is one of the most well-reimbursed obesity interventions CMS offers. The clinical
              protocol is designed around high-frequency contact - daily in month one, biweekly
              through month six. The research supports it. But behavioral change requires daily
              reinforcement, not monthly appointments. Most practices cannot staff that gap.
              That is exactly what Adherix IBT was built to close.
            </FadeRise>
          </div>
        </div>
      </section>

      <section className="mkt-v2-section">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">How we fix it</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Automated contact across all three behavioral windows.</FadeRise>
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
          <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">Deliver the benefit Medicare designed - without adding staff.</FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Daily contact. Structured cadence. Year-one outcomes. Zero overhead.
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
