'use client';

import { motion } from 'framer-motion';
import { useReducedMotionSafe } from '../animation/useReducedMotionSafe';

/**
 * Platform page hero  -  sets up the depth that follows.
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
          Under the hood
        </motion.span>
        <motion.h1 className="mkt-h1 mkt-v2-plat-hero__title" {...seq(0.08)}>
          Six phases. Four triggers.
          <br />
          Every patient, every minute.
        </motion.h1>
        <motion.p className="mkt-subhead" {...seq(0.18)}>
          This is what runs. Adherix tracks where every patient is in their
          treatment journey, what they last said, and what should happen next
           -  and executes it automatically, without coordinator involvement.
        </motion.p>
      </div>
    </section>
  );
}
