import { signOutAction } from '@/app/(auth)/actions';

type Props = {
  clinicName: string;
  email: string;
};

export function Topbar({ clinicName, email }: Props) {
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 28 }}>
        <a href="/" className="brand" style={{ border: 'none' }}>
          Adherix<sup>℞</sup>
        </a>
        <nav style={{ display: 'flex', gap: 20 }}>
          <a href="/" style={{ fontSize: 14, color: 'var(--fg-muted)', border: 'none' }}>Patients</a>
          <a href="/reports" style={{ fontSize: 14, color: 'var(--fg-muted)', border: 'none' }}>Reports</a>
        </nav>
      </div>
      <div className="meta">
        <span>{clinicName}</span>
        <span style={{ margin: '0 12px', color: 'var(--fg-faint)' }}>·</span>
        <span>{email}</span>
        <span style={{ margin: '0 12px', color: 'var(--fg-faint)' }}>·</span>
        <form action={signOutAction} style={{ display: 'inline' }}>
          <button type="submit" className="btn-ghost" style={{ fontSize: 13 }}>Sign out</button>
        </form>
      </div>
    </div>
  );
}
     