'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

const patterns = [
  {
    id: 'side-effect',
    label: 'Side effect',
    signal: 'Patient texts a side-effect keyword',
    escalates: '24h',
    color: '#5b7fa6',
    systemMsg: "What you're feeling is a recognized part of the adjustment period - most patients experience this between weeks 3 and 6. It doesn't mean the medication isn't working. Your next dose is Thursday. If anything feels severe, reply CALL.",
    patientReply: 'ok thank you - that actually helps',
  },
  {
    id: 'missed-dose',
    label: 'Missed dose',
    signal: 'Patient signals a missed or skipped dose',
    escalates: '48h',
    color: '#7a6fa6',
    systemMsg: "Missed a dose - don't double up. Just take the next one on schedule: Thursday. Missing one dose doesn't affect your overall progress. You're still on track.",
    patientReply: 'got it, will do thursday',
  },
  {
    id: 'withdrawal',
    label: 'Withdrawal',
    signal: '72h+ silence, inconsistent or declining trajectory',
    escalates: '72h',
    color: '#a67a5b',
    systemMsg: "Around this point in the program, a lot of people find it harder to stay in the rhythm - not for any one reason, just the reality of week 6. Your next dose is Thursday. No catch-up needed. You're still exactly where you should be.",
    patientReply: 'yeah its been rough. thanks for checking in',
  },
  {
    id: 'plateau',
    label: 'Plateau',
    signal: 'Phase 2-4, 48h+ silence, 21+ days in phase',
    escalates: '72h',
    color: '#5b8a6f',
    systemMsg: "Around week 8, most patients hit a window where progress feels like it has stalled. It hasn't. Your body is recalibrating, not resisting. Your next dose is Thursday. That's the only step right now.",
    patientReply: "that's reassuring - I'll stay with it",
  },
];

function AnimatedPhone({ pattern }: { pattern: typeof patterns[0] }) {
  const [stage, setStage] = useState<'idle' | 'message' | 'typing' | 'reply' | 'resolved'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearAll() { timerRef.current.forEach(clearTimeout); timerRef.current = []; }

  useEffect(() => {
    function run() {
      setStage('idle');
      const t1 = setTimeout(() => setStage('message'), 700);
      const t2 = setTimeout(() => setStage('typing'),  2600);
      const t3 = setTimeout(() => setStage('reply'),   4400);
      const t4 = setTimeout(() => setStage('resolved'), 5600);
      const t5 = setTimeout(run, 9500);
      timerRef.current = [t1, t2, t3, t4, t5];
    }
    run();
    return clearAll;
  }, [pattern.id]);

  return (
    <div className="mkt-iphone">
      <div className="mkt-iphone__frame">
        <div className="mkt-iphone__island" />
        <div className="mkt-iphone__status">
          <span className="mkt-iphone__time">9:41</span>
          <span className="mkt-iphone__status-icons">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden="true">
              <rect x="0" y="8" width="3" height="4" rx="0.6" opacity="0.35"/>
              <rect x="4.7" y="5" width="3" height="7" rx="0.6" opacity="0.35"/>
              <rect x="9.4" y="2" width="3" height="10" rx="0.6"/>
              <rect x="14.1" y="0" width="3" height="12" rx="0.6"/>
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35"/>
              <rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.4"/>
              <rect x="2" y="2" width="14" height="8" rx="2" fill="currentColor"/>
            </svg>
          </span>
        </div>
        <div className="mkt-iphone__header">
          <div className="mkt-iphone__avatar">A</div>
          <div>
            <div className="mkt-iphone__contact">Adherix Health</div>
            <div className="mkt-iphone__contact-sub">text message</div>
          </div>
        </div>
        <div className="mkt-iphone__thread">
          <div className="mkt-iphone__thread-date">Today 9:41 AM</div>
          <div className={`mkt-iphone__bubble mkt-iphone__bubble--in dc-bubble-fade${stage !== 'idle' ? ' is-visible' : ''}`}>
            {pattern.systemMsg}
          </div>
          {stage === 'typing' && (
            <div className="mkt-iphone__bubble mkt-iphone__bubble--out dc-typing-indicator">
              <span /><span /><span />
            </div>
          )}
          {(stage === 'reply' || stage === 'resolved') && (
            <div className="mkt-iphone__bubble mkt-iphone__bubble--out dc-bubble-fade is-visible">
              {pattern.patientReply}
            </div>
          )}
          {stage === 'resolved' && (
            <div className="dc-resolved-badge dc-bubble-fade is-visible">
              <span>&#10003;</span> Resolved automatically
            </div>
          )}
        </div>
        <div className="mkt-iphone__bar">
          <div className="mkt-iphone__field">iMessage</div>
        </div>
        <div className="mkt-iphone__indicator" />
      </div>
    </div>
  );
}

