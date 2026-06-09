import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Press Release: Adherix Health Releases Free Medicare GLP-1 Bridge Resources | Adherix Health',
  description:
    'Adherix Health releases free clinic preparation resources as the Medicare GLP-1 Bridge program launches July 1, 2026 - covering Wegovy, Zepbound, and Foundayo at $50/month for eligible Medicare beneficiaries.',
};

export default function MedicareGlp1BridgePressReleasePage() {
  return (
    <div className="mkt-legal press-page">
      <div className="mkt-container mkt-legal__body">

        {/* Back link */}
        <div className="pr-back">
          <Link href="/press" className="pr-back__link">&larr; Press &amp; media</Link>
        </div>

        {/* Header */}
        <div className="pr-header">
          <span className="pr-header__flag">FOR IMMEDIATE RELEASE</span>
          <p className="pr-header__date">June 9, 2026</p>
          <p className="pr-header__contact">
            Media contact: Sean Johnson, Founder &mdash;{' '}
            <a href="mailto:press@adherixhealth.com">press@adherixhealth.com</a>
            {' '}&middot;{' '}
            <a href="https://adherixhealth.com">adherixhealth.com</a>
          </p>
        </div>

        {/* Headline */}
        <div className="pr-headline-block">
          <h1 className="pr-headline">
            Adherix Health Releases Free Medicare GLP-1 Bridge Preparation Resources as July 1 Coverage Launch Approaches
          </h1>
          <p className="pr-subhead">
            New CMS program extends $50/month GLP-1 coverage to eligible Medicare beneficiaries - most clinics are not yet operationally ready for the new prior authorization process.
          </p>
        </div>

        {/* Body */}
        <div className="pr-body">

          <p>
            <strong>CHARLOTTE, N.C. - June 9, 2026</strong> - Adherix Health today announced the release of two free downloadable resources designed to help clinics prepare for the Medicare GLP-1 Bridge program, which takes effect July 1, 2026. The Clinic Bridge Readiness Checklist and Bridge Patient Onboarding Workflow are available immediately at{' '}
            <Link href="/medicare-resources">adherixhealth.com/medicare-resources</Link>.
          </p>

          <p>
            The Medicare GLP-1 Bridge is a new Centers for Medicare and Medicaid Services (CMS) program that will allow eligible Medicare Part D beneficiaries to access FDA-approved GLP-1 medications - including Wegovy, Zepbound, and Foundayo - at a fixed $50 monthly copay. The program introduces a new prior authorization process submitted through a centralized CMS processor, separate from a patient&rsquo;s existing Part D plan - a workflow many primary care, internal medicine, and obesity medicine practices have not yet encountered.
          </p>

          <p>
            With fewer than 30 days until launch, Adherix Health is seeing a significant awareness gap among independent and small group practices. Many clinics have active GLP-1 patient panels but have not yet evaluated whether their documentation, staff training, or patient communication processes are ready for the new eligibility requirements.
          </p>

          <blockquote className="pr-quote">
            <p>
              &ldquo;Most clinics are focused on patient care, not federal program implementation timelines. The Bridge is real, it&rsquo;s imminent, and the prior authorization workflow is different from anything they&rsquo;ve submitted before. We built these tools so a clinic can open the checklist today, work through it this week, and be operationally ready by July 1.&rdquo;
            </p>
            <cite>- Sean Johnson, Founder, Adherix Health</cite>
          </blockquote>

          <p>
            The Clinic Bridge Readiness Checklist covers five operational areas: prior authorization submission readiness, patient identification and eligibility screening, staff training requirements, patient communication, and post-enrollment follow-up. The Bridge Patient Onboarding Workflow maps the full patient journey from eligibility confirmation to first prescription in three phases, designed for both front desk and clinical staff.
          </p>

          <p>
            Both documents are available as free PDF downloads at{' '}
            <Link href="/medicare-resources">adherixhealth.com/medicare-resources</Link>.
          </p>

          <p>
            In addition to Bridge preparation resources, Adherix Health offers Adherix Keep, an SMS-based patient adherence platform designed specifically for GLP-1 treatment programs. Keep delivers phase-based, automated patient engagement from the day of enrollment through maintenance - addressing the documented dropout rates that occur in the first 90 days of GLP-1 therapy. Clinics that complete Bridge setup with Adherix can access Keep to maintain patient engagement after access is granted.
          </p>

          <hr className="pr-rule" />

          {/* About */}
          <div className="pr-about">
            <h2>About Adherix Health</h2>
            <p>
              Adherix Health is a behavior-driven patient adherence platform built for GLP-1 treatment programs. Adherix Keep delivers phase-based SMS engagement, automated drift detection, and clinic alert workflows designed to keep patients on treatment through the first year and beyond. Adherix Health also provides Bridge program support services for clinics preparing to enroll eligible Medicare patients before the July 1, 2026 launch. For more information, visit{' '}
              <a href="https://adherixhealth.com">adherixhealth.com</a>.
            </p>
          </div>

          <div className="pr-end">###</div>
        </div>

      </div>
    </div>
  );
}
