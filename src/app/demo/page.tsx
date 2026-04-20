'use client';

import { useState } from 'react';

// ─── Walkthrough steps ────────────────────────────────────────────────────────
// Each step shows what the engine does + a simulated patient SMS bubble.

const STEPS = [
  {
    label: 'Enrollment',
    phase: 'Initiation',
    engine: 'Patient enrolled. Engine queues welcome SMS within 5 minutes. No manual action from clinic.',
    sms: {
      direction: 'out' as const,
      body: 'Hi Alex, this is your support line. One short text a day, one action at a time. Reply YES to start.',
      key: 'phase0.welcome',
    },
  },
  {
    label: 'First reply',
    phase: 'Initiation',
    engine: 'Patient replies YES. Reply gate triggers. Confirmation message queued immediately.',
    sms: [
      { direction: 'in' as const, body: 'YES' },
      {
        direction: 'out' as const,
        body: 'Locked in. Your only job tomorrow morning: drink 16oz of water before anything else. I\'ll text to confirm.',
        key: 'phase0.confirmed',
      },
    ],
  },
  {
    label: 'Day 1 directive',
    phase: 'Dose Stabilization',
    engine: 'Engine enters Phase 1. First behavioral directive sent at 8:30am patient local time.',
    sms: {
      direction: 'out' as const,
      body: 'Today\'s one thing: 30g of protein at breakfast. Eggs, Greek yogurt, or a shake. Reply DONE when you eat it.',
      key: 'phase1.day1.morning',
    },
  },
  {
    label: 'Engagement drop detected',
    phase: 'Risk Window',
    engine: 'No reply in 48 hours. Risk score drops. Engine fires re-engagement trigger automatically.',
    sms: {
      direction: 'out' as const,
      body: 'Haven\'t heard from you in 2 days. Everything ok? Reply with anything — even one word.',
      key: 'trigger.no_response_48h',
    },
    risk: 'high' as const,
  },
  {
    label: 'Patient recovered',
    phase: 'Risk Window',
    engine: 'Patient replies. Automatically unflagged. Risk score resets. Clinic notified if 5+ days silence.',
    sms: [
      { direction: 'in' as const, body: 'back. sorry been rough week' },
      {
        direction: 'out' as const,
        body: 'Noticed you\'ve gone quiet. No judgement — but I want to make sure you haven\'t stopped. Reply YES if you\'re still in.',
        key: 'trigger.engagement_drop',
      },
    ],
    risk: 'low' as const,
  },
  {
    label: 'Maintenance phase',
    phase: 'Maintenance',
    engine: 'Patient completes 75 days of active phases. Auto-advanced to weekly maintenance. No clinic action needed.',
    sms: {
      direction: 'out' as const,
      body: 'Weekly check: protein still a habit? Reply Y or N.',
      key: 'phase5.weekly_checkin',
    },
  },
];

type Sms = { direction: 'in' | 'out'; body: string; key?: string };

function getSms(step: typeof STEPS[0]): Sms[] {
  if (!step.sms) return [];
  if (Array.isArray(step.sms)) return step.sms;
  return [step.sms];
}

function SmsBubble({ msg }: { msg: Sms }) {
  const isOut = msg.direction === 'out';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isOut ? 'flex-start' : 'flex-end',
      marginBottom: 10,
    }}>
      <div style={{
        maxWidth: '72%',
        padding: '10px 14px',
        borderRadius: isOut ? '4px 16px 16px 4px' : '16px 4px 4px 16px',
        background: isOut ? '#111110' : '#e6e5df',
        color: isOut ? '#fafaf7' : '#111110',
        fontSize: 14,
        lineHeight: 1.45,
      }}>
        {msg.body}
        {msg.key && (
          <div style={{ fontSize: 10, opacity: 0.5, marginTop: 6, fontFamily: 'monospace' }}>
            {msg.key}
          </div>
        )}
      </div>
    </div>
  );
}

function RiskBadge({ level }: { level?: 'high' | 'low' }) {
  if (!level) return null;
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 10,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      padding: '2px 8px',
      borderRadius: 3,
      background: level === 'high' ? '#fef2f2' : '#f0fdf4',
      color: level === 'high' ? '#b91c1c' : '#14532d',
      border: `1px solid ${level === 'high' ? '#fca5a5' : '#86efac'}`,
      marginLeft: 8,
    }}>
      {level === 'high' ? '↑ High Risk' : '↓ Risk cleared'}
    </span>
  );
}

