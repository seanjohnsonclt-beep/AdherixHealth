'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { QuestHero } from '../_components/sections/QuestHero';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

/* ---- animated counter ---- */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 40;
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 30);
    return () => clearInterval(id);
  }, [inView, to]);
  return <span ref={ref}>{inView ? val : 0}{suffix}</span>;
}

/* ---- animated check icon ---- */
function CheckMark({ color = '#5CFFC8' }: { color?: string }) {
  return (
    <motion.svg
      width="20" height="20" viewBox="0 0 20 20" fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      aria-hidden="true"
    >
      <motion.circle cx="10" cy="10" r="9" stroke={color} strokeWidth="1.5"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.4 }} />
      <motion.path d="M6 10.5l2.5 2.5 5-5" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.3 }} />
    </motion.svg>
  );
}

/* ---- SMS contrast visual ---- */
function SmsContrast() {
  return (
    <div className="mkt-q-contrast">
      <div className="mkt-q-contrast__col">
        <div className="mkt-q-contrast__label mkt-q-contrast__label--muted">Standard check-in</div>
        <div className="mkt-q-contrast__bubble mkt-q-contrast__bubble--plain">
          <p>Hi, this is your weekly check-in reminder. Please complete your behavioral health survey at your earliest convenience.</p>
        </div>
        <div className="mkt-q-contrast__result mkt-q-contrast__result--bad">
          <CheckMark color="rgba(244,239,230,0.2)" />
          <span>No reply. Patient lost to follow-up by month two.</span>
        </div>
      </div>
      <div className="mkt-q-contrast__divider" aria-hidden="true" />
      <div className="mkt-q-contrast__col">
        <div className="mkt-q-contrast__label mkt-q-contrast__label--electric">Quest</div>
        <div className="mkt-q-contrast__bubble mkt-q-contrast__bubble--quest">
          <p>Jordan - Week 3. You have been showing up. Reply YES to log today and keep your streak going. Your squad is tracking with you.</p>
        </div>
        <div className="mkt-q-contrast__result mkt-q-contrast__result--good">
          <CheckMark color="#5CFFC8" />
          <span>Replied in 4 minutes. Streak maintained. No staff action needed.</span>
        </div>
      </div>
    </div>
  );
}

