'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { QuestHero } from '../_components/sections/QuestHero';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

/* ---- inline visual components ---- */

function ContrastSms() {
  return (
    <div className="mkt-q-contrast">
      <div className="mkt-q-contrast__col">
        <div className="mkt-q-contrast__label mkt-q-contrast__label--muted">Standard program</div>
        <div className="mkt-q-contrast__bubble mkt-q-contrast__bubble--plain">
          <p>Hi, this is a reminder to log your activity for this week. Please complete your check-in survey at your earliest convenience.</p>
        </div>
        <div className="mkt-q-contrast__tag mkt-q-contrast__tag--bad">No reply. Dropped month 2.</div>
      </div>
      <div className="mkt-q-contrast__divider" aria-hidden="true" />
      <div className="mkt-q-contrast__col">
        <div className="mkt-q-contrast__label mkt-q-contrast__label--electric">Quest</div>
        <div className="mkt-q-contrast__bubble mkt-q-contrast__bubble--quest">
          <p><strong>MISSION ALERT</strong> - Week 3</p>
          <p>Jordan, Alpha Squad needs you. Complete today's check-in to defend your XP lead. Reply <strong>YES</strong> to lock it in.</p>
        </div>
        <div className="mkt-q-contrast__tag mkt-q-contrast__tag--good">Replied in 4 min. +20 XP.</div>
      </div>
    </div>
  );
}

function DualPhones() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="mkt-q-dual">
      <div className="mkt-q-dual__phone">
        <div className="mkt-q-dual__badge">Teen</div>
        <div className="mkt-q-phone">
          <div className="mkt-q-phone__notch" />
          <div className="mkt-q-phone__thread">
            <div className="mkt-q-phone__from">Quest</div>
            <div className="mkt-q-phone__bubble mkt-q-phone__bubble--in">
              <strong>BOSS CHALLENGE LIVE</strong> - Jordan, this week: 5 check-ins = beat the boss. Squad is counting on you. Reply <strong>YES</strong> to accept.
            </div>
            {show && (
              <div className="mkt-q-phone__bubble mkt-q-phone__bubble--out mkt-q-phone__bubble--appear">
                YES
              </div>
            )}
            {show && (
              <div className="mkt-q-phone__bubble mkt-q-phone__bubble--in mkt-q-phone__bubble--appear">
                Challenge accepted. +30 XP if you finish. You got this.
              </div>
            )}
            <div className="mkt-q-phone__xp-pill" style={{ opacity: show ? 1 : 0 }}>
              <span>&#x26A1;</span> +30 XP unlocked
            </div>
          </div>
        </div>
      </div>

      <div className="mkt-q-dual__connector" aria-hidden="true">
        <div className="mkt-q-dual__connector-line" />
        <span className="mkt-q-dual__connector-label">dual track</span>
        <div className="mkt-q-dual__connector-line" />
      </div>

      <div className="mkt-q-dual__phone">
        <div className="mkt-q-dual__badge mkt-q-dual__badge--guardian">Guardian</div>
        <div className="mkt-q-phone mkt-q-phone--guardian">
          <div className="mkt-q-phone__notch" />
          <div className="mkt-q-phone__thread">
            <div className="mkt-q-phone__from">Quest Health</div>
            <div className="mkt-q-phone__bubble mkt-q-phone__bubble--in">
              Weekly update: Jordan completed 4 of 5 check-ins this week and earned a new level. Habit streak: 12 days. No action needed from you.
            </div>
            <div className="mkt-q-phone__bubble mkt-q-phone__bubble--in">
              Tip this week: celebrate effort, not just outcomes. "You showed up 4 times - that's the habit."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- page sections ---- */

