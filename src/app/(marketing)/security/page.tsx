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
          Adherix handles patient phone numbers, behavioral data, and SMS message content on behalf
          of healthcare clinics. We take that responsibility seriously. Below is a plain-language
          description of how we protect that data.
        </p>

        <section>
          <h2>Infrastructure</h2>
          <p>
            The Adherix platform runs on infrastructure operated by providers that have completed
            independent SOC 2 Type II audits and support HIPAA-eligible deployments:
          </p>
          <ul>
            <li>
              <strong>Vercel</strong> — Application hosting and edge delivery. SOC 2 Type II certified.
              All traffic is served over TLS. No patient data is stored at the edge layer.
            </li>
            <li>
              <strong>Supabase</strong> — PostgreSQL database and authentication. SOC 2 Type II
              certified, HIPAA-eligible. Database is deployed in the AWS us-west-2 region.
              Supabase encrypts data at rest using AES-256.
            </li>
            <li>
              <strong>Twilio</strong> — SMS delivery and inbound message handling. SOC 2 Type II
              certified, HIPAA-eligible. All API communication over TLS. Twilio is the only
              sub-processor with access to patient phone numbers for message delivery.
            </li>
            <li>
              <strong>Resend</strong> — Transactional email for clinic delivery-failure alerts.
              Processes clinic administrator email addresses only — no patient data.
            </li>
          </ul>
        </section>

        <section>
          <h2>Encryption</h2>
          <ul>
            <li>
              <strong>In transit:</strong> All data moving between clients, the Adherix application,
              and our infrastructure is encrypted using TLS 1.2 or higher. This includes browser
              sessions, API calls, and database connections.
            </li>
            <li>
              <strong>At rest:</strong> Patient and clinic data stored in Supabase is encrypted
              at rest using AES-256, managed by Supabase&rsquo;s infrastructure layer.
            </li>
            <li>
              <strong>SMS content:</strong> Message bodies are transmitted over Twilio&rsquo;s
              encrypted API. Message content is stored in our database (encrypted at rest) to
              support the behavioral engine and clinic reporting.
            </li>
          </ul>
        </section>

        <section>
          <h2>Access controls</h2>
          <ul>
            <li>
              <strong>Authentication:</strong> Clinic administrator accounts are authenticated
              through Supabase Auth using email/password with JWT-based session management.
            </li>
            <li>
              <strong>Multi-tenant isolation:</strong> All patient data is scoped to a
              <code>clinic_id</code>. Queries are enforced at the application layer to prevent
              cross-clinic data access. A clinic administrator can only access data belonging
              to their own organization.
            </li>
            <li>
              <strong>API access:</strong> Internal API endpoints that process patient data
              require authenticated sessions. The behavioral engine cron endpoint is rate-limited
              and will be secured with signed tokens prior to production clinical deployment.
            </li>
            <li>
              <strong>Principle of least privilege:</strong> Service accounts and API keys are
              scoped to the minimum permissions required to perform their function.
            </li>
          </ul>
        </section>

        <section>
          <h2>HIPAA posture</h2>
          <p>
            Adherix is designed with HIPAA compliance in mind. Our infrastructure sub-processors
            (Supabase, Twilio) are HIPAA-eligible and can enter into Business Associate Agreements.
            We require a signed BAA with any Clinic Operator that is a HIPAA Covered Entity before
            processing Protected Health Information in a production environment.
          </p>
          <p>
            The minimum necessary principle guides our data model: we collect only the patient
            information required to deliver phase-based SMS outreach — first name, phone number,
            timezone, and program enrollment state. We do not collect or store clinical notes,
            diagnostic codes, insurance information, or other categories of PHI beyond what
            the behavioral engine requires.
          </p>
          <p>
            To request a Business Associate Agreement, contact{' '}
            <a href="mailto:hello@adherix.health">hello@adherix.health</a>.
          </p>
        </section>

        <section>
          <h2>Vulnerability disclosure</h2>
          <p>
            If you discover a security vulnerability in the Adherix platform, please report it
            responsibly to <a href="mailto:hello@adherix.health">hello@adherix.health</a> before
            public disclosure. We will acknowledge receipt within 48 hours and work to resolve
            confirmed vulnerabilities promptly.
          </p>
          <p>
            We do not currently operate a formal bug bounty program but will acknowledge responsible
            disclosures publicly if the reporter consents.
          </p>
        </section>

        <section>
          <h2>Incident response</h2>
          <p>
            In the event of a confirmed data breach affecting patient or clinic data, Adherix will
            notify affected Clinic Operators within 72 hours of discovery, consistent with HIPAA
            Breach Notification Rule requirements. Notifications will include the nature of the
            incident, data categories affected, and remediation steps taken.
          </p>
        </section>

        <section>
          <h2>Questions</h2>
          <p>
            Security questions or BAA requests:{' '}
            <a href="mailto:hello@adherix.health">hello@adherix.health</a>
          </p>
        </section>

      </div>
    </div>
  );
}
