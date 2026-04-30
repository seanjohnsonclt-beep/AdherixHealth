'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

// ─── Pattern data ─────────────────────────────────────────────────────────────

const patterns = [
  {
    id: 'side-effect',
    label: 'Side effect',
    signal: 'Patient texts a side-effect keyword',
    escalates: '24h',
    color: '#5b7fa6',
    systemMsg:
      "What you're feeling at this stage is a recognized part of the adjustment period — most patients experience some version of it between weeks 3 and 6. It doesn't mean the medication isn't working. Your next dose is Thursday. If anything feels severe, reply CALL and someone from the clinic will reach out today.",
    patientReply: 'ok thank you that actually helps',
    outcome: 'auto_resolved',
  },
  {
    id: 'missed-dose',
    label: 'Missed dose',
    signal: 'Patient signals a missed or skipped dose',
    escalates: '48h',
    color: '#7a6fa6',
    systemMsg:
      "Missed a dose — don't double up. Just take the next one on schedule: Thursday. Missing one dose doesn't affect your overall progress or your protocol. You're still on track.",
    patientReply: 'got it, will do thursday',
    outcome: 'auto_resolved',
  },
  {
    id: 'withdrawal',
    label: 'Withdrawal',
    signal: '72h+ silence, inconsistent or declining trajectory',
    escalates: '72h',
    color: '#a67a5b',
    systemMsg:
      "Around this point in the program, a lot of people find it harder to stay in the rhythm — not for any one reason, just the reality of week 6. Your next dose is Thursday. No catch-up needed. You're still exactly where you should be.",
    patientReply: 'yeah its been rough. thanks for checking in',
    outcome: 'auto_resolved',
  },
  {
    id: 'plateau',
    label: 'Plateau',
    signal: 'Phase 2–4, 48h+ silence, 21+ days in phase',
    escalates: '72h',
    color: '#5b8a6f',
    systemMsg:
      "Around week 8, most patients hit a window where progress feels like it has stalled. It hasn't. This is a recognized adjustment period — your body is recalibrating, not resisting. The patients who push through this window see the clearest results on the other side. Your next dose is Thursday. That's the only step right now.",
    patientReply: "that's reassuring, I'll stay with it",
    outcome: 'auto_resolved',
  },
];

// ─── Animated iPhone ──────────────────────────────────────────────────────────

function AnimatedPhone({ pattern }: { pattern: typeof patterns[0] }) {
  const [stage, setStage] = useState<'idle' | 'message' | 'typing' | 'reply' | 'resolved'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Run the animation sequence once on mount, then loop
    function run() {
      setStage('idle');
      timerRef.current = setTimeout(() => setStage('message'), 600);
      timerRef.current = setTimeout(() => setStage('typing'), 2200);
      timerRef.current = setTimeout(() => setStage('reply'), 4000);
      timerRef.current = setTimeout(() => setStage('resolved'), 5200);
      timerRef.current = setTimeout(run, 9000);
    }
    run();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [pattern.id]);

  return (
    <div className="dc-phone">
      <div className="dc-phone__frame">
        <div className="dc-phone__island" />
        <div className="dc-phone__status">
          <span className="dc-phone__time">9:41</span>
          <span className="dc-phone__status-icons">
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

        <div className="dc-phone__header">
          <div className="dc-phone__avatar">A</div>
          <div>
            <div className="dc-phone__contact">Adherix Health</div>
            <div className="dc-phone__contact-sub">text message</div>
          </div>
        </div>

        <div className="dc-phone__thread">
          <div className="dc-phone__date">Today 9:41 AM</div>

          {/* System correction message */}
          <div className={`dc-phone__bubble dc-phone__bubble--in dc-phone__bubble--fade ${stage !== 'idle' ? 'is-visible' : ''}`}>
            {pattern.systemMsg}
          </div>

          {/* Typing indicator OR patient reply */}
          {stage === 'typing' && (
            <div className="dc-phone__bubble dc-phone__bubble--out dc-phone__typing">
              <span /><span /><span />
            </div>
          )}
          {(stage === 'reply' || stage === 'resolved') && (
            <div className={`dc-phone__bubble dc-phone__bubble--out dc-phone__bubble--fade is-visible`}>
              {pattern.patientReply}
            </div>
          )}

          {/* Resolution badge */}
          {stage === 'resolved' && (
            <div className="dc-phone__resolved dc-phone__resolved--fade is-visible">
              <span className="dc-phone__resolved-icon">✓</span>
              Resolved automatically
            </div>
          )}
        </div>

        <div className="dc-phone__bar">
          <div className="dc-phone__field">iMessage</div>
        </div>
        <div className="dc-phone__indicator" />
      </div>
    </div>
  );
}

// ─── Flow diagram ─────────────────────────────────────────────────────────────

