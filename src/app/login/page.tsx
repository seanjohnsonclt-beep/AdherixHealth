import { signInWithPasswordAction, sendMagicLinkAction } from '@/app/(auth)/actions';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; magic?: string; email?: string };
}) {
  const { error, magic, email } = searchParams;

  // Magic link sent  -  show confirmation
  if (magic === 'sent') {
    return (
      <div className="shell">
        <div className="login-card">
          <h1>MyAdherix</h1>
          <p style={{ marginTop: 8 }}>
            We sent a sign-in link to <strong>{email}</strong>.
          </p>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-muted)' }}>
            Check your inbox and click the link  -  no password needed.
            The link expires in 1 hour.
          </p>
          <div className="footer" style={{ marginTop: 32 }}>
            <a href="/login" style={{ fontSize: 13 }}>Back to sign in</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <div className="login-card">
        <h1>MyAdherix</h1>

        {/* -- Magic link (primary for clinic onboarding) -- */}
        <p style={{ marginBottom: 16 }}>Enter your work email to get a sign-in link.</p>
        <form action={sendMagicLinkAction}>
          <div className="field">
            <label className="label" htmlFor="magic-email">Work email</label>
            <input
              className="input"
              type="email"
              name="email"
              id="magic-email"
              required
              autoFocus
              placeholder="you@clinic.com"
            />
          </div>
          <button className="btn" type="submit" style={{ width: '100%' }}>
            Send me a link
          </button>
        </form>

        {/* -- Divider -- */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          margin: '24px 0', color: 'var(--text-muted)', fontSize: 13,
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          or sign in with password
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* -- Password form (for existing admin accounts) -- */}
        <form action={signInWithPasswordAction}>
          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <input className="input" type="email" name="email" id="email" required />
          </div>
          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <input className="input" type="password" name="password" id="password" required />
          </div>
          <button className="btn btn--ghost" type="submit" style={{ width: '100%' }}>
            Sign in with password
          </button>
        </form>

        {/* -- Error states -- */}
        {error === 'invalid_credentials' && (
          <p style={{ marginTop: 16, color: 'var(--accent)', fontSize: 13 }}>
            Incorrect email or password. Try again or use the magic link above.
          </p>
        )}
        {error === 'missing_fields' && (
          <p style={{ marginTop: 16, color: 'var(--accent)', fontSize: 13 }}>
            Please enter your email and password.
          </p>
        )}
        {error === 'missing_email' && (
          <p style={{ marginTop: 16, color: 'var(--accent)', fontSize: 13 }}>
            Please enter your email address.
          </p>
        )}
        {error === 'magic_link_failed' && (
          <p style={{ marginTop: 16, color: 'var(--accent)', fontSize: 13 }}>
            Couldn't send the link. Check the email address and try again.
          </p>
        )}
        {error === 'no_clinic' && (
          <p style={{ marginTop: 16, color: 'var(--accent)', fontSize: 13 }}>
            That account isn't provisioned to a clinic yet. Contact Adherix.
          </p>
        )}
        {error === 'auth' && (
          <p style={{ marginTop: 16, color: 'var(--accent)', fontSize: 13 }}>
            Sign-in link expired or already used. Request a new one above.
          </p>
        )}

        <div className="footer">
          Behavioral infrastructure for GLP-1 programs.
        </div>
      </div>
    </div>
  );
}
