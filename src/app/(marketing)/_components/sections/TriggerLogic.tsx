'use client';

import Link from 'next/link';
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

export function TriggerLogic() {
  return (
    <section className="mkt-v2-section mkt-v2-section--alt" id="triggers">
      <div className="mkt-container">
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

        <FadeRise>
          <div className="mkt-v2-dc-callout">
            <div className="mkt-v2-dc-callout__content">
              <span className="mkt-eyebrow" style={{ marginBottom: 8, display: 'block' }}>
                Drift Correction
              </span>
              <h3 className="mkt-h3" style={{ margin: '0 0 10px' }}>
                Beyond triggers — the loop that closes itself.
              </h3>
              <p style={{ margin: '0 0 24px', color: 'var(--mkt-ink-2)', fontSize: 15, lineHeight: 1.65 }}>
                When a patient drifts, the engine identifies the specific behavioral
                pattern — side effect, missed dose, withdrawal, plateau — sends a
                targeted correction, and tracks whether they come back. Auto-resolves
                on reply. Escalates to the clinic if they don&rsquo;t.
              </p>
              <Link href="/drift-correction" className="mkt-btn mkt-btn--primary mkt-btn--sm">
                See Drift Correction →
              </Link>
            </div>
          </div>
        </FadeRise>
      </div>
    </section>
  );
}
