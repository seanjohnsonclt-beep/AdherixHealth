'use client';

import { FadeRise } from '../animation/MotionPrimitives';

/**
 * Section 8 — Founder credibility note.
 *
 * Soft Paper section. Single column, generous whitespace. Avatar is a
 * neutral SVG silhouette placeholder until a real photo is added.
 *
 * TODO(sean): Replace placeholder body with a real one-paragraph founder
 * note. Replace silhouette with a real headshot at /founder.jpg (or similar)
 * served from /public.
 */
export function FounderNote() {
  return (
    <section className="mkt-r-section mkt-r-section--paper-soft" id="founder">
      <div className="mkt-container mkt-r-founder">
        <FadeRise as="span" className="mkt-eyebrow">
          Why we built this
        </FadeRise>

        <div className="mkt-r-founder__row">
          <FadeRise className="mkt-r-founder__avatar" delay={0.05}>
            <Silhouette />
          </FadeRise>

          <FadeRise className="mkt-r-founder__body" delay={0.1}>
            <p className="mkt-r-founder__lede">
              Adherence is a behavior problem, not a content problem. Most
              metabolic programs lose patients between months two and four
              because no one is paying attention to the signals that matter
              — and the signals that matter aren&rsquo;t in a chart.
            </p>
            <p>
              Adherix is the smallest possible intervention layer that uses
              what patients already do — replies, silences, dose timing — to
              keep them on treatment longer. Built deliberately small, so
              clinics can run it without adding a single workflow.
            </p>
            <p className="mkt-r-founder__sign">
              <span className="mkt-r-founder__name">Sean Johnson</span>
              <span className="mkt-r-founder__role">Founder, Adherix Health</span>
            </p>
          </FadeRise>
        </div>
      </div>
    </section>
  );
}

function Silhouette() {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      role="img"
      aria-label="Founder portrait placeholder"
      className="mkt-r-founder__silhouette"
    >
      <defs>
        <linearGradient id="mkt-r-founder-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--mkt-sage)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--mkt-sage-deep)" stopOpacity="0.28" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#mkt-r-founder-grad)" />
      <circle cx="60" cy="48" r="18" fill="var(--mkt-paper)" opacity="0.92" />
      <path
        d="M 24 104 C 32 84, 48 76, 60 76 C 72 76, 88 84, 96 104 Z"
        fill="var(--mkt-paper)"
        opacity="0.92"
      />
    </svg>
  );
}
