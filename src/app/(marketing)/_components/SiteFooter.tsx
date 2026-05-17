import Link from 'next/link';
import { AdherixLogo } from './AdherixLogo';

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mkt-footer">
      <div className="mkt-container">
        <div className="mkt-footer__inner">
          <div className="mkt-footer__col">
            <AdherixLogo variant="full" invert style={{ width: 140, height: 'auto', marginBottom: 14, display: 'block' }} />
            <p className="mkt-footer__brand">
              Behavioral retention intelligence for GLP-1 programs. Built for
              clinics that can&apos;t afford to watch patients drift in silence.
            </p>
          </div>
          <div className="mkt-footer__col">
            <h4>Product</h4>
            <Link href="/">Overview</Link>
            <Link href="/platform">Platform</Link>
            <Link href="/drift-correction">Drift Correction</Link>
            <Link href="/roi">ROI calculator</Link>
            <Link href="/pilot">Book a demo</Link>
          </div>
          <div className="mkt-footer__col">
            <h4>Company</h4>
            <Link href="/about">About Adherix Health</Link>
            <Link href="/advisors">Clinical advisory board</Link>
            <Link href="/login">Sign in</Link>
            <a href="mailto:hello@adherixhealth.com">Contact us</a>
            <a href="mailto:hello@adherixhealth.com">hello@adherixhealth.com</a>
          </div>
          <div className="mkt-footer__col">
            <h4>Legal &amp; security</h4>
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms">Terms of service</Link>
            <Link href="/security">Security</Link>
            <Link href="/press">Press</Link>
          </div>
        </div>
        <div className="mkt-footer__bottom">
          <span>&copy; {year} Adherix Health. All rights reserved.</span>
          <span>HIPAA-aware infrastructure for GLP-1 retention programs.</span>
        </div>
      </div>
    </footer>
  );
}
