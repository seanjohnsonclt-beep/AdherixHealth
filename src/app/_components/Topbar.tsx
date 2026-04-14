import { signOutAction } from '@/app/(auth)/actions';

type Props = {
  clinicName: string;
  email: string;
};

export function Topbar({ clinicName, email }: Props) {
  return (
    <div className="topbar">
      <div>
        <a href="/" className="brand" style={{ border: 'none' }}>
          Adherix<sup>℞</sup>
        </a>
      </div>
      <div className="meta">
        <span>{clinicName}</span>
        <span style={{ margin: '0 12px', color: 'var(--fg-faint)' }}>·</span>
        <span>{email}</span>
        <span style={{ margin: '0 12px', color: 'var(--fg-faint)' }}>·</span>
        <form action={signOutAction} style={{ display: 'inline' }}>
          <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--fg-muted)', cursor: 'pointer', font: 'inherit' }}>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
