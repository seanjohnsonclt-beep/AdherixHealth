'use client';

import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

const phases = [
  { num: '01', name: 'Initiation',   duration: '1 day',   body: 'Welcome and context. Patients learn that pre-diabetes is reversible - not a permanent diagnosis. Framing matters: patients who understand their leverage show up differently.' },
  { num: '02', name: 'Baseline',     duration: '14 days', body: 'Carb awareness, post-meal walk introduction, sleep as a metabolic variable, medication confirmation. Two weeks of observation before behavior targets are set.' },
  { num: '03', name: 'Intervention', duration: '30 days', body: 'Protein at breakfast, post-meal movement, fiber targets, stress and glucose connection. One specific habit per message - no overwhelm, no tracking apps required.' },
  { num: '04', name: 'Optimization', duration: '60 days', body: 'Consistency reinforcement, medication adherence check, sleep targeting, A1c framing. The 90-day window where habits either lock in or drift.' },
  { num: '05', name: 'Monitoring',   duration: 'Ongoing', body: 'Weekly behavioral check and quarterly A1c lab reminder. Keeps the patient connected to their numbers and accountable to the habits that moved them.' },
];

const levers = [
  { lever: 'Post-meal walk', impact: 'A 10-minute walk after eating reduces blood sugar spike by up to 25%. No equipment, no gym, no willpower - just timing.' },
  { lever: 'Protein at breakfast', impact: '25-30g of protein in the first meal slows glucose absorption for the morning. Eggs, Greek yogurt, cottage cheese. One habit, measurable metabolic effect.' },
  { lever: 'Sleep (7+ hours)', impact: 'Under 7 hours of sleep raises fasting glucose and increases insulin resistance the next day. Most patients have never been told this.' },
  { lever: 'Carb quality', impact: 'Not counting carbs - swapping fast carbs for slow ones. White rice to lentils. White bread to whole grain. One swap per meal changes the glucose curve.' },
  { lever: 'Stress awareness', impact: 'Cortisol triggers glucose release directly. High-stress weeks show in metabolic numbers. The engine asks about stress as a metabolic signal, not just a mood one.' },
  { lever: 'A1c tracking', impact: 'Quarterly lab reminder built into the maintenance phase. A 0.5% reduction in A1c cuts T2D progression risk by ~30%. Patients need to see the number to believe the change.' },
];

const without = [
  'Pre-diabetes flagged at annual visit - no follow-up program offered',
  'Patient leaves with a pamphlet and a recommendation to "eat better"',
  'No between-visit contact until next year's lab',
  'Metabolic drift continues undetected',
  'A1c crosses into T2D range - now a more complex, more expensive patient',
  'Practice had no touchpoint to prevent it',
];

const withMet = [
  'Pre-diabetes diagnosis triggers immediate enrollment in Adherix Metabolic',
  'Baseline established in first two weeks - behavioral snapshot before targets set',
  'Specific, actionable habits delivered via SMS - no apps, no tracking burden',
  'Sleep, stress, and carb quality monitored as continuous metabolic signals',
  'Quarterly A1c reminder ensures the lab gets done and the number gets seen',
  'A1c improvement tracked - clinic can demonstrate outcome at any point',
];

export function MetabolicHealthPage() {
  return (
    <>
      <section className="dc-hero">
        <div className="mkt-container dc-hero__inner">
          <FadeRise as="span" className="dc-hero__eyebrow">Adherix Metabolic - Metabolic Health</FadeRise>
          <FadeRise as="h1" className="dc-hero__title" delay={0.06}>
            88 million Americans have pre-diabetes.
            <br />Most do not know it. None have a plan.
          </FadeRise>
          <FadeRise as="p" className="dc-hero__sub" delay={0.1}>
            Pre-diabetes and metabolic syndrome are reversible - but only with
            consistent behavioral intervention between clinic visits. Adherix Metabolic
            delivers the specific, evidence-based habits that move A1c in the right direction,
            automatically, via SMS. No apps. No tracking burden. No additional staff.
          </FadeRise>
          <FadeRise className="dc-hero__stats" delay={0.14}>
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">88M</span>
              <span className="dc-hero__stat-l">Americans with pre-diabetes - the largest addressable patient pool in metabolic care</span>
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
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Pre-diabetes is a gap in care, not just a diagnosis.</FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              Most practices identify pre-diabetes and have nowhere to send the patient.
              The visit schedule does not support the frequency of contact that behavior change requires.
              By the time the next annual lab comes back, the window has closed.
            </FadeRise>
          </div>
          <StaggerGroup className="dc-how-grid dc-how-grid--3col" stagger={0.08} amount={0.25}>
            {[
              { stat: '80%', label: 'of people with pre-diabetes are undiagnosed or unmanaged', note: 'Identified at annual labs - then nothing' },
              { stat: '70%', label: 'will develop type 2 diabetes within 10 years without intervention', note: 'Reversible with consistent lifestyle change' },
              { stat: '0', label: 'structured between-visit programs exist at most primary care practices', note: 'The gap Adherix Metabolic closes' },
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
            <FadeRise as="span" className="mkt-eyebrow">The levers</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Six evidence-based habits. One per message.</FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              Each SMS targets a specific metabolic lever - not general wellness advice.
              The science behind each one is established. The delivery is what was missing.
            </FadeRise>
          </div>
          <StaggerGroup className="bridge-signal-list" stagger={0.07} amount={0.2}>
            {levers.map(l => (
              <div key={l.lever} className="bridge-signal-row">
                <div className="bridge-signal-row__trigger">
                  <span className="bridge-signal-row__label">Habit</span>
                  <span className="bridge-signal-row__val">{l.lever}</span>
                </div>
                <div className="bridge-signal-row__arrow" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10h12M12 6l4 4-4 4" stroke="var(--mkt-sage-deep)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="bridge-signal-row__response">
                  <span className="bridge-signal-row__label">Why it moves the needle</span>
                  <span className="bridge-signal-row__val">{l.impact}</span>
                </div>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="mkt-v2-section mkt-v2-section--alt">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The care arc</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Five phases. Diagnosis through long-term monitoring.</FadeRise>
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

      <section className="mkt-v2-section">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The difference</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Pre-diabetes management without a between-visit program - and with one.</FadeRise>
          </div>
          <div className="mkt-r-sms__split">
            <FadeRise className="mkt-r-sms__col mkt-r-sms__col--dumb">
              <div className="mkt-r-sms__col-head">
                <span className="mkt-r-sms__tag mkt-r-sms__tag--dumb">Without Adherix Metabolic</span>
                <h3 className="mkt-h3">Missed window</h3>
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
                <span className="mkt-r-sms__tag mkt-r-sms__tag--smart">With Adherix Metabolic</span>
                <h3 className="mkt-h3">Closed loop</h3>
              </div>
              <ul className="mkt-r-sms__list">
                {withMet.map(item => (
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
          <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">The largest untapped patient pool in your practice.</FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Every practice has pre-diabetic patients with no active program.
            Adherix Metabolic turns a lab result into a 90-day behavioral intervention -
            automatically, with no added overhead.
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
