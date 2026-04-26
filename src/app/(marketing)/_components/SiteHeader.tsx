import Link from 'next/link';
import { AdherixLogo } from './AdherixLogo';

/**
 * Sticky public site header.
 *
 * Nav links now point to real pages, not in-page anchors.
 *   Platform      → /platform
 *   ROI calculator → /roi
 *   Sign in       → /login (low emphasis)
 *   CTA           → /pilot (Book a demo)
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
            <Link href="/platform">Platform</Link>
            <Link href="/roi">ROI calculator</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--sm mkt-nav__cta">
              Book a demo
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
