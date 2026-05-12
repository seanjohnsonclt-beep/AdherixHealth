import { requireUser } from '@/lib/auth';
import { Topbar } from '@/app/_components/Topbar';
import { ImportForm } from './ImportForm';

export const metadata = { title: 'Import patients — Adherix' };

export default async function ImportPage() {
  const user = await requireUser();

  return (
    <div className="shell">
      <Topbar clinicName={user.clinicName} email={user.email} />
      <div className="import-header">
        <h1 className="import-heading">Import patients</h1>
        <p className="import-sub">
          Upload a CSV roster or a PDF from your EHR. Review the parsed patients,
          edit any rows, then confirm. Existing phone numbers are skipped automatically.
        </p>
      </div>
      <ImportForm />
    </div>
  );
}
