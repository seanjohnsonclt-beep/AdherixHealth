'use client';

import Link from 'next/link';
import { FadeRise, TapButton } from '../animation/MotionPrimitives';
import { HomeInlineCapture } from '../HomeInlineCapture';

/**
 * Homepage Trust + CTA band — v2
 *
 * Dark Ink band. Headline → subhead → inline capture form (Formspree) → stats → trust strip.
 * When NEXT_PUBLIC_FORMSPREE_CAPTURE_ID is not set, HomeInlineCapture renders null
 * and the fallback "Book a demo" → /pilot link is shown instead.
 */

const stats = [
  { n: '60 sec', label: 'Engine checks every patient, every minute' },
  { n: '5 phases', label: 'Structured from first dose through maintenance' },
  { n: 'SMS-first', label: 'Patients respond to texts — not apps' },
];

export function HomeTrustCta() {
  return (
    <section className="mkt-v2-section mkt-v2-section--ink" id="cta">
      <div className="mkt-container mkt-v2-trust">
        <FadeRise as="h2" className="mkt-h2 mkt-v2-trust__title">
          Keep more patients.
          <br />
          Grow smarter.
        </FadeRise>

        <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
          Run a three-month behavioral pilot in your clinic. Bring your existing
          patient panel — we instrument retention, surface drift, and report on
          what changed. No commitment beyond the pilot window.
        </FadeRise>

        {/* Inline capture form — renders when FORMSPREE_CAPTURE_ID is set */}
        <FadeRise delay={0.13}>
          <HomeInlineCapture />
        </FadeRise>

        {/* Secondary nav link — visible below the form */}
        <FadeRise className="mkt-v2-trust__secondary-cta" delay={0.15}>
          <TapButton>
            <Link
              href="/platform"
              className="mkt-btn mkt-btn--ghost mkt-btn--ghost-on-dark"
            >
              See the platform
            </Link>
          </TapButton>
        </FadeRise>

        <FadeRise className="mkt-v2-trust__stats" delay={0.22}>
          {stats.map((s) => (
            <div key={s.n} className="mkt-v2-trust__stat">
              <div className="mkt-v2-trust__stat-n">{s.n}</div>
              <div className="mkt-v2-trust__stat-l">{s.label}</div>
            </div>
          ))}
        </FadeRise>


</div>
    </section>
  );
}
