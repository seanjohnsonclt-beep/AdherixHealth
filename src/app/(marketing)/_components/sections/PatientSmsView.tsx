'use client';

import { FadeRise } from '../animation/MotionPrimitives';

/**
 * Patient SMS view — iPhone mockup showing the patient-side experience.
 *
 * Placed after the phase timeline on /platform to humanize the system:
 * "here's what the engine actually looks like from the patient's phone."
 * Illustrative messages, not real patient data.
 */

export function PatientSmsView() {
  return (
    <section className="mkt-v2-section mkt-v2-section--alt" id="patient-view">
      <div className="mkt-container mkt-v2-sms-view">

        <FadeRise className="mkt-v2-sms-view__copy">
          <span className="mkt-eyebrow">The patient experience</span>
          <h2 className="mkt-h2">What arrives on the patient&rsquo;s phone</h2>
          <p className="mkt-subhead">
            Short, direct, timed to their phase. Not a blast — a behavioral cue
            that arrives when the patient needs it, with a simple reply gate
            before anything advances.
          </p>
          <ul className="mkt-v2-sms-view__points">
            <li>Sent at the patient&rsquo;s local time, not server time</li>
            <li>Waits for a reply before moving to the next step</li>
            <li>Flags the clinic when a patient goes quiet</li>
          </ul>
        </FadeRise>

        <FadeRise className="mkt-v2-sms-view__phone" delay={0.12}>
          <IPhoneMockup />
        </FadeRise>

      </div>
    </section>
  );
}

function IPhoneMockup() {
  return (
    <div className="mkt-iphone">
      <div className="mkt-iphone__frame">
        {/* Dynamic Island */}
        <div className="mkt-iphone__island" />

        {/* Status bar */}
        <div className="mkt-iphone__status">
          <span className="mkt-iphone__time">9:41</span>
          <span className="mkt-iphone__status-icons">
            {/* Signal */}
            <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden="true">
              <rect x="0" y="8" width="3" height="4" rx="0.6" opacity="0.35"/>
              <rect x="4.7" y="5" width="3" height="7" rx="0.6" opacity="0.35"/>
              <rect x="9.4" y="2" width="3" height="10" rx="0.6"/>
              <rect x="14.1" y="0" width="3" height="12" rx="0.6"/>
            </svg>
            {/* WiFi */}
            <svg width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden="true">
              <path d="M7.5 10a1 1 0 110-2 1 1 0 010 2z" fill="currentColor"/>
              <path d="M5.1 7.8C5.9 6.9 6.7 6.4 7.5 6.4s1.6.5 2.4 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
              <path d="M2.8 5.5C4.2 3.9 5.8 3 7.5 3s3.3.9 4.7 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            </svg>
            {/* Battery */}
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35"/>
              <rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.4"/>
              <rect x="2" y="2" width="14" height="8" rx="2" fill="currentColor"/>
            </svg>
          </span>
        </div>

        {/* Chat header */}
        <div className="mkt-iphone__header">
          <div className="mkt-iphone__avatar">A</div>
          <div>
            <div className="mkt-iphone__contact">Adherix Health</div>
            <div className="mkt-iphone__contact-sub">text message</div>
          </div>
        </div>

        {/* Message thread */}
        <div className="mkt-iphone__thread">
          <div className="mkt-iphone__thread-date">Today 9:41 AM</div>

          <div className="mkt-iphone__bubble mkt-iphone__bubble--in">
            Hi Marcus &mdash; Day 3 of your program. How did your first injection
            go? Reply <strong>YES</strong> if you&rsquo;re on track.
          </div>

          <div className="mkt-iphone__bubble mkt-iphone__bubble--out">
            YES
          </div>

          <div className="mkt-iphone__bubble mkt-iphone__bubble--in">
            Great. Your next dose window opens in 6 days. We&rsquo;ll check in
            then &mdash; keep it up.
          </div>

          <div className="mkt-iphone__delivered">Delivered</div>
        </div>

        {/* Input bar */}
        <div className="mkt-iphone__bar">
          <div className="mkt-iphone__field">iMessage</div>
        </div>

        {/* Home indicator */}
        <div className="mkt-iphone__indicator" />
      </div>
    </div>
  );
}