const withoutDC = [
  'Patient goes quiet - no signal is read',
  'Clinic finds out at the next manual check-in',
  'By then, the patient is one foot out the door',
  'Staff phone call: reactive, rushed, often too late',
  'Outcome: churn logged. Revenue gone.',
];

const withDC = [
  'Silence or keyword triggers the engine in real time',
  'Pattern classified: side effect, missed dose, withdrawal, or plateau',
  'Locked, specific SMS sent within the same tick',
  'If patient replies: resolved automatically, zero clinic time',
  'If silence continues: clinic alerted with context, not noise',
];

export function DriftCorrectionPage() {
  const [activePattern, setActivePattern] = useState(0);

  return (
    <>
      {/* 1. Hero */}
      <section className="dc-hero" id="dc-hero">
        <div className="mkt-container dc-hero__inner">
          <FadeRise as="span" className="dc-hero__eyebrow">
            Drift Correction
          </FadeRise>
          <FadeRise as="h1" className="dc-hero__title" delay={0.06}>
            By the time you notice,
            <br />
            it&rsquo;s already corrected.
          </FadeRise>
          <FadeRise as="p" className="dc-hero__sub" delay={0.1}>
            The engine runs every 60 seconds. When a patient goes quiet,
            misses a dose, or signals a side effect - Drift Correction
            identifies the pattern, sends the right message, and tracks
            whether it worked. No one has to tell it to.
          </FadeRise>
          <FadeRise className="dc-hero__stats" delay={0.14}>
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">4</span>
              <span className="dc-hero__stat-l">behavioral patterns detected and classified</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">&lt;&nbsp;60s</span>
              <span className="dc-hero__stat-l">from signal to correction - no staff required</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">0</span>
              <span className="dc-hero__stat-l">corrections left unresolved or untracked</span>
            </div>
          </FadeRise>
          <FadeRise className="dc-hero__ctas" delay={0.2}>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">Book a demo</Link>
            <Link href="/platform" className="mkt-btn mkt-btn--ghost mkt-btn--lg">See the full platform</Link>
          </FadeRise>
        </div>
      </section>

      {/* 2. How it works */}
      <section className="mkt-v2-section" id="dc-how">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">How it works</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Four steps. No manual monitoring.
            </FadeRise>
          </div>
          <StaggerGroup className="dc-how-grid dc-how-grid--2x2" stagger={0.1} amount={0.3}>
            {[
              { label: 'Signal detected',    body: 'Patient keywords, silence duration, and engagement trajectory scored every 60 seconds.' },
              { label: 'Pattern identified', body: 'Engine classifies the drift: side effect, missed dose, withdrawal, or plateau.' },
              { label: 'Correction sent',    body: 'Locked, pattern-specific SMS - a message calibrated to what the patient is actually experiencing.' },
              { label: 'Loop closed',        body: 'Auto-resolves on reply. Escalates to the clinic if silence crosses the threshold.' },
            ].map((s) => (
              <div key={s.label} className="dc-how-card">
                <h3 className="dc-how-card__label">{s.label}</h3>
                <p className="dc-how-card__body">{s.body}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 3. Four patterns + iPhone */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="dc-patterns">
        <div className="mkt-container mkt-v2-sms-view" style={{ alignItems: 'start' }}>
          <FadeRise className="mkt-v2-sms-view__copy">
            <span className="mkt-eyebrow">Four patterns</span>
            <h2 className="mkt-h2">Every correction is specific.</h2>
            <p className="mkt-subhead" style={{ marginBottom: 32 }}>
              The engine doesn&rsquo;t send a generic check-in. It classifies
              the behavioral signal and delivers the message written for that
              exact situation - then watches for a reply.
            </p>
            <div className="dc-pattern-list">
              {patterns.map((p, i) => (
                <button
                  key={p.id}
                  className={`dc-pattern-tab${i === activePattern ? ' is-active' : ''}`}
                  onClick={() => setActivePattern(i)}
                  style={{ '--pattern-color': p.color } as React.CSSProperties}
                >
                  <div className="dc-pattern-tab__label">{p.label}</div>
                  <div className="dc-pattern-tab__signal">{p.signal}</div>
                  <div className="dc-pattern-tab__escalates">
                    escalates if no reply in {p.escalates}
                  </div>
                </button>
              ))}
            </div>
          </FadeRise>
          <FadeRise className="mkt-v2-sms-view__phone" delay={0.12}>
            <AnimatedPhone key={activePattern} pattern={patterns[activePattern]} />
          </FadeRise>
        </div>
      </section>

      {/* 4. Without DC / With DC */}
      <section className="mkt-v2-section" id="dc-compare">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The difference</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              What happens without it - and with it.
            </FadeRise>
          </div>
          <div className="mkt-r-sms__split">
            <FadeRise className="mkt-r-sms__col mkt-r-sms__col--dumb">
              <div className="mkt-r-sms__col-head">
                <span className="mkt-r-sms__tag mkt-r-sms__tag--dumb">Without Drift Correction</span>
                <h3 className="mkt-h3">Silent churn</h3>
              </div>
              <ul className="mkt-r-sms__list">
                {withoutDC.map((item) => (
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
                <span className="mkt-r-sms__tag mkt-r-sms__tag--smart">With Drift Correction</span>
                <h3 className="mkt-h3">Closed loop</h3>
              </div>
              <ul className="mkt-r-sms__list">
                {withDC.map((item) => (
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

      {/* 5. Resolution */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="dc-resolution">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">Resolution</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Every correction has an outcome.
            </FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              The engine doesn&rsquo;t just send - it waits, measures, and acts.
              No correction is ever left open.
            </FadeRise>
          </div>
          <StaggerGroup className="dc-res-cards" stagger={0.1} amount={0.3}>
            <div className="dc-res-card dc-res-card--green">
              <div className="dc-res-card__accent" />
              <div className="dc-res-card__icon-wrap">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5" opacity="0.25"/>
                  <path d="M 12 21 L 18 27 L 29 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="dc-res-card__title">Auto-resolved</h3>
              <p className="dc-res-card__body">
                Patient replies after the correction is sent. Engine marks it resolved,
                logs time-to-resolution, and moves on. Zero clinic involvement.
              </p>
              <div className="dc-res-card__stat">
                <span className="dc-res-card__stat-label">Typical resolution</span>
                <span className="dc-res-card__stat-val">2 - 8 hours</span>
              </div>
            </div>

            <div className="dc-res-card dc-res-card--amber">
              <div className="dc-res-card__accent" />
              <div className="dc-res-card__icon-wrap">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5" opacity="0.25"/>
                  <circle cx="20" cy="15" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M 11 31 C 11 26 14.5 23 20 23 C 25.5 23 29 26 29 31" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M 29 18 L 32 18 M 30.5 16.5 L 30.5 19.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="dc-res-card__title">Escalated to clinic</h3>
              <p className="dc-res-card__body">
                Silence crosses the threshold - 24h for side effects, up to 72h for
                plateau. Patient flagged. Clinic alerted. One call, right patient, right moment.
              </p>
              <div className="dc-res-card__stat">
                <span className="dc-res-card__stat-label">Escalation window</span>
                <span className="dc-res-card__stat-val">24 - 72 hours</span>
              </div>
            </div>

            <div className="dc-res-card dc-res-card--red">
              <div className="dc-res-card__accent" />
              <div className="dc-res-card__icon-wrap">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <circle cx="20" cy="20" r="19" stroke="currentColor" strokeWidth="1.5" opacity="0.25"/>
                  <path d="M 22.5 11 L 15 22 L 19.5 22 L 17.5 29 L 25 18 L 20.5 18 Z"
                    stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
                    fill="currentColor" fillOpacity="0.15"/>
                </svg>
              </div>
              <h3 className="dc-res-card__title">Immediate escalation</h3>
              <p className="dc-res-card__body">
                Patient texts CALL or HELP. Every threshold bypassed. Clinic notified
                within the next engine tick - under 60 seconds, any time, any phase.
              </p>
              <div className="dc-res-card__stat">
                <span className="dc-res-card__stat-label">Response time</span>
                <span className="dc-res-card__stat-val">&lt; 60 seconds</span>
              </div>
            </div>
          </StaggerGroup>
        </div>
      </section>

      {/* 6. CTA */}
      <section className="mkt-v2-section mkt-v2-section--ink" id="dc-cta">
        <div className="mkt-container mkt-v2-trust">
          <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">
            Ready to close the loop?
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Drift Correction runs automatically. Every tick, every patient,
            every pattern - no coordinator required.
          </FadeRise>
          <FadeRise className="mkt-v2-trust__cta" delay={0.15}>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
              Book a demo
            </Link>
            <Link href="/platform" className="mkt-btn mkt-btn--ghost mkt-btn--ghost-on-dark mkt-btn--lg">
              See the full platform
            </Link>
          </FadeRise>
        </div>
      </section>

    </>
  );
}
