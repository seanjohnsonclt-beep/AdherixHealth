'use client';

import Image from 'next/image';
import { FadeRise } from '../animation/MotionPrimitives';

/**
 * Founder credibility section — homepage.
 *
 * Human signal before the conversion CTA. One voice, one story.
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
            <Image
              src="/founder.png"
              alt="Sean Johnson, Founder of Adherix Health"
              width={96}
              height={96}
              className="mkt-v2-founder__photo"
              priority
            />
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
