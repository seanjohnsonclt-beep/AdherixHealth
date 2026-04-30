import { requireUser } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { findPhase } from '@/lib/config';
import { Topbar } from '@/app/_components/Topbar';
import { PatientActions } from './_components/PatientActions';
import { setNextDoseDayAction } from '@/app/patients/actions';
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
  engagement_trajectory: string | null;
  drift_pattern: string | null;
  dc_resolution_status: string | null;
  next_dose_day: string | null;
};

type Message = {
  id: string;
  direction: 'inbound' | 'outbound';
  template_key: string | null;
  body: string;
  scheduled_for: Date | null;
  sent_at: Date | null;
  status: string;
  error: string | null;
  created_at: Date;
};

type DcEvent = {
  id: string;
  drift_pattern: string;
  fired_at: Date;
  resolution_status: string;
  escalated_at: Date | null;
  resolved_at: Date | null;
  time_to_resolution_hours: number | null;
  message_body: string;
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

function fmtHours(h: number | null): string {
  if (h === null) return '—';
  if (h < 24) return `${Math.round(h)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

function maskPhone(p: string): string {
  if (p.length < 4) return p;
  return `••• ••• ${p.slice(-4)}`;
}

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const PATTERN_LABELS: Record<string, string> = {
  uncertainty: 'Side effect',
  friction:    'Missed dose',
  shame:       'Withdrawal',
  expectation: 'Plateau',
};

const RESOLUTION_LABELS: Record<string, string> = {
  monitoring:    'Monitoring',
  auto_resolved: 'Resolved',
  escalated:     'Escalated',
};

const TRAJECTORY_LABELS: Record<string, string> = {
  responsive:   'Responsive',
  inconsistent: 'Inconsistent',
  declining:    'Declining',
};

export default async function PatientPage({ params }: { params: { id: string } }) {
  const user = await requireUser();

  const patient = await queryOne<Patient>(
    `select id, first_name, phone, current_phase, phase_started_at, status,
            enrolled_at, last_inbound_at, engagement_trajectory,
            drift_pattern, dc_resolution_status, next_dose_day
     from patients where id = $1 and clinic_id = $2`,
    [params.id, user.clinicId]
  );

  if (!patient) redirect('/dashboard');

  const messages = await query<Message>(
    `select id, direction, template_key, body, scheduled_for, sent_at, status, error, created_at
     from messages where patient_id = $1
     order by coalesce(sent_at, scheduled_for, created_at) desc
     limit 100`,
    [patient.id]
  );

  let dcEvents: DcEvent[] = [];
  try {
    dcEvents = await query<DcEvent>(
      `select id, drift_pattern, fired_at, resolution_status,
              escalated_at, resolved_at, time_to_resolution_hours, message_body
       from drift_correction_events
       where patient_id = $1
       order by fired_at desc`,
      [patient.id]
    );
  } catch {
    // Migration not yet applied — degrade gracefully
  }

  const failedCount  = messages.filter(m => m.status === 'failed').length;
  const phase        = findPhase(patient.current_phase);
  const isFlagged    = patient.status === 'flagged';
  const isLastPhase  = patient.current_phase >= 5;
  const trajectory   = patient.engagement_trajectory ?? 'responsive';
  const hasDcEvents  = dcEvents.length > 0;
  const openDcEvent  = dcEvents.find(e => e.resolution_status === 'monitoring' || e.resolution_status === 'escalated');

  return (
    <div className="shell">
      <Topbar clinicName={user.clinicName} email={user.email} />

      <Link href="/dashboard" className="small muted" style={{ border: 'none' }}>← All patients</Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12, marginBottom: 32 }}>
        <div>
          <h1>{patient.first_name || 'Patient'}</h1>
          <p className="mono muted" style={{ marginTop: 6 }}>{maskPhone(patient.phone)}</p>
          <p className="small faint" style={{ marginTop: 4 }}>
            Enrolled {fmtTime(patient.enrolled_at)}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className={`pill ${isFlagged ? 'flagged' : patient.status === 'churned' ? 'flagged' : 'active'}`}>
            {patient.status}
          </span>
          <div style={{ marginTop: 12 }}>
            <PatientActions
              patientId={patient.id}
              firstName={patient.first_name}
              phone={patient.phone}
              status={patient.status}
              currentPhase={patient.current_phase}
              isLastPhase={isLastPhase}
            />
          </div>
        </div>
      </div>

      {/* Phase + trajectory + next dose */}
      <div className="section">
        <div style={{ padding: '16px 20px', background: 'white', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'baseline', flexWrap: 'wrap' }}>
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
            <div>
              <div className="label">Trajectory</div>
              <div className="small" style={{ marginTop: 8 }}>
                <span style={{
                  color: trajectory === 'responsive' ? 'var(--green)' :
                         trajectory === 'declining'  ? 'var(--red)'   : 'var(--amber)',
                  fontWeight: 600,
                }}>
                  {TRAJECTORY_LABELS[trajectory] ?? trajectory}
                </span>
              </div>
            </div>
            <div>
              <div className="label">Injection day</div>
              <form action={setNextDoseDayAction} style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="hidden" name="patient_id" value={patient.id} />
                <select
                  className="input"
                  name="next_dose_day"
                  defaultValue={patient.next_dose_day ?? ''}
                  style={{ fontSize: 12, padding: '3px 6px', height: 'auto', minWidth: 120 }}
                >
                  <option value="">— not set —</option>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <button
                  type="submit"
                  className="btn ghost"
                  style={{ fontSize: 11, padding: '3px 8px' }}
                >
                  Save
                </button>
              </form>
            </div>
            <div style={{ flex: 1 }}>
              <div className="label">&nbsp;</div>
              <div className="small muted" style={{ marginTop: 8 }}>{phase?.description}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Drift Correction panel */}
      {(hasDcEvents || openDcEvent) && (
        <div className="section">
          <div className="section-head">
            <h2>Drift correction</h2>
            {openDcEvent && (
              <span
                className={`pill ${openDcEvent.resolution_status === 'escalated' ? 'flagged' : 'active'}`}
                style={{ fontSize: 11 }}
              >
                {RESOLUTION_LABELS[openDcEvent.resolution_status] ?? openDcEvent.resolution_status}
              </span>
            )}
          </div>

          {openDcEvent && openDcEvent.resolution_status === 'escalated' && (
            <div className="failure-banner failure-banner--soft" style={{ marginBottom: 12 }}>
              <span className="failure-banner__icon">●</span>
              <span>
                <strong>Escalated — staff outreach needed.</strong>
                {' '}Patient did not respond to the {PATTERN_LABELS[openDcEvent.drift_pattern] ?? openDcEvent.drift_pattern} correction message.
              </span>
            </div>
          )}

          <div style={{ border: '1px solid var(--line)', background: 'white' }}>
            {dcEvents.map((ev, i) => {
              const isEscalated = ev.resolution_status === 'escalated';
              const isResolved  = ev.resolution_status === 'auto_resolved';
              return (
                <div key={ev.id} style={{
                  padding: '14px 20px',
                  borderBottom: i < dcEvents.length - 1 ? '1px solid var(--line)' : undefined,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>
                        {PATTERN_LABELS[ev.drift_pattern] ?? ev.drift_pattern}
                      </span>
                      <span className="faint mono" style={{ fontSize: 11 }}>
                        {fmtTime(ev.fired_at)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {isResolved && (
                        <span className="small faint">resolved in {fmtHours(ev.time_to_resolution_hours)}</span>
                      )}
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: isEscalated ? 'var(--red)' : isResolved ? 'var(--green)' : 'var(--amber)',
                      }}>
                        {RESOLUTION_LABELS[ev.resolution_status] ?? ev.resolution_status}
                      </span>
                    </div>
                  </div>
                  {ev.message_body && (
                    <p className="small muted" style={{ marginTop: 6, lineHeight: 1.5 }}>
                      {ev.message_body}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Message timeline */}
      <div className="section">
        <div className="section-head">
          <h2>Message timeline</h2>
          <span className="small faint mono">{messages.length} messages</span>
        </div>

        {failedCount > 0 && (
          <div className="failure-banner failure-banner--soft">
            <span className="failure-banner__icon">●</span>
            <span>
              <strong>{failedCount} message{failedCount > 1 ? 's' : ''} pending carrier retry.</strong>
              {' '}We'll retry automatically. If the issue persists, verify the patient's number.
            </span>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="empty"><p>No messages yet.</p></div>
        ) : (
          <div className="timeline">
            {messages.map((m) => {
              const isFailed = m.status === 'failed';
              const statusLabel = isFailed ? 'Retry pending' : m.status;
              return (
                <div key={m.id} className={`timeline-item ${m.direction}${isFailed ? ' failed' : ''}`}>
                  <div className="ts">
                    {m.direction === 'outbound' ? '→' : '←'}{' '}
                    {fmtTime(m.sent_at || m.scheduled_for || m.created_at)}
                  </div>
                  <div className="body">{m.body}</div>
                  <div className={`meta${isFailed ? ' meta--soft' : ''}`}>
                    {m.template_key ? `${m.template_key} · ` : ''}{statusLabel}
                    {isFailed && m.error && (
                      <span className="error-detail"> — carrier held</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
