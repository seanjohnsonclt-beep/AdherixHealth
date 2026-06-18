'use client';

import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

const phases = [
  {
    num: '01',
    name: 'Pre-Op',
    duration: '7 days',
    body: 'Sets expectations before surgery. Protein targets, supplement schedule, what day-one recovery looks like. Patients who arrive informed recover faster.',
  },
  {
    num: '02',
    name: 'Acute Recovery',
    duration: '14 days',
    body: 'Liquid diet compliance, hydration, incision care. The highest-risk window for early complications and patient panic. Engine checks in daily.',
  },
  {
    num: '03',
    name: 'Diet Advancement',
    duration: '30 days',
    body: 'Progression from liquids through soft foods. Eating behavior rules: no drinking with meals, small bites, slow pace. Grazing is caught and corrected.',
  },
  {
    num: '04',
    name: 'Habit Building',
    duration: '60 days',
    body: 'Protein targets, supplement adherence, and movement all lock in here. The habits formed in this window determine 12-month outcomes.',
  },
  {
    num: '05',
    name: 'Rebound Window',
    duration: '90 days',
    body: 'Weight loss stalls. Motivation drops. This phase targets the behavioral patterns that precede long-term weight regain before they become permanent.',
  },
  {
    num: '06',
    name: 'Maintenance',
    duration: 'Ongoing',
    body: 'Light-touch check-ins for supplement adherence and weight stability. Keeps the patient connected to the clinic for the long arc of care.',
  },
];

const problems = [
  {
    stat: '~40%',
    label: 'of bariatric patients regain significant weight within 5 years',
    note: 'Behavioral dropout, not surgical failure',
  },
  {
    stat: '60%',
    label: 'of post-op patients are lost to follow-up within 2 years',
    note: 'No engagement system, no early warning',
  },
  {
    stat: '6+',
    label: 'months of active behavioral support needed to change long-term outcomes',
    note: 'Phone calls and portal messages do not scale',
  },
];

const signals = [
  { trigger: 'No supplement confirmation', response: 'Supplements are lifelong post-surgery - engine prompts with specific supplement and dose, not a generic reminder.' },
  { trigger: 'No protein reply (60g/day target)', response: 'Protein is the anchor habit. Engine resends the framing: muscle protection, energy, wound healing.' },
  { trigger: 'Grazing pattern detected', response: 'Multiple small eating events signal a high-risk behavior. Engine flags it and sends a direct correction before it becomes a habit.' },
  { trigger: '48h silence post-op', response: 'Acute recovery silence is high-risk. Engine escalates to clinic with patient context - not a generic flag.' },
  { trigger: 'Rebound window entry', response: 'Day 1 of Phase 5 triggers a specific rebound prevention message. Patient hears it before they feel the plateau.' },
];

const withoutBridge = [
  'Post-op call volume spikes in weeks 1-4',
  'Diet advancement handled by paper handout',
  'Supplement adherence tracked by self-report at annual visit',
  'Grazing and behavioral drift go undetected until regain appears',
  'Patient lost to follow-up - no trigger, no outreach',
];

const withBridge = [
  'Pre-op SMS sequence sets expectations before day one',
  'Daily check-ins in acute recovery without coordinator time',
  'Diet advancement rules reinforced in real time via SMS',
  'Grazing and behavioral drift detected and corrected automatically',
  'Rebound window caught early - patient engaged before the plateau hits',
];

