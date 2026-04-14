import { requireUser } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { findPhase } from '@/lib/config';
import { Topbar } from '@/app/_components/Topbar';
import { advancePhaseAction, toggleFlagAction } from '@/app/patients/actions';
import { redirect } from 'next/navigation';
import Link from 'next/link';

type Patient = {
  id: string;
  first_name: string | null;
  phone: string;
  current_phase: number;
  phase_started_at: Date;
  status: string;
  enrolled_at: Date;
  last_inbound_at: Date | null;
};

type Message = {
  id: string;
  direction: 'inbound' | 'outbound';
  template_key: string | null;
  body: string;
  scheduled_for: Date | null;
  sent_at: Date | null;
  status: string;
  created_at: Date;
};

function fmtTime(d: Date | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function maskPhone(p: string): string {
  if (p.length < 4) return p;
  return `••• ••• ${p.slice(-4)}`;
}

export default async function PatientPage({ params }: { params: { id: string } }) {
  const user = await requireUser();

  const patient = await queryOne<Patient>(
    `select id, first_name, phone, current_phase, phase_started_at, status,
            enrolled_at, last_inbound_at
     from patients where id = $1 and clinic_id = $2`,
    [params.id, user.clinicId]
  );

  if (!patient) redirect('/');

  const messages = await query<Message>(
    `select id, direction, template_key, body, scheduled_for, sent_at, status, created_at
     from messages where patient_id = $1
     order by coalesce(sent_at, scheduled_for, created_at) desc
     limit 100`,
    [patient.id]
  );

  const phase = findPhase(patient.current_phase);
  const isFlagged = patient.status === 'flagged';
  const isLastPhase = patient.current_phase >= 5;

  return (
    <div className="shell">
      <Topbar clinicName={user.clinicName} email={user.email} />

      <Link href="/" className="small muted" style={{ border: 'none' }}>← All patients</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12, marginBottom: 32 }}>
        <div>
          <h1>{patient.first_name || 'Patient'}</h1>
          <p className="mono muted" style={{ marginTop: 6 }}>{maskPhone(patient.phone)}</p>
          <p className="small faint" style={{ marginTop: 4 }}>
            Enrolled {fmtTime(patient.enrolled_at)}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className={`pill ${isFlagged ? 'flagged' : 'active'}`}>{patient.status}</span>
          <div style={{ marginTop: 12 }} className="actions">
            {!isLastPhase && (
              <form action={advancePhaseAction}>
                <input type="hidden" name="patient_id" value={patient.id} />
                <button type="submit" className="btn ghost">Advance phase</button>
              </form>
            )}
            <form action={toggleFlagAction}>
              <input type="hidden" name="patient_id" value={patient.id} />
              <button type="submit" className={`btn ${isFlagged ? '' : 'danger'}`}>
                {isFlagged ? 'Un-flag' : 'Flag'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="section">
        <div style={{ padding: '16px 20px', background: 'white', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'baseline' }}>
            <div>
              <div className="label">Current phase</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, marginTop: 4 }}>
                <span className="muted">{patient.current_phase}.</span> {phase?.name ?? '—'}
              </div>
            </div>
            <div>
              <div className="label">Started</div>
              <div className="mono small" style={{ marginTop: 8 }}>{fmtTime(patient.phase_started_at)}</div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="label">&nbsp;</div>
              <div className="small muted" style={{ marginTop: 8 }}>{phase?.description}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <h2>Message timeline</h2>
          <span className="small faint mono">{messages.length} messages</span>
        </div>

        {messages.length === 0 ? (
          <div className="empty"><p>No messages yet.</p></div>
        ) : (
          <div className="timeline">
            {messages.map((m) => (
              <div key={m.id} className={`timeline-item ${m.direction}`}>
                <div className="ts">
                  {m.direction === 'outbound' ? '→' : '←'}{' '}
                  {fmtTime(m.sent_at || m.scheduled_for || m.created_at)}
                </div>
                <div className="body">{m.body}</div>
                <div className="meta">
                  {m.template_key ? `${m.template_key} · ` : ''}{m.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
