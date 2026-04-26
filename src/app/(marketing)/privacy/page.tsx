import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Adherix Health',
  description: 'How Adherix Health collects, uses, and protects data for clinic operators and patient programs.',
};

export default function PrivacyPage() {
  return (
    <div className="mkt-legal">
      <div className="mkt-container mkt-legal__body">

        <div className="mkt-legal__head">
          <span className="mkt-eyebrow">Legal</span>
          <h1 className="mkt-h1">Privacy Policy</h1>
          <p className="mkt-legal__meta">Last updated: April 26, 2026</p>
        </div>

        <section>
          <h2>1. Who we are</h2>
          <p>
            Adherix Health (&ldquo;Adherix,&rdquo; &ldquo;we,&rdquo; &ldquo;our&rdquo;) is a behavioral adherence
            platform for GLP-1 treatment programs. We provide SMS-based patient engagement infrastructure
            to healthcare clinics and metabolic care programs (&ldquo;Clinic Operators&rdquo;).
          </p>
          <p>
            Contact: <a href="mailto:hello@adherix.health">hello@adherix.health</a>
          </p>
        </section>

        <section>
          <h2>2. Scope</h2>
          <p>
            This policy covers data collected through our marketing website (adherix-health.vercel.app),
            the Adherix platform accessed by Clinic Operators, and patient-facing SMS interactions
            delivered on behalf of Clinic Operators.
          </p>
          <p>
            Adherix operates as a <strong>Business Associate</strong> under HIPAA when processing
            Protected Health Information (PHI) on behalf of Clinic Operators who are Covered Entities.
            A Business Associate Agreement (BAA) is required before any patient data is processed
            through the Adherix platform in a production clinical environment.
          </p>
        </section>

        <section>
          <h2>3. Data we collect</h2>

          <h3>From Clinic Operators</h3>
          <p>
            When a clinic administrator creates an account or participates in a pilot, we collect:
            name, email address, organization name, and contact information provided during onboarding.
            We use this data to deliver the service, communicate about the platform, and provide support.
          </p>

          <h3>From patient programs (on behalf of Clinic Operators)</h3>
          <p>
            Clinic Operators enroll patients into the Adherix platform. The data we process on their
            behalf includes: patient first name, mobile phone number, timezone, program enrollment date,
            and SMS message history (both outbound messages and inbound replies). This data is provided
            by the Clinic Operator and is processed solely to deliver the behavioral engagement program
            they have configured.
          </p>
          <p>
            We do not collect diagnostic codes, insurance information, clinical notes, or other
            medical records beyond what is necessary to deliver phase-appropriate SMS outreach.
          </p>

          <h3>From website visitors</h3>
          <p>
            Our marketing website may collect standard web analytics data (page views, referral source,
            device type) through analytics tooling. We do not use advertising cookies or sell visitor data.
          </p>
        </section>

        <section>
          <h2>4. How we use data</h2>
          <p>We use data to:</p>
          <ul>
            <li>Deliver phase-based SMS outreach on behalf of Clinic Operators</li>
            <li>Evaluate behavioral triggers and schedule patient communications</li>
            <li>Generate retention analytics and reports for Clinic Operators</li>
            <li>Route escalation alerts to the appropriate clinic staff</li>
            <li>Communicate with Clinic Operators about their account and the platform</li>
            <li>Improve the Adherix platform and behavioral models</li>
          </ul>
          <p>
            We do not sell patient data. We do not use patient data for advertising. We do not share
            patient data with third parties except as necessary to deliver the service (see Section 5).
          </p>
        </section>

        <section>
          <h2>5. Sub-processors</h2>
          <p>
            Adherix uses the following sub-processors to deliver the service. Each has been evaluated
            for compliance with applicable data protection requirements:
          </p>
          <ul>
            <li><strong>Twilio</strong> — SMS delivery infrastructure. Processes patient phone numbers
            and message content to deliver and receive text messages. Twilio is HIPAA-eligible and
            SOC 2 Type II certified.</li>
            <li><strong>Supabase</strong> — Database and authentication infrastructure. Stores clinic,
            patient, and message data. Supabase is HIPAA-eligible and SOC 2 Type II certified.</li>
            <li><strong>Vercel</strong> — Application hosting. Processes request traffic. Vercel is
            SOC 2 Type II certified.</li>
            <li><strong>Resend</strong> — Transactional email delivery for clinic delivery-failure
            alerts. Processes clinic administrator email addresses.</li>
          </ul>
        </section>

        <section>
          <h2>6. Data retention</h2>
          <p>
            Patient and message data is retained for the duration of the clinic&rsquo;s active
            relationship with Adherix plus a reasonable period to support reporting and audit
            obligations. Clinic Operators may request deletion of their patient data by contacting
            us at <a href="mailto:hello@adherix.health">hello@adherix.health</a>. We will action
            deletion requests within 30 days.
          </p>
        </section>

        <section>
          <h2>7. Security</h2>
          <p>
            We maintain technical and organizational safeguards appropriate to the sensitivity of the
            data we process. This includes encryption in transit (TLS 1.2+), encryption at rest,
            role-based access controls, and infrastructure hosted on SOC 2 certified platforms.
            For a detailed description of our security posture, see our{' '}
            <a href="/security">Security page</a>.
          </p>
        </section>

        <section>
          <h2>8. Patient rights and consent</h2>
          <p>
            Clinic Operators are responsible for obtaining appropriate patient consent for SMS
            communications prior to enrolling patients in the Adherix platform. Patients who wish
            to stop receiving messages may reply <strong>STOP</strong> at any time. Adherix honors
            all opt-out requests delivered through the SMS channel.
          </p>
          <p>
            Patients who have questions about how their data is used within a specific clinic&rsquo;s
            program should contact that clinic directly. Adherix processes patient data under the
            direction of the Clinic Operator and does not independently respond to patient data requests
            outside of opt-out handling.
          </p>
        </section>

        <section>
          <h2>9. HIPAA and Business Associate Agreements</h2>
          <p>
            When Adherix processes PHI on behalf of a Covered Entity, a signed Business Associate
            Agreement is required before production use of the platform. Pilot programs that involve
            real patient data require a BAA in place prior to data processing. To request a BAA,
            contact <a href="mailto:hello@adherix.health">hello@adherix.health</a>.
          </p>
        </section>

        <section>
          <h2>10. Changes to this policy</h2>
          <p>
            We may update this policy as the platform evolves. Material changes will be communicated
            to active Clinic Operators by email. Continued use of the platform after notice constitutes
            acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>
            Questions about this policy or data handling practices:{' '}
            <a href="mailto:hello@adherix.health">hello@adherix.health</a>
          </p>
        </section>

      </div>
    </div>
  );
}
