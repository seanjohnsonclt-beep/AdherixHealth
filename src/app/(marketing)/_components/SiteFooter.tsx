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
              Retention intelligence for modern metabolic care. Built for clinics
              that grow on recurring program revenue.
            </p>
          </div>
          <div className="mkt-footer__col">
            <h4>Product</h4>
            <Link href="/">Overview</Link>
            <Link href="/platform">Platform</Link>
            <Link href="/roi">ROI calculator</Link>
            <Link href="/pilot">Book a demo</Link>
          </div>
          <div className="mkt-footer__col">
            <h4>Account</h4>
            <Link href="/login">Sign in</Link>
            <a href="mailto:hello@adherix.health">Contact us</a>
          </div>
          <div className="mkt-footer__col">
            <h4>Legal &amp; security</h4>
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms">Terms of service</Link>
            <Link href="/security">Security</Link>
          </div>
        </div>
        <div className="mkt-footer__bottom">
          <span>© {year} Adherix Health. All rights reserved.</span>
          <span>HIPAA-aware infrastructure for GLP-1 retention programs.</span>
        </div>
      </div>
    </footer>
  );
}
