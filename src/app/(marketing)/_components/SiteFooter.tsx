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
            <h4>Platform</h4>
            <Link href="/#platform">Overview</Link>
            <Link href="/#how">How it works</Link>
            <Link href="/#roi">ROI</Link>
            <Link href="/#trust">Compliance</Link>
          </div>
          <div className="mkt-footer__col">
            <h4>Get Started</h4>
            <Link href="/pilot">Request a pilot</Link>
            <Link href="/demo">See the platform</Link>
            <Link href="/login">Sign in</Link>
          </div>
          <div className="mkt-footer__col">
            <h4>Contact</h4>
            <a href="mailto:hello@adherix.health">hello@adherix.health</a>
            <a href="mailto:pilots@adherix.health">pilots@adherix.health</a>
          </div>
        </div>
        <div className="mkt-footer__bottom">
          <span>© {year} Adherix Health. All rights reserved.</span>
          <span>Behavioral retention infrastructure for metabolic care programs.</span>
        </div>
      </div>
    </footer>
  );
}
