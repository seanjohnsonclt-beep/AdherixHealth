'use client';

import { FadeRise, ScrollDraw } from '../animation/MotionPrimitives';

/**
 * Section 2 — The drift problem.
 *
 * Headline frames retention loss as silent decay. SVG below renders a
 * two-line chart: Sage (engaged) trending down into Graphite (drifting),
 * then a Clay marker at the churn point. Both lines draw on scroll.
 *
 * No real data — illustrative. Don't put fake clinic numbers here.
 */
export function Drift() {
  return (
    <section className="mkt-r-section mkt-r-section--alt" id="drift">
      <div className="mkt-container">
        <div className="mkt-r-section__head">
          <FadeRise as="span" className="mkt-eyebrow">
            The problem
          </FadeRise>
          <FadeRise as="h2" className="mkt-h2">
            Retention dies between months 2 and 4. Without warning.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead" delay={0.1}>
            GLP-1 patients don&rsquo;t quit dramatically. They fade. Replies slow,
            logs stop, doses slip. By the time a coordinator notices, the
            patient is already one foot out the door.
          </FadeRise>
        </div>

        <FadeRise className="mkt-r-drift__chart-wrap">
          <DriftChart />
        </FadeRise>

        <div className="mkt-r-drift__caption">
          <FadeRise as="p" delay={0.05}>
            Operationally, no clinic has the bandwidth to monitor every
            patient&rsquo;s response cadence. The ones that drift quietly are the
            ones that leave.
          </FadeRise>
        </div>

        <FadeRise className="mkt-r-drift__pull">
          <div className="mkt-r-drift__pull-num">~35%</div>
          <div className="mkt-r-drift__pull-text">
            of GLP-1 patients churn within the first 90 days without active
            behavioral engagement.<sup>*</sup>
          </div>
          <div className="mkt-r-drift__pull-foot">
            *Modeled industry baseline. Validated against pilot data.
          </div>
        </FadeRise>
      </div>
    </section>
  );
}

function DriftChart() {
  // SVG viewBox: 800 wide, 280 tall. Chart area inset 40px.
  // Engaged line: smooth descent from (60, 80) to (740, 200) — Sage.
  // Drifting branch: from (~440, 150) drops to (~700, 240) — Graphite.
  // Churn marker: Clay dot at (700, 240).
  return (
    <svg
      viewBox="0 0 800 280"
      role="img"
      aria-label="Patient engagement decay chart over a 90-day period"
      className="mkt-r-drift__chart"
    >
      {/* Background grid */}
      <g stroke="var(--mkt-line)" strokeWidth="1" opacity="0.7">
        <line x1="40" y1="60" x2="760" y2="60" />
        <line x1="40" y1="120" x2="760" y2="120" />
        <line x1="40" y1="180" x2="760" y2="180" />
        <line x1="40" y1="240" x2="760" y2="240" />
      </g>

      {/* X axis labels */}
      <g
        fontFamily="Geist Mono, ui-monospace, monospace"
        fontSize="10"
        fill="var(--mkt-graphite)"
      >
        <text x="60" y="265">Day 0</text>
        <text x="240" y="265">Day 30</text>
        <text x="430" y="265">Day 60</text>
        <text x="620" y="265">Day 90</text>
      </g>

      {/* Y axis labels */}
      <g
        fontFamily="Geist, system-ui, sans-serif"
        fontSize="10"
        fill="var(--mkt-graphite)"
      >
        <text x="0" y="64">High</text>
        <text x="0" y="244">Low</text>
      </g>

      {/* Engaged line — Sage, draws first */}
      <ScrollDraw
        d="M 60 90 C 180 100, 280 110, 380 130 S 580 175, 740 200"
        stroke="var(--mkt-sage-deep)"
        strokeWidth={2.5}
        duration={1.0}
      />

      {/* Drifting branch — Graphite, draws second */}
      <ScrollDraw
        d="M 440 150 C 520 170, 600 200, 700 240"
        stroke="var(--mkt-graphite)"
        strokeWidth={2}
        duration={0.9}
        delay={0.6}
      />

      {/* Drift annotation */}
      <g opacity="0">
        <ScrollDraw
          d="M 440 150 L 440 150"
          stroke="transparent"
          duration={0}
          delay={1.2}
        />
      </g>

      {/* Churn marker — Clay dot, last */}
      <circle cx="700" cy="240" r="6" fill="var(--mkt-clay-deep)">
        <animate attributeName="opacity" from="0" to="1" begin="1.4s" dur="0.4s" fill="freeze" />
      </circle>
      <text
        x="708"
        y="234"
        fontFamily="Geist, system-ui, sans-serif"
        fontSize="11"
        fontWeight="500"
        fill="var(--mkt-clay-deep)"
        opacity="0"
      >
        <animate attributeName="opacity" from="0" to="1" begin="1.5s" dur="0.4s" fill="freeze" />
        Churn
      </text>

      {/* Engaged-line label */}
      <text
        x="64"
        y="84"
        fontFamily="Geist, system-ui, sans-serif"
        fontSize="11"
        fontWeight="500"
        fill="var(--mkt-sage-deep)"
        opacity="0"
      >
        <animate attributeName="opacity" from="0" to="1" begin="0.8s" dur="0.3s" fill="freeze" />
        Engaged
      </text>

      {/* Drift label */}
      <text
        x="500"
        y="190"
        fontFamily="Geist, system-ui, sans-serif"
        fontSize="11"
        fontWeight="500"
        fill="var(--mkt-graphite)"
        opacity="0"
      >
        <animate attributeName="opacity" from="0" to="1" begin="1.2s" dur="0.3s" fill="freeze" />
        Drifting
      </text>
    </svg>
  );
}
