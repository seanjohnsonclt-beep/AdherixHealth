"use client";

import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { MotionProps } from "framer-motion";

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
      style={{ display: "inline-flex", ...style }}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      {...rest}
    >
      {children}
    </motion.span>
  );
}

export function QuestHero() {
  const reduced = useReducedMotionSafe();
  const [toastVisible, setToastVisible] = useState(false);
  const [xpWidth, setXpWidth] = useState(0);
  const ease = [0.22, 1, 0.36, 1] as const;

  useEffect(() => {
    const xpTimer = setTimeout(() => setXpWidth(52), reduced ? 0 : 600);
    const toastTimer = setTimeout(() => setToastVisible(true), reduced ? 0 : 2500);
    return () => {
      clearTimeout(xpTimer);
      clearTimeout(toastTimer);
    };
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
    <section className="mkt-q-hero">
      <div className="mkt-q-hero__wash" aria-hidden="true" />
      <div className="mkt-q-hero__glow" aria-hidden="true" />

      <div className="mkt-q-hero__inner">
        {/* Left: copy */}
        <div className="mkt-q-hero__copy">
          <motion.span className="mkt-q-eyebrow" {...seq(0)}>
            Adherix Quest - Pediatric Weight Management
          </motion.span>

          <motion.h1 className="mkt-q-title" {...seq(0.08)}>
            Teen patients don&rsquo;t fail treatment.
            <br />
            <em>Treatment fails to keep them.</em>
          </motion.h1>

          <motion.p className="mkt-q-sub" {...seq(0.18)}>
            Quest keeps adolescent patients in treatment longer - by turning
            behavioral check-ins into something they actually respond to.
            Same clinical protocol. Completely different retention.
          </motion.p>

          <motion.div className="mkt-q-ctas" {...seq(0.28)}>
            <TapButton>
              <Link href="/pilot" className="mkt-q-btn--primary">
                Book a demo
              </Link>
            </TapButton>
            <TapButton>
              <Link href="#quest-experience" className="mkt-q-btn--ghost">
                See how it works
              </Link>
            </TapButton>
          </motion.div>

          <motion.div
            className="mkt-q-stats"
            {...seq(0.36)}
            aria-label="Quest program facts"
          >
            <div className="mkt-q-stat">
              <span className="mkt-q-stat__value">13-18</span>
              <span className="mkt-q-stat__label">Age range</span>
            </div>
            <div className="mkt-q-stat">
              <span className="mkt-q-stat__value">Dual SMS</span>
              <span className="mkt-q-stat__label">Teen + guardian</span>
            </div>
            <div className="mkt-q-stat">
              <span className="mkt-q-stat__value">Clinically</span>
              <span className="mkt-q-stat__label">Structured</span>
            </div>
          </motion.div>
        </div>

        {/* Right: Quest game card widget */}
        <motion.div
          className="mkt-q-hero__widget"
          initial={reduced ? undefined : { opacity: 0, x: 28, y: 8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.85, ease, delay: 0.3 }}
        >
          <div className="mkt-q-card">
            <div className="mkt-q-card__header">
              <span className="mkt-q-handle">@quickhawk</span>
              <span className="mkt-q-pill mkt-q-pill--squad">Alpha Squad</span>
            </div>

            <div className="mkt-q-level">
              <span className="mkt-q-level__label">Level</span>
              <span className="mkt-q-pill mkt-q-pill--violet">Lv. 4 - Beast Mode</span>
            </div>

            <div
              className="mkt-q-xpbar"
              role="progressbar"
              aria-valuenow={520}
              aria-valuemin={0}
              aria-valuemax={1000}
              aria-label="Monthly XP progress"
            >
              <div className="mkt-q-xpbar__meta">
                <span>Monthly XP</span>
                <span>520 / 1,000</span>
              </div>
              <div className="mkt-q-xpbar__track">
                <div
                  className="mkt-q-xpbar__fill"
                  style={{ width: xpWidth + "%" }}
                />
              </div>
            </div>

            <div className="mkt-q-reward">
              <span className="mkt-q-reward__dot" aria-hidden="true" />
              $5 reward unlocked
            </div>

            <div className="mkt-q-squad">
              <span className="mkt-q-squad__label">Squad</span>
              <div className="mkt-q-avatar mkt-q-avatar--active" aria-label="Jordan">J</div>
              <div className="mkt-q-avatar" aria-label="Maya">M</div>
              <div className="mkt-q-avatar" aria-label="Carlos">C</div>
            </div>

            <AnimatePresence>
              {toastVisible && (
                <motion.div
                  className="mkt-q-toast"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease }}
                >
                  <span className="mkt-q-toast__icon" aria-hidden="true">&#x26A1;</span>
                  <div>
                    <p className="mkt-q-toast__label">+30 XP - Boss Challenge: CONQUERED</p>
                    <p className="mkt-q-toast__sub">
                      @quickhawk completed this week&rsquo;s mission
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
