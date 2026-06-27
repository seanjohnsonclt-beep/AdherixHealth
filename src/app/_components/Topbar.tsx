import { signOutAction } from '@/app/(auth)/actions';

type Props = {
  clinicName: string;
  email: string;
};

export function Topbar({ clinicName, email }: Props) {
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 28 }}>
        <a href="/dashboard" className="brand" style={{ border: 'none' }}>
          MyAdherix
        </a>
        <nav style={{ display: 'flex', gap: 20 }}>
          <a href="/dashboard"     style={{ fontSize: 14, color: 'var(--fg-muted)', border: 'none' }} title="View and manage all enrolled patients">Patients</a>
          <a href="/replies"       style={{ fontSize: 14, color: 'var(--fg-muted)', border: 'none' }} title="Inbound patient replies and keyword review queue">Replies</a>
          <a href="/reports"       style={{ fontSize: 14, color: 'var(--fg-muted)', border: 'none' }} title="Retention outcomes, engagement analytics, and message performance">Reports</a>
          <a href="/roi"           style={{ fontSize: 14, color: 'var(--fg-muted)', border: 'none' }} title="Estimate revenue protected by retention automation">ROI</a>
          <a href="/admin/rewards" style={{ fontSize: 14, color: 'var(--fg-muted)', border: 'none' }} title="Quest reward fulfillment queue">Rewards</a>
        </nav>
      </div>
      <div className="meta">
        <span>{clinicName}</span>
        <span style={{ margin: '0 12px', color: 'var(--fg-faint)' }}>&middot;</span>
        <span>{email}</span>
        <span style={{ margin: '0 12px', color: 'var(--fg-faint)' }}>&middot;</span>
        <form action={signOutAction} style={{ display: 'inline' }}>
          <button type="submit" className="btn-ghost" style={{ fontSize: 13 }}>Sign out</button>
        </form>
      </div>
    </div>
  );
}
