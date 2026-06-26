import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

const BASE_URL = 'https://adherixhealth.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Adherix Health — Retention Intelligence for GLP-1 Programs',
    template: 'Adherix Health | %s',
  },
  description:
    'Adherix helps GLP-1 clinics detect patient disengagement early, trigger smarter interventions, and retain more patients through the treatment journey.',
  openGraph: {
    type: 'website',
    siteName: 'Adherix Health',
    title: 'Adherix Health — Retention Intelligence for GLP-1 Programs',
    description:
      'Behavior-driven SMS adherence for GLP-1 clinics. Phase-based. Trigger-based. Pilot-ready.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adherix Health — Retention Intelligence for GLP-1 Programs',
    description:
      'Behavior-driven SMS adherence for GLP-1 clinics. Phase-based. Trigger-based. Pilot-ready.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Adherix Health',
  url: 'https://adherixhealth.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://adherixhealth.com/?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Adherix Health',
  url: 'https://adherixhealth.com',
  logo: 'https://adherixhealth.com/logo.png',
  foundingDate: '2024',
  description:
    'Adherix Health builds behavior-driven patient adherence systems for GLP-1 treatment programs.',
  industry: 'Healthcare Technology',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'hello@adherixhealth.com',
    contactType: 'customer support',
  },
  sameAs: [
    'https://www.linkedin.com/company/adherixhealth',
    'https://www.crunchbase.com/organization/adherix-health',
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
