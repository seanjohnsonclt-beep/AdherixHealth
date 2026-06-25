import type { Metadata } from 'next';
import { PitchDeck } from './_pitch';

export const metadata: Metadata = {
  title: 'Adherix Health — Demo',
  robots: { index: false, follow: false },
};

export default function PitchPage() {
  return <PitchDeck />;
}
