import { sendMagicLinkAction } from '@/app/(auth)/actions';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { sent?: string; error?: string };
}) {
  const sent = searchParams.sent === '1';
  const error = searchParams.error;

  return (
    <div className="shell">
      <div className="login-card">
        <h1>Adherix<sup style={{ fontSize: '13px', color: 'var(--fg-muted)', marginLeft: 4 }}>℞</sup></h1>
        <p>Sign in with a magic link.</p>

        {sent ? (
          <div style={{ padding: 16, background: 'var(--bg)', border: '1px solid var(--line)', fontSize: 14 }}>
            Check your email. The link is valid for 1 hour.
          </div>
        ) : (
          <form action={sendMagicLinkAction}>
            <div className="field">
              <label className="label" htmlFor="email">Work email</label>
              <input className="input" type="email" name="email" id="email" required autoFocus />
            </div>
            <button className="btn" type="submit">Send link</button>
          </form>
        )}

        {error === 'send_failed' && (
          <p style={{ marginTop: 16, color: 'var(--accent)', fontSize: 13 }}>
            Something went wrong. Try again.
          </p>
        )}
        {error === 'no_clinic' && (
          <p style={{ marginTop: 16, color: 'var(--accent)', fontSize: 13 }}>
            That account isn't provisioned to a clinic yet. Contact Adherix.
          </p>
        )}

        <div className="footer">
          Behavioral infrastructure for GLP-1 programs.
        </div>
      </div>
    </div>
  );
}