const flowSteps = [
  { step: '01', label: 'Signal detected', body: 'Patient keywords, silence duration, and trajectory score evaluated every 60 seconds.' },
  { step: '02', label: 'Pattern identified', body: 'Engine classifies the drift: side effect, missed dose, withdrawal, or plateau.' },
  { step: '03', label: 'Correction sent', body: 'Locked, pattern-specific SMS delivered. Not a generic nudge — a targeted behavioral message.' },
  { step: '04', label: 'Response tracked', body: 'Auto-resolves on reply. Escalates to the clinic if silence exceeds the threshold.' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DriftCorrectionPage() {
  const [activePattern, setActivePattern] = useState(0);

  return (
    <main>

      {/* ── Hero ── */}
      <section className="dc-hero">
        <div className="mkt-container dc-hero__inner">
          <FadeRise as="span" className="mkt-eyebrow dc-hero__eyebrow">
            Drift Correction
          </FadeRise>
          <FadeRise as="h1" className="dc-hero__title" delay={0.05}>
            The loop that<br />closes itself.
          </FadeRise>
          <FadeRise as="p" className="dc-hero__sub" delay={0.12}>
            Most SMS programs detect drift and send a nudge. Adherix identifies
            the specific behavioral pattern — side effect, missed dose, withdrawal,
            plateau — sends a targeted correction, then tracks whether the patient
            comes back. If they don't, the clinic is alerted. Automatically.
          </FadeRise>
          <FadeRise delay={0.18}>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary">
              Book a demo
            </Link>
          </FadeRise>
        </div>
      </section>

      {/* ── Flow ── */}
      <section className="dc-flow">
        <div className="mkt-container">
          <FadeRise className="dc-flow__head">
            <span className="mkt-eyebrow">How it works</span>
            <h2 className="mkt-h2">Four steps. No manual monitoring.</h2>
          </FadeRise>

          <StaggerGroup className="dc-flow__steps" stagger={0.1} amount={0.2}>
            {flowSteps.map((s) => (
              <div key={s.step} className="dc-flow__step">
                <div className="dc-flow__step-num">{s.step}</div>
                <h3 className="dc-flow__step-label">{s.label}</h3>
                <p className="dc-flow__step-body">{s.body}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── Patterns + live phone ── */}
      <section className="dc-patterns">
        <div className="mkt-container dc-patterns__inner">

          {/* Left: pattern selector */}
          <div className="dc-patterns__list">
            <FadeRise>
              <span className="mkt-eyebrow">Four patterns</span>
              <h2 className="mkt-h2" style={{ marginBottom: 32 }}>
                Every correction is specific.
              </h2>
            </FadeRise>

            {patterns.map((p, i) => (
              <button
                key={p.id}
                className={`dc-pattern-tab ${i === activePattern ? 'is-active' : ''}`}
                onClick={() => setActivePattern(i)}
                style={{ '--pattern-color': p.color } as React.CSSProperties}
              >
                <div className="dc-pattern-tab__label">{p.label}</div>
                <div className="dc-pattern-tab__signal">{p.signal}</div>
                <div className="dc-pattern-tab__escalates">
                  escalates if no response in {p.escalates}
                </div>
              </button>
            ))}
          </div>

          {/* Right: animated phone */}
          <FadeRise className="dc-patterns__phone" delay={0.1}>
            <AnimatedPhone key={activePattern} pattern={patterns[activePattern]} />
          </FadeRise>

        </div>
      </section>

      {/* ── Resolution ── */}
      <section className="dc-resolution">
        <div className="mkt-container">
          <FadeRise className="dc-resolution__head">
            <span className="mkt-eyebrow">Resolution</span>
            <h2 className="mkt-h2">Every correction has an outcome.</h2>
            <p className="mkt-subhead">
              The engine doesn't just send — it waits, measures, and acts on
              what it observes. No correction is ever left open.
            </p>
          </FadeRise>

          <StaggerGroup className="dc-resolution__grid" stagger={0.1} amount={0.25}>
            <div className="dc-resolution__card dc-resolution__card--green">
              <div className="dc-resolution__card-icon">✓</div>
              <h3>Auto-resolved</h3>
              <p>Patient replies after the correction is sent. Engine marks resolved, logs time-to-resolution. No clinic action needed.</p>
            </div>
            <div className="dc-resolution__card dc-resolution__card--amber">
              <div className="dc-resolution__card-icon">→</div>
              <h3>Escalated to clinic</h3>
              <p>No reply within 24–72 hours depending on pattern. Patient flagged. Clinic alerted. One call, right patient, right moment.</p>
            </div>
            <div className="dc-resolution__card dc-resolution__card--red">
              <div className="dc-resolution__card-icon">!</div>
              <h3>Immediate escalation</h3>
              <p>Patient texts CALL or HELP at any time. Bypasses all thresholds. Clinic notified within the same tick — under 60 seconds.</p>
            </div>
          </StaggerGroup>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="dc-cta">
        <div className="mkt-container dc-cta__inner">
          <FadeRise>
            <h2 className="mkt-h2">Ready to close the loop?</h2>
            <p className="mkt-subhead" style={{ marginBottom: 36 }}>
              Drift Correction is live in the Adherix engine. Every tick, every
              patient, every pattern — automatically.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/pilot" className="mkt-btn mkt-btn--primary">Book a demo</Link>
              <Link href="/platform" className="mkt-btn mkt-btn--ghost">See the full platform</Link>
            </div>
          </FadeRise>
        </div>
      </section>

    </main>
  );
}