// ─── Walkthrough panel ────────────────────────────────────────────────────────

function Walkthrough() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const messages = getSms(current);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 0, border: '1px solid #e6e5df', background: 'white' }}>
      {/* Step list */}
      <div style={{ borderRight: '1px solid #e6e5df', padding: '8px 0' }}>
        {STEPS.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '10px 16px',
              border: 'none',
              background: i === step ? '#fafaf7' : 'transparent',
              borderLeft: i === step ? '3px solid #111110' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: i === step ? 600 : 400,
              color: i === step ? '#111110' : '#6b6b66',
            }}
          >
            <span style={{ fontSize: 10, color: '#a5a5a0', display: 'block', marginBottom: 2 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Step detail */}
      <div style={{ padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#6b6b66',
            background: '#f0f0eb',
            padding: '3px 8px',
          }}>
            {current.phase}
          </span>
          <RiskBadge level={current.risk} />
        </div>

        <p style={{ fontSize: 14, color: '#3a3a35', lineHeight: 1.6, marginBottom: 24, fontStyle: 'italic' }}>
          {current.engine}
        </p>

        {/* SMS preview */}
        <div style={{
          background: '#f5f5f0',
          borderRadius: 8,
          padding: '16px 20px',
          minHeight: 100,
        }}>
          <div style={{ fontSize: 11, color: '#a5a5a0', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Patient phone
          </div>
          {messages.map((m, i) => <SmsBubble key={i} msg={m} />)}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            style={{
              padding: '8px 16px',
              border: '1px solid #e6e5df',
              background: 'transparent',
              cursor: step === 0 ? 'not-allowed' : 'pointer',
              fontSize: 13,
              color: step === 0 ? '#a5a5a0' : '#111110',
            }}
          >
            ← Previous
          </button>
          <span style={{ fontSize: 12, color: '#a5a5a0', alignSelf: 'center' }}>
            {step + 1} / {STEPS.length}
          </span>
          <button
            onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
            disabled={step === STEPS.length - 1}
            style={{
              padding: '8px 16px',
              border: '1px solid #111110',
              background: step === STEPS.length - 1 ? '#e6e5df' : '#111110',
              color: step === STEPS.length - 1 ? '#a5a5a0' : 'white',
              cursor: step === STEPS.length - 1 ? 'not-allowed' : 'pointer',
              fontSize: 13,
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Live demo panel ──────────────────────────────────────────────────────────

function LiveDemo() {
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
      setMessage(data.alreadyEnrolled
        ? 'A demo is already running for this number. Check your texts.'
        : 'You\'re enrolled. Expect your first message within 5 minutes.'
      );
    } catch {
      setState('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <div style={{ border: '1px solid #e6e5df', background: 'white', padding: 32 }}>
      {state === 'sent' ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
          <p style={{ fontSize: 16, color: '#111110', marginBottom: 8 }}>{message}</p>
          <p style={{ fontSize: 13, color: '#6b6b66', lineHeight: 1.6 }}>
            The engine will send you a welcome message, then guide you through<br />
            the behavioral sequence automatically — just reply to the texts.
          </p>
          <button
            onClick={() => { setState('idle'); setPhone(''); setName(''); }}
            style={{ marginTop: 20, fontSize: 13, color: '#6b6b66', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Try a different number
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#6b6b66',
              marginBottom: 6,
            }}>
              Your name (optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #c8c7c0',
                background: 'white',
                fontSize: 15,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#6b6b66',
              marginBottom: 6,
            }}>
              Mobile number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #c8c7c0',
                background: 'white',
                fontSize: 15,
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
          {state === 'error' && (
            <p style={{ fontSize: 13, color: '#b91c1c', marginBottom: 12 }}>{message}</p>
          )}
          <button
            type="submit"
            disabled={state === 'loading' || !phone}
            style={{
              width: '100%',
              padding: '12px',
              background: state === 'loading' ? '#6b6b66' : '#111110',
              color: 'white',
              border: 'none',
              fontSize: 14,
              fontWeight: 500,
              cursor: state === 'loading' || !phone ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {state === 'loading' ? 'Starting…' : 'Start live demo →'}
          </button>
          <p style={{ fontSize: 12, color: '#a5a5a0', marginTop: 12, textAlign: 'center', lineHeight: 1.5 }}>
            You'll receive real SMS messages. Demo expires after 7 days.<br />
            US numbers only. Standard message rates apply.
          </p>
        </form>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafaf7',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '32px 40px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
      }}>
        <a href="/" style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontSize: 22,
          fontWeight: 500,
          color: '#111110',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}>
          Adherix<sup style={{ fontSize: 11, color: '#6b6b66' }}>℞</sup>
        </a>
        <a href="/login" style={{ fontSize: 13, color: '#6b6b66', textDecoration: 'none', borderBottom: '1px solid #c8c7c0' }}>
          Clinic login →
        </a>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 40px 80px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 56 }}>
          <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b6b66', marginBottom: 16 }}>
            Retention intelligence for metabolic care
          </p>
          <h1 style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 48,
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: '#111110',
            marginBottom: 20,
            maxWidth: 640,
          }}>
            Patients don't drop off.<br />They drift — and we catch them.
          </h1>
          <p style={{ fontSize: 17, color: '#3a3a35', lineHeight: 1.65, maxWidth: 600 }}>
            Adherix helps metabolic care programs keep more patients enrolled
            through automated behavioral retention workflows — detecting drift,
            re-engaging quietly, and protecting program revenue before a patient
            decides to stop.
          </p>
          <div style={{ marginTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <a
              href="/roi"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: '#111110',
                color: '#fafaf7',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                border: '1px solid #111110',
              }}
            >
              See the ROI for your clinic →
            </a>
            <a
              href="#walkthrough"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                background: 'transparent',
                color: '#111110',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                border: '1px solid #c8c7c0',
              }}
            >
              How it works
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: 'flex',
          gap: 48,
          padding: '24px 0',
          borderTop: '1px solid #e6e5df',
          borderBottom: '1px solid #e6e5df',
          marginBottom: 56,
          flexWrap: 'wrap',
        }}>
          {[
            { value: '18%', label: 'Fewer early drop-offs*' },
            { value: '< 5 min', label: 'Launch time per patient' },
            { value: '8 hrs', label: 'Staff time saved / week*' },
            { value: '90 days', label: 'Retention workflows built-in' },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 28, fontWeight: 500, color: '#111110' }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: '#6b6b66', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: '#a5a5a0', marginTop: -44, marginBottom: 56 }}>
          * Modeled from typical GLP-1 retention baselines + observed engagement lift. Pilot data in collection.
        </p>

        {/* Walkthrough */}
        <div id="walkthrough" style={{ marginBottom: 64 }}>
          <h2 style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 26,
            fontWeight: 500,
            color: '#111110',
            marginBottom: 8,
            letterSpacing: '-0.01em',
          }}>
            How the retention engine works
          </h2>
          <p style={{ fontSize: 14, color: '#6b6b66', marginBottom: 24 }}>
            Behavioral drift detection and engagement recovery, end-to-end — enrollment to maintenance.
          </p>
          <Walkthrough />
        </div>

        {/* Live demo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          <div>
            <h2 style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 26,
              fontWeight: 500,
              color: '#111110',
              marginBottom: 12,
              letterSpacing: '-0.01em',
            }}>
              Try it on your phone
            </h2>
            <p style={{ fontSize: 14, color: '#6b6b66', lineHeight: 1.65, marginBottom: 20 }}>
              Enter your number and the engine enrolls you as a demo patient.
              You'll receive the same SMS sequence your patients get — starting within 5 minutes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Welcome text within 5 minutes',
                'Daily behavioral directives',
                'Automatic re-engagement if you go quiet',
                'Phase progression tracked in real time',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: '#3a3a35' }}>
                  <span style={{ color: '#14532d', fontWeight: 600, flexShrink: 0 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <LiveDemo />
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 72,
          padding: '40px 48px',
          background: '#111110',
          color: '#fafaf7',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
        }}>
          <div>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 22, fontWeight: 500, marginBottom: 6 }}>
              Ready to run this for your clinic?
            </div>
            <div style={{ fontSize: 14, color: '#a5a5a0', lineHeight: 1.5 }}>
              Pilot programs launch in under 48 hours. No long-term commitment.
            </div>
          </div>
          <a
            href="mailto:seanjohnsonclt@gmail.com?subject=Adherix Pilot Inquiry"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: '#fafaf7',
              color: '#111110',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Request a pilot →
          </a>
        </div>
      </div>
    </div>
  );
}
