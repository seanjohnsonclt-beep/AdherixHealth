'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TapButton } from '../animation/MotionPrimitives';
import { useReducedMotionSafe } from '../animation/useReducedMotionSafe';

const patients = [
  { name: 'Maria C.',  last: 'Replied this morning',  status: 'active'   },
  { name: 'James R.',  last: 'No reply — 48 hours',   status: 'warning'  },
  { name: 'Priya S.',  last: 'Silent — 5 days',       status: 'critical' },
  { name: 'Tom W.',    last: 'Replied yesterday',      status: 'active'   },
];

/**
 * Homepage Hero — v3
 *
 * Split layout: copy left, live patient-signal widget right.
 * The widget demonstrates the product in the hero itself:
 *   – animated status dots (green / amber / red pulsing)
 *   – an "automated nudge sent" toast slides in after ~3s
 * No stat clutter here — stats live in the Trust/CTA band.
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

        {/* ── Left: copy ── */}
        <div className="mkt-v2-hero__copy">
          <motion.span className="mkt-eyebrow mkt-v2-hero__eyebrow" {...seq(0)}>
            GLP-1 retention — the gap most clinics don&rsquo;t see coming
          </motion.span>

          <motion.h1 className="mkt-h1 mkt-v2-hero__title" {...seq(0.08)}>
            Some of your patients
            <br />
            are already drifting.
          </motion.h1>

          <motion.p className="mkt-subhead mkt-v2-hero__sub" {...seq(0.18)}>
            They won&rsquo;t tell you. They&rsquo;ll slow down, stop replying, miss a
            dose — then dis