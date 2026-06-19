'use client';

import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

const phases = [
  { num: '01', name: 'Initiation',  duration: '1 day',    body: 'Welcome and medication timing anchor. Patient picks a daily time and commits to it. Same time every day is the single strongest predictor of long-term pill adherence.' },
  { num: '02', name: 'Onboarding',  duration: '14 days',  body: 'First dose, side effect framing, appetite change context. Patients who understand what to expect in the first two weeks stay on medication at significantly higher rates.' },
  { num: '03', name: 'Activation',  duration: '30 days',  body: 'Daily pill habit, protein reinforcement, refill warning at day 21. For controlled substances, the monthly Rx requirement is flagged before patients run out.' },
  { num: '04', name: 'Momentum',    duration: '45 days',  body: 'Consistency reinforcement and prescriber follow-up prompts. The 90-day mark is when most patients either lock in or quietly stop.' },
  { num: '05', name: 'Plateau',     duration: '45 days',  body: 'Plateau framing and dose review prompts. Three months is when the scale stalls and patients lose confidence. The engine addresses this before it becomes a reason to stop.' },
  { num: '06', name: 'Maintenance', duration: 'Ongoing',  body: 'Weekly habit check and monthly refill reminders. Long-term pharmacotherapy works when refills stay consistent and the behavioral habits around the medication hold.' },
];

const without = [
  'Patient fills first Rx - no follow-up until next appointment',
  'Side effects go unaddressed; patient stops without telling the clinic',
  'Refill missed because no one flagged the window',
  'Controlled substance requires monthly Rx - patient runs out between visits',
  'Plateau hits at month 3; patient assumes medication stopped working',
  'Silent discontinuation - clinic finds out at the 6-month visit',
];

const withRx = [
  'First dose framed: what to expect, what is normal, when to call',
  'Side effect keywords detected and corrected automatically',
  'Refill reminder at day 21 of every 30-day supply',
  'Monthly Rx reminder built into the trigger cadence',
  'Plateau framing sent before the stall hits - patient stays on it',
  'Drift detected at 48h silence; clinic alerted at 5 days',
];

const audience = [
  { label: 'Weight management clinics', body: 'Practices prescribing phentermine, topiramate, or combination protocols that need adherence support between monthly visits.' },
  { label: 'Primary care with obesity medicine', body: 'PCPs managing weight loss medications alongside other chronic conditions - high patient volume, limited follow-up bandwidth.' },
  { label: 'Endocrinology practices', body: 'Programs using metformin or other metabolic medications for weight management alongside diabetes or thyroid care.' },
  { label: 'Concierge and DPC practices', body: 'High-touch practices that want automated adherence support without adding coordinator overhead to their model.' },
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
            Non-GLP-1 weight loss medications work when patients take them consistently,
            manage side effects early, and stay on them through the plateau. Most do not.
            Adherix Rx runs the behavioral support layer automatically - no staff involvement required.
          </FadeRise>
          <FadeRise className="dc-hero__stats" delay={0.14}>
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">6</span>
              <span className="dc-hero__stat-l">phases from first dose through long-term maintenance</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">Daily</span>
              <span className="dc-hero__stat-l">pill habit anchored in the first week - before the dropout window opens</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">SMS</span>
              <span className="dc-hero__stat-l">first - meets patients where they already are</span>
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
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Medication adherence is a behavioral problem, not a clinical one.</FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              The pharmacology works. What breaks down is what happens between prescriptions.
              Side effects go unaddressed. Refills are missed. The plateau hits and patients assume
              the medication stopped working. None of these require a clinician to fix - they require
              a consistent, timely response that no practice can staff at scale.
            </FadeRise>
          </div>
          <StaggerGroup className="dc-how-grid dc-how-grid--3col" stagger={0.08} amount={0.25}>
            {[
              { stat: '~50%', label: 'of patients discontinue weight loss medication within 3 months', note: 'Side effects and plateau are the top two reasons' },
              { stat: '30d', label: 'supply cycles create a monthly dropout window for controlled substances', note: 'No refill reminder = silent discontinuation' },
              { stat: 'Month 3', label: 'is when the plateau hits and confidence drops - the highest-risk window', note: 'Most practices have no touchpoint here' },
            ].map(p => (
              <div key={p.stat} className="dc-how-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--mkt-sage-deep)', lineHeight: 1, marginBottom: 8 }}>{p.stat}</div>
                <p className="dc-how-card__body" style={{ fontWeight: 500, marginBottom: 6 }}>{p.label}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--mkt-graphite)', opacity: 0.65 }}>{p.note}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="mkt-v2-section">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The care arc</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Six phases. First dose through year one.</FadeRise>
          </div>
          <StaggerGroup className="bridge-phase-grid" stagger={0.07} amount={0.2}>
            {phases.map(ph => (
              <div key={ph.num} className="bridge-phase-card">
                <div className="bridge-phase-card__num">{ph.num}</div>
                <div className="bridge-phase-card__head">
                  <span className="bridge-phase-card__name">{ph.name}</span>
                  <span className="bridge-phase-card__dur">{ph.duration}</span>
                </div>
                <p className="bridge-phase-card__body">{ph.body}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="mkt-v2-section mkt-v2-section--alt">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The difference</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>What your patients experience without it - and with it.</FadeRise>
          </div>
          <div className="mkt-r-sms__split">
            <FadeRise className="mkt-r-sms__col mkt-r-sms__col--dumb">
              <div className="mkt-r-sms__col-head">
                <span className="mkt-r-sms__tag mkt-r-sms__tag--dumb">Without Adherix Rx</span>
                <h3 className="mkt-h3">Silent dropout</h3>
              </div>
              <ul className="mkt-r-sms__list">
                {without.map(item => (
                  <li key={item} className="mkt-r-sms__item">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 4 }}>
                      <circle cx="7" cy="7" r="6" stroke="var(--mkt-graphite)" strokeWidth="1.2" opacity="0.4"/>
                      <path d="M4.5 7h5" stroke="var(--mkt-graphite)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </FadeRise>
            <FadeRise className="mkt-r-sms__col mkt-r-sms__col--smart" delay={0.08}>
              <div className="mkt-r-sms__col-head">
                <span className="mkt-r-sms__tag mkt-r-sms__tag--smart">With Adherix Rx</span>
                <h3 className="mkt-h3">Closed loop</h3>
              </div>
              <ul className="mkt-r-sms__list">
                {withRx.map(item => (
                  <li key={item} className="mkt-r-sms__item">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0, marginTop: 4 }}>
                      <circle cx="7" cy="7" r="6" fill="var(--mkt-sage-mist)" stroke="var(--mkt-sage-soft)" strokeWidth="1"/>
                      <path d="M4.5 7l2 2 3-3" stroke="var(--mkt-sage-deep)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </FadeRise>
          </div>
        </div>
      </section>

      <section className="mkt-v2-section">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">Who it is built for</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Practices that prescribe weight loss medications and want patients to stay on them.</FadeRise>
          </div>
          <StaggerGroup className="dc-how-grid dc-how-grid--2x2" stagger={0.09} amount={0.25}>
            {audience.map(c => (
              <div key={c.label} className="dc-how-card">
                <h3 className="dc-how-card__label">{c.label}</h3>
                <p className="dc-how-card__body">{c.body}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="mkt-v2-section mkt-v2-section--ink">
        <div className="mkt-container mkt-v2-trust">
          <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">Ready to close the adherence gap?</FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Adherix Rx runs automatically from first fill through year one.
            No coordinator overhead. No portal. Just SMS that works.
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
