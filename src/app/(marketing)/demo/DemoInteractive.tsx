'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FadeRise, TapButton } from '../_components/animation/MotionPrimitives';

// --- Walkthrough data --------------------------------------------------------

const STEPS = [
  {
    label: 'Enrollment',
    phase: 'Initiation  -  Phase 0',
    engine:
      'Patient enrolled. Engine queues a welcome SMS within 5 minutes. No manual action from clinic  -  the behavioral sequence starts automatically.',
    sms: [
      {
        direction: 'out' as const,
        body: 'Hi Alex, this is your support line. One short text a day, one action at a time. Reply YES to start.',
        key: 'phase0.welcome',
      },
    ],
  },
  {
    label: 'First reply',
    phase: 'Initiation  -  Phase 0',
    engine:
      'Patient replies YES. Reply gate opens. Confirmation message queued immediately. The engine moves to Phase 1 onboarding.',
    sms: [
      { direction: 'in' as const, body: 'YES' },
      {
        direction: 'out' as const,
        body: "Locked in. Your only job tomorrow morning: drink 16oz of water before anything else. I'll text to confirm.",
        key: 'phase0.confirmed',
      },
    ],
  },
  {
    label: 'Day 1 directive',
    phase: 'Onboarding  -  Phase 1',
    engine:
      'Engine enters Phase 1. First behavioral directive sent at 8:30am patient local time. Dose prep, side effect framing, habit anchoring.',
    sms: [
      {
        direction: 'out' as const,
        body: "Today's one thing: 30g of protein at breakfast. Eggs, Greek yogurt, or a shake. Reply DONE when you eat it.",
        key: 'phase1.day1.morning',
      },
    ],
  },
  {
    label: 'Drift detected',
    phase: 'Risk Window',
    engine:
      'No reply in 48 hours. Risk score drops. Engine fires re-engagement trigger automatically  -  no coordinator needed.',
    risk: 'high' as const,
    sms: [
      {
        direction: 'out' as const,
        body: "Haven't heard from you in 2 days. Everything ok? Reply with anything  -  even one word.",
        key: 'trigger.no_response_48h',
      },
    ],
  },
  {
    label: 'Patient recovered',
    phase: 'Risk Window',
    engine:
      'Patient replies. Automatically unflagged. Risk score resets. If silence had continued to 5 days, clinic would receive a single email alert.',
    risk: 'low' as const,
    sms: [
      { direction: 'in' as const, body: 'back. sorry been rough week' },
      {
        direction: 'out' as const,
        body: "Glad you're back. No judgement  -  let's pick up where we left off. Reply YES when you're ready.",
        key: 'trigger.recovery',
      },
    ],
  },
  {
    label: 'Maintenance',
    phase: 'Maintenance  -  Phase 5',
    engine:
      'Patient completes 75 days of active phases. Auto-advanced to weekly maintenance. Light-touch check-ins. No clinic action required.',
    sms: [
      {
        direction: 'out' as const,
        body: 'Weekly check: protein still a habit? Reply Y or N.',
        key: 'phase5.weekly_checkin',
      },
    ],
  },
];

type Sms = { direction: 'in' | 'out'; body: string; key?: string };

// --- SMS phone frame ---------------------------------------------------------

function PhoneFrame({ messages }: { messages: Sms[] }) {
  return (
    <div className="mkt-demo-phone">
      <div className="mkt-demo-phone__header">Adherix Health · Patient SMS</div>
      {messages.map((m, i) =>
        m.direction === 'out' ? (
          <div key={i} className="mkt-demo-bubble-out">
            <div className="mkt-demo-bubble-out__inner">
              {m.body}
              {m.key && <div className="mkt-demo-bubble-key">{m.key}</div>}
            </div>
          </div>
        ) : (
          <div key={i} className="mkt-demo-bubble-in">
            <div className="mkt-demo-bubble-in__inner">{m.body}</div>
          </div>
        ),
      )}
    </div>
  );
}

// --- Walkthrough -------------------------------------------------------------

function Walkthrough() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <div className="mkt-demo-walk">
      <div className="mkt-demo-walk__steps">
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`mkt-demo-walk__step-btn${i === step ? ' mkt-demo-walk__step-btn--active' : ''}`}
          >
            <span className="mkt-demo-walk__step-num">{String(i + 1).padStart(2, '0')}</span>
            <span className="mkt-demo-walk__step-label">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="mkt-demo-walk__panel">
        <div className="mkt-demo-walk__phase">
          <span className="mkt-eyebrow" style={{ marginBottom: 0 }}>{current.phase}</span>
          {current.risk && (
            <span className={`mkt-demo-risk mkt-demo-risk--${current.risk}`}>
              {current.risk === 'high' ? '↑ High risk' : '↓ Risk cleared'}
            </span>
          )}
        </div>

        <p className="mkt-demo-walk__engine">{current.engine}</p>

        <PhoneFrame messages={current.sms} />

        <div className="mkt-demo-walk__nav">
          <TapButton>
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="mkt-btn mkt-btn--ghost mkt-btn--sm"
              style={{ opacity: step === 0 ? 0.35 : 1 }}
            >
              ← Previous
            </button>
          </TapButton>
          <span className="mkt-demo-walk__progress">
            {step + 1} / {STEPS.length}
          </span>
          <TapButton>
            <button
              onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
              disabled={step === STEPS.length - 1}
              className="mkt-btn mkt-btn--primary mkt-btn--sm"
              style={{ opacity: step === STEPS.length - 1 ? 0.35 : 1 }}
            >
              Next →
            </button>
          </TapButton>
        </div>
      </div>
    </div>
  );
}

