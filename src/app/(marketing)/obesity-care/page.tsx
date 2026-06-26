import type { Metadata } from 'next';
import { ObesityCarePage } from './_page';

export const metadata: Metadata = {
  title: 'Obesity Care | Adherix Bridge',
  description:
    'Adherix Bridge - behavioral adherence for bariatric surgery programs. Pre-op through maintenance, SMS-first, automated. No coordinator overhead.',
  openGraph: {
    title: '40% of bariatric patients regain within 5 years.',
    description: 'Adherix Bridge delivers phase-based SMS adherence for bariatric surgery programs - from pre-op through long-term maintenance. Automated. No coordinator overhead.',
    url: 'https://adherixhealth.com/obesity-care',
    siteName: 'Adherix Health',
  },
  twitter: {
    card: 'summary_large_image',
    title: '40% of bariatric patients regain within 5 years.',
    description: 'Adherix Bridge delivers phase-based SMS adherence for bariatric surgery programs - from pre-op through long-term maintenance.',
  },
};

export default function Page() {
  return <ObesityCarePage />;
}
