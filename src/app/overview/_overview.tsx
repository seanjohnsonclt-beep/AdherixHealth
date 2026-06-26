'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

/* ─── tokens ─────────────────────────────────────────────────────────── */
const GREEN  = '#4ade80';
const INK    = '#0a0a0a';
const CARD   = '#141414';
const MUTED  = '#555';
const BORDER = '#1f1f1f';
const DIM    = '#9ca3af';

/* ─── types ──────────────────────────────────────────────────────────── */
type Bubble = { dir: 'in' | 'out'; text: string; delay: number };

type Scene =
  | { type: 'cover' }
  | { type: 'stat'; headline: string; stat: string; sub: string }
  | { type: 'gap' }
  | { type: 'engine' }
  | { type: 'volume' }
  | { type: 'phone'; eyebrow: string; headline: string; context: string; bubbles: Bubble[] }
  | { type: 'trigger'; eyebrow: string; headline: string; context: string; trigger: { condition: string; action: string; result: string } }
  | { type: 'bridge' }
  | { type: 'gauge'; bubbles: Bubble[] }
  | { type: 'milestone' }
  | { type: 'close' };

/* ─── scenes ─────────────────────────────────────────────────────────── */
const SCENES: Scene[] = [
  { type: 'cover' },

  {
    type: 'stat',
    headline: 'Most GLP-1 patients drop off before they see real results.',
    stat: '40%',
    sub: 'stop treatment in the first 90 days - not because the medication failed, but because no one was there at the right moment.',
  },

  { type: 'gap' },

  { type: 'engine' },

  { type: 'volume' },

  {
    type: 'phone',
    eyebrow: 'Day 1 — Initiation',
    headline: 'Enrollment triggers the engine.',
    context: 'The moment a patient is added, a timed welcome message goes out. No coordinator action. The behavioral sequence starts automatically.',
    bubbles: [
      { dir: 'out', text: 'Hi Alex, this is your support line. One short text a day, one action at a time. Reply YES to start.', delay: 500 },
      { dir: 'in',  text: 'YES', delay: 1600 },
      { dir: 'out', text: "Locked in. Your only job tomorrow morning: drink 16oz of water before anything else. I'll text to confirm.", delay: 2400 },
    ],
  },

  {
    type: 'phone',
    eyebrow: 'Day 5 — Habit Formation',
    headline: 'Daily directives. One action at a time.',
    context: 'Phase 1 messages are designed to reduce decision-making. Short, specific, and binary - patients reply DONE or they don\'t. Both outcomes tell the engine something.',
    bubbles: [
      { dir: 'out', text: "Today's one thing: 30g of protein at breakfast. Eggs, Greek yogurt, or a shake. Reply DONE when you eat it.", delay: 500 },
      { dir: 'in',  text: 'done', delay: 1600 },
      { dir: 'out', text: "That's the one. Same thing tomorrow - protein first. You're building the habit your medication needs to work.", delay: 2400 },
    ],
  },

  {
    type: 'phone',
    eyebrow: 'Week 2 — Injection Confirmation',
    headline: 'The engine tracks dosing. Automatically.',
    context: 'At each injection window, patients get a confirmation check. If they reply YES - noted. If they miss the window - that\'s a trigger. Clinics know who actually dosed without making a single call.',
    bubbles: [
      { dir: 'out', text: "Injection day, Alex. Did you take your dose today? Reply YES or NO - no judgment either way.", delay: 500 },
      { dir: 'in',  text: 'yes', delay: 1600 },
      { dir: 'out', text: "Got it. You're on track. Stay on the protein and water routine - it makes the next dose easier.", delay: 2400 },
    ],
  },

  {
    type: 'trigger',
    eyebrow: '48 Hours of Silence — Risk Trigger',
    headline: 'The engine catches drift before the clinic does.',
    context: 'No reply in 48 hours means the behavioral loop has broken. The engine fires a re-engagement message automatically - no coordinator needed. If silence continues to 5 days, the clinic gets one email alert.',
    trigger: {
      condition: 'No patient reply in 48 hours',
      action: 'Queue re-engagement SMS immediately',
      result: 'If still silent at 5 days → one clinic alert email',
    },
  },

  {
    type: 'phone',
    eyebrow: '48 Hours of Silence — Re-engagement',
    headline: 'The right message at the right moment.',
    context: 'Short, non-judgmental, low-friction. The goal is a single reply - any reply. One word resets the behavioral loop and tells the engine the patient is still engaged.',
    bubbles: [
      { dir: 'out', text: "Haven't heard from you in a couple days, Alex. Everything ok? Reply with anything - even one word.", delay: 500 },
      { dir: 'in',  text: 'yeah just been busy', delay: 1600 },
      { dir: 'out', text: "Good to hear. No pressure - let's just pick up where we left off. Reply YES when you're ready.", delay: 2500 },
    ],
  },

  {
    type: 'phone',
    eyebrow: 'Month 2 — Momentum Phase',
    headline: 'The engine stays with patients long after the first shot.',
    context: 'Most dropout happens in the first 90 days. Adherix keeps the engagement loop alive through months 2 and 3 - the highest-risk window - with messages that reframe the plateau and reinforce the habit.',
    bubbles: [
      { dir: 'out', text: "You're two months in, Alex. The hard part is behind you. The medication is working - your job now is to let it.", delay: 500 },
      { dir: 'in',  text: 'feels like the scale stopped moving tbh', delay: 1700 },
      { dir: 'out', text: "That's normal at this stage - your body is recalibrating. It's still working. Keep the protein up and reply DONE when you eat it today.", delay: 2600 },
    ],
  },

  { type: 'bridge' },

  {
    type: 'gauge',
    bubbles: [
      { dir: 'out', text: "Hi Alex - quick check-in: what's your weight this week? Just reply with the number.", delay: 500 },
      { dir: 'in',  text: '182', delay: 1700 },
      { dir: 'out', text: "Down 11 lbs since you started, Alex. That's real. Keep going.", delay: 2700 },
    ],
  },

  { type: 'milestone' },

  { type: 'close' },
];

