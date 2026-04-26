'use client';

import { FadeRise, StaggerGroup } from '../animation/MotionPrimitives';

/**
 * Section 3 — Why SMS alone isn't enough.
 *
 * The positioning split: generic SMS reminder app vs. behavioral SMS engine.
 * Resolves the apparent contradiction (Adherix is SMS-first) with a footer
 * line: "Built on the same SMS rails. Different engine."
 */

const dumbSms = [
  'Same message every day on the same schedule',
  'No phase awareness — week 1 looks like week 12',
  'Treats every reply (or non-reply) the same',
  'No clinic routing when a human needs to step in',
  'Engagement metric is "did the message send"',
];

const adherix = [
  'Six-phase progression: Initiation → Onboarding → Activation → Momentum → Plateau → Maintenance',
  'Trigger-driven outreach: drift detection, plateau, manual flag',
  'Reply-gated advancement \u2014 won\u2019t move on until the patient confirms',
  'Behavioral event log feeds analytics and clinic routing',
  'Engagement metric is \u201Cdid the patient stay enrolled\u201D',
];

export function SmsAlone() {
  return (
    <section className="mkt-r-section" id="sms-alone">
      <div className="mkt-container">
        <div className="mkt-r-section__head">
          <FadeRise as="span" className="mkt-eyebrow">
            Why SMS alone isn&rsquo;t enough
          </FadeRise>
          <FadeRise as="h2" className="mkt-h2">
            SMS reminders aren&rsquo;t engagement. Behavior is.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead" delay={0.1}>
            Generic reminder apps blast messages on a schedule and call it a
            retention strategy. Adherix reads what the patient does — and
            doesn&rsquo;t — and responds accordingly.
          </FadeRise>
        </div>

        <div className="mkt-r-sms__split">
          <FadeRise className="mkt-r-sms__col mkt-r-sms__col--dumb">
            <div className="mkt-r-sms__col-head">
              <span className="mkt-r-sms__tag mkt-r-sms__tag--dumb">Generic SMS reminder app</span>
              <h3 className="mkt-h3">Schedule, not behavior</h3>
            </div>
            <StaggerGroup as="ul" className="mkt-r-sms__list" stagger={0.06}>
              {dumbSms.map((item) => (
                <li key={item} className="mkt-r-sms__item mkt-r-sms__item--dumb">
                  <DashIcon />
                  <span>{item}</span>
                </li>
              ))}
            </StaggerGroup>
          </FadeRise>

          <FadeRise className="mkt-r-sms__col mkt-r-sms__col--smart" delay={0.1}>
            <div className="mkt-r-sms__col-head">
              <span className="mkt-r-sms__tag mkt-r-sms__tag--smart">Adherix behavioral engine</span>
              <h3 className="mkt-h3">Phase-aware, trigger-driven, clinic-routed</h3>
            </div>
            <StaggerGroup as="ul" className="mkt-r-sms__list" stagger={0.06} initialDelay={0.05}>
              {adherix.map((item) => (
                <li key={item} className="mkt-r-sms__item mkt-r-sms__item--smart">
                  <CheckIcon />
                  <span>{item}</span>
                </li>
              ))}
            </StaggerGroup>
          </FadeRise>
        </div>

        <FadeRise className="mkt-r-sms__foot">
          <p>Built on the same SMS rails. Different engine.</p>
        </FadeRise>
      </div>
    </section>
  );
}

function DashIcon() {
  return (
    <svg
      className="mkt-r-sms__dash"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="mkt-r-sms__check"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
