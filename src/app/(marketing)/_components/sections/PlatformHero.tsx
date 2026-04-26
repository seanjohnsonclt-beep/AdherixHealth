'use client';

import { motion } from 'framer-motion';
import { useReducedMotionSafe } from '../animation/useReducedMotionSafe';

/**
 * Platform page hero — sets up the depth that follows.
 * Centered, tight, leads straight into the phase engine.
 */
export function PlatformHero() {
  const reduced = useReducedMotionSafe();
  const ease = [0.22, 1, 0.36, 1] as const;

  const seq = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.65, ease, delay },
        };

  return (
    <section className="mkt-v2-section mkt-v2-plat-hero">
      <div className="mkt-container mkt-v2-section__head mkt-v2-section__head--lg">
        <motion.span className="mkt-eyebrow" {...seq(0)}>
          The platform
        </motion.span>
        <motion.h1 className="mkt-h1 mkt-v2-plat-hero__title" {...seq(0.08)}>
          Built for the moments
          <br />
          retention is won or lost
        </motion.h1>
        <motion.p className="mkt-subhead" {...seq(0.18)}>
          Adherix runs a six-phase behavioral engine on top of SMS. It knows where
          every patient is, when they last replied, and what should happen next —
          without anyone in the clinic having to think about it.
        </motion.p>
      </div>
    </section>
  );
}
