import { signInWithPasswordAction } from '@/app/(auth)/actions';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error;

  return (
    <div className="shell">
      <div className="login-card">
        <h1>Adherix<sup style={{ fontSize: '13px', color: 'var(--fg-muted)', marginLeft: 4 }}>℞</sup></h1>
        <p>Sign in to your account.</p>

        <form action={signInWithPasswordAction}>
          <div className="field">
            <label className="label" htmlFor="email">Work email</label>
            <input className="input" type="email" name="email" id="email" required autoFocus />
          </div>
          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <input className="input" type="password" name="password" id="password" required />
          </div>
          <button className="btn" type="submit">Sign in</button>
        </form>

        {error === 'invalid_credentials' && (
          <p style={{ marginTop: 16, color: 'var(--accent)', fontSize: 13 }}>
            Incorrect email or password. Try again.
          </p>
        )}
        {error === 'missing_fields' && (
          <p style={{ marginTop: 16, color: 'var(--accent)', fontSize: 13 }}>
            Please enter your email and password.
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
