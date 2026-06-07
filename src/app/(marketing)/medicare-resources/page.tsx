import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Medicare GLP-1 Bridge Resources | Adherix Health',
  description:
    'The Medicare GLP-1 Bridge starts July 1, 2026. Adherix Health helps clinics navigate prior authorization, documentation requirements, and patient onboarding - then keeps those patients on treatment.',
};

export default function MedicareResourcesPage() {
  return (
    <div className="med-page">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="med-hero">
        <div className="mkt-container med-hero__inner">
          <span className="mkt-eyebrow">Medicare resources</span>
          <h1 className="mkt-h1 med-hero__title">
            The Medicare GLP-1 Bridge<br />starts July 1.
          </h1>
          <p className="mkt-subhead med-hero__sub">
            Eligible Medicare beneficiaries can now access Wegovy, Zepbound, and Foundayo
            for $50/month. That means more patients at your door - and a prior authorization
            process your clinic may not be set up for yet.
          </p>
          <p className="med-hero__sub2">
            Adherix helps clinics navigate Bridge enrollment and keeps those patients on
            treatment once access is granted.
          </p>
          <div className="med-hero__ctas">
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
              Book a workflow review
            </Link>
            <a
              href="https://www.cms.gov/glp-1-bridge.pdf"
              className="mkt-btn mkt-btn--ghost mkt-btn--lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              CMS provider info
            </a>
          </div>
        </div>
      </section>

      {/* ── What the Bridge requires ──────────────────────────── */}
      <section className="mkt-section med-section">
        <div className="mkt-container">
          <span className="mkt-eyebrow">How the program works</span>
          <h2 className="mkt-h2 med-section__title">
            What providers need to know
          </h2>
          <p className="mkt-subhead med-section__sub">
            The Bridge operates outside the standard Part D benefit. Providers submit
            prior authorization through a new central processor - not the patient&rsquo;s
            existing plan. Here is what that means operationally.
          </p>
          <div className="med-req-grid">
            <div className="med-req-card">
              <div className="med-req-card__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <rect x="3" y="2" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M7 8h8M7 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Prior authorization</h3>
              <p>
                PAs are submitted to a single central processor - not the patient&rsquo;s
                Part D plan. CMS accepts requests electronically or by fax. The PA form
                is being released June 2026.
              </p>
            </div>
            <div className="med-req-card">
              <div className="med-req-card__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/>
                  <path d="M4 19c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Patient eligibility</h3>
              <p>
                Patients must be enrolled in Medicare Part D (PDP or MA-PD). They must
                meet BMI thresholds and have at least one qualifying condition: heart
                failure, hypertension, CKD, pre-diabetes, or cardiovascular history.
              </p>
            </div>
            <div className="med-req-card">
              <div className="med-req-card__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 3v16M3 11h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Provider attestation</h3>
              <p>
                The PA must attest that the drug is prescribed for weight reduction in
                combination with ongoing lifestyle modification - structured nutrition and
                physical activity per FDA labeling.
              </p>
            </div>
            <div className="med-req-card">
              <div className="med-req-card__icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4 6h14M4 10h10M4 14h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Covered medications</h3>
              <p>
                Wegovy (injection and tablets), Zepbound KwikPen, and Foundayo are
                covered under the Bridge for weight management. $50 copay per month.
                Does not count toward Part D out-of-pocket limits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Adherix Bridge Support ────────────────────────────── */}
      <section className="mkt-section mkt-section--alt med-section">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Adherix bridge support</span>
          <h2 className="mkt-h2 med-section__title">
            We help clinics operationalize the Bridge
          </h2>
          <p className="mkt-subhead med-section__sub">
            Navigating a new federal program on top of an already full patient panel is a
            real operational lift. Adherix works alongside your team to make sure Bridge
            patients get enrolled and onboarded without adding staff overhead.
          </p>
          <div className="med-support-grid">
            <div className="med-support-item">
              <span className="med-support-item__num">01</span>
              <div>
                <h3>PA documentation review</h3>
                <p>
                  We walk through your documentation workflow and identify gaps before
                  the July 1 launch - so your first PA submissions go through cleanly.
                </p>
              </div>
            </div>
            <div className="med-support-item">
              <span className="med-support-item__num">02</span>
              <div>
                <h3>Patient eligibility screening</h3>
                <p>
                  We help you identify which patients in your panel likely qualify for
                  the Bridge so you can prioritize outreach before demand surges.
                </p>
              </div>
            </div>
            <div className="med-support-item">
              <span className="med-support-item__num">03</span>
              <div>
                <h3>Onboarding workflow setup</h3>
                <p>
                  We map the patient journey from eligibility confirmation to first
                  prescription - so your front desk and clinical staff know exactly what
                  happens when.
                </p>
              </div>
            </div>
            <div className="med-support-item">
              <span className="med-support-item__num">04</span>
              <div>
                <h3>Staff readiness checklist</h3>
                <p>
                  A practical checklist your team can run through before July 1 -
                  covering PA submission, patient communication, and documentation filing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Once enrolled - Adherix Keep ─────────────────────── */}
      <section className="mkt-section med-section med-keep-section">
        <div className="mkt-container med-keep-inner">
          <div className="med-keep-copy">
            <span className="mkt-eyebrow">Adherix Keep</span>
            <h2 className="mkt-h2">
              Getting patients enrolled is step one.
              Keeping them on treatment is where the work begins.
            </h2>
            <p className="mkt-subhead">
              GLP-1 dropout rates are highest in the first 90 days - before patients see
              meaningful results and while side effects are most disruptive. The Bridge
              gets your patients access. Adherix Keep makes sure they actually use it.
            </p>
            <ul className="med-keep-list">
              <li>Phase-based SMS engagement from day one</li>
              <li>Automated drift detection when patients go silent</li>
              <li>Side effect check-ins timed to dose escalation windows</li>
              <li>Injection confirmation tracking for real adherence data</li>
              <li>Clinic alerts when patients need a human touchpoint</li>
            </ul>
            <Link href="/platform" className="mkt-btn mkt-btn--primary">
              See how Keep works
            </Link>
          </div>
          <div className="med-keep-stat-panel">
            <div className="med-keep-stat">
              <span className="med-keep-stat__num">90</span>
              <span className="med-keep-stat__label">days - the highest-risk window for GLP-1 dropout</span>
            </div>
            <div className="med-keep-stat">
              <span className="med-keep-stat__num">50%</span>
              <span className="med-keep-stat__label">of patients discontinue within the first year without structured support*</span>
            </div>
            <div className="med-keep-stat">
              <span className="med-keep-stat__num">8 hrs</span>
              <span className="med-keep-stat__label">of staff time saved per week through automated outreach*</span>
            </div>
            <p className="med-keep-stat-disc">* Modeled estimates based on published GLP-1 adherence data.</p>
          </div>
        </div>
      </section>

      {/* ── Resources ─────────────────────────────────────────── */}
      <section className="mkt-section mkt-section--alt med-section">
        <div className="mkt-container">
          <span className="mkt-eyebrow">Downloads &amp; resources</span>
          <h2 className="mkt-h2 med-section__title">Provider resources</h2>
          <p className="mkt-subhead med-section__sub">
            Official CMS materials and Adherix support documents for Bridge-eligible clinics.
          </p>
          {/* CMS official - plain rows */}
          <p className="med-resource-group-label">Official CMS documents</p>
          <div className="med-resource-list">
            <a className="med-resource-row" href="https://www.cms.gov/glp-1-bridge.pdf" target="_blank" rel="noopener noreferrer">
              <div className="med-resource-row__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2.5" y="1.5" width="13" height="15" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M5.5 6.5h7M5.5 9.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="med-resource-row__copy">
                <span className="med-resource-row__title">Prior authorization request form</span>
                <span className="med-resource-row__sub">cms.gov/glp-1-bridge.pdf - Electronic or fax. Accepted from July 1.</span>
              </div>
              <span className="med-resource-row__badge">CMS official</span>
              <span className="med-resource-row__arrow">&#8599;</span>
            </a>
            <a className="med-resource-row" href="https://www.cms.gov/files/document/glp-1-prescribers-c-1.pdf" target="_blank" rel="noopener noreferrer">
              <div className="med-resource-row__icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M3 16.5c0-2.761 2.686-5 6-5s6 2.239 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="med-resource-row__copy">
                <span className="med-resource-row__title">Prescriber information sheet</span>
                <span className="med-resource-row__sub">cms.gov - Eligibility criteria, attestation requirements, submission workflow.</span>
              </div>
              <span className="med-resource-row__badge">CMS official</span>
              <span className="med-resource-row__arrow">&#8599;</span>
            </a>
          </div>

          {/* Adherix templates - direct PDF downloads */}
          <p className="med-resource-group-label med-resource-group-label--adherix">Adherix templates</p>
          <div className="med-resource-grid">
            <a className="med-resource-card med-resource-card--adherix" href="/adherix-bridge-checklist.pdf" download>
              <div className="med-resource-card__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <span className="med-resource-card__tag med-resource-card__tag--adherix">Free download</span>
                <h3>Clinic Bridge readiness checklist</h3>
                <p>PA submission, patient identification, staff training, and post-enrollment follow-up - all in one pre-launch checklist.</p>
              </div>
              <span className="med-resource-card__arrow" aria-hidden="true">&#8595;</span>
            </a>
            <a className="med-resource-card med-resource-card--adherix" href="/adherix-bridge-workflow.pdf" download>
              <div className="med-resource-card__icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5h14M3 10h10M3 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <span className="med-resource-card__tag med-resource-card__tag--adherix">Free download</span>
                <h3>Bridge patient onboarding workflow</h3>
                <p>Step-by-step from eligibility screening to first prescription - mapped for front desk and clinical staff.</p>
              </div>
              <span className="med-resource-card__arrow" aria-hidden="true">&#8595;</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="mkt-section mkt-section--dark med-cta-section">
        <div className="mkt-container med-cta-inner">
          <h2 className="mkt-h2">
            The Bridge opens a door. <br />Make sure your clinic is ready to walk through it.
          </h2>
          <p className="mkt-subhead">
            We offer a free workflow review for clinics preparing for the July 1 launch -
            covering PA readiness, patient identification, and post-enrollment support.
          </p>
          <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
            Book a free workflow review
          </Link>
        </div>
      </section>

    </div>
  );
}
