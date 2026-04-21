import Link from 'next/link';
import { SiteHeader } from '@/app/(marketing)/_components/SiteHeader';
import { SiteFooter } from '@/app/(marketing)/_components/SiteFooter';
import { RoiCalculator } from '@/app/(marketing)/_components/RoiCalculator';

/**
 * Adherix Health — public marketing homepage.
 *
 * Sections (per the brief, in order):
 *   1. Hero
 *   2. Value / Outcome
 *   3. Problem
 *   4. How Adherix Works
 *   5. Dashboard / Product Preview
 *   6. ROI / Revenue Protection
 *   7. Why Clinics Buy / Benefits
 *   8. Trust / Compliance / Implementation
 *   9. Final CTA
 *
 * Tone: premium, clinical, operational, non-hype.
 * Anything that smells like "engagement app" or "SMS reminder tool" is out.
 */
export const metadata = {
  title: 'Adherix Health · Retention intelligence for modern metabolic care',
  description:
    'Adherix helps metabolic care programs keep more patients enrolled through automated behavioral retention workflows that detect drift early, guide intervention, and protect recurring program revenue.',
};

export default function MarketingHome() {
  return (
    <div className="mkt-page">
      <SiteHeader />
      <main>
        {/* ═══════════════════════════════════════════════════════════════
            1. HERO
           ═══════════════════════════════════════════════════════════════ */}
        <section className="mkt-hero">
          <div className="mkt-container">
            <div className="mkt-hero__grid">
              <div>
                <span className="mkt-eyebrow">
                  Retention intelligence for metabolic care
                </span>
                <h1 className="mkt-h1">
                  Patients don't drop off.
                  <br />
                  They drift, and we catch them.
                </h1>
                <p className="mkt-subhead">
                  Adherix helps metabolic care programs keep more patients enrolled
                  through automated behavioral retention workflows that detect
                  disengagement early, guide intervention, and protect recurring
                  revenue.
                </p>
                <div className="mkt-hero__cta">
                  <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
                    Request a pilot
                  </Link>
                  <Link href="#platform" className="mkt-btn mkt-btn--ghost mkt-btn--lg">
                    See the platform
                  </Link>
                </div>
                <div className="mkt-trust-strip">
                  <span>Built for metabolic programs</span>
                  <span>HIPAA-conscious architecture</span>
                  <span>Pilot-ready in days</span>
                  <span>No additional headcount required</span>
                </div>
              </div>

              <div>
                <HeroPreviewTile />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            2. VALUE / OUTCOME
           ═══════════════════════════════════════════════════════════════ */}
        <section className="mkt-section" id="platform">
          <div className="mkt-container">
            <div style={{ maxWidth: 720, marginBottom: 48 }}>
              <span className="mkt-eyebrow">What changes</span>
              <h2 className="mkt-h2">What Adherix actually changes</h2>
              <p className="mkt-subhead" style={{ marginBottom: 0 }}>
                Four operational shifts in how your program holds onto patients.
              </p>
            </div>

            <div className="mkt-grid-4">
              <OutcomeCard
                icon={<IconRadar />}
                title="Detects patient drift early"
                body="Surface disengagement weeks before it becomes lost revenue."
              />
              <OutcomeCard
                icon={<IconTrigger />}
                title="Automates the right intervention"
                body="Trigger outreach based on behavior, phase, and response patterns — not blast schedules."
              />
              <OutcomeCard
                icon={<IconTarget />}
                title="Guides clinic action"
                body="Show staff exactly who needs attention today and what to do next."
              />
              <OutcomeCard
                icon={<IconShield />}
                title="Protects recurring revenue"
                body="Turn silent drop-off into recoverable retention opportunities."
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            3. PROBLEM
           ═══════════════════════════════════════════════════════════════ */}
        <section className="mkt-section mkt-section--alt">
          <div className="mkt-container">
            <div className="mkt-problem-grid">
              <div>
                <span className="mkt-eyebrow">The problem</span>
                <h2 className="mkt-h2">
                  Retention loss rarely looks dramatic, until the revenue is gone.
                </h2>
                <p style={{ fontSize: 17, color: 'var(--mkt-muted)', maxWidth: 540 }}>
                  Most clinics do not lose patients in one obvious moment. They lose
                  them slowly — through missed replies, stalled momentum, plateau
                  frustration, and inconsistent follow-through. By the time a
                  coordinator notices, the patient may already be on the way out.
                </p>
                <p style={{ fontSize: 17, color: 'var(--mkt-fg)', fontWeight: 500, marginTop: 18 }}>
                  Adherix is built to catch that drift sooner.
                </p>
              </div>

              <div className="mkt-problem-list">
                <ProblemItem
                  num="01"
                  title="Patients disengage quietly"
                  body="Two missed replies, a delayed dose log — small signals that compound."
                />
                <ProblemItem
                  num="02"
                  title="Staff cannot monitor every patient manually"
                  body="A coordinator carrying 200 patients can't catch the right moment for each."
                />
                <ProblemItem
                  num="03"
                  title="Revenue leakage compounds over time"
                  body="Each lost patient is months of recurring revenue you'll never replace."
                />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            4. HOW IT WORKS
           ═══════════════════════════════════════════════════════════════ */}
        <section className="mkt-section" id="how">
          <div className="mkt-container">
            <div style={{ maxWidth: 720, marginBottom: 48 }}>
              <span className="mkt-eyebrow">How it works</span>
              <h2 className="mkt-h2">How Adherix works</h2>
              <p className="mkt-subhead" style={{ marginBottom: 0 }}>
                A four-step retention workflow that runs in the background while
                your team stays focused on care delivery.
              </p>
            </div>

            <div className="mkt-steps">
              <Step n={1} title="Enroll" body="Bring patients into structured retention workflows tuned to your program phases." />
              <Step n={2} title="Monitor" body="Track engagement and progression across each phase of care, not just intake." />
              <Step n={3} title="Detect" body="Surface drift, silence, plateau risk, and delivery issues automatically." />
              <Step n={4} title="Act" body="Trigger the right outreach and route the right patients to clinic staff." />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            5. DASHBOARD / PRODUCT PREVIEW
           ═══════════════════════════════════════════════════════════════ */}
        <section className="mkt-section mkt-section--alt">
          <div className="mkt-container">
            <div style={{ maxWidth: 720, marginBottom: 8 }}>
              <span className="mkt-eyebrow">The platform</span>
              <h2 className="mkt-h2">Retention intelligence your team can actually use</h2>
              <p className="mkt-subhead" style={{ marginBottom: 0 }}>
                Adherix gives operators a daily view of program health, surfaces
                who is drifting, and recommends the next action before retention
                loss becomes visible in your numbers.
              </p>
            </div>

            <DashboardPreview />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            6. ROI / REVENUE PROTECTION
           ═══════════════════════════════════════════════════════════════ */}
        <section className="mkt-section" id="roi">
          <div className="mkt-container">
            <div style={{ maxWidth: 720 }}>
              <span className="mkt-eyebrow">Revenue protection</span>
              <h2 className="mkt-h2">What drift is quietly costing your program</h2>
              <p className="mkt-subhead" style={{ marginBottom: 0 }}>
                Adjust the inputs to your program. Even a modest retention
                improvement typically covers the platform many times over.
              </p>
            </div>

            <RoiCalculator />
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            7. WHY CLINICS BUY
           ═══════════════════════════════════════════════════════════════ */}
        <section className="mkt-section mkt-section--alt">
          <div className="mkt-container">
            <div style={{ maxWidth: 720, marginBottom: 40 }}>
              <span className="mkt-eyebrow">Why clinics buy</span>
              <h2 className="mkt-h2">Why clinics adopt Adherix</h2>
            </div>

            <div className="mkt-benefits">
              <Benefit title="Grow without adding headcount" body="One coordinator can hold a larger book without sacrificing follow-through." />
              <Benefit title="Catch disengagement before cancellation" body="Behavioral signals trigger intervention well before churn becomes visible." />
              <Benefit title="Create consistency across follow-up" body="Every patient receives the same level of attention at the right moments." />
              <Benefit title="Reduce invisible retention loss" body="Make quiet drop-off measurable, recoverable, and reportable." />
              <Benefit title="Operationally light by design" body="Adherix supports your team's workflow — it does not invent a new one." />
              <Benefit title="A daily system, not another task" body="Operators get a single screen that tells them what to do next." />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            8. TRUST / COMPLIANCE / IMPLEMENTATION
           ═══════════════════════════════════════════════════════════════ */}
        <section className="mkt-section" id="trust">
          <div className="mkt-container">
            <div style={{ maxWidth: 720, marginBottom: 40 }}>
              <span className="mkt-eyebrow">Built for clinical operations</span>
              <h2 className="mkt-h2">Built for real clinical operations</h2>
              <p className="mkt-subhead" style={{ marginBottom: 0 }}>
                Pragmatic security, fast implementation, and operational support
                designed around how clinics actually work.
              </p>
            </div>

            <div className="mkt-trust">
              <div className="mkt-trust__col">
                <h3>Fast implementation</h3>
                <p>Launch in days, not months. Pilots are typically live within a week of kickoff.</p>
                <ul>
                  <li>Guided onboarding for clinic admins</li>
                  <li>Patient enrollment from day one</li>
                  <li>Implementation support included</li>
                </ul>
              </div>

              <div className="mkt-trust__col">
                <h3>Operationally light</h3>
                <p>Adherix is designed to support your team, not create more work for them.</p>
                <ul>
                  <li>Daily action list, not another inbox</li>
                  <li>Clinic-specific program views</li>
                  <li>Workflows built for operational reliability</li>
                </ul>
              </div>

              <div className="mkt-trust__col">
                <h3>HIPAA-conscious architecture</h3>
                <p>Serious about patient data, security, and responsible deployment.</p>
                <ul>
                  <li>Secure role-based access</li>
                  <li>Audited messaging workflows</li>
                  <li>Data minimization by default</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            9. FINAL CTA
           ═══════════════════════════════════════════════════════════════ */}
        <section className="mkt-section mkt-section--tight">
          <div className="mkt-container">
            <div className="mkt-final-cta">
              <h2>Ready to improve retention without adding headcount?</h2>
              <p>
                Adherix helps metabolic care programs detect drift early, recover
                at-risk patients, and build more durable recurring revenue.
              </p>
              <div className="mkt-final-cta__row">
                <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
                  Request a pilot
                </Link>
                <Link href="#platform" className="mkt-btn mkt-btn--outline-dark mkt-btn--lg">
                  See the platform
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

