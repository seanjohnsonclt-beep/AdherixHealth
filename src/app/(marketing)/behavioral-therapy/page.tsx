import type { Metadata } from 'next';
import { BehavioralTherapyPage } from './_page';

export const metadata: Metadata = {
  title: 'Adherix IBT - Behavioral Therapy | Adherix Health',
  description: 'Medicare covers 22 IBT visits for obesity. Most practices deliver 4. Adherix IBT fills every gap between clinic visits automatically - no additional coordinator hours.',
};

export default function Page() {
  return <BehavioralTherapyPage />;
}
