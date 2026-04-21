import type { Metadata } from 'next';
import { PilotForm } from '../_components/PilotForm';

export const metadata: Metadata = {
  title: 'Request a pilot — Adherix Health',
  description:
    'See how Adherix catches drifting GLP-1 patients before they drop off. Scoped pilots in weeks, not quarters.',
};

export default function PilotPage() {
  return (
    <>
      <section className="mkt-section">
        <div className="mkt-container mkt-container--narrow">
          <div className="mkt-eyebrow">Request a pilot</div>
          <h1 className="mkt-h1">
            Run a scoped pilot on your own patient panel.
          </h1>
          <p className="mkt-lede">
            Pilots are tailored to your program. We work with a slice of your
            active GLP-1 patients for a defined window, measure retention lift
            against your baseline, and share the raw numbers. No platform
            rebuild, no data-warehouse project, no six-month deployment.
          </p>

          <div className="mkt-pilot-grid">
            <div className="mkt-pilot-grid__form">
              <PilotForm />
            </div>

            <aside className="mkt-pilot-grid__aside">
              <h3 className="mkt-aside-h">What to expect</h3>
              <ol className="mkt-steps-list">
                <li>
                  <strong>Discovery call (30 min).</strong> We walk your current
                  retention workflow and agree on pilot scope &amp; success
                  metrics.
                </li>
                <li>
                  <strong>Scoped setup (1&ndash;2 weeks).</strong> We enroll a
                  patient cohort &mdash; typically 100&ndash;500 active patients
                  &mdash; and configure phases, triggers, and messaging to your
                  program.
                </li>
                <li>
                  <strong>Run &amp; measure (8&ndash;12 weeks).</strong>
                  Retention, drift events, and revenue protected are reported
                  weekly against your baseline.
                </li>
                <li>
                  <strong>Decision point.</strong> Expand, adjust, or walk away
                  with the data &mdash; your call.
                </li>
              </ol>

              <div className="mkt-aside-note">
                <div className="mkt-aside-note__title">Questions first?</div>
                <div className="mkt-aside-note__body">
                  Email{' '}
                  <a href="mailto:pilots@adherix.health">pilots@adherix.health</a>{' '}
                  &mdash; we keep the back-and-forth short and human.
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
