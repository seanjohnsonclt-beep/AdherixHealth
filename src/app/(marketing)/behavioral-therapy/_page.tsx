'use client';

import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

const visitSchedule = [
  { period: 'Month 1',      visits: '4 visits',  cadence: 'Weekly',     sms: 'Daily check-ins between visits - food log, hunger rating, movement, emotional eating' },
  { period: 'Months 2-6',   visits: '10 visits', cadence: 'Biweekly',   sms: 'Every 2-3 days - habit reinforcement, setback reframes, visit prep, sleep and stress signals' },
  { period: 'Months 7-12',  visits: '6 visits',  cadence: 'Monthly',    sms: 'Weekly - eating quality, movement, visit prep, behavioral stability check' },
  { period: 'Year 2+',      visits: 'Monthly',   cadence: 'If 3kg lost', sms: 'Monthly touch - habit check, lab reminder, long-term sustainability' },
];

const without = [
  'Practice bills for 22 IBT visits - delivers 4-6 in practice',
  'Between-visit behavioral drift goes undetected',
  'No structured check-in between biweekly appointments',
  'Coordinator manually calls patients who miss appointments',
  'Emotional eating and setbacks surface at the next visit - weeks later',
  'Year-two retention suffers; Medicare continued coverage threshold missed',
];

const withIbt = [
  'SMS fills every gap the visit schedule cannot cover',
  'Daily behavioral data collected between visits - brings real signal into the room',
  'Biweekly visit prep sent automatically - patient arrives with something to work on',
  'Setbacks detected mid-cycle and reframed before they compound',
  'Sleep, stress, and emotional eating monitored as continuous signals',
  'Year-two 3kg threshold tracked - clinic notified if patient is at risk of not qualifying',
];

const behaviors = [
  { signal: 'Food log check-in', response: 'Daily lunch-time prompt during intensive phase. Not tracking calories - building the habit of noticing what and why.' },
  { signal: 'Hunger vs emotion detection', response: 'Evening prompt asks whether eating was hunger-driven or emotion-driven. Most patients have never been asked this question consistently.' },
  { signal: 'Movement check', response: 'Daily movement prompt anchored to the 150-minute weekly target. Short and direct - did you move today? Reply Y or N.' },
  { signal: 'Setback signal', response: 'When a patient replies ROUGH or STRUGGLING, the engine sends a specific reframe - not a generic affirmation. Calibrated to the phase they are in.' },
  { signal: 'Visit prep', response: 'Sent 2 days before every scheduled clinic visit. Patient is prompted to bring one specific thing to work on. Visit quality goes up.' },
  { signal: '48h silence', response: 'Engine detects dropout risk and sends a targeted re-engagement. Clinic alerted at 5 days with context, not noise.' },
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
            Intensive Behavioral Therapy for obesity is a Medicare benefit that requires
            frequent, brief behavioral contact - exactly what most practices cannot staff at scale.
            Adherix IBT fills every gap between clinic visits automatically, so the benefit
            your patients are entitled to is the one they actually receive.
          </FadeRise>
          <FadeRise className="dc-hero__stats" delay={0.14}>
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">22</span>
              <span className="dc-hero__stat-l">Medicare-covered visits in year one - this program operationalizes all of them</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">Daily</span>
              <span className="dc-hero__stat-l">SMS check-ins in month one - the highest behavioral risk window</span>
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
            <FadeRise as="span" className="mkt-eyebrow">The Medicare IBT schedule</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Adherix IBT runs in the gaps.</FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              The visit schedule is defined by CMS. What happens between visits is where most
              practices have nothing. That is where Adherix operates.
            </FadeRise>
          </div>
          <StaggerGroup className="ibt-schedule-grid" stagger={0.08} amount={0.2}>
            {visitSchedule.map(row => (
              <div key={row.period} className="ibt-schedule-row">
                <div className="ibt-schedule-row__period">
                  <span className="ibt-schedule-row__label">Period</span>
                  <span className="ibt-schedule-row__val">{row.period}</span>
                </div>
                <div className="ibt-schedule-row__visits">
                  <span className="ibt-schedule-row__label">Medicare visits</span>
                  <span className="ibt-schedule-row__val">{row.visits} &mdash; {row.cadence}</span>
                </div>
                <div className="ibt-schedule-row__sms">
                  <span className="ibt-schedule-row__label">Adherix IBT between visits</span>
                  <span className="ibt-schedule-row__val">{row.sms}</span>
                </div>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="mkt-v2-section">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">Behavioral signals</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>What the engine tracks between every visit.</FadeRise>
          </div>
          <StaggerGroup className="bridge-signal-list" stagger={0.07} amount={0.2}>
            {behaviors.map(s => (
              <div key={s.signal} className="bridge-signal-row">
                <div className="bridge-signal-row__trigger">
                  <span className="bridge-signal-row__label">Signal</span>
                  <span className="bridge-signal-row__val">{s.signal}</span>
                </div>
                <div className="bridge-signal-row__arrow" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M12 6l4 4-4 4" stroke="var(--mkt-sage-deep)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="bridge-signal-row__response">
                  <span className="bridge-signal-row__label">Response</span>
                  <span className="bridge-signal-row__val">{s.response}</span>
                </div>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="mkt-v2-section mkt-v2-section--alt">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The difference</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>IBT without a between-visit layer - and with one.</FadeRise>
          </div>
          <div className="mkt-r-sms__split">
            <FadeRise className="mkt-r-sms__col mkt-r-sms__col--dumb">
              <div className="mkt-r-sms__col-head">
                <span className="mkt-r-sms__tag mkt-r-sms__tag--dumb">Without Adherix IBT</span>
                <h3 className="mkt-h3">Underdelivered benefit</h3>
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
                <span className="mkt-r-sms__tag mkt-r-sms__tag--smart">With Adherix IBT</span>
                <h3 className="mkt-h3">Fully operationalized</h3>
              </div>
              <ul className="mkt-r-sms__list">
                {withIbt.map(item => (
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

      <section className="mkt-v2-section mkt-v2-section--ink">
        <div className="mkt-container mkt-v2-trust">
          <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">Ready to deliver IBT the way it was designed?</FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            The reimbursement exists. The visit schedule is set. Adherix IBT handles
            everything in between - automatically, at no additional staffing cost.
          </FadeRise>
          <FadeRise className="mkt-v2-trust__cta" delay={0.15}>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">Book a demo</Link>
            <Link href="/platform" className="mkt-btn mkt-btn--ghost mkt-btn--ghost-on-dark mkt-btn--lg">See the platform</Link>
          </FadeRise>
        </div>
      </section>

      <style>{`
        .ibt-schedule-grid { display: flex; flex-direction: column; gap: 1rem; }
        .ibt-schedule-row {
          display: grid;
          grid-template-columns: 140px 200px 1fr;
          gap: 1.5rem;
          align-items: start;
          background: var(--mkt-surface);
          border: 1px solid var(--mkt-border);
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
        }
        @media (max-width: 700px) {
          .ibt-schedule-row { grid-template-columns: 1fr; gap: 0.75rem; }
        }
        .ibt-schedule-row__label {
          display: block;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--mkt-graphite);
          opacity: 0.5;
          margin-bottom: 4px;
        }
        .ibt-schedule-row__val {
          display: block;
          font-size: 0.875rem;
          color: var(--mkt-ink);
          line-height: 1.5;
        }
      `}</style>
    </>
  );
}
