import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { findPhase } from '@/lib/config';
import { Topbar } from '@/app/_components/Topbar';
import Link from 'next/link';

type PatientRow = {
  id: string;
  first_name: string | null;
  phone: string;
  current_phase: number;
  status: string;
  enrolled_at: Date;
  last_inbound_at: Date | null;
};

function relativeTime(d: Date | null): string {
  if (!d) return 'never';
  const ms = Date.now() - new Date(d).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d2 = Math.floor(hr / 24);
  return `${d2}d ago`;
}

function maskPhone(p: string): string {
  if (p.length < 4) return p;
  return `••• ••• ${p.slice(-4)}`;
}

export default async function HomePage() {
  const user = await requireUser();

  const patients = await query<PatientRow>(
    `select id, first_name, phone, current_phase, status, enrolled_at, last_inbound_at
     from patients
     where clinic_id = $1
     order by status = 'flagged' desc, last_inbound_at desc nulls last`,
    [user.clinicId]
  );

  const active = patients.filter((p) => p.status === 'active').length;
  const flagged = patients.filter((p) => p.status === 'flagged').length;

  return (
    <div className="shell">
      <Topbar clinicName={user.clinicName} email={user.email} />

      <div className="stat-row">
        <div className="stat">
          <div className="num">{patients.length}</div>
          <div className="lbl">Enrolled</div>
        </div>
        <div className="stat">
          <div className="num">{active}</div>
          <div className="lbl">Active</div>
        </div>
        <div className={`stat ${flagged > 0 ? 'flagged' : ''}`}>
          <div className="num">{flagged}</div>
          <div className="lbl">Flagged</div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2>Patients</h2>
          <Link href="/patients/new" className="btn">Enroll patient</Link>
        </div>

        {patients.length === 0 ? (
          <div className="empty">
            <div className="num">No patients yet</div>
            <p style={{ marginTop: 12 }}>Enroll one to start the behavior loop.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Phase</th>
                <th>Last reply</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => {
                const phase = findPhase(p.current_phase);
                return (
                  <tr key={p.id}>
                    <td className="name">
                      <Link href={`/patients/${p.id}`}>{p.first_name || '—'}</Link>
                    </td>
                    <td className="mono">{maskPhone(p.phone)}</td>
                    <td>
                      <span className="muted small">{p.current_phase}.</span> {phase?.name ?? '—'}
                    </td>
                    <td className="mono small muted">{relativeTime(p.last_inbound_at)}</td>
                    <td>
                      <span className={`pill ${p.status === 'flagged' ? 'flagged' : 'active'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
