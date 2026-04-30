'use client';

import { FadeRise, StaggerGroup } from '../animation/MotionPrimitives';

const triggers = [
  {
    key: 'no_response_48h',
    label: 'Drift detected',
    timing: '48 hours without reply',
    action:
      'Schedule a phase-appropriate nudge message automatically. No coordinator required.',
  },
  {
    key: 'no_response_5d',
    label: 'Escalation',
    timing: '5 days without reply',
    action:
      'Flag the patient and alert the clinic by email. One summary per clinic per tick — not a flood of individual alerts.',
  },
  {
    key: 'phase_auto_advance',
    label: 'Phase advance',
    timing: 'On phase duration completion',
    action:
      'Automatically move the patient to the next phase, reset the phase clock, and schedule the opening message set.',
  },
  {
    key: 'manual_flag',
    label: 'Manual override',
    timing: 'Coordinator-triggered at any time',
    action:
      'Flag any patient for human follow-up at any point in the journey. Auto-unflag when the patient replies.',
  },
];

const corrections = [
  {
    pattern: 'Side effect',
    signal: 'Patient texts a side-effect keyword',
    message:
      'Validates the experience, normalizes the adjustment period, provides a clear action (next dose date or reply CALL for clinic contact).',
    resolves: '24h',
  },
  {
    pattern: 'Missed dose',
    signal: 'Patient signals a missed or skipped dose',
    message:
      'No catch-up instruction. Confirms next scheduled dose, removes shame, keeps protocol intact.',
    resolves: '48h',
  },
  {
    pattern: 'Withdrawal',
    signal: '72h+ silence, inconsistent or declining trajectory',
    message:
      `Acknowledges that week-N is hard without naming the patient's specific struggle. Normalizes the pattern. Re-anchors to next dose.`,
    resolves: '72h',
  },
  {
    pattern: 'Plateau',
    signal: 'Phase 2–4, 48h+ silence, 21+ days in phase',
    message:
      'Reframes plateau as a recognized recalibration period. Directs to next dose as the only required action.',
    resolves: '72h',
  },
];

export function TriggerLogic() {
  return (
    <section className="mkt-v2-section mkt-v2-section--alt" id="triggers">
      <div className="mkt-container">

        {/* ── Trigger layer ─────────────────────────────────────────────── */}
        <div className="mkt-v2-section__head">
          <FadeRise as="span" className="mkt-eyebrow">
            Trigger logic
          </FadeRise>
          <FadeRise as="h2" className="mkt-h2" delay={0.05}>
            Trigger-driven, not schedule-driven.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead" delay={0.1}>
            Every trigger evaluates every 60 seconds, deduped per patient per day.
            Same trigger never fires twice in a single day for the same patient.
          </FadeRise>
        </div>

        <StaggerGroup className="mkt-v2-triggers" stagger={0.09} amount={0.2}>
          {triggers.map((t) => (
            <div key={t.key} className="mkt-v2-trigger">
              <div className="mkt-v2-trigger__head">
                <span className="mkt-v2-trigger__label">{t.label}</span>
                <code className="mkt-v2-trigger__key">{t.key}</code>
              </div>
              <div className="mkt-v2-trigger__timing">{t.timing}</div>
              <p className="mkt-v2-trigger__action">{t.action}</p>
            </div>
          ))}
        </StaggerGroup>

        {/* ── Drift correction layer ────────────────────────────────────── */}
        <div className="mkt-v2-section__head" style={{ marginTop: 80 }}>
          <FadeRise as="span" className="mkt-eyebrow">
            Drift correction
          </FadeRise>
          <FadeRise as="h2" className="mkt-h2" delay={0.05}>
            Beyond detection — closing the loop.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead" delay={0.1}>
            When a behavioral signal fires, the engine identifies the specific
            pattern and sends a targeted correction — not a generic nudge. Every
            correction is tracked. Patients who reply auto-resolve. Patients who
            don&rsquo;t are escalated to the clinic before they disappear.
          </FadeRise>
        </div>

        <StaggerGroup className="mkt-v2-triggers" stagger={0.09} amount={0.2}>
          {corrections.map((c) => (
            <div key={c.pattern} className="mkt-v2-trigger">
              <div className="mkt-v2-trigger__head">
                <span className="mkt-v2-trigger__label">{c.pattern}</span>
                <code className="mkt-v2-trigger__key">
                  escalates in {c.resolves}
                </code>
              </div>
              <div className="mkt-v2-trigger__timing">{c.signal}</div>
              <p className="mkt-v2-trigger__action">{c.message}</p>
            </div>
          ))}
        </StaggerGroup>

        {/* ── Resolution note ───────────────────────────────────────────── */}
        <FadeRise>
          <div className="mkt-v2-resolution-note">
            <div className="mkt-v2-resolution-note__row">
              <div className="mkt-v2-resolution-note__item">
                <span className="mkt-v2-resolution-note__icon mkt-v2-resolution-note__icon--green">✓</span>
                <div>
                  <strong>Patient replies</strong>
                  <p>Auto-resolved. Time-to-resolution logged. No clinic action needed.</p>
                </div>
              </div>
              <div className="mkt-v2-resolution-note__item">
                <span className="mkt-v2-resolution-note__icon mkt-v2-resolution-note__icon--amber">→</span>
                <div>
                  <strong>No response past threshold</strong>
                  <p>Patient flagged. Clinic alerted. One call, right patient, right moment.</p>
                </div>
              </div>
              <div className="mkt-v2-resolution-note__item">
                <span className="mkt-v2-resolution-note__icon mkt-v2-resolution-note__icon--red">!</span>
                <div>
                  <strong>Patient texts CALL or HELP</strong>
                  <p>Immediate escalation. Bypasses all time thresholds. Clinic notified now.</p>
                </div>
              </div>
            </div>
          </div>
        </FadeRise>

      </div>
    </section>
  );
}
