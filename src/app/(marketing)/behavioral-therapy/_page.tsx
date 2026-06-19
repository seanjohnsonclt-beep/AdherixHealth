'use client';

import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

const steps = [
  {
    n: '01',
    title: 'Daily contact in month one',
    body: 'The highest behavioral risk window. SMS checks in every day - food log prompts, hunger scale, eating speed, movement. The visit alone cannot carry this frequency.',
  },
  {
    n: '02',
    title: 'Structured cadence through month six',
    body: 'Every 2-3 days between visits. Emotional eating, environment redesign, sleep, the plate method. Patients stay engaged between the biweekly appointments Medicare requires.',
  },
  {
    n: '03',
    title: 'Weekly maintenance through year one',
    body: 'Weekly behavioral check-ins and visit prep reminders. Patients who stay engaged in months 7-12 are significantly less likely to regain. The engine runs it automatically.',
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
            The reimbursement exists. The between-visit program does not.
            Behavior change requires contact at a frequency that appointments alone cannot provide.
            Adherix IBT fills every gap between visits - automatically, via SMS.
          </FadeRise>
          <FadeRise className="dc-hero__stats" delay={0.14}>
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">22</span>
              <span className="dc-hero__stat-l">Medicare-covered IBT visits in year one - most programs use fewer than 5</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">Daily</span>
              <span className="dc-hero__stat-l">SMS in month one - the window when habits form or fail</span>
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
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The problem</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>The visits exist. The between-visit program does not.</FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              IBT is reimbursed at the highest frequency of any CMS obesity benefit - monthly in month one,
              biweekly through month six, monthly through year one. The clinical evidence is strong.
              What most practices are missing is the daily behavioral contact that keeps patients
              on track between those appointments. That is what Adherix IBT provides.
            </FadeRise>
          </div>
        </div>
      </section>

      <section className="mkt-v2-section">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">How it works</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Three phases. One year. Zero overhead.</FadeRise>
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
          <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">Deliver IBT the way it was designed.</FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Daily contact. Structured cadence. Year-one retention - without adding staff.
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
