import type { Metadata } from 'next';
import { CohortAuditPage } from './_components/CohortAuditPage';

export const metadata: Metadata = {
  title: 'Free Cohort Audit | Adherix Health',
  description: 'Upload a de-identified patient list and see your real GLP-1 retention rate, where patients drop off, and your estimated annual revenue leakage. No account required. All analysis runs in your browser.',
  openGraph: {
    title: 'Your free cohort audit is ready in 60 seconds.',
    description: '4 questions. See your 90-day retention rate, dropout curve, and annual revenue leakage. Free - no signup required.',
    url: 'https://adherixhealth.com/audit',
    siteName: 'Adherix Health',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your free cohort audit is ready in 60 seconds.',
    description: '4 questions. See your 90-day retention rate, dropout curve, and annual revenue leakage. Free - no signup required.',
  },
};

export default function AuditPage() {
  return <CohortAuditPage />;
}
