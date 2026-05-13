import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Adherix Health | GLP-1 Adherence Platform',
  description:
    'Adherix Health is a healthcare technology company building behavior-driven adherence systems for GLP-1 treatment programs. Founded by Sean Johnson to solve the patient drift problem in metabolic care.',
  alternates: {
    canonical: 'https://adherixhealth.com/about',
  },
};

const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Adherix Health',
  url: 'https://adherixhealth.com/about',
  description:
    'Adherix Health is a healthcare technology company building behavior-driven adherence systems for GLP-1 treatment programs.',
  mainEntity: {
    '@type': 'Organization',
    name: 'Adherix Health',
    url: 'https://adherixhealth.com',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'Sean Johnson',
      jobTitle: 'Founder',
      worksFor: { '@type': 'Organization', name: 'Adherix Health' },
    },
    description:
      'Adherix Health builds behavior-driven patient adherence systems for GLP-1 treatment programs. Our SMS-first platform uses phase-based progression and trigger logic to detect disengagement early and automatically correct patient drift — keeping more patients on treatment longer.',
    industry: 'Healthcare Technology',
    knowsAbout: [
      'GLP-1 medication adherence',
      'Patient retention technology',
      'Behavioral health interventions',
      'SMS-based patient engagement',
      'Metabolic care programs',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@adherixhealth.com',
      contactType: 'customer support',
    },
    sameAs: [
      'https://www.linkedin.com/company/adherixhealth',
      'https://www.crunchbase.com/organization/adherix-health',
      'https://wellfound.com/company/adherix-health',
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

      {/* Hero */}
      <section className="mkt-v2-section" id="about-hero">
        <div className="mkt-container mkt-container--narrow">
          <span className="mkt-eyebrow">About Adherix Health</span>
          <h1 className="mkt-h1">
            A retention system built specifically for GLP-1 programs.
          </h1>
          <p className="mkt-subhead">
            Adherix Health is a healthcare technology company that builds
            behavior-driven adherence systems for clinics running GLP-1 treatment
            programs. We help clinics detect patient disengagement early, trigger
            automated SMS interventions, and retain more patients through the full
            treatment journey.
          </p>
        </div>
      </section>

      {/* What we do */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="about-what">
        <div className="mkt-container mkt-container--narrow">
          <span className="mkt-eyebrow">What Adherix Health does</span>
          <h2 className="mkt-h2">The gap between acquisition and retention.</h2>
          <p>
            Most GLP-1 clinics invest heavily in patient acquisition — intake
            workflows, coordinators, sign-up tracking. Then treatment begins, and
            visibility disappears. Nobody watches the signals that predict churn:
            replies slowing down, doses spacing out, engagement fading.
          </p>
          <p>
            In GLP-1 programs, that gap has a number attached to it. Patients who
            drift in the first 90 days rarely come back. Adherix Health exists to
            close that gap with an SMS-first, automated engagement layer that runs
            without adding to your team&rsquo;s workload.
          </p>
          <p>
            The platform uses phase-based progression — moving each patient from
            initiation through onboarding, activation, momentum, and plateau — and
            trigger-based logic that automatically fires the right message at the
            right moment. When a patient goes silent, Adherix detects the pattern
            and corrects it. When a patient re-engages, the system records it.
            Everything is measurable.
          </p>
        </div>
      </section>

      {/* Founder */}
      <section className="mkt-v2-section" id="about-founder">
        <div className="mkt-container mkt-container--narrow">
          <span className="mkt-eyebrow">Founder</span>
          <div className="mkt-v2-founder__row" style={{ marginTop: 32 }}>
            <div className="mkt-v2-founder__avatar">
              <Image
                src="/founder.png"
                alt="Sean Johnson, Founder of Adherix Health"
                width={96}
                height={96}
                className="mkt-v2-founder__photo"
                priority
              />
            </div>
            <div className="mkt-v2-founder__body">
              <h2 className="mkt-h2" style={{ marginTop: 0 }}>Sean Johnson</h2>
              <p className="mkt-v2-founder__role" style={{ marginBottom: 16 }}>
                Founder, Adherix Health
              </p>
              <p>
                Sean Johnson is a healthcare operator who saw the same patient
                retention failure repeat across program after program. Organizations
                spent aggressively to acquire patients — then treatment began and
                the visibility disappeared. Nobody was watching the signals that
                predict churn.
              </p>
              <p>
                Adherix Health was built from that observation: clinics should not
                lose patients because no one noticed they were drifting. The
                platform is the smallest possible intervention layer that uses what
                patients already do — replies, silences, dose timing — to keep them
                on treatment longer.
              </p>
              <p>
                <a href="mailto:hello@adherixhealth.com">hello@adherixhealth.com</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company facts */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="about-company">
        <div className="mkt-container mkt-container--narrow">
          <span className="mkt-eyebrow">Company</span>
          <h2 className="mkt-h2">Adherix Health at a glance</h2>
          <dl style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px 24px', marginTop: 24 }}>
            <dt><strong>Company name</strong></dt>
            <dd>Adherix Health</dd>
            <dt><strong>Industry</strong></dt>
            <dd>Healthcare Technology / Digital Health</dd>
            <dt><strong>Category</strong></dt>
            <dd>GLP-1 patient adherence &amp; retention platform</dd>
            <dt><strong>Founded</strong></dt>
            <dd>2024</dd>
            <dt><strong>Founder</strong></dt>
            <dd>Sean Johnson</dd>
            <dt><strong>Headquarters</strong></dt>
            <dd>United States</dd>
            <dt><strong>Contact</strong></dt>
            <dd>
              <a href="mailto:hello@adherixhealth.com">hello@adherixhealth.com</a>
            </dd>
            <dt><strong>Demos</strong></dt>
            <dd>
              <a href="mailto:demos@adherixhealth.com">demos@adherixhealth.com</a>
            </dd>
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="mkt-v2-section" id="about-cta">
        <div className="mkt-container mkt-container--narrow" style={{ textAlign: 'center' }}>
          <h2 className="mkt-h2">See Adherix Health in action.</h2>
          <p className="mkt-subhead">
            We run a 30-minute live walkthrough on a realistic patient panel.
            No slide deck. Real platform, real data.
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
