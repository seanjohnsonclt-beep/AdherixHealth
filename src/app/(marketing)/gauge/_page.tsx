'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

// --- Animated phone: weekly check-in exchange --------------------------------

const exchanges = [
  {
    checkin: "Hi Sarah - quick check-in: what's your weight this week? Just reply with the number.",
    reply: '182',
    response: "Down 11 lbs since you started, Sarah. That's real. Keep going.",
    label: '11 lbs down',
    color: '#5b8a6f',
  },
  {
    checkin: "Hi Marcus - quick check-in: what's your weight this week? Just reply with the number.",
    reply: '214',
    response: "Marcus - you've lost 10% of your starting weight. That's the threshold where health outcomes actually shift. You're there.",
    label: '10% milestone',
    color: '#5b7fa6',
  },
  {
    checkin: "Hi Diane - quick check-in: what's your weight this week? Just reply with the number.",
    reply: '167',
    response: "Scale holding steady this week, Diane - that's normal on GLP-1s. Plateaus break when you stay consistent. Same habits, same check-ins.",
    label: 'Plateau support',
    color: '#a67a5b',
  },
  {
    checkin: "Hi James - quick check-in: what's your weight this week? Just reply with the number.",
    reply: '198',
    response: "James - averaging 1.8 lbs/week. That's above the typical range for this medication. The consistency is showing.",
    label: 'Strong avg',
    color: '#7a6fa6',
  },
];

