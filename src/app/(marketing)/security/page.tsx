import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security | Adherix Health',
  description: 'How Adherix Health protects clinic and patient data. Infrastructure, encryption, access controls, and HIPAA posture.',
};

export default function SecurityPage() {
  return (
    <div className="mkt-legal">
      <div className="mkt-container mkt-legal__body">

        <div className="mkt-legal__head">
          <span className="mkt-eyebrow">Security</span>
          <h1 className="mkt-h1">Our security posture</h1>
          <p className="mkt-legal__meta">Last updated: April 26, 2026</p>
        </div>

        <p className="mkt-legal__lede">
          Adherix processes patient behavioral data and SMS communications on behalf of healthcare
          clinics. The following describes how we protect that data across infrastructure,
          transmission, access, and operations.
        </p>

        <section>
          <h2>Infrastructure</h2>
          <p>
            The Adherix platform is hosted on enterprise-grade cloud infrastructure with SOC 2
            Type II certification. Our database, application layer, and communications infrastructure
            are each operated by providers that maintain independent third-party security audits
            and support HIPAA-eligible deployments. We select infrastructure partners on the basis
            of their compliance certifications, not cost alone.
          </p>
          <p>
            All patient and clinic data is stored in the United States.
          </p>
        </section>

        <section>
          <h2>Encryption</h2>
          <ul>
            <li>
              <strong>In transit:</strong> All data between clients, the Adherix application, and
              our infrastructure is encrypted using TLS 1.2 or higher. This applies to browser
              sessions, API calls, database connections, and SMS delivery pipelines.
            </li>
            <li>
              <strong>At rest:</strong> Patient and clinic data stored in our database is encrypted
              at rest using AES-256.
            </li>
            <li>
              <strong>SMS content:</strong> Message content is transmitted over encrypted channels
              and stored in our encrypted database to support the behavioral engine and clinic
              reporting.
            </li>
          </ul>
        </section>

        <section>
          <h2>Access controls</h2>
          <ul>
            <li>
              <strong>Authentication:</strong> Clinic administrator accounts use email/password
              authentication with JWT-based session management. Sessions are scoped and expire
              on inactivity.
            </li>
            <li>
              <strong>Multi-tenant isolation:</strong> All patient data is scoped to a clinic
              identifier enforced at the application layer. No clinic can access another
              clinic&rsquo;s data. This isolation is structural, not policy-dependent.
            </li>
            <li>
              <strong>Principle of least privilege:</strong> Service credentials are scoped to
              the minimum permissions required for each function. Internal API endpoints that
              process patient data require authenticated sessions.
            </li>
            <li>
              <strong>Audit trail:</strong> All patient state changes, message events, and
              trigger firings are recorded in an append-only event log for each clinic.
            </li>
          </ul>
        </section>

        <section>
          <h2>HIPAA posture</h2>
          <p>
            Adherix is designed for HIPAA-aware deployments. Our infrastructure partners maintain
            HIPAA-eligible environments, and we apply the minimum necessary standard to all
            patient data we process — collecting only what is required to deliver phase-based
            behavioral outreach.
          </p>
          <p>
            We require a signed <strong>Business Associate Agreement (BAA)</strong> with any
            Clinic Operator that is a HIPAA Covered Entity before processing Protected Health
            Information in a production environment. Pilot programs involving real patient data
            are subject to this requirement.
          </p>
          <p>
            To request a BAA, contact{' '}
            <a href="mailto:hello@adherix.health">hello@adherix.health</a>.
          </p>
        </section>

        <section>
          <h2>Incident response</h2>
          <p>
            In the event of a confirmed breach affecting patient or clinic data, Adherix will
            notify affected Clinic Operators within 72 hours of discovery, consistent with HIPAA
            Breach Notification Rule requirements. Notifications will describe the nature of the
            incident, affected data categories, and remediation actions taken.
          </p>
        </section>

        <section>
          <h2>Vulnerability disclosure</h2>
          <p>
            If you discover a potential security issue in the Adherix platform, please report it
            to <a href="mailto:hello@adherix.health">hello@adherix.health</a> before public
            disclosure. We will acknowledge receipt within 48 hours and work to resolve confirmed
            issues promptly.
          </p>
        </section>

        <section>
          <h2>Questions</h2>
          <p>
            Security questions, BAA requests, or sub-processor inquiries:{' '}
            <a href="mailto:hello@adherix.health">hello@adherix.health</a>
          </p>
        </section>

      </div>
    </div>
  );
}
