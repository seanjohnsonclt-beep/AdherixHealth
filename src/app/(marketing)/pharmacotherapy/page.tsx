import type { Metadata } from 'next';
import { PharmacotherapyPage } from './_page';

export const metadata: Metadata = {
  title: 'Adherix Rx - Pharmacotherapy | Adherix Health',
  description: 'Behavioral adherence support for non-GLP-1 weight loss medications. Daily pill habit, side effect management, refill reminders - automated via SMS.',
};

export default function Page() {
  return <PharmacotherapyPage />;
}
