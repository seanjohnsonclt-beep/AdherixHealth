import type { ReactNode } from 'react';
import { SiteHeader } from './_components/SiteHeader';
import { SiteFooter } from './_components/SiteFooter';

/**
 * Public marketing layout. Wraps all routes inside the (marketing) group:
 * /, /pilot, etc. Imports its own CSS so the dashboard styles in globals.css
 * are not affected.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mkt-page">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
