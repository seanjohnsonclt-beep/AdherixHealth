import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Adherix Health | GLP-1 Adherence Platform',
  description:
    'Adherix Health is a healthcare technology company building behavior-driven adherence systems for GLP-1 treatment programs. Founded by Sean Johnson.',
  alternates: {
    canonical: 'https://adherixhealth.com/about',
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Adherix Health',
  url: 'https://adherixhealth.com/about',
  mainEntity: {
    '@type': 'Organization',
    name: 'Adherix Health',
    url: 'https://adherixhealth.com',
    foundingDate: '2024',
    founder: { '@type': 'Person', name: 'Sean Johnson' },
    description:
      'Adherix Health builds behavior-driven patient adherence systems for GLP-1 treatment programs.',
    industry: 'Healthcare Technology',
    contactPoint: { '@type': 'ContactPoint', email: 'hello@adherixhealth.com', contactType: 'customer support' },
    sameAs: [
      'https://www.linkedin.com/company/adherixhealth',
      'https://www.crunchbase.com/organization/adherix-health',
    ],
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />

      <section className="mkt-v2-section" id="about-hero">
        <div className="mkt-container mkt-container--narrow">
          <span className="mkt-eyebrow">About Adherix Health</span>
          <h1 className="mkt-h1">
            Built to solve a specific problem in GLP-1 care.
          </h1>
          <p className="mkt-subhead">
            Adherix Health is a healthcare technology company that builds
            behavior-driven adherence systems for GLP-1 treatment programs.
            We help clinics detect patient disengagement early, trigger
            automated interventions, and retain more patients through the
            full treatment journey.
          </p>
        </div>
      </section>

      <section className="mkt-v2-section mkt-v2-section--alt" id="about-what">
        <div className="mkt-container mkt-container--narrow">
          <span className="mkt-eyebrow">The problem we solve</span>
          <h2 className="mkt-h2">Most GLP-1 programs lose patients in silence.</h2>
          <p>
            Clinics invest heavily to get patients started &mdash; intake workflows,
            coordinators, sign-up tracking. Then treatment begins and visibility
            disappears. Nobody is watching the signals that predict churn: replies
            slowing down, doses spacing out, engagement fading.
          </p>
          <p>
            In GLP-1 programs, that gap has a number attached to it. Patients who
            drift in the first 90 days rarely come back. Adherix closes that gap
            with an SMS-first engagement layer that runs automatically &mdash; detecting
            disengagement early and correcting it before the care team ever has to
            get involved.
          </p>
          <p>
            The platform uses phase-based progression and trigger-based logic to
            move each patient from initiation through onboarding, activation,
            momentum, and plateau. When a patient goes silent, Adherix detects the
            pattern and responds. Everything is tracked. Everything is measurable.
          </p>
        </div>
      </section>

      <section className="mkt-v2-section" id="about-company">
        <div className="mkt-container mkt-container--narrow">
          <span className="mkt-eyebrow">The company</span>
          <h2 className="mkt-h2">Adherix Health</h2>
          <p>
            Adherix Health is a healthcare technology company founded in 2024
            by Sean Johnson, a healthcare operator with a decade of enterprise
            growth experience across health tech and digital transformation &mdash;
            including roles at Phreesia and Unlock Health.
          </p>
          <p>
            We are headquartered in the United States and focused exclusively
            on the metabolic care market. Our platform is designed for GLP-1
            clinics that need patient retention infrastructure without adding
            to their team&apos;s workload.
          </p>
          <p>
            To reach us:{' '}
            <a href="mailto:hello@adherixhealth.com">hello@adherixhealth.com</a>
            {' '}&mdash;{' '}
            or book a demo at{' '}
            <a href="mailto:demos@adherixhealth.com">demos@adherixhealth.com</a>.
          </p>
        </div>
      </section>

      <section className="mkt-v2-section mkt-v2-section--alt" id="about-cta">
        <div className="mkt-container mkt-container--narrow" style={{ textAlign: 'center' }}>
          <h2 className="mkt-h2">See it running on a real patient panel.</h2>
          <p className="mkt-subhead">
            30-minute walkthrough. No slides. Real platform, realistic data.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
              Book a demo
            </Link>
            <Link href="/platform" className="mkt-btn mkt-btn--ghost mkt-btn--lg">
              See the platform
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
