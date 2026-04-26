'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { CountUp, FadeRise, TapButton } from '../animation/MotionPrimitives';
import { useReducedMotionSafe } from '../animation/useReducedMotionSafe';

/**
 * Section 1 — Hero
 *
 * Headline: existing brand line, kept verbatim.
 * Subheadline: positions Adherix as retention intelligence layer.
 * CTAs: Request a demo (primary) + See the platform (secondary in-page).
 * Below CTAs: animated stat trio that count-up on mount.
 *
 * Visual: subtle radial Sage + Clay washes on Paper (handled in CSS).
 */
export function Hero() {
  const reduced = useReducedMotionSafe();

  return (
    <section className="mkt-r-hero" id="top">
      <div className="mkt-container mkt-r-hero__inner">
        <FadeRise as="span" className="mkt-eyebrow mkt-r-hero__eyebrow">
          Retention intelligence for metabolic care
        </FadeRise>

        <motion.h1
          className="mkt-h1 mkt-r-hero__title"
          initial={reduced ? false : { opacity: 0, y: 18 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        >
          Patients don&rsquo;t drop off.
          <br />
          They drift, and we catch them.
        </motion.h1>

        <motion.p
          className="mkt-subhead mkt-r-hero__sub"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          The retention intelligence layer for modern metabolic care. Adherix
          detects patient drift in GLP-1 programs and automates behavioral
          engagement that keeps adherence above the average.
        </motion.p>

        <motion.div
          className="mkt-r-hero__cta"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
        >
          <TapButton>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
              Request a demo
            </Link>
          </TapButton>
          <TapButton>
            <Link href="#dashboard-preview" className="mkt-btn mkt-btn--ghost mkt-btn--lg">
              See the platform
            </Link>
          </TapButton>
        </motion.div>

        <motion.div
          className="mkt-r-hero__stats"
          initial={reduced ? false : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          aria-label="Key program outcomes"
        >
          <HeroStat
            big={
              <>
                <CountUp to={18} />
                <span className="mkt-r-hero__stat-unit">%</span>
              </>
            }
            label="fewer early drop-offs*"
          />
          <HeroStat
            big={
              <>
                <CountUp to={8} />
                <span className="mkt-r-hero__stat-unit"> hrs/wk</span>
              </>
            }
            label="staff time recovered*"
          />
          <HeroStat
            big={
              <>
                <CountUp to={90} />
                <span className="mkt-r-hero__stat-unit">-day</span>
              </>
            }
            label="retention workflow built in"
          />
        </motion.div>
        <p className="mkt-r-hero__disclaimer">
          *Modeled estimates. Pilots validate against your actual program data.
        </p>
      </div>

      {/* Decorative wash — pure CSS, no extra DOM cost */}
      <div className="mkt-r-hero__wash" aria-hidden="true" />
    </section>
  );
}

function HeroStat({ big, label }: { big: React.ReactNode; label: string }) {
  return (
    <div className="mkt-r-hero__stat">
      <div className="mkt-r-hero__stat-big">{big}</div>
      <div className="mkt-r-hero__stat-label">{label}</div>
    </div>
  );
}
