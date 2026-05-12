import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

const BASE_URL = 'https://adherixhealth.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Adherix Health — Retention intelligence for GLP-1 programs',
    template: '%s — Adherix Health',
  },
  description:
    'Adherix helps GLP-1 clinics detect patient disengagement early, trigger smarter interventions, and retain more patients through the treatment journey.',
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'Adherix Health',
    title: 'Adherix Health — Retention intelligence for GLP-1 programs',
    description:
      'Behavior-driven SMS adherence for GLP-1 clinics. Phase-based. Trigger-based. Pilot-ready.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Adherix Health' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adherix Health — Retention intelligence for GLP-1 programs',
    description:
      'Behavior-driven SMS adherence for GLP-1 clinics. Phase-based. Trigger-based. Pilot-ready.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
