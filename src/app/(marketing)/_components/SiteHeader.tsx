import Link from 'next/link';
import { AdherixLogo } from './AdherixLogo';
import { MobileNav } from './MobileNav';
import { ProductsDropdown } from './ProductsDropdown';

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
          <nav className="mkt-nav mkt-nav--desktop" aria-label="Primary">
            <Link href="/">Overview</Link>
            <ProductsDropdown />
            <Link href="/platform">Platform</Link>
            <Link href="/roi">ROI</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/audit" className="mkt-nav__audit-link">Free audit</Link>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--sm mkt-nav__cta">
              Book a demo
            </Link>
          </nav>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
