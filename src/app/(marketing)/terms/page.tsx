import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Adherix Health',
  description: 'Terms governing use of the Adherix Health platform by clinic operators and authorized users.',
};

export default function TermsPage() {
  return (
    <div className="mkt-legal">
      <div className="mkt-container mkt-legal__body">

        <div className="mkt-legal__head">
          <span className="mkt-eyebrow">Legal</span>
          <h1 className="mkt-h1">Terms of Service</h1>
          <p className="mkt-legal__meta">Last updated: April 26, 2026</p>
        </div>

        <section>
          <h2>1. Acceptance</h2>
          <p>
            By accessing or using the Adherix Health platform (&ldquo;Service&rdquo;), you agree to
            be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you are accessing the Service
            on behalf of a clinic, healthcare organization, or other entity, you represent that you have
            authority to bind that entity and these Terms apply to it.
          </p>
          <p>
            If you do not agree to these Terms, do not use the Service.
          </p>
        </section>

        <section>
          <h2>2. Description of service</h2>
          <p>
            Adherix Health provides a behavioral adherence platform for GLP-1 treatment programs.
            The Service enables Clinic Operators to enroll patients in phase-based SMS engagement
            programs, monitor engagement signals, and receive alerts when patient behavior crosses
            defined thresholds.
          </p>
          <p>
            The Service is currently available in a <strong>pilot and demonstration capacity</strong>.
            Clinic Operators acknowledge that the platform is in active development and features,
            availability, and pricing are subject to change.
          </p>
        </section>

        <section>
          <h2>3. Accounts and access</h2>
          <p>
            Clinic Operators are responsible for maintaining the security of their account credentials.
            You may not share credentials or permit unauthorized users to access the platform on your
            behalf. You are responsible for all activity that occurs under your account.
          </p>
          <p>
            Adherix reserves the right to suspend or terminate accounts that violate these Terms or
            that are used in a manner that creates risk for the platform or other users.
          </p>
        </section>

        <section>
          <h2>4. Clinic operator responsibilities</h2>
          <p>Clinic Operators agree to:</p>
          <ul>
            <li>Obtain appropriate patient consent for SMS communications before enrolling patients
            in the Adherix platform, in compliance with TCPA, HIPAA, and applicable state law</li>
            <li>Use the platform only for lawful purposes and only in connection with legitimate
            patient care programs</li>
            <li>Ensure that patient data provided to Adherix is accurate and obtained in compliance
            with applicable privacy law</li>
            <li>Honor patient opt-out requests promptly and not re-enroll patients who have
            opted out without their renewed explicit consent</li>
            <li>Execute a Business Associate Agreement with Adherix prior to processing any
            Protected Health Information through the platform in a production clinical environment</li>
            <li>Not use the Service to send unsolicited communications, spam, or messages
            unrelated to the patient&rsquo;s enrolled program</li>
          </ul>
        </section>

        <section>
          <h2>5. Data ownership</h2>
          <p>
            Clinic Operators retain ownership of their patient data. Adherix processes patient data
            as a service provider acting under the Clinic Operator&rsquo;s direction. We do not claim
            ownership of patient data and do not use it for purposes beyond delivering the Service
            and improving the platform&rsquo;s behavioral models.
          </p>
          <p>
            Adherix retains ownership of the platform, behavioral engine, phase logic, trigger
            architecture, and all intellectual property embedded in the Service.
          </p>
        </section>

        <section>
          <h2>6. Acceptable use</h2>
          <p>You may not use the Service to:</p>
          <ul>
            <li>Violate any applicable law or regulation, including HIPAA, TCPA, or state SMS marketing laws</li>
            <li>Transmit harmful, fraudulent, or misleading content to patients</li>
            <li>Attempt to reverse engineer, copy, or replicate the Adherix behavioral engine or platform</li>
            <li>Interfere with the operation of the Service or the infrastructure it runs on</li>
            <li>Enroll patients in programs they have not consented to</li>
          </ul>
        </section>

        <section>
          <h2>7. Disclaimers</h2>
          <p>
            THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE.&rdquo; ADHERIX HEALTH
            MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS
            FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>
          <p>
            Adherix does not guarantee specific patient retention outcomes. The modeled retention
            estimates presented on our website are directional projections based on industry data
            and are not guarantees of results. Actual outcomes depend on program design, patient
            population, and factors outside Adherix&rsquo;s control.
          </p>
          <p>
            The Service is not a substitute for clinical judgment. Adherix does not provide medical
            advice, and clinic staff remain responsible for clinical decisions related to patient care.
          </p>
        </section>

        <section>
          <h2>8. Limitation of liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, ADHERIX HEALTH SHALL NOT BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST
            REVENUE, LOST PROFITS, OR LOSS OF DATA, ARISING FROM YOUR USE OF THE SERVICE.
          </p>
          <p>
            ADHERIX&rsquo;S TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS OR THE SERVICE
            SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO ADHERIX IN THE THREE MONTHS PRECEDING
            THE CLAIM.
          </p>
        </section>

        <section>
          <h2>9. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Adherix Health from any claims, damages, or
            expenses (including reasonable attorney&rsquo;s fees) arising from your use of the
            Service, your violation of these Terms, or your violation of any third-party rights,
            including patient privacy rights.
          </p>
        </section>

        <section>
          <h2>10. Termination</h2>
          <p>
            Either party may terminate the service relationship at any time. Upon termination,
            Clinic Operators may request an export of their patient data. Adherix will provide
            a data export within 30 days of a written termination request. Following export
            delivery, patient data will be deleted from the Adherix platform within 60 days.
          </p>
        </section>

        <section>
          <h2>11. Governing law</h2>
          <p>
            These Terms are governed by the laws of the United States. Any disputes arising from
            these Terms or the Service shall be resolved through binding arbitration, except that
            either party may seek injunctive relief in a court of competent jurisdiction for
            intellectual property violations.
          </p>
        </section>

        <section>
          <h2>12. Changes to terms</h2>
          <p>
            We may update these Terms as the platform evolves. We will notify active Clinic Operators
            of material changes by email at least 14 days before they take effect. Continued use of
            the Service after that period constitutes acceptance.
          </p>
        </section>

        <section>
          <h2>13. Contact</h2>
          <p>
            Questions about these Terms:{' '}
            <a href="mailto:hello@adherix.health">hello@adherix.health</a>
          </p>
        </section>

      </div>
    </div>
  );
}