const steps = [
  {
    icon: '\u26A1',
    n: '01',
    title: 'Game layer',
    body: 'XP, squads, boss challenges. Check-ins become missions. Dropout becomes a comeback arc.',
  },
  {
    icon: '\uD83D\uDCF1',
    n: '02',
    title: 'Guardian track',
    body: 'Parallel SMS for parents: level updates, habit tips, drift alerts. No PHI. No weight numbers.',
  },
  {
    icon: '\uD83D\uDEE1\uFE0F',
    n: '03',
    title: 'Compliance built in',
    body: 'Age and state-aware consent. COPPA-safe. Dual-channel SMS. Zero coordinator overhead.',
  },
];

const audience = [
  {
    icon: String.fromCodePoint(0x1F3E5),
    type: 'Pediatric practices',
    tagline: 'Behavioral engagement between visits - automated.',
  },
  {
    icon: String.fromCodePoint(0x2665) + String.fromCodePoint(0xFE0F),
    type: "Children's hospitals",
    tagline: 'Free your clinical team for high-complexity cases.',
  },
  {
    icon: String.fromCodePoint(0x1F4C8),
    type: 'Health systems',
    tagline: 'Same Adherix engine, adolescent-native experience.',
  },
];

export function QuestPage() {
  return (
    <div className="mkt-q-page">
      <QuestHero />

      {/* Problem: contrast visual */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="quest-problem">
        <div className="mkt-container">
          <div className="mkt-v2-problem">
            <div className="mkt-v2-problem__copy">
              <FadeRise as="span" className="mkt-eyebrow">The problem</FadeRise>
              <FadeRise as="h2" className="mkt-h2" delay={0.05}>
                Dropout is not a motivation problem. It is a design problem.
              </FadeRise>
              <FadeRise as="p" className="mkt-subhead" delay={0.1} style={{ color: 'rgba(244,239,230,0.7)', marginBottom: 0 }}>
                Standard adult behavioral frameworks do not transfer to teens. A 15-year-old does
                not respond to the same check-in message your GLP-1 cohort ignores. Quest changes
                what the patient experiences - not the clinical protocol underneath.
              </FadeRise>
            </div>
            <FadeRise className="mkt-v2-problem__visual" delay={0.08} amount={0.15}>
              <ContrastSms />
            </FadeRise>
          </div>
        </div>
      </section>

      {/* Dual track visual */}
      <section className="mkt-v2-section" id="quest-dual">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The dual track</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Teen gets the mission. Guardian gets the brief.
            </FadeRise>
            <FadeRise as="p" className="mkt-subhead" delay={0.1} style={{ color: 'rgba(244,239,230,0.7)', maxWidth: 560, margin: '0 auto 48px' }}>
              Two SMS streams run in parallel. One built for a 15-year-old. One built
              for their parent. No PHI crosses either channel.
            </FadeRise>
          </div>
          <FadeRise delay={0.1}>
            <DualPhones />
          </FadeRise>
        </div>
      </section>

      {/* How it works - 3 cards */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="quest-how">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">How it works</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Three layers. One engine.
            </FadeRise>
          </div>
          <StaggerGroup className="prod-step-grid" stagger={0.07} amount={0.2}>
            {steps.map(s => (
              <div key={s.n} className="prod-step-card">
                <span className="mkt-q-step-icon" aria-hidden="true">{s.icon}</span>
                <span className="prod-step-card__n">{s.n}</span>
                <h3 className="prod-step-card__title">{s.title}</h3>
                <p className="prod-step-card__body">{s.body}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Audience */}
      <section className="mkt-v2-section" id="quest-audience">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">Built for</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Who Quest is designed for.
            </FadeRise>
          </div>
          <StaggerGroup className="mkt-q-audience-grid" stagger={0.08} amount={0.2}>
            {audience.map(a => (
              <div key={a.type} className="mkt-q-audience-card">
                <span className="mkt-q-audience-icon" aria-hidden="true">{a.icon}</span>
                <h3 className="mkt-q-audience-type">{a.type}</h3>
                <p className="mkt-q-audience-tagline">{a.tagline}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* CTA */}
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
            Same engine as Adherix Keep. Adding Quest is a modality switch - not a second platform.
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
    </div>
  );
}
