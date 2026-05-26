import type { Metadata } from 'next';
import { CohortAuditPage } from './_components/CohortAuditPage';

export const metadata: Metadata = {
  title: 'Free Cohort Audit | Adherix Health',
  description: 'Upload a de-identified patient list and see your real GLP-1 retention rate, where patients drop off, and your estimated annual revenue leakage. No account required. All analysis runs in your browser.',
};

export default function AuditPage() {
  return <CohortAuditPage />;
}
