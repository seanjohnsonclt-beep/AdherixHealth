'use client';

import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion, type MotionProps } from 'framer-motion';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

/* Inlined to avoid dependency on deleted animation files */
function useReducedMotionSafe(): boolean {
  const reduced = useReducedMotion();
  return reduced === true;
}

function TapButton({
  children,
  className,
  style,
  ...rest
}: { children: ReactNode; className?: string; style?: CSSProperties } & MotionProps) {
  const reduced = useReducedMotionSafe();
  return (
    <motion.span
      className={className}
      style={{ display: 'inline-flex', ...style }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      {...rest}
    >
      {children}
    </motion.span>
  );
}

const patients = [
  { name: 'Maria C.',  last: 'Replied this morning',  status: 'active'   },
  { name: 'James R.',  last: 'No reply  -  48 hours',   status: 'warning'  },
  { name: 'Priya S.',  last: 'Silent  -  5 days',       status: 'critical' },
  { name: 'Tom W.',    last: 'Replied yesterday',      status: 'active'   },
];

/**
 * Homepage Hero  -  v3
 *
 * Split layout: copy left, live patient-signal widget right.
 * The widget demonstrates the product in the hero itself:
 *   - animated status dots (green / amber / red pulsing)
 *   - an "automated nudge sent" toast slides in after ~3s
 * No stat clutter here  -  stats live in the Trust/CTA band.
 */
export function HomeHero() {
  const reduced = useReducedMotionSafe();
  const [nudgeSent, setNudgeSent] = useState(false);
  const ease = [0.22, 1, 0.36, 1] as const;

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setNudgeSent(true), 2800);
    return () => clearTimeout(t);
  }, [reduced]);

  const seq = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease, delay },
        };

  return (
    <section className="mkt-v2-hero">
      <div className="mkt-container mkt-v2-hero__inner">

        {/* -- Left: copy -- */}
        <div className="mkt-v2-hero__copy">
          <motion.span className="mkt-eyebrow mkt-v2-hero__eyebrow" {...seq(0)}>
            GLP-1 retention  -  the gap most clinics don&rsquo;t see coming
          </motion.span>

          <motion.h1 className="mkt-h1 mkt-v2-hero__title" {...seq(0.08)}>
            Some of your patients
            <br />
            are already drifting.
          </motion.h1>

          <motion.p className="mkt-subhead mkt-v2-hero__sub" {...seq(0.18)}>
            They won&rsquo;t tell you. They&rsquo;ll slow down, stop replying, miss a
            dose  -  then disappear. Adherix detects the pattern in real time and
            corrects it automatically, before your team ever has to get involved.
          </motion.p>

          <motion.div className="mkt-v2-hero__ctas" {...seq(0.28)}>
            <TapButton>
              <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
                Book a demo
              </Link>
            </TapButton>
            <TapButton>
              <Link href="/platform" className="mkt-btn mkt-btn--ghost mkt-btn--lg">
                See how it works
              </Link>
            </TapButton>
          </motion.div>
        </div>

        {/* -- Right: live signal widget -- */}
        <motion.div
          className="mkt-v2-hero__widget"
          initial={reduced ? undefined : { opacity: 0, x: 28, y: 8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.85, ease, delay: 0.3 }}
        >
          <div className="mkt-signal-widget">
            {/* Header */}
            <div className="mkt-signal-widget__header">
              <span className="mkt-signal-live-dot" aria-hidden="true" />
              Live patient signals
            </div>

            {/* Patient rows */}
            <div className="mkt-signal-widget__rows" role="list">
              {patients.map((p, i) => (
                <motion.div
                  key={p.name}
                  className={`mkt-signal-row mkt-signal-row--${p.status}`}
                  role="listitem"
                  initial={reduced ? undefined : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.45 + i * 0.1 }}
                >
                  <span
                    className={`mkt-signal-dot mkt-signal-dot--${p.status}`}
                    aria-label={p.status}
                  />
                  <span className="mkt-signal-name">{p.name}</span>
                  <span className="mkt-signal-last">{p.last}</span>
                </motion.div>
              ))}
            </div>

            {/* Auto-nudge toast */}
            <AnimatePresence>
              {nudgeSent && (
                <motion.div
                  className="mkt-signal-nudge"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease }}
                >
                  <div className="mkt-signal-nudge__icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 14L14 2M14 2H6M14 2V10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="mkt-signal-nudge__label">Nudge sent automatically</p>
                    <p className="mkt-signal-nudge__sub">Priya S. · &ldquo;Just checking in on how you&rsquo;re feeling…&rdquo;</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Decorative floating badge */}
          <motion.div
            className="mkt-signal-badge"
            initial={reduced ? undefined : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease, delay: 0.9 }}
          >
            <span className="mkt-signal-badge__dot" aria-hidden="true" />
            Automated  -  no staff action needed
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative radial wash */}
      <div className="mkt-v2-hero__wash" aria-hidden="true" />
    </section>
  );
}
