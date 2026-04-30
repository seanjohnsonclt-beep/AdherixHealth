import type { Metadata } from 'next';
import { DriftCorrectionPage } from './_page';

export const metadata: Metadata = {
  title: 'Drift Correction | Adherix Health',
  description:
    'When a GLP-1 patient drifts, Adherix detects the pattern, sends a targeted correction, and tracks whether they come back. Automated. Closed loop.',
};

export default function Page() {
  return <DriftCorrectionPage />;
}
