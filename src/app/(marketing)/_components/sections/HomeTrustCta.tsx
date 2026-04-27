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
  { n: '18%', label: 'fewer early drop-offs*' },
  { n: '$714', label: 'protected revenue per patient*' },
  { n: '8 hrs/wk', label: 'staff time recovered*' },
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

        <FadeRise as="p" className="mkt-v2-trust__disclaimer" delay={0.26}>
          *Modeled estimates against a $600/month program at industry-baseline churn. Pilots
          validate against your actual program data.
        </FadeRise>

        <FadeRise className="mkt-v2-trust__strip" delay={0.3}>
          <span>Built on Twilio &amp; Supabase</span>
          <span aria-hidden="true">·</span>
          <span>HIPAA-aware architecture</span>
          <span aria-hidden="true">·</span>
          <span>Accepting early clinic partnerships</span>
        </FadeRise>
      </div>
    </section>
  );
}
