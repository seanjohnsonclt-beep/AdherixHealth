'use client';

import Link from 'next/link';
import { QuestHero } from '../_components/sections/QuestHero';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

const steps = [
  {
    n: '01',
    title: 'The game layer',
    body: 'XP, levels, squads, boss challenges. Clinical check-ins become missions. Progress becomes visible. Failure becomes a comeback arc, not a reason to quit. The same behavioral protocol runs underneath - teens just do not experience it as a protocol.',
  },
  {
    n: '02',
    title: 'The guardian track',
    body: 'Every Quest patient has a parallel SMS track for their parent or guardian. Weekly brief: level, streak, check-in count. Behavioral coaching tips that redirect from weight-focus to habit reinforcement. Drift alerts when engagement drops. No PHI shared - no weight numbers, no doses.',
  },
  {
    n: '03',
    title: 'Built for compliance',
    body: 'Age and state-aware consent routing at enrollment. COPPA-safe for under-13. Minor self-consent where state law allows. Dual-channel SMS so teen and guardian each get the right message. No clinical staff overhead. No new portal.',
  },
];

export function QuestPage() {
  return (
    <>
      <QuestHero />

      <section className="mkt-v2-section mkt-v2-section--alt" id="quest-problem">
        <div className="mkt-container">
          <div className="mkt-v2-problem">
            <div className="mkt-v2-problem__copy">
              <FadeRise as="span" className="mkt-eyebrow">The problem</FadeRise>
              <FadeRise as="h2" className="mkt-h2" delay={0.05}>
                Your program was built for adults. Your teen patients know it.
              </FadeRise>
              <FadeRise as="div" className="mkt-v2-problem__body" delay={0.1}>
                <p>
                  Standard adult behavioral frameworks do not transfer to adolescents. The challenge
                  is not access to care - it is engagement. A teenager who does not feel seen,
                  understood, or challenged in a way that makes sense to them will not show up. The
                  dropout rate in pediatric weight management is not a motivation problem. It is a
                  design problem.
                </p>
                <p style={{ marginTop: 16 }}>
                  Quest does not change the clinical protocol. It changes what the patient
                  experiences. The engine underneath is identical to Adherix Keep - phase-based
                  progression, trigger-based nudges, drift correction. The surface is built for
                  a 15-year-old.
                </p>
              </FadeRise>
            </div>
            <FadeRise className="mkt-v2-problem__visual" delay={0.06} amount={0.2}>
              <div className="mkt-v2-problem__pull">
                <div className="mkt-v2-problem__pull-num">1 in 5</div>
                <div className="mkt-v2-problem__pull-text">
                  U.S. teens have obesity - the fastest-growing patient population in
                  pediatric medicine. Most programs lose them before month three.
                </div>
              </div>
            </FadeRise>
          </div>
        </div>
      </section>

      <section className="mkt-v2-section" id="quest-how">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">How it works</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Three layers that make the difference.
            </FadeRise>
          </div>
          <StaggerGroup className="prod-step-grid" stagger={0.07} amount={0.2}>
            {steps.map(s => (
              <div key={s.n} className="prod-step-card">
                <span className="prod-step-card__n">{s.n}</span>
                <h3 className="prod-step-card__title">{s.title}</h3>
                <p className="prod-step-card__body">{s.body}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="mkt-v2-section mkt-v2-section--alt" id="quest-audience">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">Built for</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Who Quest is designed for.
            </FadeRise>
          </div>
          <StaggerGroup className="prod-step-grid" stagger={0.07} amount={0.2}>
            {[
              {
                n: 'Pediatric practices',
                title: 'Weight management programs for teens 13-18',
                body: 'Clinics running structured pediatric obesity programs that need behavioral support between visits. Quest wraps around your existing clinical protocol without replacing it.',
              },
              {
                n: "Children's hospitals",
                title: 'Multi-disciplinary obesity medicine departments',
                body: 'Large programs with dedicated dietitians, psychologists, and care coordinators. Quest handles the between-visit behavioral engagement layer so your clinical team can focus on high-complexity cases.',
              },
              {
                n: 'Health systems',
                title: 'Adolescent medicine and endocrinology programs',
                body: 'Systems running GLP-1 programs for adolescents alongside adult cohorts. Quest is a modality within the Adherix engine - the same infrastructure, a completely different patient experience.',
              },
            ].map(s => (
              <div key={s.n} className="prod-step-card">
                <span className="prod-step-card__n">{s.n}</span>
                <h3 className="prod-step-card__title">{s.title}</h3>
                <p className="prod-step-card__body">{s.body}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="mkt-v2-section mkt-v2-section--ink">
        <div className="mkt-container mkt-v2-trust">
          <FadeRise
            as="h2"
            className="mkt-v2-trust__title"
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 400,
              color: 'var(--mkt-paper)',
              lineHeight: 1.1,
              marginBottom: 20,
            }}
          >
            Give your patients something to fight back with.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Quest runs on the same engine as Adherix Keep. If your clinic already uses
            Keep for adult GLP-1 patients, adding Quest is a modality switch - not a
            second platform.
          </FadeRise>
          <FadeRise className="mkt-v2-trust__cta" delay={0.15}>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
              Book a demo
            </Link>
            <Link
              href="/platform"
              className="mkt-btn mkt-btn--ghost mkt-btn--ghost-on-dark mkt-btn--lg"
            >
              See the platform
            </Link>
          </FadeRise>
        </div>
      </section>
    </>
  );
}
