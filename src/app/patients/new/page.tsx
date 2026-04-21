import { requireUser } from '@/lib/auth';
import { Topbar } from '@/app/_components/Topbar';
import { enrollPatientAction } from '@/app/patients/actions';
import Link from 'next/link';

export default async function NewPatientPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await requireUser();

  return (
    <div className="shell">
      <Topbar clinicName={user.clinicName} email={user.email} />

      <div style={{ maxWidth: 440 }}>
        <Link href="/dashboard" className="small muted" style={{ border: 'none' }}>← All patients</Link>
        <h1 style={{ marginTop: 12, marginBottom: 8 }}>Enroll patient</h1>
        <p className="muted small" style={{ marginBottom: 24 }}>
          The first message goes out within 5 minutes of enrollment.
        </p>

        <form action={enrollPatientAction}>
          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="first_name">First name</label>
            <input className="input" type="text" name="first_name" id="first_name" autoFocus />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="label" htmlFor="phone">Phone (US)</label>
            <input className="input" type="tel" name="phone" id="phone" placeholder="(555) 123-4567" required />
            <p className="small faint" style={{ marginTop: 6 }}>
              Patient will receive an SMS asking them to reply YES to begin.
            </p>
          </div>

          {searchParams.error === 'invalid_phone' && (
            <p style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 16 }}>
              That phone number doesn't look right.
            </p>
          )}

          <div className="actions">
            <button className="btn" type="submit">Enroll &amp; start</button>
            <Link href="/dashboard" className="btn ghost">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
