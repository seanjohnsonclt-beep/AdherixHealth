'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FadeRise } from '../animation/MotionPrimitives';

/**
 * Homepage mini ROI calculator — v2
 *
 * Two inputs (active patients, monthly program value), two live outputs
 * (annual revenue at risk, protected with Adherix). Fixed assumptions so
 * clinic operators see their number immediately without guesswork.
 *
 * Full calculator with custom churn/lift assumptions lives at /roi.
 */

const CHURN_RATE = 0.35;   // 35% industry-baseline churn
const LIFT_PCT   = 0.18;   // 18% modeled retention improvement
const MONTHS     = 12;

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
            Adjust for your program size. See the leakage and what Adherix
            protects, side by side.
          </FadeRise>
        </div>

        <FadeRise className="mkt-v2-roi" amount={0.2}>
          <div className="mkt-v2-roi__inputs">
            {/* Patients slider */}
            <div className="mkt-v2-roi__input-group">
              <div className="mkt-v2-roi__input-head">
                <label className="mkt-v2-roi__label" htmlFor="roi-patients">
                  Active GLP-1 patients
                </label>
                <span className="mkt-v2-roi__val">{patients.toLocaleString('en-US')}</span>
              </div>
              <input
                id="roi-patients"
                type="range"
                className="mkt-v2-roi__slider"
                min={20}
                max={1000}
                step={10}
                value={patients}
                onChange={(e) => setPatients(Number(e.target.value))}
              />
              <div className="mkt-v2-roi__ticks" aria-hidden="true">
                <span>20</span>
                <span>500</span>
                <span>1,000</span>
              </div>
            </div>

            {/* Monthly value slider */}
            <div className="mkt-v2-roi__input-group">
              <div className="mkt-v2-roi__input-head">
                <label className="mkt-v2-roi__label" htmlFor="roi-monthly">
                  Monthly program value per patient
                </label>
                <span className="mkt-v2-roi__val">${monthly.toLocaleString('en-US')}</span>
              </div>
              <input
                id="roi-monthly"
                type="range"
                className="mkt-v2-roi__slider"
                min={200}
                max={2000}
                step={50}
                value={monthly}
                onChange={(e) => setMonthly(Number(e.target.value))}
              />
              <div className="mkt-v2-roi__ticks" aria-hidden="true">
                <span>$200</span>
                <span>$1,000</span>
                <span>$2,000</span>
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
