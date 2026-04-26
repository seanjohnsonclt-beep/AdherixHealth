'use client';

import Link from 'next/link';
import { FadeRise, TapButton } from '../animation/MotionPrimitives';

/**
 * Section 7 — Pilot CTA band.
 *
 * Dark Ink band with a calm, declarative invitation. One primary CTA + one
 * ghost secondary. Trust strip below acknowledges where Adherix is in its
 * lifecycle (validation, not deployed at scale).
 */
export function PilotBand() {
  return (
    <section className="mkt-r-section mkt-r-section--ink" id="pilot-cta">
      <div className="mkt-container mkt-r-pilot">
        <FadeRise as="span" className="mkt-eyebrow mkt-r-pilot__eyebrow">
          Pilot Adherix
        </FadeRise>
        <FadeRise as="h2" className="mkt-h2 mkt-r-pilot__title">
          Run a four-week behavioral pilot in your clinic.
        </FadeRise>
        <FadeRise as="p" className="mkt-subhead mkt-r-pilot__sub" delay={0.05}>
          Bring your existing patient panel. We instrument retention, surface
          drift, and report on what changed. No commitment beyond the pilot
          window.
        </FadeRise>

        <FadeRise className="mkt-r-pilot__cta" delay={0.1}>
          <TapButton>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
              Request a demo
            </Link>
          </TapButton>
          <TapButton>
            <Link href="#platform" className="mkt-btn mkt-btn--ghost mkt-btn--ghost-on-dark mkt-btn--lg">
              Revisit the platform
            </Link>
          </TapButton>
        </FadeRise>

        <FadeRise className="mkt-r-pilot__strip" delay={0.18}>
          <span>Built on Twilio &amp; Supabase</span>
          <span aria-hidden>·</span>
          <span>HIPAA-aware architecture</span>
          <span aria-hidden>·</span>
          <span>Currently in clinic validation</span>
        </FadeRise>
      </div>
    </section>
  );
}
