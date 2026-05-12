import { requireUser } from '@/lib/auth';
import { Topbar } from '@/app/_components/Topbar';
import Link from 'next/link';
import { EnrollForm } from './EnrollForm';

export default async function NewPatientPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await requireUser();

  return (
    <div className="shell">
      <Topbar clinicName={user.clinicName} email={user.email} />

      <div style={{ maxWidth: 480 }}>
        <Link href="/dashboard" className="small muted" style={{ border: 'none' }}>
          ← All patients
        </Link>
        <h1 style={{ marginTop: 12, marginBottom: 8 }}>Enroll patient</h1>
        <p className="muted small" style={{ marginBottom: 24 }}>
          The first message goes out within 5 minutes of enrollment.
          If a medication is selected, weekly injection confirmations start automatically after day 7.
        </p>

        <EnrollForm error={searchParams.error} />
      </div>
    </div>
  );
}