function AnimatedPhone({ exchange }: { exchange: typeof exchanges[0] }) {
  const [stage, setStage] = useState<'idle' | 'checkin' | 'typing' | 'reply' | 'response'>('idle');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clear() { timers.current.forEach(clearTimeout); timers.current = []; }

  useEffect(() => {
    function run() {
      setStage('idle');
      const t1 = setTimeout(() => setStage('checkin'),  600);
      const t2 = setTimeout(() => setStage('typing'),   2400);
      const t3 = setTimeout(() => setStage('reply'),    3800);
      const t4 = setTimeout(() => setStage('response'), 5200);
      const t5 = setTimeout(run, 9800);
      timers.current = [t1, t2, t3, t4, t5];
    }
    run();
    return clear;
  }, [exchange.checkin]);

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
            {exchange.checkin}
          </div>

          {stage === 'typing' && (
            <div className="mkt-iphone__bubble mkt-iphone__bubble--out dc-typing-indicator">
              <span /><span /><span />
            </div>
          )}

          {(stage === 'reply' || stage === 'response') && (
            <div className="mkt-iphone__bubble mkt-iphone__bubble--out dc-bubble-fade is-visible">
              {exchange.reply}
            </div>
          )}

          {stage === 'response' && (
            <div className="mkt-iphone__bubble mkt-iphone__bubble--in dc-bubble-fade is-visible gauge-response-bubble">
              {exchange.response}
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

// --- Milestone cards ---------------------------------------------------------

const milestones = [
  {
    label: 'First log',
    body: 'Starting weight locked in. The baseline is set - every week from here is progress against a real number.',
    icon: '◎',
    color: '#5b7fa6',
  },
  {
    label: '5 lbs down',
    body: 'The medication is doing its job. Patients who see this number early stay engaged through harder weeks.',
    icon: '↓',
    color: '#5b8a6f',
  },
  {
    label: '10 lbs down',
    body: 'Most people notice a real physical difference here. The message says so - and tells them to stay consistent.',
    icon: '↓↓',
    color: '#5b8a6f',
  },
  {
    label: '10% of starting weight',
    body: "The clinical threshold where metabolic health outcomes measurably shift. Patients deserve to know when they've crossed it.",
    icon: '%',
    color: '#7a6fa6',
  },
  {
    label: '20% of starting weight',
    body: "Exceptional territory. The message names it directly - rare company, same habits, keep going.",
    icon: '%%',
    color: '#7a6fa6',
  },
  {
    label: 'Plateau detected',
    body: "Scale hasn't moved. Instead of silence, the patient gets a message: normal, expected, here's why it breaks.",
    icon: '—',
    color: '#a67a5b',
  },
];

const withoutGauge = [
  'Clinic has no idea how much weight the patient has lost',
  'Patient hits a plateau - no one notices, no one responds',
  'Motivation drops quietly - patient stops engaging',
  'By the time it shows up in data, they\'ve already quit',
  'Lost revenue. Outcome unknown.',
];

const withGauge = [
  'Weekly check-in lands Monday morning - one text, one number',
  'Weight logged, progress calculated, milestone checked',
  'Patient hits 10 lbs - congratulatory message fires within seconds',
  'Plateau detected - support message sent before motivation crashes',
  'Clinic sees who is progressing and who is stalling - in real time',
];

// --- Page --------------------------------------------------------------------

export function GaugePage() {
  const [activeExchange, setActiveExchange] = useState(0);

  return (
    <>
      {/* 1. Hero */}
      <section className="gauge-hero" id="gauge-hero">
        <div className="mkt-container gauge-hero__inner">
          <FadeRise as="span" className="gauge-hero__eyebrow">
            Adherix Gauge
          </FadeRise>
          <FadeRise as="h1" className="gauge-hero__title" delay={0.06}>
            Every pound is proof.
            <br />
            <span className="gauge-hero__title-sub">We make sure patients know it.</span>
          </FadeRise>
          <FadeRise as="p" className="gauge-hero__body" delay={0.1}>
            GLP-1 patients are motivated by one thing above everything else: the scale moving.
            Gauge tracks it through a simple weekly text - no app, no friction.
            When patients hit a milestone, they hear about it. When the scale stalls, we tell them why
            it&rsquo;s normal and keep them going.
          </FadeRise>
          <FadeRise className="gauge-hero__stats" delay={0.14}>
            <div className="gauge-hero__stat">
              <span className="gauge-hero__stat-n">1</span>
              <span className="gauge-hero__stat-l">text per week - no app required</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="gauge-hero__stat">
              <span className="gauge-hero__stat-n">6</span>
              <span className="gauge-hero__stat-l">milestone triggers from first log to 20% lost</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="gauge-hero__stat">
              <span className="gauge-hero__stat-n">0</span>
              <span className="gauge-hero__stat-l">plateaus that go unacknowledged</span>
            </div>
          </FadeRise>
          <FadeRise className="gauge-hero__ctas" delay={0.2}>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">Book a demo</Link>
            <Link href="/platform" className="mkt-btn mkt-btn--ghost mkt-btn--lg">See the full platform</Link>
          </FadeRise>
        </div>
      </section>

      {/* 2. The moment that matters */}
      <section className="mkt-v2-section" id="gauge-moment">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The problem</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              The scale stops moving. So does the patient.
            </FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              GLP-1 medications produce real, visible weight loss - and that visibility is what keeps patients on treatment.
              When progress stalls, motivation follows. Without something to close that gap,
              patients go quiet, disengage, and eventually drop off.
              No alert. No intervention. Just churn.
            </FadeRise>
          </div>
          <StaggerGroup className="gauge-moment-grid" stagger={0.09} amount={0.3}>
            {[
              {
                step: '01',
                label: 'Scale moves',
                body: 'Patient loses weight in the first weeks. Motivation is high. Engagement is strong. They reply to everything.',
                state: 'positive',
              },
              {
                step: '02',
                label: 'Plateau hits',
                body: 'Progress slows or stalls. This is normal physiology - but patients don\'t know that. They assume the medication stopped working.',
                state: 'warning',
              },
              {
                step: '03',
                label: 'Silence sets in',
                body: 'Replies slow down. Check-ins go unanswered. No one detects it because no one is tracking the weight data that triggered it.',
                state: 'danger',
              },
              {
                step: '04',
                label: 'Patient drops off',
                body: 'By the time the clinic notices, the patient has mentally quit. Re-engagement at this point is expensive - and rarely works.',
                state: 'danger',
              },
            ].map((s) => (
              <div key={s.step} className={`gauge-moment-card gauge-moment-card--${s.state}`}>
                <span className="gauge-moment-card__step">{s.step}</span>
                <h3 className="gauge-moment-card__label">{s.label}</h3>
                <p className="gauge-moment-card__body">{s.body}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 3. How it works + animated phone */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="gauge-how">
        <div className="mkt-container mkt-v2-sms-view" style={{ alignItems: 'start' }}>
          <FadeRise className="mkt-v2-sms-view__copy">
            <span className="mkt-eyebrow">How it works</span>
            <h2 className="mkt-h2">One text. Every week. That&rsquo;s it.</h2>
            <p className="mkt-subhead" style={{ marginBottom: 32 }}>
              Gauge sends a check-in every Monday morning. The patient replies with a number.
              The engine logs it, calculates progress against their starting weight,
              and responds based on exactly where they are.
              No app. No login. No friction.
            </p>
            <div className="gauge-exchange-list">
              {exchanges.map((e, i) => (
                <button
                  key={i}
                  className={`gauge-exchange-tab${i === activeExchange ? ' is-active' : ''}`}
                  onClick={() => setActiveExchange(i)}
                  style={{ '--gauge-color': e.color } as React.CSSProperties}
                >
                  <span className="gauge-exchange-tab__label">{e.label}</span>
                </button>
              ))}
            </div>
          </FadeRise>
          <FadeRise className="mkt-v2-sms-view__phone" delay={0.12}>
            <AnimatedPhone key={activeExchange} exchange={exchanges[activeExchange]} />
          </FadeRise>
        </div>
      </section>

      {/* 4. Milestones */}
      <section className="mkt-v2-section" id="gauge-milestones">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">Milestones</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Every win gets acknowledged.
            </FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              Gauge tracks six distinct milestones - from first weigh-in to 20% of starting weight lost.
              Each one fires exactly once, with a message written for that specific moment.
              Patients feel seen. Clinics see who is winning.
            </FadeRise>
          </div>
          <StaggerGroup className="gauge-milestones-grid" stagger={0.08} amount={0.25}>
            {milestones.map((m) => (
              <div key={m.label} className="gauge-milestone-card" style={{ '--milestone-color': m.color } as React.CSSProperties}>
                <div className="gauge-milestone-card__icon">{m.icon}</div>
                <h3 className="gauge-milestone-card__label">{m.label}</h3>
                <p className="gauge-milestone-card__body">{m.body}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 5. Without / With */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="gauge-compare">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The difference</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Blind spots vs. closed loops.
            </FadeRise>
          </div>
          <div className="mkt-r-sms__split">
            <FadeRise className="mkt-r-sms__col mkt-r-sms__col--dumb">
              <div className="mkt-r-sms__col-head">
                <span className="mkt-r-sms__tag mkt-r-sms__tag--dumb">Without Gauge</span>
                <h3 className="mkt-h3">Flying blind</h3>
              </div>
              <ul className="mkt-r-sms__list">
                {withoutGauge.map((item) => (
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
                <span className="mkt-r-sms__tag mkt-r-sms__tag--smart">With Gauge</span>
                <h3 className="mkt-h3">Progress tracked</h3>
              </div>
              <ul className="mkt-r-sms__list">
                {withGauge.map((item) => (
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

      {/* 6. For clinics */}
      <section className="mkt-v2-section" id="gauge-clinics">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">For clinics</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Proof the treatment is working.
            </FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              Gauge gives clinics something they&rsquo;ve never had before - a real-time weight signal at
              the patient level. Not claims data. Not self-reported outcomes at a 90-day visit.
              Actual weekly numbers, automatically collected, with no staff time required.
            </FadeRise>
          </div>
          <StaggerGroup className="gauge-clinic-grid" stagger={0.1} amount={0.3}>
            {[
              {
                title: 'Outcome visibility',
                body: 'See which patients are losing weight, at what rate, and where progress has stalled - without calling anyone.',
              },
              {
                title: 'Early stall detection',
                body: 'Gauge sees a plateau before the patient stops engaging. The support message goes out automatically. No coordinator needed.',
              },
              {
                title: 'Retention at the critical moment',
                body: 'The moment a patient thinks the medication stopped working is the moment they quit. Gauge closes that gap with a text - not a phone call.',
              },
              {
                title: 'A stronger program story',
                body: 'Real weight loss data, collected weekly, gives clinics something concrete to show: this program works. Here are the numbers.',
              },
            ].map((c) => (
              <div key={c.title} className="gauge-clinic-card">
                <h3 className="gauge-clinic-card__title">{c.title}</h3>
                <p className="gauge-clinic-card__body">{c.body}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="mkt-v2-section mkt-v2-section--ink" id="gauge-cta">
        <div className="mkt-container mkt-v2-trust">
          <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">
            The scale is already moving.
            <br />
            Make sure your patients know it.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Gauge runs automatically alongside the rest of the Adherix platform.
            One text per week. Every milestone acknowledged. Every plateau caught.
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
