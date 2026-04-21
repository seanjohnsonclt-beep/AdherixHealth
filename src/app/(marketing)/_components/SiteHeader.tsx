import Link from 'next/link';
import { AdherixLogo } from './AdherixLogo';

/**
 * Sticky public site header. Marketing nav per the brief:
 *   Platform · How It Works · ROI · Request a Pilot
 *
 * "Sign in" is intentionally a low-emphasis link — the site exists to
 * convert clinics, not to herd existing users to the dashboard.
 */
export function SiteHeader() {
  return (
    <header className="mkt-header">
      <div className="mkt-container">
        <div className="mkt-header__inner">
          <Link href="/" className="mkt-logo" aria-label="Adherix Health, home">
            <AdherixLogo variant="mark" className="mkt-logo__mark" />
            <span className="mkt-logo__wm">
              Adherix
              <small>Health</small>
            </span>
          </Link>

          <nav className="mkt-nav" aria-label="Primary">
            <Link href="/#platform">Platform</Link>
            <Link href="/#how">How it works</Link>
            <Link href="/#roi">ROI</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--sm mkt-nav__cta">
              Request a pilot
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
