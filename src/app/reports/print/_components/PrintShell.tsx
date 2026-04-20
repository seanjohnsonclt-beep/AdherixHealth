'use client';

// PrintShell — wraps a print-optimized page and auto-fires the browser
// print dialog on mount. Clinic admin clicks "Open printable PDF",
// gets the print dialog, saves as PDF. No server-side PDF library.

import { useEffect } from 'react';

export function PrintShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Small delay so fonts/layout settle before print dialog opens
    const t = setTimeout(() => {
      try {
        window.print();
      } catch {
        // If blocked (some browsers require user gesture), user can hit Ctrl+P
      }
    }, 350);
    return () => clearTimeout(t);
  }, []);

  return <>{children}</>;
}
