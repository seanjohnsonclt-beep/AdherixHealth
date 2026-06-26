import type { Metadata } from 'next';
import { GaugePage } from './_page';

export const metadata: Metadata = {
  title: 'Adherix Gauge | Weight Tracking for GLP-1 Patients',
  description:
    'Gauge tracks patient weight loss through weekly SMS check-ins. When patients hit milestones, they hear about it. When the scale stalls, we keep them going.',
  openGraph: {
    title: 'The scale is the moment patients stay.',
    description: 'Adherix Gauge delivers weekly SMS weight check-ins, automatic milestone detection, and zero staff overhead. The scale result is the primary reason patients stay on GLP-1s.',
    url: 'https://adherixhealth.com/gauge',
    siteName: 'Adherix Health',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The scale is the moment patients stay.',
    description: 'Weekly SMS weight check-ins. Automatic milestone detection. Zero staff overhead.',
  },
};

export default function Page() {
  return <GaugePage />;
}
