'use client';

import Link from 'next/link';
import { FadeRise, TapButton } from '../animation/MotionPrimitives';

/**
 * Homepage Trust + CTA band — v2
 *
 * Dark Ink band. Headline + subhead + single CTA + stat row + trust strip.
 * Stats moved here from hero — gives them more weight, closer to the conversion action.
 * No founder note on homepage — that lives on /platform.
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
          Run a four-week behavioral pilot in your clinic. Bring your existing
          patient panel — we instrument retention, surface drift, and report on
          what changed. No commitment beyond the pilot window.
        </FadeRise>

        <FadeRise className="mkt-v2-trust__cta" delay={0.15}>
          <TapButton>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
              Book a demo
            </Link>
          </TapButton>
          <TapButton>
            <Link
              href="/platform"
              className="mkt-btn mkt-btn--ghost mkt-btn--ghost-on-dark mkt-btn--lg"
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
          <span>Currently in clinic validation</span>
        </FadeRise>
      </div>
    </section>
  );
}
