import type { Metadata } from 'next';
import { PilotForm } from '../_components/PilotForm';

export const metadata: Metadata = {
  title: 'Request a demo — Adherix Health',
  description:
    'See how Adherix catches drifting GLP-1 patients before they drop off. A working walk-through of the platform, not a slide deck.',
};

export default function PilotPage() {
  return (
    <>
      <section className="mkt-section">
        <div className="mkt-container mkt-container--narrow">
          <div className="mkt-eyebrow">Request a demo</div>
          <h1 className="mkt-h1">
            See Adherix running on a realistic patient panel.
          </h1>
          <p className="mkt-lede">
            A working walk-through, not a slide deck. We show you the dashboard,
            the drift alerts, the recovery ledger, and the exact math behind
            revenue protected. Then we scope what a pilot would look like for
            your program — on your data, not ours.
          </p>

          <div className="mkt-pilot-grid">
            <div className="mkt-pilot-grid__form">
              <PilotForm />
            </div>

            <aside className="mkt-pilot-grid__aside">
              <h3 className="mkt-aside-h">What to expect</h3>
              <ol className="mkt-steps-list">
                <li>
                  <strong>Intro call (30 min).</strong> We walk through the live
                  platform on a realistic patient panel and answer program-fit
                  questions.
                </li>
                <li>
                  <strong>Scope session (30 min).</strong> If it's a fit, we
                  sketch what a pilot would look like for your clinic — cohort
                  size, success metrics, timeline.
                </li>
                <li>
                  <strong>Pilot setup (1&ndash;2 weeks).</strong> We enroll a
                  cohort &mdash; typically 100&ndash;500 active patients &mdash;
                  and configure phases, triggers, and messaging to your program.
                </li>
                <li>
                  <strong>Run &amp; measure (8&ndash;12 weeks).</strong>
                  Retention, drift events, and revenue protected are reported
                  weekly against your baseline. Expand, adjust, or walk away with
                  the data &mdash; your call.
                </li>
              </ol>

              <div className="mkt-aside-note">
                <div className="mkt-aside-note__title">Questions first?</div>
                <div className="mkt-aside-note__body">
                  Email{' '}
                  <a href="mailto:demos@adherix.health">demos@adherix.health</a>{' '}
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
