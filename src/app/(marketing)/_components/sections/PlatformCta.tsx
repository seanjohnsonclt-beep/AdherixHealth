'use client';

import Link from 'next/link';
import { FadeRise, TapButton } from '../animation/MotionPrimitives';

/**
 * Platform page closing CTA.
 * Brief — the user has already read the depth. Now give them the next step.
 */
export function PlatformCta() {
  return (
    <section className="mkt-v2-section mkt-v2-section--ink" id="platform-cta">
      <div className="mkt-container mkt-v2-trust">
        <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">
          See it in action
        </FadeRise>
        <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
          A working walk-through of Adherix against your patient panel. Not a
          slide deck.
        </FadeRise>
        <FadeRise className="mkt-v2-trust__cta" delay={0.15}>
          <TapButton>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
              Book a demo
            </Link>
          </TapButton>
          <TapButton>
            <Link
              href="/roi"
              className="mkt-btn mkt-btn--ghost mkt-btn--ghost-on-dark mkt-btn--lg"
            >
              ROI calculator
            </Link>
          </TapButton>
        </FadeRise>
      </div>
    </section>
  );
}
