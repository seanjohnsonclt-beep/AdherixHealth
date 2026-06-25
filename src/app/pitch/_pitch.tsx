'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/* ─── tokens ─────────────────────────────────────────────────────────── */
const GREEN = '#4ade80';
const INK   = '#0a0a0a';
const CARD  = '#141414';
const MUTED = '#555';
const BORDER = '#1f1f1f';

/* ─── types ──────────────────────────────────────────────────────────── */
type Bubble = { dir: 'in' | 'out'; text: string; delay: number };

type Scene =
  | { type: 'cover' }
  | { type: 'stat'; headline: string; stat: string; sub: string }
  | { type: 'engine' }
  | { type: 'phone'; eyebrow: string; headline: string; sub?: string; bubbles: Bubble[] }
  | { type: 'bridge' }
  | { type: 'close'; headline: string; sub: string };

/* ─── scene data ─────────────────────────────────────────────────────── */
const SCENES: Scene[] = [
  { type: 'cover' },
  {
    type: 'stat',
    headline: 'Most GLP-1 patients drop off before they see real results.',
    stat: '40%',
    sub: 'stop treatment in the first 90 days - not because the medication failed, but because no one was there.',
  },
  { type: 'engine' },
  {
    type: 'phone',
    eyebrow: 'Day 1 — Initiation',
    headline: 'The engine starts the moment a patient enrolls.',
    bubbles: [
      {
        dir: 'out',
        text: 'Hi Sarah, this is your support line from FryeCare. One short text a day, one action at a time. Reply YES to start.',
        delay: 600,
      },
      { dir: 'in', text: 'YES', delay: 1800 },
      {
        dir: 'out',
        text: "Locked in. Your only job tomorrow: drink 16oz of water before anything else. I'll text to confirm.",
        delay: 2800,
      },
    ],
  },
  {
    type: 'phone',
    eyebrow: 'Day 3 — Risk Trigger',
    headline: 'No reply in 48 hours. Caught automatically.',
    sub: 'No coordinator needed.',
    bubbles: [
      {
        dir: 'out',
        text: "Haven't heard from you in 2 days, Sarah. Everything ok? Reply with anything - even one word.",
        delay: 600,
      },
      { dir: 'in', text: 'back. sorry been rough week', delay: 1800 },
      {
        dir: 'out',
        text: "Glad you're back. No judgment - let's pick up where we left off. Reply YES when you're ready.",
        delay: 2800,
      },
    ],
  },
  { type: 'bridge' },
  {
    type: 'phone',
    eyebrow: 'Adherix Gauge — Scale Tracker',
    headline: 'Every Monday morning. Every patient. Automated.',
    bubbles: [
      {
        dir: 'out',
        text: "Hi Sarah - quick check-in: what's your weight this week? Just reply with the number.",
        delay: 600,
      },
      { dir: 'in', text: '182', delay: 1800 },
      {
        dir: 'out',
        text: "Down 11 lbs since you started, Sarah. That's real. Keep going.",
        delay: 2800,
      },
    ],
  },
  {
    type: 'close',
    headline: '2,000 patients. Zero extra staff.',
    sub: "Let's talk about what this looks like for FryeCare.",
  },
];

