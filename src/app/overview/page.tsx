import type { Metadata } from 'next';
import { OverviewDeck } from './_overview';

export const metadata: Metadata = {
  title: 'Adherix Health — Overview',
  robots: { index: false, follow: false },
};

export default function OverviewPage() {
  return <OverviewDeck />;
}
