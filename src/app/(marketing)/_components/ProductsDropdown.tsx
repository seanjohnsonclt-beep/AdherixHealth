'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

const products = [
  {
    label: 'Adherix Keep',
    sub: 'GLP-1 retention',
    href: '/platform',
    tag: 'glp1',
  },
  {
    label: 'Adherix Bridge',
    sub: 'Bariatric surgery support',
    href: '/obesity-care',
    tag: 'bariatric',
  },
  {
    label: 'Adherix Gauge',
    sub: 'Scale Tracker for GLP-1 programs',
    href: '/gauge',
    tag: 'gauge',
  },
  {
    label: 'Adherix Metabolic',
    sub: 'Pre-diabetes & metabolic syndrome',
    href: '/metabolic-health',
    tag: 'metabolic',
  },
];

export function ProductsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="mkt-products-dd" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        className="mkt-products-dd__trigger"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(v => !v)}
      >
        Products
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true" className={open ? 'is-open' : ''}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="mkt-products-dd__menu" role="menu">
          {products.map(p => (
            <Link
              key={p.href}
              href={p.href}
              className="mkt-products-dd__item"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <span className="mkt-products-dd__item-label">{p.label}</span>
              <span className="mkt-products-dd__item-sub">{p.sub}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