/* ─── Hero preview tile (small, premium snapshot) ─────────────────────── */
function HeroPreviewTile() {
  return (
    <div className="mkt-preview" aria-hidden="true">
      <div className="mkt-preview__chrome">
        <div className="mkt-preview__dots">
          <span className="mkt-preview__dot" />
          <span className="mkt-preview__dot" />
          <span className="mkt-preview__dot" />
        </div>
        <div className="mkt-preview__url">adherix.health · Today at Vista Metabolic</div>
        <div style={{ width: 30 }} />
      </div>
      <div className="mkt-preview__body">
        <div className="mkt-preview__row">
          <div className="mkt-preview__tile mkt-preview__tile--accent">
            <small>Active patients</small>
            <strong>418</strong>
            <span>+12 this week</span>
          </div>
          <div className="mkt-preview__tile">
            <small>Drifting</small>
            <strong style={{ color: 'var(--mkt-warn)' }}>11</strong>
            <span>caught early</span>
          </div>
          <div className="mkt-preview__tile">
            <small>Recovered</small>
            <strong style={{ color: 'var(--mkt-good)' }}>9</strong>
            <span>this week</span>
          </div>
        </div>

        <div className="mkt-preview__list">
          <PreviewItem name="J. Alvarez"   sub="Phase 3 · Risk Window"        pill="urgent" pillText="Recover now"      action="Send outreach" />
          <PreviewItem name="K. Mitchell"  sub="Phase 2 · Adherence Building" pill="warn"   pillText="Trending down"    action="Monitor" />
          <PreviewItem name="S. Okafor"    sub="Phase 4 · Plateau"            pill="warn"   pillText="Plateau"          action="Plateau intervention" />
          <PreviewItem name="R. Chen"      sub="Phase 1 · Dose Stabilization" pill="good"   pillText="Healthy"          action="No action needed" />
        </div>
      </div>
    </div>
  );
}

