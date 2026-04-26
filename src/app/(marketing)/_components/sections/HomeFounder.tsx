'use client';

import { FadeRise } from '../animation/MotionPrimitives';

/**
 * Founder credibility section — homepage.
 *
 * Human signal before the conversion CTA. One voice, one story.
 * Silhouette is a placeholder — replace with a real headshot at
 * public/founder.jpg and swap the <Silhouette /> for an <img> tag.
 *
 * TODO(sean): Replace Silhouette with real headshot + update sign block.
 */
export function HomeFounder() {
  return (
    <section className="mkt-v2-section mkt-v2-section--alt" id="founder">
      <div className="mkt-container mkt-v2-founder">
        <FadeRise as="span" className="mkt-eyebrow">
          Why we built this
        </FadeRise>

        <div className="mkt-v2-founder__row">
          <FadeRise className="mkt-v2-founder__avatar" delay={0.05}>
            <Silhouette />
          </FadeRise>

          <FadeRise className="mkt-v2-founder__body" delay={0.1}>
            <p className="mkt-v2-founder__lede">
              Adherix was built by a healthcare operator who saw the same pattern
              repeat across program after program.
            </p>
            <p>
              Organizations spent aggressively to acquire patients — intake
              workflows, coordinators, sign-up tracking. Then treatment began,
              and the visibility disappeared. Nobody was watching the signals
              that predict churn: replies slowing, doses spacing out, engagement
              fading.
            </p>
            <p>
              In GLP-1 programs, that gap has a number attached to it. Patients
              who drift in the first 90 days rarely come back. And no one on the
              care team noticed they were drifting until they were already gone.
            </p>
            <p>
              The fix isn&rsquo;t more staff. It&rsquo;s better signal, delivered
              at the right moment.
            </p>
            <p className="mkt-v2-founder__vision">
              The vision is simple: clinics should not lose patients because no
              one noticed they were drifting.
            </p>

            <div className="mkt-v2-founder__sign">
              <span className="mkt-v2-founder__name">Sean Johnson</span>
              <span className="mkt-v2-founder__role">Founder, Adherix Health</span>
            </div>
          </FadeRise>
        </div>
      </div>
    </section>
  );
}

function Silhouette() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      role="img"
      aria-label="Founder portrait placeholder"
      className="mkt-v2-founder__silhouette"
    >
      <defs>
        <linearGradient id="founder-grad-v2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--mkt-sage)"      stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--mkt-sage-deep)" stopOpacity="0.28" />
        </linearGradient>
      </defs>
      <circle cx="48" cy="48" r="46" fill="url(#founder-grad-v2)" />
      <circle cx="48" cy="38" r="14" fill="var(--mkt-paper)" opacity="0.9" />
      <path
        d="M 18 84 C 24 68, 36 60, 48 60 C 60 60, 72 68, 78 84 Z"
        fill="var(--mkt-paper)"
        opacity="0.9"
      />
    </svg>
  );
}