/* ---- dual phone mockup ---- */
function DualPhones() {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  useEffect(() => {
    if (inView) { const t = setTimeout(() => setShow(true), 600); return () => clearTimeout(t); }
  }, [inView]);

  return (
    <div ref={ref} className="mkt-q-dual">
      <div className="mkt-q-dual__phone">
        <div className="mkt-q-dual__badge">Patient</div>
        <div className="mkt-q-phone">
          <div className="mkt-q-phone__notch" />
          <div className="mkt-q-phone__thread">
            <div className="mkt-q-phone__from">Quest Health</div>
            <div className="mkt-q-phone__bubble mkt-q-phone__bubble--in">
              Jordan - this is your Week 5 check-in. How are you tracking with this week's goal? Reply YES to log it.
            </div>
            {show && (
              <motion.div className="mkt-q-phone__bubble mkt-q-phone__bubble--out"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}>
                YES
              </motion.div>
            )}
            {show && (
              <motion.div className="mkt-q-phone__bubble mkt-q-phone__bubble--in"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.5 }}>
                Logged. 9-day streak. Keep it going - your next milestone is close.
              </motion.div>
            )}
            {show && (
              <motion.div className="mkt-q-phone__streak-bar"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}>
                <div className="mkt-q-phone__streak-label">Habit streak</div>
                <div className="mkt-q-phone__streak-track">
                  <motion.div className="mkt-q-phone__streak-fill"
                    initial={{ width: '0%' }} animate={{ width: '72%' }}
                    transition={{ duration: 0.6, delay: 1.0, ease: 'easeOut' }} />
                </div>
                <div className="mkt-q-phone__streak-val">9 / 12 days</div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="mkt-q-dual__connector" aria-hidden="true">
        <div className="mkt-q-dual__connector-line" />
        <span className="mkt-q-dual__connector-label">parallel</span>
        <div className="mkt-q-dual__connector-line" />
      </div>

      <div className="mkt-q-dual__phone">
        <div className="mkt-q-dual__badge mkt-q-dual__badge--guardian">Guardian</div>
        <div className="mkt-q-phone mkt-q-phone--guardian">
          <div className="mkt-q-phone__notch" />
          <div className="mkt-q-phone__thread">
            <div className="mkt-q-phone__from">Quest Health</div>
            <div className="mkt-q-phone__bubble mkt-q-phone__bubble--in">
              Weekly summary for Jordan: 4 of 5 check-ins completed. Habit streak: 9 days. Engagement: strong.
            </div>
            <div className="mkt-q-phone__bubble mkt-q-phone__bubble--in">
              This week: focus on routine over results. Consistency at this stage matters more than any single number.
            </div>
            <div className="mkt-q-phone__guardian-tag">
              No clinical data shared. No action required.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- zero lift cards ---- */
const lifts = [
  { label: 'No EHR changes', sub: 'Quest runs alongside your existing system. Nothing to integrate.' },
  { label: 'No portal for patients', sub: 'SMS only. Teens reply from their phone. No app, no login.' },
  { label: 'No manual follow-up', sub: 'Quiet patients are flagged automatically. Your team acts on signals, not silence.' },
  { label: 'Guardian loop included', sub: 'Weekly parent summaries run automatically. No coordinator needed.' },
];

/* ---- audience cards ---- */
const audience = [
  {
    type: 'Pediatric practices',
    tagline: 'Running structured teen weight management programs',
    detail: 'Quest wraps around your existing clinical protocol. Behavioral engagement between visits, automated.',
  },
  {
    type: "Children's hospitals",
    tagline: 'Multi-disciplinary obesity medicine departments',
    detail: 'Free your coordinators for complex cases. Quest handles the between-visit engagement layer automatically.',
  },
  {
    type: 'Health systems',
    tagline: 'Adolescent GLP-1 and weight management programs',
    detail: 'If you run Adherix for adult patients, Quest adds adolescent-native engagement without a second platform.',
  },
];

const stats = [
  { n: 20, suffix: '%', label: 'of U.S. teens have obesity' },
  { n: 50, suffix: '%+', label: 'dropout before month three' },
  { n: 0, suffix: '', label: 'staff hours to run it' },
];

export function QuestPage() {
  return (
    <div className="mkt-q-page">
      <QuestHero />

      {/* Problem */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="quest-problem">
        <div className="mkt-container">
          <div className="mkt-v2-problem">
            <div className="mkt-v2-problem__copy">
              <FadeRise as="span" className="mkt-eyebrow">The clinical gap</FadeRise>
              <FadeRise as="h2" className="mkt-h2" delay={0.05}>
                Teen patients drop out of weight management programs at twice the rate of adults.
              </FadeRise>
              <FadeRise as="p" delay={0.1} style={{ color: 'rgba(244,239,230,0.7)', fontSize: 17, lineHeight: 1.65, marginBottom: 0 }}>
                The clinical protocol is sound. The patient experience is the variable.
                Standard behavioral frameworks were designed for adults. Adolescents need
                a different engagement surface - not different medicine.
              </FadeRise>
            </div>
            <FadeRise className="mkt-v2-problem__visual" delay={0.06} amount={0.15}>
              <div className="mkt-q-stats-block">
                {stats.map(s => (
                  <div key={s.label} className="mkt-q-stat-item">
                    <div className="mkt-q-stat-item__n">
                      <Counter to={s.n} suffix={s.suffix} />
                    </div>
                    <div className="mkt-q-stat-item__l">{s.label}</div>
                  </div>
                ))}
              </div>
            </FadeRise>
          </div>
        </div>
      </section>

      {/* SMS contrast */}
      <section className="mkt-v2-section" id="quest-experience">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">The patient experience</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              The same check-in. Built for who is receiving it.
            </FadeRise>
            <FadeRise as="p" delay={0.1} style={{ color: 'rgba(244,239,230,0.7)', maxWidth: 520, margin: '0 auto 48px', textAlign: 'center', fontSize: 16 }}>
              Quest does not replace your behavioral protocol. It translates it
              into a format adolescents respond to.
            </FadeRise>
          </div>
          <FadeRise delay={0.1}>
            <SmsContrast />
          </FadeRise>
        </div>
      </section>

      {/* Dual track */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="quest-dual">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">Dual-channel outreach</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              The patient gets engaged. The parent stays informed.
            </FadeRise>
            <FadeRise as="p" delay={0.1} style={{ color: 'rgba(244,239,230,0.7)', maxWidth: 520, margin: '0 auto 48px', textAlign: 'center', fontSize: 16 }}>
              Two parallel SMS streams run automatically. Behavioral engagement
              for the teen. A weekly clinical summary for the guardian.
              No PHI on either channel.
            </FadeRise>
          </div>
          <FadeRise delay={0.12}>
            <DualPhones />
          </FadeRise>
        </div>
      </section>

      {/* Zero lift */}
      <section className="mkt-v2-section" id="quest-lift">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">For your team</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              Your patients stay in treatment. Your team has less to chase.
            </FadeRise>
          </div>
          <StaggerGroup className="mkt-q-lift-grid" stagger={0.08} amount={0.2}>
            {lifts.map(l => (
              <div key={l.label} className="mkt-q-lift-card">
                <CheckMark color="#5CFFC8" />
                <h3 className="mkt-q-lift-card__title">{l.label}</h3>
                <p className="mkt-q-lift-card__body">{l.sub}</p>
              </div>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Audience */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="quest-audience">
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
                <h3 className="mkt-q-audience-type">{a.type}</h3>
                <p className="mkt-q-audience-tagline">{a.tagline}</p>
                <p className="mkt-q-audience-detail">{a.detail}</p>
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
            Your patients stay in program. Your team gets alerted when they don't.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Quest runs automatically between visits. No new staff. No portal.
            No workflow changes. Book a demo to see a live program.
          </FadeRise>
          <FadeRise className="mkt-v2-trust__cta" delay={0.15}>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
              Book a demo
            </Link>
            <Link href="/platform" className="mkt-btn mkt-btn--ghost mkt-btn--ghost-on-dark mkt-btn--lg">
              See the platform
            </Link>
          </FadeRise>
        </div>
      </section>
    </div>
  );
}
