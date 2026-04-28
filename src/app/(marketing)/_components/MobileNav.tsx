'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Mobile navigation -- hamburger toggle + full-width slide-down menu.
 * Hidden on desktop (CSS), shown on mobile (< 680px).
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 680) setOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        className="mkt-mobile-toggle"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        aria-expanded={open}
        aria-controls="mkt-mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`mkt-mobile-toggle__bar ${open ? 'is-open' : ''}`} />
      </button>

      {open && (
        <nav
          id="mkt-mobile-menu"
          className="mkt-mobile-menu"
          aria-label="Mobile navigation"
        >
          <div className="mkt-mobile-menu__inner">
            <Link href="/"         className="mkt-mobile-menu__link" onClick={close}>Overview</Link>
            <Link href="/platform" className="mkt-mobile-menu__link" onClick={close}>Platform</Link>
            <Link href="/roi"      className="mkt-mobile-menu__link" onClick={close}>ROI calculator</Link>
            <Link href="/login"    className="mkt-mobile-menu__link mkt-mobile-menu__link--muted" onClick={close}>Sign in</Link>
            <Link href="/pilot"    className="mkt-btn mkt-btn--primary mkt-mobile-menu__cta" onClick={close}>
              Book a demo
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}