/* ─── phone shell ────────────────────────────────────────────────────── */
function PhoneShell({ children, width = 300, height = 620, accentColor = '#3a3a3a' }: {
  children: React.ReactNode; width?: number; height?: number; accentColor?: string;
}) {
  const btnColor = '#2a2a2a';
  const btnBorder = '1px solid #444';
  return (
    <div style={{ position: 'relative', width, flexShrink: 0 }}>
      {/* left buttons */}
      <div style={{ position: 'absolute', left: -4, top: 100, width: 4, height: 28, background: btnColor, borderRadius: '3px 0 0 3px', border: btnBorder, borderRight: 'none' }} />
      <div style={{ position: 'absolute', left: -4, top: 144, width: 4, height: 48, background: btnColor, borderRadius: '3px 0 0 3px', border: btnBorder, borderRight: 'none' }} />
      <div style={{ position: 'absolute', left: -4, top: 204, width: 4, height: 48, background: btnColor, borderRadius: '3px 0 0 3px', border: btnBorder, borderRight: 'none' }} />
      {/* right button */}
      <div style={{ position: 'absolute', right: -4, top: 160, width: 4, height: 72, background: btnColor, borderRadius: '0 3px 3px 0', border: btnBorder, borderLeft: 'none' }} />
      {/* frame */}
      <div style={{
        width,
        height,
        background: 'linear-gradient(145deg, #1e1e1e 0%, #141414 100%)',
        borderRadius: 52,
        border: `2px solid ${accentColor}`,
        boxShadow: `0 40px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)`,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* screen inset */}
        <div style={{
          margin: '10px 8px 8px',
          flex: 1,
          background: '#000',
          borderRadius: 44,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* status bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px 0',
            flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>9:41</span>
            {/* dynamic island */}
            <div style={{ width: 88, height: 26, background: '#000', border: '1px solid #1a1a1a', borderRadius: 20, position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 12 }} />
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <svg width="14" height="10" viewBox="0 0 14 10" fill="white" opacity={0.8}><rect x="0" y="4" width="3" height="6" rx="1"/><rect x="4" y="2" width="3" height="8" rx="1"/><rect x="8" y="0" width="3" height="10" rx="1"/><rect x="12" y="0" width="1.5" height="10" rx="0.5" opacity={0.3}/></svg>
              <svg width="14" height="10" viewBox="0 0 20 14" fill="white" opacity={0.8}><path d="M10 3C13.5 3 16.6 4.4 18.8 6.7L20 5.4C17.5 2.7 13.9 1 10 1C6.1 1 2.5 2.7 0 5.4L1.2 6.7C3.4 4.4 6.5 3 10 3Z"/><path d="M10 7C12.2 7 14.2 7.9 15.7 9.4L17 8C15.1 6.1 12.7 5 10 5C7.3 5 4.9 6.1 3 8L4.3 9.4C5.8 7.9 7.8 7 10 7Z"/><circle cx="10" cy="13" r="2"/></svg>
              <div style={{ display: 'flex', gap: 1 }}>
                <div style={{ width: 22, height: 11, border: '1px solid rgba(255,255,255,0.4)', borderRadius: 3, padding: '1px 2px', display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '80%', height: 7, background: GREEN, borderRadius: 2 }} />
                </div>
                <div style={{ width: 2, height: 5, background: 'rgba(255,255,255,0.4)', borderRadius: 1, alignSelf: 'center' }} />
              </div>
            </div>
          </div>
          {/* content */}
          <div style={{ flex: 1, padding: '12px 14px 0', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
            {children}
          </div>
          {/* home indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 10px' }}>
            <div style={{ width: 100, height: 4, background: 'rgba(255,255,255,0.25)', borderRadius: 2 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── phone component ────────────────────────────────────────────────── */
function Phone({ bubbles, sceneKey }: { bubbles: Bubble[]; sceneKey: number }) {
  const [visible, setVisible] = useState<number[]>([]);

  useEffect(() => {
    setVisible([]);
    const timers = bubbles.map((b, i) =>
      setTimeout(() => setVisible(v => [...v, i]), b.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [sceneKey]);

  return (
    <PhoneShell width={300} height={620}>
      <div style={{ textAlign: 'center', color: '#555', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
        Your Clinic
      </div>
      {bubbles.map((b, i) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: b.dir === 'out' ? 'flex-start' : 'flex-end',
          opacity: visible.includes(i) ? 1 : 0,
          transform: visible.includes(i) ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
        }}>
          <div style={{
            maxWidth: '80%',
            padding: '9px 13px',
            borderRadius: b.dir === 'out' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
            background: b.dir === 'out' ? '#1c1c1e' : GREEN,
            color: b.dir === 'out' ? '#e5e7eb' : '#0a0a0a',
            fontSize: 13,
            lineHeight: 1.5,
            border: b.dir === 'out' ? '1px solid #2c2c2e' : 'none',
          }}>
            {b.text}
          </div>
        </div>
      ))}
    </PhoneShell>
  );
}

/* ─── engine scene ───────────────────────────────────────────────────── */
function EngineScene() {
  const phases = [
    { label: 'Initiation',  days: 'Day 1',        note: 'Welcome + expectations' },
    { label: 'Onboarding',  days: 'Days 2-7',     note: 'First dose, early habits' },
    { label: 'Activation',  days: 'Days 8-21',    note: 'Habit formation + logging' },
    { label: 'Momentum',    days: 'Days 22-51',   note: 'Progress reinforcement' },
    { label: 'Plateau',     days: 'Days 52-81',   note: 'Sustain through stall' },
    { label: 'Maintenance', days: 'Ongoing',      note: 'Light-touch check-ins' },
  ];
  const [active, setActive] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
        {phases.map((p, i) => (
          <div
            key={i}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onClick={e => e.stopPropagation()}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              border: `1px solid ${i === active ? GREEN : BORDER}`,
              background: i === active ? 'rgba(74,222,128,0.08)' : CARD,
              transition: 'all 0.25s ease',
              minWidth: 150,
              cursor: 'default',
            }}>
            <div style={{ color: i === active ? GREEN : DIM, fontSize: 13, fontWeight: 600, transition: 'color 0.25s' }}>{p.label}</div>
            <div style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>{p.days}</div>
            <div style={{ color: MUTED, fontSize: 11, marginTop: 2, opacity: i === active ? 1 : 0, transition: 'opacity 0.25s' }}>{p.note}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {[
          { label: 'Behavioral triggers', sub: 'No-reply detection, drift flags, phase advance' },
          { label: 'Timezone-aware', sub: 'Messages arrive at 9am wherever the patient is' },
          { label: 'Closed loop', sub: 'Engine acts first. Clinic notified only when needed.' },
        ].map((item, i) => (
          <div key={i} style={{ padding: 16, background: CARD, borderRadius: 10, border: `1px solid ${BORDER}` }}>
            <div style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
            <div style={{ color: MUTED, fontSize: 12, lineHeight: 1.4 }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── volume scene ───────────────────────────────────────────────────── */
function VolumeScene() {
  const items = [
    { phase: 'Initiation',  count: 4,  color: '#4ade80' },
    { phase: 'Onboarding',  count: 5,  color: '#34d399' },
    { phase: 'Activation',  count: 5,  color: '#22d3ee' },
    { phase: 'Momentum',    count: 6,  color: '#818cf8' },
    { phase: 'Plateau',     count: 8,  color: '#f472b6' },
    { phase: 'Maintenance', count: 5,  color: '#fb923c' },
  ];
  const max = 8;

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', width: '100%' }}>
      <p style={{ color: MUTED, fontSize: 13, textAlign: 'center', marginBottom: 32 }}>
        Scheduled message touchpoints across the patient journey
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 100, color: DIM, fontSize: 13, textAlign: 'right', flexShrink: 0 }}>{item.phase}</div>
            <div style={{ flex: 1, background: CARD, borderRadius: 4, height: 28, overflow: 'hidden', border: `1px solid ${BORDER}` }}>
              <div style={{
                height: '100%',
                width: `${(item.count / max) * 100}%`,
                background: item.color,
                opacity: 0.7,
                borderRadius: 3,
                transition: 'width 0.6s ease',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 10,
              }}>
                <span style={{ color: '#0a0a0a', fontSize: 12, fontWeight: 700 }}>{item.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 32, padding: 20, background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, textAlign: 'center' }}>
        <span style={{ color: GREEN, fontSize: 28, fontWeight: 800 }}>33+</span>
        <span style={{ color: DIM, fontSize: 16, marginLeft: 12 }}>scheduled touchpoints per patient</span>
        <p style={{ color: MUTED, fontSize: 13, marginTop: 8, marginBottom: 0 }}>
          Plus behavioral triggers that fire based on patient actions - replies, silences, injection confirmations.
        </p>
      </div>
    </div>
  );
}

/* ─── milestone scene ───────────────────────────────────────────────── */
const MILESTONES = [
  {
    label: 'First weigh-in',
    tag: 'Week 1',
    color: '#4ade80',
    bubbles: [
      { dir: 'out' as const, text: "Hi Alex - quick check-in: what's your weight this week?", delay: 400 },
      { dir: 'in'  as const, text: '247', delay: 1400 },
      { dir: 'out' as const, text: "First check-in logged. That's how it starts. See you next week.", delay: 2200 },
    ],
  },
  {
    label: '5 lbs down',
    tag: 'Milestone',
    color: '#34d399',
    bubbles: [
      { dir: 'out' as const, text: "Weekly check-in - what's the number this week?", delay: 400 },
      { dir: 'in'  as const, text: '242', delay: 1400 },
      { dir: 'out' as const, text: "Down 5 lbs since you started. That's not nothing - that's real progress. Keep it up.", delay: 2200 },
    ],
  },
  {
    label: '10 lbs down',
    tag: 'Milestone',
    color: '#22d3ee',
    bubbles: [
      { dir: 'out' as const, text: "Monday check-in. What's your weight today?", delay: 400 },
      { dir: 'in'  as const, text: '237', delay: 1400 },
      { dir: 'out' as const, text: "10 lbs down, Alex. You're past the first big milestone. The hardest part is behind you.", delay: 2200 },
    ],
  },
  {
    label: '10% body weight',
    tag: 'Major milestone',
    color: '#818cf8',
    bubbles: [
      { dir: 'out' as const, text: "Weekly check-in. What's the scale saying?", delay: 400 },
      { dir: 'in'  as const, text: '222', delay: 1400 },
      { dir: 'out' as const, text: "You've lost 10% of your starting body weight. That's a clinical milestone. Your team knows. This is what you started for.", delay: 2200 },
    ],
  },
];

function MilestonePhone({
  milestone,
  color,
}: {
  milestone: typeof MILESTONES[0];
  color: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState<number[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setVisible([]);
    if (hovered) {
      milestone.bubbles.forEach((b, i) => {
        const t = setTimeout(() => setVisible(v => [...v, i]), b.delay);
        timersRef.current.push(t);
      });
    }
  }, [hovered, milestone]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={e => e.stopPropagation()}
      style={{ cursor: 'default', transition: 'transform 0.2s ease', transform: hovered ? 'translateY(-4px)' : 'none' }}
    >
      <PhoneShell width={210} height={460} accentColor={hovered ? color : '#3a3a3a'}>
        {/* label row */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: hovered ? color : MUTED, transition: 'color 0.3s ease', marginBottom: 2 }}>
            {milestone.tag}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: hovered ? '#e5e7eb' : '#444', transition: 'color 0.3s ease' }}>
            {milestone.label}
          </div>
        </div>
        {/* bubbles */}
        {milestone.bubbles.map((b, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: b.dir === 'out' ? 'flex-start' : 'flex-end',
            opacity: visible.includes(i) ? 1 : 0,
            transform: visible.includes(i) ? 'translateY(0)' : 'translateY(4px)',
            transition: 'opacity 0.35s ease, transform 0.35s ease',
          }}>
            <div style={{
              maxWidth: '85%',
              padding: '7px 10px',
              borderRadius: b.dir === 'out' ? '12px 12px 12px 3px' : '12px 12px 3px 12px',
              background: b.dir === 'out' ? '#1c1c1e' : color,
              color: b.dir === 'out' ? '#e5e7eb' : '#0a0a0a',
              fontSize: 11,
              lineHeight: 1.45,
              border: b.dir === 'out' ? '1px solid #2c2c2e' : 'none',
            }}>
              {b.text}
            </div>
          </div>
        ))}
        {/* hover hint */}
        {!hovered && (
          <div style={{ marginTop: 'auto', textAlign: 'center', color: '#333', fontSize: 10, letterSpacing: '0.06em', paddingBottom: 4 }}>
            hover to see
          </div>
        )}
      </PhoneShell>
    </div>
  );
}

function MilestoneScene() {
  return (
    <div style={{ width: '100%', maxWidth: 960 }}>
      <p style={{ color: GREEN, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12, fontWeight: 600, textAlign: 'center' }}>
        Adherix Gauge - Scale Tracker
      </p>
      <h2 style={{ fontSize: 'clamp(20px, 2.6vw, 32px)', fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
        Every milestone lands in their pocket.
      </h2>
      <p style={{ color: DIM, fontSize: 15, textAlign: 'center', marginBottom: 36, lineHeight: 1.6 }}>
        The engine tracks every weigh-in and fires a personalized message when a patient hits a milestone.<br />
        Hover each phone to see what they receive.
      </p>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', justifyContent: 'center' }}>
        {MILESTONES.map((m, i) => (
          <MilestonePhone key={i} milestone={m} color={m.color} />
        ))}
      </div>
    </div>
  );
}

/* ─── gap scene ──────────────────────────────────────────────────────── */
function GapScene() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', width: '100%' }}>
      <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 700, textAlign: 'center', marginBottom: 48 }}>
        The problem isn't the medication.
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {[
          {
            n: '01',
            label: 'Clinics call. Patients ghost.',
            sub: 'Coordinators can\'t reach every patient. The ones who stop responding are exactly the ones who need help most.',
          },
          {
            n: '02',
            label: 'Manual check-ins don\'t scale.',
            sub: 'A 500-patient practice can\'t follow up weekly with every GLP-1 patient. So they don\'t - and dropout climbs.',
          },
          {
            n: '03',
            label: 'Silent dropout is invisible.',
            sub: 'There\'s no EHR alert when a patient just stops. Clinics often don\'t know until a missed appointment months later.',
          },
        ].map((item, i) => (
          <div key={i} style={{ padding: 24, background: CARD, borderRadius: 12, border: `1px solid ${BORDER}` }}>
            <div style={{ color: GREEN, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>{item.n}</div>
            <div style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{item.label}</div>
            <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.5 }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── trigger scene ──────────────────────────────────────────────────── */
function TriggerScene({ eyebrow, headline, context, trigger }: {
  eyebrow: string; headline: string; context: string;
  trigger: { condition: string; action: string; result: string };
}) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', width: '100%', display: 'flex', gap: 64, alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <p style={{ color: GREEN, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>
          {eyebrow}
        </p>
        <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 700, lineHeight: 1.3, marginBottom: 16 }}>
          {headline}
        </h2>
        <p style={{ color: DIM, fontSize: 16, lineHeight: 1.6 }}>{context}</p>
      </div>
      <div style={{ flexShrink: 0, width: 280 }}>
        <div style={{ background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
          {[
            { label: 'Condition', value: trigger.condition, color: '#f87171' },
            { label: 'Action',    value: trigger.action,    color: GREEN },
            { label: 'Result',    value: trigger.result,    color: DIM },
          ].map((row, i) => (
            <div key={i} style={{
              padding: '14px 18px',
              borderBottom: i < 2 ? `1px solid ${BORDER}` : 'none',
            }}>
              <div style={{ color: MUTED, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>{row.label}</div>
              <div style={{ color: row.color, fontSize: 13, lineHeight: 1.4 }}>{row.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── main deck ──────────────────────────────────────────────────────── */
export function OverviewDeck() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const total = SCENES.length;

  const go = useCallback((next: number) => {
    if (fading || next < 0 || next >= total) return;
    setFading(true);
    setTimeout(() => { setIndex(next); setFading(false); }, 280);
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
      style={{ minHeight: '100vh', background: INK, color: '#f9fafb', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', display: 'flex', flexDirection: 'column' }}
      onClick={() => go(index + 1)}
    >
      {/* progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, background: BORDER, zIndex: 10 }}>
        <div style={{ height: '100%', background: GREEN, width: `${((index + 1) / total) * 100}%`, transition: 'width 0.3s ease' }} />
      </div>

      {/* counter */}
      <div style={{ position: 'fixed', top: 20, right: 24, color: MUTED, fontSize: 12, letterSpacing: '0.05em', zIndex: 10, fontVariantNumeric: 'tabular-nums' }}>
        {index + 1} / {total}
      </div>

      {/* content */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 48px',
        opacity: fading ? 0 : 1,
        transform: fading ? 'translateY(6px)' : 'translateY(0)',
        transition: 'opacity 0.28s ease, transform 0.28s ease',
      }}>

        {/* COVER */}
        {scene.type === 'cover' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: GREEN, boxShadow: `0 0 20px ${GREEN}` }} />
              <span style={{ color: GREEN, fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>Adherix Health</span>
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 700, lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
              Retention Intelligence<br />for GLP-1 Programs
            </h1>
            <p style={{ color: DIM, fontSize: 18, marginBottom: 16, lineHeight: 1.6, maxWidth: 520, margin: '0 auto 48px' }}>
              A behavior-driven SMS engine that keeps patients engaged through every phase of treatment - automatically.
            </p>
            <p style={{ color: '#374151', fontSize: 13, letterSpacing: '0.08em' }}>Press → or click to advance</p>
          </div>
        )}

        {/* STAT */}
        {scene.type === 'stat' && (
          <div style={{ maxWidth: 680, textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 38px)', fontWeight: 600, lineHeight: 1.25, marginBottom: 48, color: '#e5e7eb' }}>
              {scene.headline}
            </h2>
            <div style={{ fontSize: 'clamp(80px, 14vw, 148px)', fontWeight: 800, color: GREEN, lineHeight: 1, marginBottom: 32, letterSpacing: '-0.04em' }}>
              {scene.stat}
            </div>
            <p style={{ color: DIM, fontSize: 20, lineHeight: 1.6 }}>{scene.sub}</p>
          </div>
        )}

        {/* GAP */}
        {scene.type === 'gap' && <GapScene />}

        {/* ENGINE */}
        {scene.type === 'engine' && (
          <div style={{ width: '100%', maxWidth: 720, textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 700, marginBottom: 8 }}>
              Six phases. Automated from day one.
            </h2>
            <p style={{ color: DIM, marginBottom: 48, fontSize: 17 }}>
              Adherix moves patients through a clinically-sequenced behavioral program - no coordinator involvement required at each step.
            </p>
            <EngineScene />
          </div>
        )}

        {/* VOLUME */}
        {scene.type === 'volume' && (
          <div style={{ width: '100%', maxWidth: 680, textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 700, marginBottom: 8 }}>
              This is not a reminder tool.
            </h2>
            <p style={{ color: DIM, marginBottom: 48, fontSize: 17 }}>
              Every patient receives a full behavioral sequence - timed, personalized, and responsive to what they actually do.
            </p>
            <VolumeScene />
          </div>
        )}

        {/* PHONE */}
        {scene.type === 'phone' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 72, width: '100%', maxWidth: 860 }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: GREEN, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>
                {scene.eyebrow}
              </p>
              <h2 style={{ fontSize: 'clamp(20px, 2.6vw, 32px)', fontWeight: 700, lineHeight: 1.25, marginBottom: 16 }}>
                {scene.headline}
              </h2>
              <p style={{ color: DIM, fontSize: 16, lineHeight: 1.65 }}>{scene.context}</p>
            </div>
            <div onClick={e => e.stopPropagation()}>
              <Phone key={index} bubbles={scene.bubbles} sceneKey={index} />
            </div>
          </div>
        )}

        {/* TRIGGER */}
        {scene.type === 'trigger' && (
          <TriggerScene
            eyebrow={scene.eyebrow}
            headline={scene.headline}
            context={scene.context}
            trigger={scene.trigger}
          />
        )}

        {/* BRIDGE */}
        {scene.type === 'bridge' && (
          <div style={{ textAlign: 'center', maxWidth: 700 }}>
            <div style={{
              display: 'inline-block', padding: '4px 16px',
              background: 'rgba(74,222,128,0.1)', border: `1px solid rgba(74,222,128,0.3)`,
              borderRadius: 20, color: GREEN, fontSize: 12, letterSpacing: '0.12em',
              textTransform: 'uppercase', fontWeight: 600, marginBottom: 48,
            }}>
              One more thing
            </div>
            <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 56px)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 24 }}>
              Before we close out -
            </h2>
            <p style={{ fontSize: 'clamp(22px, 3.2vw, 40px)', fontWeight: 600, color: GREEN, lineHeight: 1.25 }}>
              this is what your patients<br />will remember.
            </p>
          </div>
        )}

        {/* GAUGE */}
        {scene.type === 'gauge' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 72, width: '100%', maxWidth: 860 }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: GREEN, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>
                Adherix Gauge - Scale Tracker
              </p>
              <h2 style={{ fontSize: 'clamp(20px, 2.6vw, 32px)', fontWeight: 700, lineHeight: 1.25, marginBottom: 16 }}>
                Weekly weight check-ins. Automated milestones.
              </h2>
              <p style={{ color: DIM, fontSize: 16, lineHeight: 1.65, marginBottom: 24 }}>
                Every Monday, patients get a single-question check-in. They reply with a number. The engine tracks progress, detects milestones, and sends a personalized congratulatory message - or a plateau-support message if the scale has stalled.
              </p>
              <p style={{ color: DIM, fontSize: 16, lineHeight: 1.65 }}>
                No app. No wearable. No login. Just a text and a reply.
              </p>
            </div>
            <div onClick={e => e.stopPropagation()}>
              <Phone key={index} bubbles={scene.bubbles} sceneKey={index} />
            </div>
          </div>
        )}

        {/* MILESTONE */}
        {scene.type === 'milestone' && <MilestoneScene />}

        {/* CLOSE */}
        {scene.type === 'close' && (
          <div style={{ textAlign: 'center', maxWidth: 680 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, boxShadow: `0 0 16px ${GREEN}` }} />
              <span style={{ color: GREEN, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>Adherix Health</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 52px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 20 }}>
              Patients who feel supported<br />stay longer.
            </h2>
            <p style={{ color: DIM, fontSize: 20, lineHeight: 1.6, marginBottom: 56 }}>
              That's the product. An automated behavioral layer that shows up at the right moment - every time, for every patient, without adding headcount.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, maxWidth: 560, margin: '0 auto' }}>
              {[
                { stat: '33+', label: 'touchpoints per patient' },
                { stat: '6',   label: 'behavioral phases' },
                { stat: '0',   label: 'coordinator actions required' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '20px 16px', background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, textAlign: 'center' }}>
                  <div style={{ color: GREEN, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{item.stat}</div>
                  <div style={{ color: MUTED, fontSize: 12, marginTop: 6, lineHeight: 1.3 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* dots */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: '20px 0 28px' }}>
        {SCENES.map((_, i) => (
          <button key={i} onClick={e => { e.stopPropagation(); go(i); }} style={{
            width: i === index ? 22 : 6, height: 6, borderRadius: 3,
            background: i === index ? GREEN : BORDER,
            border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s ease',
          }} aria-label={`Scene ${i + 1}`} />
        ))}
      </div>

      {/* arrows */}
      {index > 0 && (
        <button onClick={e => { e.stopPropagation(); go(index - 1); }} style={{
          position: 'fixed', left: 20, top: '50%', transform: 'translateY(-50%)',
          background: CARD, border: `1px solid ${BORDER}`, color: DIM,
          width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', fontSize: 17,
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
        }} aria-label="Previous">‹</button>
      )}
      {index < total - 1 && (
        <button onClick={e => { e.stopPropagation(); go(index + 1); }} style={{
          position: 'fixed', right: 20, top: '50%', transform: 'translateY(-50%)',
          background: CARD, border: `1px solid ${BORDER}`, color: DIM,
          width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', fontSize: 17,
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
        }} aria-label="Next">›</button>
      )}
    </div>
  );
}
