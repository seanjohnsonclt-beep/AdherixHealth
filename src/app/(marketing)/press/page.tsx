import type { Metadata } from 'next';
import { CopyButton } from './_components/CopyButton';

export const metadata: Metadata = {
  title: 'Press & media | Adherix Health',
  description: 'Press resources for journalists, analysts, and partners covering metabolic care and GLP-1 adherence.',
  openGraph: {
    title: 'Press & media - Adherix Health',
    description: 'Press releases, brand assets, and media contact for Adherix Health. Covering metabolic care and GLP-1 adherence.',
    url: 'https://adherixhealth.com/press',
    siteName: 'Adherix Health',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Press & media - Adherix Health',
    description: 'Press releases, brand assets, and media contact for Adherix Health.',
  },
};

const BOILERPLATE =
  'Adherix Health is a behavioral retention platform purpose-built for GLP-1 treatment programs. ' +
  'The platform delivers phase-based SMS engagement, automated trigger logic, and real-time Drift Correction ' +
  'to help metabolic care clinics identify at-risk patients early and sustain adherence through the critical ' +
  'first 90 days of treatment. Adherix operates as a Business Associate under HIPAA and is designed for ' +
  'clinic operators who need a lightweight, auditable outreach layer without adding staff overhead.';

export default function PressPage() {
  return (
    <div className="mkt-legal press-page">
      <div className="mkt-container mkt-legal__body">

        {/* Hero */}
        <div className="mkt-legal__head">
          <span className="mkt-eyebrow">Press &amp; media</span>
          <h1 className="mkt-h1">Press &amp; media</h1>
          <p className="mkt-legal__lede">
            Resources for journalists, analysts, and partners covering metabolic care.
          </p>
        </div>

        {/* Boilerplate */}
        <section>
          <h2>About Adherix Health</h2>
          <div className="press-boilerplate">
            <p>{BOILERPLATE}</p>
            <CopyButton text={BOILERPLATE} />
          </div>
        </section>

        {/* Logo downloads */}
        <section>
          <h2>Logo downloads</h2>
          <div className="press-logo-grid">
            <a
              className="press-logo-card"
              href="/logo.svg"
              download="adherix-health-logo.svg"
            >
              <div className="press-logo-card__preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="Adherix Health mark and wordmark" />
              </div>
              <div className="press-logo-card__label">
                <span className="press-logo-card__name">Mark + wordmark (SVG)</span>
                <span className="press-logo-card__format">Download</span>
              </div>
            </a>
            <a
              className="press-logo-card"
              href="/logo-mark.svg"
              download="adherix-health-mark.svg"
            >
              <div className="press-logo-card__preview press-logo-card__preview--mark">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo-mark.svg" alt="Adherix Health mark only" />
              </div>
              <div className="press-logo-card__label">
                <span className="press-logo-card__name">Mark only (SVG)</span>
                <span className="press-logo-card__format">Download</span>
              </div>
            </a>
          </div>
        </section>

        {/* Brand colors */}
        <section>
          <h2>Brand colors</h2>
          <div className="press-swatches">
            <div className="press-swatch">
              <div className="press-swatch__block" style={{ background: '#5B9B94' }} />
              <span className="press-swatch__name">Sage</span>
              <span className="press-swatch__hex">#5B9B94</span>
            </div>
            <div className="press-swatch">
              <div className="press-swatch__block" style={{ background: '#1F2A2A' }} />
              <span className="press-swatch__name">Ink</span>
              <span className="press-swatch__hex">#1F2A2A</span>
            </div>
            <div className="press-swatch">
              <div
                className="press-swatch__block press-swatch__block--bordered"
                style={{ background: '#F4EFE6' }}
              />
              <span className="press-swatch__name">Paper</span>
              <span className="press-swatch__hex">#F4EFE6</span>
            </div>
            <div className="press-swatch">
              <div className="press-swatch__block" style={{ background: '#D99877' }} />
              <span className="press-swatch__name">Clay</span>
              <span className="press-swatch__hex">#D99877</span>
            </div>
          </div>
        </section>

        {/* Press releases */}
        <section>
          <h2>Press releases</h2>
          <div className="press-release-list">
            <div className="press-release-item">
              <span className="press-release-item__date">June 9, 2026</span>
              <div className="press-release-item__body">
                <h3 className="press-release-item__title">
                  Adherix Health Releases Free Medicare GLP-1 Bridge Preparation Resources as July 1 Coverage Launch Approaches
                </h3>
                <p className="press-release-item__sub">
                  New CMS program extends $50/month GLP-1 coverage to eligible Medicare beneficiaries - most clinics are not yet operationally ready for the new prior authorization process.
                </p>
                <a
                  className="press-release-item__link"
                  href="/press/medicare-glp1-bridge"
                >
                  Read more &rarr;
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Coverage & mentions */}
        <section>
          <h2>Coverage &amp; mentions</h2>
          <div className="press-coverage-grid">
            <div className="press-coverage-card press-coverage-card--empty">
              <span className="press-coverage-card__label">
                Coverage will appear here as it&rsquo;s published.
              </span>
            </div>
          </div>
        </section>

        {/* Press contact */}
        <section>
          <h2>Press contact</h2>
          <p>
            For press inquiries contact{' '}
            <a href="mailto:press@adherixhealth.com">press@adherixhealth.com</a>
          </p>
        </section>

      </div>
    </div>
  );
}
