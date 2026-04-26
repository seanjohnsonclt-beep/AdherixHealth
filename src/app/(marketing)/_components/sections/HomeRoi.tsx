'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FadeRise } from '../animation/MotionPrimitives';

/**
 * Homepage ROI calculator — tier-button version.
 *
 * Clinic operators select their program tier from preset options.
 * No sliders — deliberate choices, no drag ambiguity. Outputs update
 * instantly. Fixed 35% / 18% assumptions so operators see their number
 * without any guesswork.
 */

const CHURN_RATE = 0.35;
const LIFT_PCT   = 0.18;
const MONTHS     = 12;

const PATIENT_TIERS = [
  { label: '25',   value: 25 },
  { label: '50',   value: 50 },
  { label: '100',  value: 100 },
  { label: '250',  value: 250 },
  { label: '500',  value: 500 },
  { label: '1,000+', value: 1000 },
];

const MONTHLY_TIERS = [
  { label: '$200', value: 200 },
  { label: '$400', value: 400 },
  { label: '$600', value: 600 },
  { label: '$900', value: 900 },
  { label: '$1,500', value: 1500 },
  { label: '$2,000', value: 2000 },
];

function fmt(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function HomeRoi() {
  const [patients, setPatients] = useState(100);
  const [monthly,  setMonthly]  = useState(600);

  const annualAtRisk = patients * monthly * CHURN_RATE * MONTHS;
  const protected_   = annualAtRisk * LIFT_PCT;

  return (
    <section className="mkt-v2-section" id="roi">
      <div className="mkt-container">
        <div className="mkt-v2-section__head">
          <FadeRise as="span" className="mkt-eyebrow">
            Run the numbers
          </FadeRise>
          <FadeRise as="h2" className="mkt-h2" delay={0.05}>
            How much revenue is drifting away from your clinic right now?
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead" delay={0.1}>
            Select your program size. See what&rsquo;s at risk and what Adherix
            protects — side by side.
          </FadeRise>
        </div>

        <FadeRise className="mkt-v2-roi" amount={0.2}>
          <div className="mkt-v2-roi__inputs">

            {/* Patients */}
            <div className="mkt-v2-roi__input-group">
              <div className="mkt-v2-roi__input-label">Active GLP-1 patients</div>
              <div className="mkt-v2-roi__tiers">
                {PATIENT_TIERS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`mkt-v2-roi__tier${patients === t.value ? ' is-active' : ''}`}
                    onClick={() => setPatients(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly value */}
            <div className="mkt-v2-roi__input-group">
              <div className="mkt-v2-roi__input-label">Monthly program value per patient</div>
              <div className="mkt-v2-roi__tiers">
                {MONTHLY_TIERS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`mkt-v2-roi__tier${monthly === t.value ? ' is-active' : ''}`}
                    onClick={() => setMonthly(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Live outputs */}
          <div className="mkt-v2-roi__outputs">
            <div className="mkt-v2-roi__out mkt-v2-roi__out--risk">
              <div className="mkt-v2-roi__out-label">Annual revenue at risk</div>
              <div className="mkt-v2-roi__out-num">{fmt(annualAtRisk)}</div>
              <div className="mkt-v2-roi__out-sub">
                if churn continues at the {Math.round(CHURN_RATE * 100)}% baseline
              </div>
            </div>

            <div className="mkt-v2-roi__divider" aria-hidden="true">&rarr;</div>

            <div className="mkt-v2-roi__out mkt-v2-roi__out--protect">
              <div className="mkt-v2-roi__out-label">Protected with Adherix</div>
              <div className="mkt-v2-roi__out-num">
                {fmt(protected_)}
                <span className="mkt-v2-roi__out-yr">/yr</span>
              </div>
              <div className="mkt-v2-roi__out-sub">
                modeled at {Math.round(LIFT_PCT * 100)}% retention improvement
              </div>
            </div>
          </div>

          <div className="mkt-v2-roi__footer">
            <p className="mkt-v2-roi__disclaimer">
              Modeled estimates — 35% industry-baseline churn, 18% retention lift.
              Pilots validate against your actual program data.
            </p>
            <Link href="/roi" className="mkt-v2-roi__more">
              Full calculator with custom assumptions &rarr;
            </Link>
          </div>
        </FadeRise>
      </div>
    </section>
  );
}
