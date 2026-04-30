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
      "What you're feeling is a recognized part of the adjustment period — most patients experience this between weeks 3 and 6. It doesn't mean the medication isn't working. Your next dose is Thursday. If anything feels severe, reply CALL.",
    patientReply: 'ok thank you — that actually helps',
  },
  {
    id: 'missed-dose',
    label: 'Missed dose',
    signal: 'Patient signals a missed or skipped dose',
    escalates: '48h',
    color: '#7a6fa6',
    systemMsg:
      "Missed a dose — don't double up. Just take the next one on schedule: Thursday. Missing one dose doesn't affect your overall progress. You're still on track.",
    patientReply: 'got it, will do thursday',
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
  },
  {
    id: 'plateau',
    label: 'Plateau',
    signal: 'Phase 2–4, 48h+ silence, 21+ days in phase',
    escalates: '72h',
    color: '#5b8a6f',
    systemMsg:
      "Around week 8, most patients hit a window where progress feels like it has stalled. It hasn't. Your body is recalibrating, not resisting. Your next dose is Thursday. That's the only step right now.",
    patientReply: "that's reassuring — I'll stay with it",
  },
];

// ─── Animated iPhone ──────────────────────────────────────────────────────────

function AnimatedPhone({ pattern }: { pattern: typeof patterns[0] }) {
  const [stage, setStage] = useState<'idle' | 'message' | 'typing' | 'reply' | 'resolved'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearAll() {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }

  useEffect(() => {
    function run() {
      setStage('idle');
      const t1 = setTimeout(() => setStage('message'), 700);
      const t2 = setTimeout(() => setStage('typing'), 2600);
      const t3 = setTimeout(() => setStage('reply'), 4400);
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
              <span>✓</span> Resolved automatically
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

// ─── How it works cards ───────────────────────────────────────────────────────

const howItWorks = [
  {
    label: 'Signal detected',
    body: 'Patient keywords, silence duration, and engagement trajectory scored every 60 seconds.',
  },
  {
    label: 'Pattern identified',
    body: 'Engine classifies the drift: side effect, missed dose, withdrawal, or plateau.',
  },
  {
    label: 'Correction sent',
    body: 'Locked, pattern-specific SMS. Not a generic nudge — a message calibrated to what the patient is actually experiencing.',
  },
  {
    label: 'Loop closed',
    body: 'Auto-resolves on reply. Escalates to the clinic if silence crosses the threshold.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DriftCorrectionPage() {
  const [activePattern, setActivePattern] = useState(0);

  return (
    <main className="dc-page">

      {/* ── Hero ── */}
      <section className="mkt-r-hero" style={{ textAlign: 'center', padding: '72px 0 56px' }}>
        <div className="mkt-container">
          <FadeRise as="span" className="mkt-eyebrow" style={{ marginBottom: 20, display: 'block' }}>
            Drift Correction
          </FadeRise>
          <FadeRise as="h1" className="mkt-r-hero__title" delay={0.05} style={{ textAlign: 'center' }}>
            The loop that closes itself.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead" delay={0.1}
            style={{ maxWidth: 580, margin: '0 auto 40px' }}>
            Every drop-off starts as a pattern.
            A missed check-in. A slower reply. A subtle change in behavior.
            Adherix reads the pattern, interrupts the drift the moment it starts
            &mdash; responds in real time, and confirms whether the patient re-engages.
            If not, it escalates automatically.
          </FadeRise>
          <FadeRise delay={0.16}>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary">Book a demo</Link>
          </FadeRise>
        </div>
      </section>

      {/* ── How it works — scroll-animated cards ── */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="how" style={{ padding: '64px 0' }}>
        <div className="mkt-container">
          <div className="mkt-v2-section__head" style={{ marginBottom: 40 }}>
            <FadeRise as="span" className="mkt-eyebrow">How it works</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Four steps. No manual monitoring.
            </FadeRise>
          </div>
          <StaggerGroup className="dc-how-grid dc-how-grid--2x2" stagger={0.12} amount={0.3}>
            {howItWorks.map((s) => (
              <div key={s.label} className="dc-how-card">
                <h3 className="dc-how-card__label">{s.label}</h3>
                <p className="dc-how-card__body">{s.body}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── Patterns + iPhone — mirrors PatientSmsView layout ── */}
      <section className="mkt-v2-section" id="patterns">
        <div className="mkt-container mkt-v2-sms-view" style={{ alignItems: 'start' }}>

          <FadeRise className="mkt-v2-sms-view__copy">
            <span className="mkt-eyebrow">Four patterns</span>
            <h2 className="mkt-h2">Every correction is specific.</h2>
            <p className="mkt-subhead" style={{ marginBottom: 32 }}>
              The engine doesn&rsquo;t send a generic check-in. It classifies
              the behavioral signal and delivers the message written for that
              exact situation — then watches for a reply.
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

      {/* ── Resolution ── */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="resolution">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">Resolution</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Every correction has an outcome.
            </FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              The engine doesn&rsquo;t just send — it waits, measures, and acts.
              No correction is ever left open.
            </FadeRise>
          </div>
          <StaggerGroup className="dc-resolution-grid" stagger={0.1} amount={0.25}>
            <div className="dc-res-card">
              <div className="dc-res-card__icon dc-res-card__icon--green">✓</div>
              <h3 className="dc-res-card__title">Auto-resolved</h3>
              <p className="dc-res-card__body">Patient replies. Engine marks resolved, logs time-to-resolution. No clinic action needed.</p>
            </div>
            <div className="dc-res-card">
              <div className="dc-res-card__icon dc-res-card__icon--amber">→</div>
              <h3 className="dc-res-card__title">Escalated to clinic</h3>
              <p className="dc-res-card__body">No reply within 24–72 hours. Patient flagged. Clinic alerted. One call, right patient, right moment.</p>
            </div>
            <div className="dc-res-card">
              <div className="dc-res-card__icon dc-res-card__icon--red">!</div>
              <h3 className="dc-res-card__title">Immediate escalation</h3>
              <p className="dc-res-card__body">Patient texts CALL or HELP at any time. Bypasses all thresholds. Clinic notified within 60 seconds.</p>
            </div>
          </StaggerGroup>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mkt-v2-section" style={{ textAlign: 'center' }}>
        <div className="mkt-container">
          <FadeRise>
            <h2 className="mkt-h2">Ready to close the loop?</h2>
            <p className="mkt-subhead" style={{ maxWidth: 480, margin: '0 auto 36px' }}>
              Drift Correction runs automatically. Every tick, every patient,
              every pattern — no coordinator required.
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
