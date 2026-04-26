import Link from 'next/link';
import { AdherixLogo } from './AdherixLogo';
import { MobileNav } from './MobileNav';

/**
 * Sticky public site header.
 *
 * Desktop nav: Overview | Platform | ROI calculator | Sign in | Book a demo
 * Mobile: logo + hamburger via MobileNav (client component)
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

          {/* Desktop nav — hidden on mobile via CSS */}
          <nav className="mkt-nav mkt-nav--desktop" aria-label="Primary">
            <Link href="/">Overview</Link>
            <Link href="/platform">Platform</Link>
            <Link href="/roi">ROI calculator</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--sm mkt-nav__cta">
              Book a demo
            </Link>
          </nav>

          {/* Mobile nav — hamburger + slide-down, hidden on desktop via CSS */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
