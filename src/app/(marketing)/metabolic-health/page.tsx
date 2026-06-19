import type { Metadata } from 'next';
import { MetabolicHealthPage } from './_page';

export const metadata: Metadata = {
  title: 'Adherix Metabolic - Metabolic Health | Adherix Health',
  description: '88 million Americans have pre-diabetes. Adherix Metabolic delivers evidence-based behavioral habits between clinic visits to move A1c in the right direction - automatically via SMS.',
};

export default function Page() {
  return <MetabolicHealthPage />;
}
