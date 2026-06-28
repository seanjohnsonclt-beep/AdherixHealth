'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { QuestHero } from '../_components/sections/QuestHero';
import { FadeRise, StaggerGroup } from '../_components/animation/MotionPrimitives';

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

function CheckMark({ color = '#5CFFC8' }: { color?: string }) {
  return (
    <motion.svg width="20" height="20" viewBox="0 0 20 20" fill="none"
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }} aria-hidden="true">
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

interface Bubble { dir: 'in' | 'out'; text: string; }

function QuestIPhone({
  contact, avatar, avatarBg = '#1a4a46', date, bubbles, delivered, animateDelay = 0,
}: {
  contact: string; avatar: string; avatarBg?: string;
  date?: string; bubbles: Bubble[]; delivered?: boolean; animateDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [visCount, setVisCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const start = setTimeout(() => {
      // show first bubble immediately
      setVisCount(1);
      i = 1;
      const id = setInterval(() => {
        i++;
        setVisCount(i);
        if (i >= bubbles.length) clearInterval(id);
      }, 900);
      return () => clearInterval(id);
    }, animateDelay);
    return () => clearTimeout(start);
  }, [inView, animateDelay, bubbles.length]);

  return (
    <div ref={ref} className="mkt-iphone">
      <div className="mkt-iphone__frame">
        <div className="mkt-iphone__island" />
        <div className="mkt-iphone__status">
          <span className="mkt-iphone__time">9:41</span>
          <span className="mkt-iphone__status-icons">
            <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor" aria-hidden="true">
              <rect x="0" y="8" width="3" height="4" rx="0.6" opacity="0.35"/>
              <rect x="4.7" y="5" width="3" height="7" rx="0.6" opacity="0.35"/>
              <rect x="9.4" y="2" width="3" height="10" rx="0.6"/>
              <rect x="14.1" y="0" width="3" height="12" rx="0.6"/>
            </svg>
            <svg width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden="true">
              <path d="M7.5 10a1 1 0 110-2 1 1 0 010 2z" fill="currentColor"/>
              <path d="M5.1 7.8C5.9 6.9 6.7 6.4 7.5 6.4s1.6.5 2.4 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
              <path d="M2.8 5.5C4.2 3.9 5.8 3 7.5 3s3.3.9 4.7 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.4"/>
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35"/>
              <rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="currentColor" fillOpacity="0.4"/>
              <rect x="2" y="2" width="14" height="8" rx="2" fill="currentColor"/>
            </svg>
          </span>
        </div>
        <div className="mkt-iphone__header">
          <div className="mkt-iphone__avatar" style={{ background: avatarBg }}>{avatar}</div>
          <div>
            <div className="mkt-iphone__contact">{contact}</div>
            <div className="mkt-iphone__contact-sub">text message</div>
          </div>
        </div>
        <div className="mkt-iphone__thread">
          {date && <div className="mkt-iphone__thread-date">{date}</div>}
          {bubbles.slice(0, visCount).map((b, i) => (
            <motion.div key={i}
              className={`mkt-iphone__bubble mkt-iphone__bubble--${b.dir}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}>
              {b.text}
            </motion.div>
          ))}
          {delivered && visCount >= bubbles.length && (
            <div className="mkt-iphone__delivered">Delivered</div>
          )}
        </div>
        <div className="mkt-iphone__bar">
          <div className="mkt-iphone__field">iMessage</div>
        </div>
        <div className="mkt-iphone__indicator" />
      </div>
    </div>
  );
}

function SmsContrast() {
  return (
    <div className="mkt-q-contrast">
      <div className="mkt-q-contrast__col">
        <div className="mkt-q-contrast__label mkt-q-contrast__label--muted">Standard program</div>
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
          <p>Jordan - Week 3. You have been showing up. Reply YES to log today and keep your streak going. Your squad is watching the board.</p>
        </div>
        <div className="mkt-q-contrast__result mkt-q-contrast__result--good">
          <CheckMark color="#5CFFC8" />
          <span>Replied in 4 minutes. Streak maintained. No staff action needed.</span>
        </div>
      </div>
    </div>
  );
}

const lifts = [
  { label: 'No EHR changes', sub: 'Quest runs alongside your existing system. Nothing to integrate.' },
  { label: 'No portal for patients', sub: 'SMS only. Teens reply from their phone. No app, no login.' },
  { label: 'No manual follow-up', sub: 'Quiet patients are flagged automatically. Your team acts on signals, not silence.' },
  { label: 'Guardian loop included', sub: 'Weekly parent summaries run automatically. No coordinator needed.' },
];

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
                    <div className="mkt-q-stat-item__n"><Counter to={s.n} suffix={s.suffix} /></div>
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
              into a format adolescents actually respond to.
            </FadeRise>
          </div>
          <FadeRise delay={0.1}><SmsContrast /></FadeRise>
        </div>
      </section>

      {/* Game layer - copy left, phone right (PatientSmsView pattern) */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="quest-game">
        <div className="mkt-container mkt-v2-sms-view">
          <FadeRise className="mkt-v2-sms-view__copy">
            <span className="mkt-eyebrow">The game layer</span>
            <h2 className="mkt-h2">Clinical check-ins become missions. Progress becomes visible.</h2>
            <p className="mkt-subhead" style={{ marginBottom: 28 }}>
              XP, streaks, squad accountability, and weekly boss challenges run
              automatically on top of your existing behavioral protocol.
              Teens engage because it feels worth showing up for.
            </p>
            <ul className="mkt-v2-sms-view__points">
              <li>Boss challenges: 3x XP stakes, squad visibility, Monday launch</li>
              <li>Streaks and level-ups fire automatically - no staff trigger</li>
              <li>Intensity levels (Chill / Standard / Beast) set by the teen on day one</li>
            </ul>
          </FadeRise>
          <FadeRise className="mkt-v2-sms-view__phone" delay={0.12}>
            <QuestIPhone
              contact="Quest Health"
              avatar="Q"
              avatarBg="#1a4a46"
              date="Monday 9:00 AM"
              animateDelay={400}
              delivered={true}
              bubbles={[
                { dir: 'in', text: 'WEEK 5 BOSS: 5 consecutive check-ins. Alpha Squad needs every member in. Reply BOSS to accept. Worth 3x XP.' },
                { dir: 'out', text: 'BOSS' },
                { dir: 'in', text: "Challenge accepted. Check-in streak starts today. Squad can see you're in." },
              ]}
            />
          </FadeRise>
        </div>
      </section>

      {/* Dual channel - two phones side by side */}
      <section className="mkt-v2-section" id="quest-dual">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">Dual-channel outreach</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>
              The patient gets engaged. The parent stays informed.
            </FadeRise>
            <FadeRise as="p" delay={0.1} style={{ color: 'rgba(244,239,230,0.7)', maxWidth: 520, margin: '0 auto 48px', textAlign: 'center', fontSize: 16 }}>
              Two parallel SMS streams run automatically. No PHI on either channel.
            </FadeRise>
          </div>
          <div className="mkt-q-dual-row">
            <FadeRise className="mkt-q-dual-col" delay={0.05}>
              <div className="mkt-q-dual-badge mkt-q-dual-badge--patient">Patient</div>
              <QuestIPhone
                contact="Quest Health"
                avatar="Q"
                avatarBg="#1a4a46"
                date="Today 4:00 PM"
                animateDelay={200}
                delivered={true}
                bubbles={[
                  { dir: 'in', text: 'Jordan - 12-day streak. Reply YES to log today and keep it going. Squad check is Sunday.' },
                  { dir: 'out', text: 'YES' },
                  { dir: 'in', text: 'Logged. Keep going.' },
                ]}
              />
            </FadeRise>
            <FadeRise className="mkt-q-dual-col" delay={0.18}>
              <div className="mkt-q-dual-badge mkt-q-dual-badge--guardian">Guardian</div>
              <QuestIPhone
                contact="Quest Health"
                avatar="Q"
                avatarBg="#3d2d6e"
                date="Sunday 10:00 AM"
                animateDelay={500}
                bubbles={[
                  { dir: 'in', text: 'Weekly update for Jordan: 5 of 5 check-ins. Streak: 12 days. Habit consistency is strong.' },
                  { dir: 'in', text: 'Tip: reinforce effort, not outcomes. This window is where habits become identity.' },
                ]}
              />
              <p className="mkt-q-dual-note">No clinical data shared. No action required.</p>
            </FadeRise>
          </div>
        </div>
      </section>

      {/* Zero lift */}
      <section className="mkt-v2-section mkt-v2-section--alt" id="quest-lift">
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
      <section className="mkt-v2-section" id="quest-audience">
        <div className="mkt-container">
          <div className="mkt-v2-section__head">
            <FadeRise as="span" className="mkt-eyebrow">Built for</FadeRise>
            <FadeRise as="h2" className="mkt-h2" delay={0.05}>Who Quest is designed for.</FadeRise>
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
          <FadeRise as="h2" className="mkt-v2-trust__title" style={{
            fontFamily: 'Fraunces, Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 400, color: 'var(--mkt-paper)', lineHeight: 1.1, marginBottom: 20,
          }}>
            Your patients stay in program. Your team gets alerted when they don't.
          </FadeRise>
          <FadeRise as="p" className="mkt-subhead mkt-v2-trust__sub" delay={0.08}>
            Quest runs automatically between visits. No new staff. No portal. No workflow changes.
          </FadeRise>
          <FadeRise className="mkt-v2-trust__cta" delay={0.15}>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">Book a demo</Link>
            <Link href="/platform" className="mkt-btn mkt-btn--ghost mkt-btn--ghost-on-dark mkt-btn--lg">See the platform</Link>
          </FadeRise>
        </div>
      </section>
    </div>
  );
}