export function ObesityCarePage() {
  return (
    <>
      {/* 1. Hero */}
      <section className="dc-hero" id="bridge-hero">
        <div className="mkt-container dc-hero__inner">
          <FadeRise as="span" className="dc-hero__eyebrow">
            Adherix Bridge - Bariatric Care
          </FadeRise>
          <FadeRise as="h1" className="dc-hero__title" delay={0.06}>
            Surgery solves the anatomy.
            <br />
            Behavior determines the outcome.
          </FadeRise>
          <FadeRise as="p" className="dc-hero__sub" delay={0.1}>
            Bariatric patients need structured behavioral support from pre-op through
            year two. Adherix Bridge delivers it automatically via SMS - no portal
            logins, no app downloads, no added coordinator workload.
          </FadeRise>
          <FadeRise className="dc-hero__stats" delay={0.14}>
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">6</span>
              <span className="dc-hero__stat-l">phases from pre-op through long-term maintenance</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">35+</span>
              <span className="dc-hero__stat-l">targeted messages across the post-op behavioral arc</span>
            </div>
            <div className="dc-hero__stat-div" />
            <div className="dc-hero__stat">
              <span className="dc-hero__stat-n">SMS</span>
              <span className="dc-hero__stat-l">first - no app, no portal, no friction</span>
            </div>
          </FadeRise>
          <FadeRise className="dc-hero__ctas" delay={0.2}>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">Book a demo</Link>
            <Link href="/platform" className="mkt-btn mkt-btn--ghost mkt-btn--lg">See the platform</Link>
          </FadeRise>
        </div>
      </section>

      {/* 2. The problem */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="bridge-problem">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The problem</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Bariatric surgery works. Post-op behavior is the variable.
            </FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              Outcomes diverge not in the OR but in the months that follow.
              Supplement adherence. Eating behavior. Protein targets. Activity.
              These are not self-managing - and a once-a-year check-in does not move them.
            </FadeRise>
          </div>
          <StaggerGroup className="dc-how-grid dc-how-grid--3col" stagger={0.08} amount={0.25}>
            {problems.map((p) => (
              <div key={p.stat} className="dc-how-card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--mkt-sage-deep)', lineHeight: 1, marginBottom: 8 }}>
                  {p.stat}
                </div>
                <p className="dc-how-card__body" style={{ fontWeight: 500, marginBottom: 6 }}>{p.label}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--mkt-graphite)', opacity: 0.65 }}>{p.note}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 3. Six phases */}
      <section className="mkt-v2-section" id="bridge-phases">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The care arc</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Six phases. Pre-op through year two.
            </FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              Each phase has its own message cadence, behavioral targets, and trigger
              logic. Patients advance automatically as time elapses.
            </FadeRise>
          </div>
          <StaggerGroup className="bridge-phase-grid" stagger={0.07} amount={0.2}>
            {phases.map((ph) => (
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

      {/* 4. Trigger signals */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="bridge-signals">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">Behavioral triggers</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Every signal gets a specific response.
            </FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              The engine detects post-op behavioral patterns and responds with
              targeted SMS - not generic check-ins.
            </FadeRise>
          </div>
          <StaggerGroup className="bridge-signal-list" stagger={0.07} amount={0.2}>
            {signals.map((s) => (
              <div key={s.trigger} className="bridge-signal-row">
                <div className="bridge-signal-row__trigger">
                  <span className="bridge-signal-row__label">Signal</span>
                  <span className="bridge-signal-row__val">{s.trigger}</span>
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

      {/* 5. Without / With */}
      <section className="mkt-v2-section" id="bridge-compare">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The difference</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              What your patients experience without it - and with it.
            </FadeRise>
          </div>
          <div className="mkt-r-sms__split">
            <FadeRise className="mkt-r-sms__col mkt-r-sms__col--dumb">
              <div className="mkt-r-sms__col-head">
                <span className="mkt-r-sms__tag mkt-r-sms__tag--dumb">Without Adherix Bridge</span>
                <h3 className="mkt-h3">Behavioral drift</h3>
              </div>
              <ul className="mkt-r-sms__list">
                {withoutBridge.map((item) => (
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
                <span className="mkt-r-sms__tag mkt-r-sms__tag--smart">With Adherix Bridge</span>
                <h3 className="mkt-h3">Closed loop</h3>
              </div>
              <ul className="mkt-r-sms__list">
                {withBridge.map((item) => (
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

      {/* 6. Who it's for */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="bridge-audience">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">Who it's built for</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Surgical programs that want better long-term outcomes.
            </FadeRise>
          </div>
          <StaggerGroup className="dc-how-grid dc-how-grid--2x2" stagger={0.09} amount={0.25}>
            {[
              {
                label: 'Bariatric surgery centers',
                body: 'Gastric sleeve and bypass programs that lack structured post-op behavioral follow-up beyond the 90-day visit cycle.',
              },
              {
                label: 'Obesity medicine practices',
                body: 'Programs offering both surgical and non-surgical pathways. Bridge handles the surgical cohort; Adherix Keep handles the GLP-1 side.',
              },
              {
                label: 'Health systems with bariatric programs',
                body: 'Coordinator teams stretched thin by post-op call volume. Bridge handles routine follow-up so staff focus on patients who actually need them.',
              },
              {
                label: 'Practices building a long-term care model',
                body: 'Surgery is year one. The patients who succeed at year five are the ones who stayed engaged. Bridge keeps that engagement running.',
              },
            ].map((c) => (
              <div key={c.label} className="dc-how-card">
                <h3 className="dc-how-card__label">{c.label}</h3>
                <p className="dc-how-card__body">{c.body}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* 7. CTA */}
      <section className="mkt-v2-section mkt-v2-section--ink" id="bridge-cta">
        <div className="mkt-container mkt-v2-trust">
          <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">
            Ready to extend your program beyond the OR?
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Adherix Bridge is built on the same behavioral engine as Adherix Keep.
            Same SMS-first architecture. Same automated trigger logic.
            Configured specifically for the post-surgical care arc.
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

      <style>{`
        .bridge-phase-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }
        @media (max-width: 860px) {
          .bridge-phase-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 540px) {
          .bridge-phase-grid { grid-template-columns: 1fr; }
        }
        .bridge-phase-card {
          background: var(--mkt-surface);
          border: 1px solid var(--mkt-border);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .bridge-phase-card__num {
          font-family: 'Geist Mono', ui-monospace, monospace;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--mkt-sage-deep);
          letter-spacing: 0.08em;
          opacity: 0.7;
        }
        .bridge-phase-card__head {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }
        .bridge-phase-card__name {
          font-size: 1rem;
          font-weight: 650;
          color: var(--mkt-ink);
        }
        .bridge-phase-card__dur {
          font-size: 0.75rem;
          color: var(--mkt-graphite);
          opacity: 0.6;
        }
        .bridge-phase-card__body {
          font-size: 0.875rem;
          color: var(--mkt-graphite);
          line-height: 1.55;
          margin: 0;
        }
        .bridge-signal-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 900px;
          margin: 0 auto;
        }
        .bridge-signal-row {
          display: grid;
          grid-template-columns: 1fr 32px 1fr;
          align-items: start;
          gap: 1rem;
          background: var(--mkt-surface);
          border: 1px solid var(--mkt-border);
          border-radius: 10px;
          padding: 1.25rem 1.5rem;
        }
        @media (max-width: 600px) {
          .bridge-signal-row {
            grid-template-columns: 1fr;
          }
          .bridge-signal-row__arrow { display: none; }
        }
        .bridge-signal-row__label {
          display: block;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--mkt-graphite);
          opacity: 0.5;
          margin-bottom: 4px;
        }
        .bridge-signal-row__val {
          display: block;
          font-size: 0.875rem;
          color: var(--mkt-ink);
          line-height: 1.5;
        }
        .bridge-signal-row__arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 18px;
          opacity: 0.6;
        }
        .dc-how-grid--3col {
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 700px) {
          .dc-how-grid--3col { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
