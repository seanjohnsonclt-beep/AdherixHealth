'use client';

import { FadeRise, ScrollDraw } from '../animation/MotionPrimitives';

/**
 * Homepage Problem — v2
 *
 * Two-column layout on desktop: copy + pull stat left, drift chart right.
 * The chart is illustrative — no fake clinic data, just the pattern.
 */
export function HomeProblem() {
  return (
    <section className="mkt-v2-section mkt-v2-section--alt" id="problem">
      <div className="mkt-container mkt-v2-problem">
        <div className="mkt-v2-problem__copy">
          <FadeRise as="span" className="mkt-eyebrow">
            The problem
          </FadeRise>
          <FadeRise as="h2" className="mkt-h2" delay={0.05}>
            The hidden leak in GLP-1 growth
          </FadeRise>
          <FadeRise as="div" className="mkt-v2-problem__body" delay={0.1}>
            <p>Most clinics focus on acquisition. Few operationalize retention.</p>
            <p>Missed check-ins. Delayed refills. Lower motivation. Slower replies.</p>
            <p>Then the patient disappears.</p>
          </FadeRise>
          <FadeRise className="mkt-v2-problem__pull" delay={0.15}>
            <div className="mkt-v2-problem__pull-num">~35%</div>
            <div className="mkt-v2-problem__pull-text">
              of GLP-1 patients churn within 90 days without active behavioral
              engagement.<sup>*</sup>
            </div>
            <div className="mkt-v2-problem__pull-foot">
              *Modeled industry baseline. Validated against pilot data.
            </div>
          </FadeRise>
        </div>

        <FadeRise className="mkt-v2-problem__visual" delay={0.06} amount={0.2}>
          <DriftChart />
        </FadeRise>
      </div>
    </section>
  );
}

function DriftChart() {
  return (
    <svg
      viewBox="0 0 500 260"
      role="img"
      aria-label="Illustrative chart showing patient engagement decay over 90 days"
      className="mkt-v2-problem__chart"
    >
      {/* Grid lines */}
      <g stroke="var(--mkt-line)" strokeWidth="1" opacity="0.7">
        <line x1="30" y1="50" x2="475" y2="50" />
        <line x1="30" y1="110" x2="475" y2="110" />
        <line x1="30" y1="170" x2="475" y2="170" />
        <line x1="30" y1="220" x2="475" y2="220" />
      </g>

      {/* X axis labels */}
      <g fontFamily="Geist Mono, ui-monospace, monospace" fontSize="9" fill="var(--mkt-graphite)">
        <text x="30" y="242">Day 0</text>
        <text x="155" y="242">Day 30</text>
        <text x="295" y="242">Day 60</text>
        <text x="425" y="242">Day 90</text>
      </g>

      {/* Y axis */}
      <g fontFamily="Geist, system-ui, sans-serif" fontSize="9" fill="var(--mkt-graphite)">
        <text x="0" y="54">High</text>
        <text x="0" y="224">Low</text>
      </g>

      {/* Engaged line — Sage deep, draws on scroll */}
      <ScrollDraw
        d="M 40 72 C 150 82, 250 102, 350 128 S 445 162, 470 175"
        stroke="var(--mkt-sage-deep)"
        strokeWidth={2.2}
        duration={1.1}
      />

      {/* Drift branch — Graphite, delayed */}
      <ScrollDraw
        d="M 290 118 C 350 140, 405 178, 455 218"
        stroke="var(--mkt-graphite)"
        strokeWidth={1.8}
        duration={0.85}
        delay={0.75}
      />

      {/* Churn marker */}
      <circle cx="455" cy="218" r="5" fill="var(--mkt-clay-deep)">
        <animate
          attributeName="opacity"
          from="0"
          to="1"
          begin="1.6s"
          dur="0.35s"
          fill="freeze"
        />
      </circle>

      {/* Labels — appear after their lines */}
      <text
        x="44"
        y="65"
        fontFamily="Geist, system-ui, sans-serif"
        fontSize="10"
        fontWeight="500"
        fill="var(--mkt-sage-deep)"
        opacity="0"
      >
        <animate attributeName="opacity" from="0" to="1" begin="0.9s" dur="0.3s" fill="freeze" />
        Engaged
      </text>
      <text
        x="360"
        y="186"
        fontFamily="Geist, system-ui, sans-serif"
        fontSize="10"
        fontWeight="500"
        fill="var(--mkt-graphite)"
        opacity="0"
      >
        <animate attributeName="opacity" from="0" to="1" begin="1.4s" dur="0.3s" fill="freeze" />
        Drifting
      </text>
      <text
        x="462"
        y="213"
        fontFamily="Geist, system-ui, sans-serif"
        fontSize="10"
        fontWeight="500"
        fill="var(--mkt-clay-deep)"
        opacity="0"
      >
        <animate attributeName="opacity" from="0" to="1" begin="1.7s" dur="0.3s" fill="freeze" />
        Churn
      </text>
    </svg>
  );
}