function PreviewItem({
  name, sub, pill, pillText, action,
}: { name: string; sub: string; pill: 'good' | 'warn' | 'urgent'; pillText: string; action: string }) {
  return (
    <div className="mkt-preview__item">
      <div>
        <div className="mkt-preview__name">{name}</div>
        <span className="mkt-preview__sub">{sub}</span>
      </div>
      <span className={`mkt-pill mkt-pill--${pill}`}>{pillText}</span>
      <span className="mkt-action-btn">{action}</span>
    </div>
  );
}

/* ─── Outcome card (Section 2) ─────────────────────────────────────────── */
function OutcomeCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="mkt-card">
      <div className="mkt-card__icon">{icon}</div>
      <h3 className="mkt-h3">{title}</h3>
      <p>{body}</p>
    </div>
  );
}

/* ─── Problem item (Section 3) ─────────────────────────────────────────── */
function ProblemItem({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="mkt-problem-item">
      <span className="mkt-problem-item__num">{num}</span>
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>
    </div>
  );
}

/* ─── Step (Section 4) ─────────────────────────────────────────────────── */
function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="mkt-step">
      <div className="mkt-step__num">{n}</div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

/* ─── Benefit (Section 7) ──────────────────────────────────────────────── */
function Benefit({ title, body }: { title: string; body: string }) {
  return (
    <div className="mkt-benefit">
      <span className="mkt-benefit__check">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <div>
        <p>{title}</p>
        <small>{body}</small>
      </div>
    </div>
  );
}

