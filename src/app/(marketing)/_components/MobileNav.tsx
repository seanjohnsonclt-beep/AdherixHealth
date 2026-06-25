'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onResize() { if (window.innerWidth >= 680) setOpen(false); }
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
        <nav id="mkt-mobile-menu" className="mkt-mobile-menu" aria-label="Mobile navigation">
          <div className="mkt-mobile-menu__inner">
            <Link href="/"         className="mkt-mobile-menu__link" onClick={close}>Overview</Link>
            <div className="mkt-mobile-menu__section-head">Products</div>
            <Link href="/platform"         className="mkt-mobile-menu__link mkt-mobile-menu__link--sub" onClick={close}>Adherix Keep — GLP-1</Link>
            <Link href="/obesity-care"     className="mkt-mobile-menu__link mkt-mobile-menu__link--sub" onClick={close}>Adherix Bridge — Bariatric</Link>
            <Link href="/gauge"            className="mkt-mobile-menu__link mkt-mobile-menu__link--sub" onClick={close}>Adherix Gauge — Scale Tracker</Link>
            <Link href="/metabolic-health" className="mkt-mobile-menu__link mkt-mobile-menu__link--sub" onClick={close}>Adherix Metabolic — Metabolic Health</Link>
            <Link href="/platform" className="mkt-mobile-menu__link" onClick={close}>Platform</Link>
            <Link href="/roi"      className="mkt-mobile-menu__link" onClick={close}>ROI</Link>
            <Link href="/audit"    className="mkt-mobile-menu__link" onClick={close}>Free cohort audit</Link>
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
