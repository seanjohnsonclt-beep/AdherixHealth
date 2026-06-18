import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { Topbar } from '@/app/_components/Topbar';
import { acknowledgeAction } from './actions';
import Link from 'next/link';

const CLINICAL_STAGES: Record<number, string> = {
  0: 'Initiation',
  1: 'Dose Stabilization',
  2: 'Adherence Building',
  3: 'Risk Window',
  4: 'Taper Management',
  5: 'Maintenance',
};

type ReviewRow = {
  id: string;
  patient_id: string;
  first_name: string | null;
  current_phase: number;
  patient_trajectory: string | null;
  message_body: string;
  created_at: Date;
  matched_keywords: string[] | null;
};

type ReplyRow = {
  id: string;
  patient_id: string;
  first_name: string | null;
  current_phase: number;
  patient_status: string;
  body: string;
  created_at: Date;
  triggered_event: string | null;
  keyword_flagged: boolean;
  prev_outbound: string | null;
};

function relTime(d: Date | string): string {
  const ms = Date.now() - new Date(d).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function triggerLabel(
  event: string | null,
  keywordFlagged: boolean
): { label: string; color: string } | null {
  if (event === 'injection_confirmed')      return { label: 'Dose confirmed',  color: 'var(--good)' };
  if (event === 'injection_missed')         return { label: 'Dose missed',     color: 'var(--warn)' };
  if (event === 'dc_escalated_by_patient')  return { label: 'DC escalated',    color: 'var(--urgent)' };
  if (keywordFlagged)                       return { label: 'Keyword flagged', color: 'var(--warn)' };
  return null;
}

export default async function RepliesPage() {
  const user = await requireUser();

  // Keyword review queue - messages that matched uncertainty/friction keywords
  // Wrapped in try/catch: 0006 migration may not be applied yet
  let reviewRows: ReviewRow[] = [];
  try {
    reviewRows = await query<ReviewRow>(
      `select
         kq.id,
         kq.patient_id,
         p.first_name,
         p.current_phase,
         kq.patient_trajectory,
         kq.message_body,
         kq.created_at,
         isl.matched_keywords
       from keyword_review_queue kq
       join patients p on p.id = kq.patient_id
       left join lateral (
         select matched_keywords
         from inbound_scan_log
         where patient_id = kq.patient_id
           and body_raw   = kq.message_body
           and created_at between kq.created_at - interval '10 seconds'
                               and kq.created_at + interval '10 seconds'
         order by created_at desc
         limit 1
       ) isl on true
       where kq.clinic_id = $1
         and kq.reviewed  = false
       order by kq.created_at desc
       limit 30`,
      [user.clinicId]
    );
  } catch { /* 0006 migration not yet applied - degrade gracefully */ }

  // Recent inbound replies, annotated with what each one triggered
  let replies: ReplyRow[] = [];
  try {
    replies = await query<ReplyRow>(
      `select
         m.id,
         m.patient_id,
         p.first_name,
         p.current_phase,
         p.status as patient_status,
         m.body,
         m.created_at,
         (
           select e.kind
           from events e
           where e.patient_id = m.patient_id
             and e.kind in ('injection_confirmed', 'injection_missed', 'dc_escalated_by_patient')
             and e.created_at between m.created_at - interval '30 seconds'
                                  and m.created_at + interval '60 seconds'
           order by e.created_at asc
           limit 1
         ) as triggered_event,
         exists (
           select 1 from keyword_review_queue kq
           where kq.patient_id  = m.patient_id
             and kq.message_body = m.body
             and kq.created_at  between m.created_at - interval '30 seconds'
                                     and m.created_at + interval '60 seconds'
         ) as keyword_flagged,
         (
           select body
           from messages
           where patient_id = m.patient_id
             and direction   = 'outbound'
             and status      = 'sent'
             and coalesce(sent_at, scheduled_for, created_at) < m.created_at
           order by coalesce(sent_at, scheduled_for, created_at) desc
           limit 1
         ) as prev_outbound
       from messages m
       join patients p on p.id = m.patient_id and p.clinic_id = $1
       where m.direction = 'inbound'
       order by m.created_at desc
       limit 60`,
      [user.clinicId]
    );
  } catch {
    // Fall back if keyword_review_queue subquery fails (0006 not yet applied)
    try {
      replies = await query<ReplyRow>(
        `select
           m.id, m.patient_id, p.first_name, p.current_phase,
           p.status as patient_status, m.body, m.created_at,
           null::text as triggered_event,
           false      as keyword_flagged,
           null::text as prev_outbound
         from messages m
         join patients p on p.id = m.patient_id and p.clinic_id = $1
         where m.direction = 'inbound'
         order by m.created_at desc
         limit 60`,
        [user.clinicId]
      );
    } catch { /* db error - show empty */ }
  }

  return (
    <div className="shell">
      <Topbar clinicName={user.clinicName} email={user.email} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28 }}>Replies</h1>
          <p className="small muted" style={{ marginTop: 6 }}>
            Inbound messages from your patients
          </p>
        </div>
        {reviewRows.length > 0 && (
          <span className="pill flagged" style={{ fontSize: 12, alignSelf: 'center' }}>
            {reviewRows.length} need{reviewRows.length === 1 ? 's' : ''} review
          </span>
        )}
      </div>

      {/* Needs Review section - keyword/friction matches waiting for a human */}
      {reviewRows.length > 0 && (
        <div className="section">
          <div className="section-head">
            <h2>Needs review</h2>
            <span className="small faint">{reviewRows.length} unreviewed</span>
          </div>

          <div style={{ marginBottom: 10, fontSize: 13, color: 'var(--fg-muted)' }}>
            These replies matched side-effect or friction keywords. Acknowledge once reviewed.
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phase</th>
                <th>Message</th>
                <th>Keywords</th>
                <th>Received</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reviewRows.map((row) => (
                <tr key={row.id}>
                  <td className="name">
                    <Link href={`/patients/${row.patient_id}`}>
                      {row.first_name || '-'}
                    </Link>
                  </td>
                  <td className="small muted">
                    Ph {row.current_phase}
                    {CLINICAL_STAGES[row.current_phase]
                      ? ` · ${CLINICAL_STAGES[row.current_phase]}`
                      : ''}
                  </td>
                  <td style={{ maxWidth: 300 }}>
                    <span style={{ fontStyle: 'italic', color: 'var(--fg-muted)' }}>
                      &ldquo;{row.message_body}&rdquo;
                    </span>
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    {row.matched_keywords && row.matched_keywords.length > 0 ? (
                      <span className="small" style={{ color: 'var(--warn)', fontWeight: 500 }}>
                        {row.matched_keywords.slice(0, 3).join(', ')}
                        {row.matched_keywords.length > 3
                          ? ` +${row.matched_keywords.length - 3}`
                          : ''}
                      </span>
                    ) : (
                      <span className="small faint">-</span>
                    )}
                  </td>
                  <td className="small mono muted">{relTime(row.created_at)}</td>
                  <td>
                    <form action={acknowledgeAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <button
                        type="submit"
                        className="btn btn--ghost"
                        style={{ fontSize: 12, padding: '4px 10px' }}
                      >
                        Acknowledge
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent replies feed */}
      <div className="section">
        <div className="section-head">
          <h2>Recent replies</h2>
          <span className="small faint mono">{replies.length} shown</span>
        </div>

        {replies.length === 0 ? (
          <div className="empty">
            <p>No replies yet. Once patients respond to SMS messages, they will appear here.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phase</th>
                <th>Reply</th>
                <th>Received</th>
                <th>Triggered</th>
              </tr>
            </thead>
            <tbody>
              {replies.map((r) => {
                const trig = triggerLabel(r.triggered_event, Boolean(r.keyword_flagged));
                return (
                  <tr key={r.id}>
                    <td className="name">
                      <Link href={`/patients/${r.patient_id}`}>
                        {r.first_name || '-'}
                      </Link>
                      {r.patient_status === 'flagged' && (
                        <span
                          className="pill flagged"
                          style={{ fontSize: 10, marginLeft: 6, verticalAlign: 'middle' }}
                        >
                          Flagged
                        </span>
                      )}
                    </td>
                    <td className="small muted">Ph {r.current_phase}</td>
                    <td style={{ maxWidth: 400 }}>
                      <span style={{ fontStyle: 'italic', color: 'var(--fg-muted)' }}>
                        &ldquo;{r.body}&rdquo;
                      </span>
                      {r.prev_outbound && (
                        <div
                          className="small faint"
                          style={{
                            marginTop: 5,
                            paddingLeft: 8,
                            borderLeft: '2px solid var(--line-strong)',
                            lineHeight: 1.4,
                          }}
                        >
                          {r.prev_outbound}
                        </div>
                      )}
                    </td>
                    <td className="small mono muted">{relTime(r.created_at)}</td>
                    <td>
                      {trig ? (
                        <span className="small" style={{ color: trig.color, fontWeight: 500 }}>
                          {trig.label}
                        </span>
                      ) : (
                        <span className="small faint">-</span>
                      )}
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
