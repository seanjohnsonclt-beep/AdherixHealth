'use client';

import { FadeRise } from '../animation/MotionPrimitives';

/**
 * HomeConsequence — hard-stop dark panel between Problem and Pillars.
 *
 * No calculator. No interactivity. Just the cost of inaction stated plainly.
 * Forces the reader to compute their own exposure before hearing the solution.
 */
export function HomeConsequence() {
  return (
    <section className="mkt-v2-section mkt-v2-section--ink" id="consequence">
      <div className="mkt-container mkt-v2-consequence">
        <FadeRise className="mkt-v2-consequence__number">
          $252,000
        </FadeRise>
        <FadeRise as="p" className="mkt-v2-consequence__body" delay={0.08}>
          That&rsquo;s the annual revenue walking out the door at a 100-patient
          GLP-1 program — at the industry baseline churn rate. Most of it
          happens silently, between check-ins, before anyone notices a pattern.
        </FadeRise>
        <FadeRise className="mkt-v2-consequence__facts" delay={0.14}>
          <div className="mkt-v2-consequence__fact">
            <span className="mkt-v2-consequence__fact-n">35%</span>
            <span className="mkt-v2-consequence__fact-l">of GLP-1 patients churn within 90 days without active behavioral engagement</span>
          </div>
          <div className="mkt-v2-consequence__fact">
            <span className="mkt-v2-consequence__fact-n">72 hrs</span>
            <span className="mkt-v2-consequence__fact-l">median silence window before a drifting patient becomes a churned one</span>
          </div>
          <div className="mkt-v2-consequence__fact">
            <span className="mkt-v2-consequence__fact-n">0</span>
            <span className="mkt-v2-consequence__fact-l">clinic staff hours required to intervene — when the engine catches it first</span>
          </div>
        </FadeRise>
      </div>
    </section>
  );
}
