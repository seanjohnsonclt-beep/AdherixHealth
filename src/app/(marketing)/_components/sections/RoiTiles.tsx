'use client';

import Link from 'next/link';
import { CountUp, FadeRise, StaggerGroup, TapButton } from '../animation/MotionPrimitives';

/**
 * Section 5 — Clinic operations & ROI.
 *
 * Three big stat tiles. Numbers are modeled, grounded in metrics.ts:
 *   - 18% fewer early drop-offs
 *   - ~$714 protected revenue per patient ( $600/mo × 35% baseline churn × 3.4 mo)
 *   - 8 hrs/wk staff time recovered
 *
 * Tiles are followed by a one-line formula explainer and a CTA to /roi for the
 * full calculator. Modeled disclaimer is mandatory and non-removable.
 */

const tiles = [
  {
    big: 18,
    unit: '%',
    label: 'fewer early drop-offs',
    sub: 'Patients lost in the first 90 days who would have churned silently.',
  },
  {
    big: 714,
    prefix: '$',
    label: 'protected revenue per patient',
    sub: '$600 monthly program × 35% baseline churn × 3.4 months recovered.',
  },
  {
    big: 8,
    unit: ' hrs/wk',
    label: 'staff time recovered',
    sub: 'No more chasing patients who went quiet. The engine routes who needs a human.',
  },
];

export function RoiTiles() {
  return (
    <section className="mkt-r-section mkt-r-section--alt" id="roi">
      <div className="mkt-container">
        <div className="mkt-r-section__head">
          <FadeRise as="span" className="mkt-eyebrow">
            Clinic operations
          </FadeRise>
          <FadeRise as="h2" className="mkt-h2">
            Retention is revenue. The math is unromantic.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead" delay={0.1}>
            Every patient who drops off in month two is a refill, a follow-up,
            and a referral that never happened. Adherix protects that
            cashflow without adding headcount.
          </FadeRise>
        </div>

        <StaggerGroup className="mkt-r-roi__grid" stagger={0.1} amount={0.25}>
          {tiles.map((tile) => (
            <article key={tile.label} className="mkt-r-roi__tile">
              <div className="mkt-r-roi__big">
                {tile.prefix ?? ''}
                <CountUp to={tile.big} />
                {tile.unit ? <span className="mkt-r-roi__unit">{tile.unit}</span> : null}
              </div>
              <div className="mkt-r-roi__label">{tile.label}</div>
              <div className="mkt-r-roi__sub">{tile.sub}</div>
            </article>
          ))}
        </StaggerGroup>

        <FadeRise className="mkt-r-roi__cta">
          <p className="mkt-r-roi__formula">
            Run your own numbers — program price, panel size, baseline churn —
            and see the protected revenue line for yourself.
          </p>
          <TapButton>
            <Link href="/roi" className="mkt-btn mkt-btn--primary">
              Open the ROI calculator
            </Link>
          </TapButton>
        </FadeRise>

        <p className="mkt-r-roi__disclaimer">
          Modeled estimates against a $600/month program at industry-baseline
          churn. Pilots validate against your actual program data.
        </p>
      </div>
    </section>
  );
}