/* ─── phone scene ─────────────────────────────────────────────────────── */
function PhoneScene({ bubbles }: { bubbles: Bubble[] }) {
  const [visible, setVisible] = useState<number[]>([]);

  useEffect(() => {
    setVisible([]);
    const timers = bubbles.map((b, i) =>
      setTimeout(() => setVisible(v => [...v, i]), b.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [bubbles]);

  return (
    <div style={{
      width: 340,
      margin: '0 auto',
      background: '#0f0f0f',
      borderRadius: 40,
      border: `2px solid ${BORDER}`,
      padding: '48px 16px 32px',
      boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
      minHeight: 420,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      position: 'relative',
    }}>
      {/* notch */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 80,
        height: 6,
        background: BORDER,
        borderRadius: 3,
      }} />
      {/* sender label */}
      <div style={{
        textAlign: 'center',
        color: MUTED,
        fontSize: 11,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}>
        FryeCare
      </div>
      {bubbles.map((b, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: b.dir === 'out' ? 'flex-start' : 'flex-end',
            opacity: visible.includes(i) ? 1 : 0,
            transform: visible.includes(i) ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          <div style={{
            maxWidth: '78%',
            padding: '10px 14px',
            borderRadius: b.dir === 'out' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
            background: b.dir === 'out' ? CARD : GREEN,
            color: b.dir === 'out' ? '#e5e7eb' : '#0a0a0a',
            fontSize: 14,
            lineHeight: 1.5,
            border: b.dir === 'out' ? `1px solid ${BORDER}` : 'none',
          }}>
            {b.text}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── engine scene ───────────────────────────────────────────────────── */
function EngineScene() {
  const phases = [
    { label: 'Initiation', days: 'Day 1' },
    { label: 'Onboarding', days: 'Days 2-7' },
    { label: 'Activation', days: 'Days 8-21' },
    { label: 'Momentum', days: 'Days 22-51' },
    { label: 'Plateau', days: 'Days 52-81' },
    { label: 'Maintenance', days: 'Ongoing' },
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(v => (v + 1) % phases.length), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', width: '100%' }}>
      <p style={{ color: MUTED, fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 32 }}>
        Adherix Keep — GLP-1 Retention Engine
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
        {phases.map((p, i) => (
          <div key={i} style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: `1px solid ${i === active ? GREEN : BORDER}`,
            background: i === active ? 'rgba(74,222,128,0.08)' : CARD,
            transition: 'all 0.4s ease',
          }}>
            <div style={{ color: i === active ? GREEN : '#9ca3af', fontSize: 13, fontWeight: 600 }}>{p.label}</div>
            <div style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>{p.days}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {[
          { icon: '⚡', label: 'Triggers', sub: 'No-reply, flagging, phase advance' },
          { icon: '💬', label: '45+ templates', sub: 'Timed to patient local timezone' },
          { icon: '🏥', label: 'Clinic alerts', sub: 'One email when intervention needed' },
        ].map((item, i) => (
          <div key={i} style={{
            padding: 20,
            background: CARD,
            borderRadius: 12,
            border: `1px solid ${BORDER}`,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
            <div style={{ color: MUTED, fontSize: 12, lineHeight: 1.4 }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────────────── */
export function PitchDeck() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const total = SCENES.length;
  const prevRef = useRef(index);

  const go = useCallback((next: number) => {
    if (fading || next < 0 || next >= total) return;
    setFading(true);
    setTimeout(() => {
      setIndex(next);
      prevRef.current = next;
      setFading(false);
    }, 280);
  }, [fading, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(index + 1);
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index]);

  const scene = SCENES[index];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: INK,
        color: '#f9fafb',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => go(index + 1)}
    >
      {/* progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, background: BORDER, zIndex: 10 }}>
        <div style={{
          height: '100%',
          background: GREEN,
          width: `${((index + 1) / total) * 100}%`,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* slide counter */}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 24,
        color: MUTED,
        fontSize: 12,
        letterSpacing: '0.05em',
        fontVariantNumeric: 'tabular-nums',
        zIndex: 10,
      }}>
        {index + 1} / {total}
      </div>

      {/* main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 48px',
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(6px)' : 'translateY(0)',
        transition: 'opacity 0.28s ease, transform 0.28s ease',
      }}>

        {/* COVER */}
        {scene.type === 'cover' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 48,
            }}>
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: GREEN,
                boxShadow: `0 0 20px ${GREEN}`,
              }} />
              <span style={{ color: GREEN, fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
                Adherix Health
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 700, lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
              Retention Intelligence<br />for GLP-1 Programs
            </h1>
            <p style={{ color: MUTED, fontSize: 18, marginBottom: 64 }}>FryeCare — June 2026</p>
            <p style={{ color: '#374151', fontSize: 13, letterSpacing: '0.08em' }}>
              Press → or click to advance
            </p>
          </div>
        )}

        {/* STAT */}
        {scene.type === 'stat' && (
          <div style={{ maxWidth: 680, textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 600, lineHeight: 1.25, marginBottom: 48, color: '#e5e7eb' }}>
              {scene.headline}
            </h2>
            <div style={{
              fontSize: 'clamp(80px, 15vw, 160px)',
              fontWeight: 800,
              color: GREEN,
              lineHeight: 1,
              marginBottom: 32,
              letterSpacing: '-0.04em',
            }}>
              {scene.stat}
            </div>
            <p style={{ color: '#9ca3af', fontSize: 20, lineHeight: 1.6 }}>{scene.sub}</p>
          </div>
        )}

        {/* ENGINE */}
        {scene.type === 'engine' && (
          <div style={{ width: '100%', maxWidth: 720, textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, marginBottom: 8 }}>
              Adherix monitors every patient. Automatically.
            </h2>
            <p style={{ color: '#9ca3af', marginBottom: 48, fontSize: 18 }}>
              Phase-based progression. Trigger-based logic. Zero manual follow-up.
            </p>
            <EngineScene />
          </div>
        )}

        {/* PHONE */}
        {scene.type === 'phone' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 80, width: '100%', maxWidth: 840 }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: GREEN, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>
                {scene.eyebrow}
              </p>
              <h2 style={{ fontSize: 'clamp(22px, 2.8vw, 34px)', fontWeight: 700, lineHeight: 1.25, marginBottom: 16 }}>
                {scene.headline}
              </h2>
              {scene.sub && (
                <p style={{ color: '#6b7280', fontSize: 18 }}>{scene.sub}</p>
              )}
            </div>
            <div style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              <PhoneScene key={index} bubbles={scene.bubbles} />
            </div>
          </div>
        )}

        {/* BRIDGE */}
        {scene.type === 'bridge' && (
          <div style={{ textAlign: 'center', maxWidth: 700 }}>
            <div style={{
              display: 'inline-block',
              padding: '4px 16px',
              background: 'rgba(74,222,128,0.1)',
              border: `1px solid rgba(74,222,128,0.3)`,
              borderRadius: 20,
              color: GREEN,
              fontSize: 12,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 48,
            }}>
              One more thing
            </div>
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 60px)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: 24,
            }}>
              Before we close out -
            </h2>
            <p style={{
              fontSize: 'clamp(24px, 3.5vw, 44px)',
              fontWeight: 600,
              color: GREEN,
              lineHeight: 1.2,
            }}>
              this is what your patients<br />will remember.
            </p>
          </div>
        )}

        {/* CLOSE */}
        {scene.type === 'close' && (
          <div style={{ textAlign: 'center', maxWidth: 680 }}>
            <h2 style={{
              fontSize: 'clamp(32px, 5vw, 60px)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: 24,
            }}>
              {scene.headline}
            </h2>
            <p style={{ color: '#9ca3af', fontSize: 22, lineHeight: 1.5 }}>{scene.sub}</p>
          </div>
        )}

      </div>

      {/* nav dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        padding: '24px 0 32px',
      }}>
        {SCENES.map((_, i) => (
          <button
            key={i}
            onClick={e => { e.stopPropagation(); go(i); }}
            style={{
              width: i === index ? 24 : 6,
              height: 6,
              borderRadius: 3,
              background: i === index ? GREEN : BORDER,
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s ease',
            }}
            aria-label={`Go to scene ${i + 1}`}
          />
        ))}
      </div>

      {/* prev/next arrows */}
      {index > 0 && (
        <button
          onClick={e => { e.stopPropagation(); go(index - 1); }}
          style={{
            position: 'fixed',
            left: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            background: CARD,
            border: `1px solid ${BORDER}`,
            color: '#9ca3af',
            width: 40,
            height: 40,
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
          aria-label="Previous"
        >
          ‹
        </button>
      )}
      {index < total - 1 && (
        <button
          onClick={e => { e.stopPropagation(); go(index + 1); }}
          style={{
            position: 'fixed',
            right: 24,
            top: '50%',
            transform: 'translateY(-50%)',
            background: CARD,
            border: `1px solid ${BORDER}`,
            color: '#9ca3af',
            width: 40,
            height: 40,
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
          aria-label="Next"
        >
          ›
        </button>
      )}
    </div>
  );
}
