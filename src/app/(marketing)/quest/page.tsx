import type { Metadata } from 'next';
import { QuestPage } from './_page';

export const metadata: Metadata = {
  title: 'Adherix Quest - Pediatric Weight Management for Teens 13-18',
  description:
    'Quest turns clinical behavioral protocols into a game world teens actually inhabit. ' +
    'XP, squads, boss challenges, weekly missions. Same clinical rigor. A completely different experience.',
  openGraph: {
    title: '1 in 5 U.S. teens have obesity. Most programs lose them before month three.',
    description:
      'Adherix Quest delivers phase-based SMS adherence for pediatric weight management - ' +
      'gamified for teens 13-18, with a parallel guardian track. No staff overhead.',
    url: 'https://adherixhealth.com/quest',
    siteName: 'Adherix Health',
  },
  twitter: {
    card: 'summary_large_image',
    title: '1 in 5 U.S. teens have obesity. Most programs lose them before month three.',
    description:
      'Adherix Quest - gamified behavioral adherence for pediatric weight management programs.',
  },
};

export default function Page() {
  return <QuestPage />;
}
