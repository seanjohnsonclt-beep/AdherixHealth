import type { Metadata } from 'next';
import { ObesityCarePage } from './_page';

export const metadata: Metadata = {
  title: 'Obesity Care | Adherix Bridge',
  description:
    'Adherix Bridge - behavioral adherence for bariatric surgery programs. Pre-op through maintenance, SMS-first, automated. No coordinator overhead.',
};

export default function Page() {
  return <ObesityCarePage />;
}
