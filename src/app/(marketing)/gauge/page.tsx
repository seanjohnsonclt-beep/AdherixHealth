import type { Metadata } from 'next';
import { GaugePage } from './_page';

export const metadata: Metadata = {
  title: 'Adherix Gauge | Weight Tracking for GLP-1 Patients',
  description:
    'Gauge tracks patient weight loss through weekly SMS check-ins. When patients hit milestones, they hear about it. When the scale stalls, we keep them going.',
};

export default function Page() {
  return <GaugePage />;
}