/* ─── Dashboard preview (Section 5) — larger, two-pane mock ───────────── */
function DashboardPreview() {
  return (
    <div className="mkt-dashboard-preview" aria-hidden="true">
      <div className="mkt-dashboard-preview__chrome">
        <div className="mkt-preview__dots">
          <span className="mkt-preview__dot" />
          <span className="mkt-preview__dot" />
          <span className="mkt-preview__dot" />
        </div>
        <span>Dashboard · Vista Metabolic · Today</span>
      </div>
      <div className="mkt-dashboard-preview__body">
        <div className="mkt-dashboard-preview__pane">
          <div className="mkt-dashboard-preview__hero">Today at Vista Metabolic</div>
          <div className="mkt-dashboard-preview__big" style={{ marginBottom: 14 }}>
            <small style={{ display: 'block', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mkt-muted)', fontWeight: 600, marginBottom: 6 }}>
              Revenue protected · last 30 days
            </small>
            <strong>$36,400</strong>
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--mkt-muted)' }}>Modeled · 14 patients recovered</div>
          </div>
          <div className="mkt-preview__row" style={{ marginTop: 0 }}>
            <div className="mkt-preview__tile">
              <small>Active</small>
              <strong>418</strong>
            </div>
            <div className="mkt-preview__tile">
              <small>Drifting</small>
              <strong style={{ color: 'var(--mkt-warn)' }}>11</strong>
            </div>
            <div className="mkt-preview__tile">
              <small>Recovered (wk)</small>
              <strong style={{ color: 'var(--mkt-good)' }}>9</strong>
            </div>
          </div>
        </div>

        <div className="mkt-dashboard-preview__pane">
          <div className="mkt-dashboard-preview__hero">Patients · today's action list</div>
          <div className="mkt-preview__list">
            <PreviewItem name="J. Alvarez"   sub="Phase 3 · Risk Window · 38d"        pill="urgent" pillText="Urgent"        action="Send outreach" />
            <PreviewItem name="K. Mitchell"  sub="Phase 2 · Adherence Building · 19d" pill="warn"   pillText="Trending down" action="Monitor" />
            <PreviewItem name="S. Okafor"    sub="Phase 4 · Plateau · 64d"            pill="warn"   pillText="Plateau"       action="Plateau intervention" />
            <PreviewItem name="A. Patel"     sub="Phase 1 · Dose Stabilization · 6d"  pill="good"   pillText="Healthy"       action="No action" />
            <PreviewItem name="L. Brennan"   sub="Phase 5 · Maintenance · 92d"        pill="good"   pillText="Healthy"       action="No action" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Inline icons (no external icon dep) ─────────────────────────────── */

function IconRadar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconTrigger() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="13 2 13 10 19 10 11 22 11 14 5 14 13 2" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <line x1="12" y1="3" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="21" />
      <line x1="3" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="21" y2="12" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z" />
      <polyline points="9 12 11.5 14.5 16 10" />
    </svg>
  );
}