// --- Live enroll form ---------------------------------------------------------

function EnrollForm() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/demo/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState('error');
        setMessage(data.error ?? 'Something went wrong.');
        return;
      }
      setState('sent');
      setMessage(
        data.alreadyEnrolled
          ? 'A demo is already running for this number. Check your texts.'
          : "You're enrolled. Expect your first message within 5 minutes.",
      );
    } catch {
      setState('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (state === 'sent') {
    return (
      <div className="mkt-demo-enroll__form-card mkt-demo-form__success">
        <div className="mkt-demo-form__success-mark">✓</div>
        <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 8 }}>{message}</p>
        <p style={{ fontSize: 14, color: 'var(--mkt-muted)', lineHeight: 1.65 }}>
          The engine will send you a welcome message, then guide you through
          the behavioral sequence automatically  -  just reply to the texts.
        </p>
        <button
          onClick={() => { setState('idle'); setPhone(''); setName(''); }}
          style={{ marginTop: 20, fontSize: 13, color: 'var(--mkt-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Try a different number
        </button>
      </div>
    );
  }

  return (
    <div className="mkt-demo-enroll__form-card">
      <form onSubmit={handleSubmit}>
        <div className="mkt-demo-form__field">
          <label className="mkt-demo-form__label">Your name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            className="mkt-demo-form__input"
          />
        </div>
        <div className="mkt-demo-form__field">
          <label className="mkt-demo-form__label">Mobile number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            required
            className="mkt-demo-form__input"
          />
        </div>
        {state === 'error' && (
          <p style={{ fontSize: 13, color: '#b91c1c', marginBottom: 12 }}>{message}</p>
        )}
        <TapButton style={{ width: '100%' }}>
          <button
            type="submit"
            disabled={state === 'loading' || !phone}
            className="mkt-btn mkt-btn--primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {state === 'loading' ? 'Starting…' : 'Start live demo →'}
          </button>
        </TapButton>
        <p className="mkt-demo-form__note">
          You'll receive real SMS messages. Demo runs for 7 days.
          <br />US numbers only. Standard message rates apply.
        </p>
      </form>
    </div>
  );
}

// --- Main export -------------------------------------------------------------

export function DemoInteractive() {
  return (
    <>
      {/* Walkthrough */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="walkthrough">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">Engine walkthrough</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Every phase. Every trigger. End to end.
            </FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1}>
              Six steps from first text to long-term maintenance  -  with the exact SMS your patients receive at each one.
            </FadeRise>
          </div>
          <FadeRise delay={0.12} amount={0.15}>
            <Walkthrough />
          </FadeRise>
        </div>
      </section>

      {/* Live enroll */}
      <section className="mkt-v2-section" id="enroll">
        <div className="mkt-container">
          <div className="mkt-demo-enroll">
            <div>
              <FadeRise as="span" className="mkt-eyebrow">Try it yourself</FadeRise>
              <FadeRise as="h2" className="mkt-h2" delay={0.05}>
                Feel it on your own phone.
              </FadeRise>
              <FadeRise as="p" className="mkt-subhead" delay={0.1}>
                Enter your number and the engine enrolls you as a demo patient.
                Same sequence your patients get  -  starting within 5 minutes.
              </FadeRise>
              <FadeRise className="mkt-demo-enroll__features" delay={0.14}>
                {[
                  'Welcome text within 5 minutes',
                  'Daily behavioral directives, phase by phase',
                  'Automatic re-engagement if you go quiet',
                  'Injection confirmation loop (reply YES or NO)',
                  'Phase progression tracked in real time',
                ].map((item) => (
                  <div key={item} className="mkt-demo-enroll__feat">
                    <span className="mkt-demo-enroll__feat-mark">✓</span>
                    {item}
                  </div>
                ))}
              </FadeRise>
              <FadeRise delay={0.2} style={{ marginTop: 32 }}>
                <p style={{ fontSize: 14, color: 'var(--mkt-muted)' }}>
                  Want a guided walkthrough instead?{' '}
                  <Link href="/pilot" style={{ color: 'var(--mkt-sage-deep)', textDecoration: 'underline' }}>
                    Book a 30-minute demo call →
                  </Link>
                </p>
              </FadeRise>
            </div>
            <FadeRise delay={0.08} amount={0.2}>
              <EnrollForm />
            </FadeRise>
          </div>
        </div>
      </section>
    </>
  );
}
