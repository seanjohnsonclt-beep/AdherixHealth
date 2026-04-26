'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TapButton } from '../animation/MotionPrimitives';
import { useReducedMotionSafe } from '../animation/useReducedMotionSafe';

/**
 * Homepage Hero — v2
 *
 * One clean entry sequence. Headline → subhead → CTAs.
 * No stat trio noise here — stats live in the Trust/CTA band.
 * Hero's only job: establish the problem and earn the next scroll.
 */
export function HomeHero() {
  const reduced = useReducedMotionSafe();
  const ease = [0.22, 1, 0.36, 1] as const;

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
        <motion.span className="mkt-eyebrow mkt-v2-hero__eyebrow" {...seq(0)}>
          Retention intelligence for GLP-1 programs
        </motion.span>

        <motion.h1 className="mkt-h1 mkt-v2-hero__title" {...seq(0.08)}>
          Patients don&rsquo;t drop off.
          <br />
          They drift.
        </motion.h1>

        <motion.p className="mkt-subhead mkt-v2-hero__sub" {...seq(0.18)}>
          Adherix helps GLP-1 clinics detect disengagement early, trigger smarter
          interventions, and retain more patients through the treatment journey.
        </motion.p>

        <motion.div className="mkt-v2-hero__ctas" {...seq(0.28)}>
          <TapButton>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
              Book a demo
            </Link>
          </TapButton>
          <TapButton>
            <Link href="/platform" className="mkt-btn mkt-btn--ghost mkt-btn--lg">
              See the platform
            </Link>
          </TapButton>
        </motion.div>
      </div>

      {/* Decorative radial wash — no DOM cost, pure CSS */}
      <div className="mkt-v2-hero__wash" aria-hidden="true" />
    </section>
  );
}
