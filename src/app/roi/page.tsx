'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SiteHeader } from '@/app/(marketing)/_components/SiteHeader';
import { SiteFooter } from '@/app/(marketing)/_components/SiteFooter';

// ─── Shared helpers ───────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000)    return '$' + Math.round(n / 1000) + 'k';
  return '$' + Math.round(n).toLocaleString('en-US');
}
function fmtN(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

function NumberInput({
  id, label, value, onChange, prefix, suffix, step = 1, min = 0,
}: {
  id: string; label: string; value: number; onChange: (v: number) => void;
  prefix?: string; suffix?: string; step?: number; min?: number;
}) {
  return (
    <div className="roi-field">
      <label className="roi-field__label" htmlFor={id}>{label}</label>
      <div className="roi-field__wrap">
        {prefix && <span className="roi-field__affix">{prefix}</span>}
        <input
          id={id} type="number" className="roi-field__input"
          value={value} step={step} min={min}
          onChange={(e) => { const v = parseFloat(e.target.value); onChange(Number.isFinite(v) ? v : 0); }}
        />
        {suffix && <span className="roi-field__affix roi-field__affix--right">{suffix}</span>}
      </div>
    </div>
  );
}

// ─── Calculator 1: Revenue at Risk ────────────────────────────────────────────
function RevenueCalc() {
  const [patients, setPatients] = useState(100);
  const [monthly,  setMonthly]  = useState(600);

  const annualAtRisk = patients * monthly * 0.35 * 12;
  const protected_   = annualAtRisk * 0.18;

  return (
    <section className="roi-section" id="revenue">
      <div className="mkt-container roi-section__inner roi-section__inner--a">

        {/* Visual */}
        <div className="roi-visual">
          <DriftVisual patients={patients} protected_={protected_} atRisk={annualAtRisk} />
        </div>

        {/* Calculator */}
        <div className="roi-calc">
          <span className="mkt-eyebrow">01 &middot; Revenue at risk</span>
          <h2 className="mkt-h2">What drift costs your program annually</h2>
          <p className="roi-calc__sub">
            At industry-baseline churn, 35% of active patients disengage within 12 months.
            Most clinics don&rsquo;t see it coming until the patient is already gone.
          </p>

          <div className="roi-calc__inputs">
            <NumberInput id="r-patients" label="Active GLP-1 patients" value={patients} onChange={setPatients} min={1} />
            <NumberInput id="r-monthly" label="Monthly program value per patient" value={monthly} onChange={setMonthly} prefix="$" step={25} min={0} />
          </div>

          <div className="roi-calc__outputs">
            <div className="roi-output roi-output--risk">
              <div className="roi-output__label">Annual revenue at risk</div>
              <div className="roi-output__num">{fmt(annualAtRisk)}</div>
              <div className="roi-output__sub">if drift continues unchecked</div>
            </div>
            <div className="roi-output roi-output--protect">
              <div className="roi-output__label">Protected with Adherix</div>
              <div className="roi-output__num">{fmt(protected_)}<span className="roi-output__yr">/yr</span></div>
              <div className="roi-output__sub">modeled at 18% retention improvement</div>
            </div>
          </div>

          <Link href="/pilot" className="roi-cta">
            Protect this revenue &rarr;
          </Link>
          <p className="roi-disclaimer">
            Modeled at 35% annual churn baseline and 18% retention lift. Pilots validate
            against your actual program data.
          </p>
        </div>

      </div>
    </section>
  );
}

function DriftVisual({ patients, protected_, atRisk }: { patients: number; protected_: number; atRisk: number }) {
  const pct = atRisk > 0 ? Math.min(protected_ / atRisk, 1) : 0;
  const dots = Math.min(Math.max(Math.round(patients / 10), 6), 20);
  const drifting = Math.round(dots * 0.35);
  const saved    = Math.round(drifting * 0.18);

  return (
    <svg viewBox="0 0 440 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="roi-svg" aria-hidden="true">
      {/* Background card */}
      <rect x="20" y="20" width="400" height="320" rx="16" fill="var(--mkt-paper-soft)" stroke="var(--mkt-line)" strokeWidth="1"/>

      {/* Title */}
      <text x="40" y="58" fontFamily="Geist,system-ui,sans-serif" fontSize="11" fontWeight="600"
        letterSpacing="0.08em" textTransform="uppercase" fill="var(--mkt-graphite)">PATIENT PANEL</text>

      {/* Patient dots — stable */}
      {Array.from({ length: dots - drifting }).map((_, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        return (
          <circle key={i} cx={52 + col * 36} cy={90 + row * 36} r="12"
            fill="var(--mkt-sage-mist)" stroke="var(--mkt-sage)" strokeWidth="1.5"/>
        );
      })}

      {/* Drifting dots */}
      {Array.from({ length: drifting }).map((_, i) => {
        const isSaved = i < saved;
        const startX = 52 + ((dots - drifting + i) % 5) * 36;
        const startY = 90 + Math.floor((dots - drifting + i) / 5) * 36;
        const endX   = startX + 90 + i * 8;
        const endY   = startY + 20;
        return (
          <g key={`d-${i}`}>
            <circle cx={isSaved ? startX + 45 : endX} cy={isSaved ? startY + 10 : endY} r="12"
              fill={isSaved ? 'var(--mkt-sage-mist)' : 'var(--mkt-line)'}
              stroke={isSaved ? 'var(--mkt-sage-deep)' : 'var(--mkt-graphite)'}
              strokeWidth="1.5" opacity={isSaved ? 1 : 0.4} strokeDasharray={isSaved ? '0' : '3 2'}/>
          </g>
        );
      })}

      {/* Arrow + save indicator */}
      <path d="M 290 180 L 360 180" stroke="var(--mkt-sage-deep)" strokeWidth="2" strokeDasharray="4 3"/>
      <polygon points="360,175 370,180 360,185" fill="var(--mkt-sage-deep)"/>

      {/* Protected bar */}
      <rect x="280" y="220" width="120" height="12" rx="6" fill="var(--mkt-line)"/>
      <rect x="280" y="220" width={120 * pct} height="12" rx="6" fill="var(--mkt-sage)"/>
      <text x="280" y="250" fontFamily="Geist,system-ui,sans-serif" fontSize="11" fill="var(--mkt-graphite)">
        {Math.round(pct * 100)}% of at-risk revenue protected
      </text>

      {/* Legend */}
      <circle cx="40" cy="300" r="7" fill="var(--mkt-sage-mist)" stroke="var(--mkt-sage)" strokeWidth="1.5"/>
      <text x="54" y="304" fontFamily="Geist,system-ui,sans-serif" fontSize="11" fill="var(--mkt-ink-2)">Retained</text>
      <circle cx="130" cy="300" r="7" fill="var(--mkt-line)" stroke="var(--mkt-graphite)" strokeWidth="1.5" opacity="0.5"/>
      <text x="144" y="304" fontFamily="Geist,system-ui,sans-serif" fontSize="11" fill="var(--mkt-ink-2)">Drifting</text>
      <circle cx="225" cy="300" r="7" fill="var(--mkt-sage-mist)" stroke="var(--mkt-sage-deep)" strokeWidth="1.5"/>
      <text x="239" y="304" fontFamily="Geist,system-ui,sans-serif" fontSize="11" fill="var(--mkt-ink-2)">Recovered</text>
    </svg>
  );
}

// ─── Calculator 2: Staff Time Recovered ──────────────────────────────────────
function StaffCalc() {
  const [coordinators, setCoordinators] = useState(3);
  const [hoursPerWeek, setHoursPerWeek] = useState(8);

  const AUTOMATION_RATE = 0.65;
  const HOURLY_RATE     = 35;

  const weeklyHoursSaved  = coordinators * hoursPerWeek * AUTOMATION_RATE;
  const annualHoursSaved  = weeklyHoursSaved * 52;
  const fteEquivalent     = annualHoursSaved / 2080;
  const annualDollarValue = annualHoursSaved * HOURLY_RATE;

  return (
    <section className="roi-section roi-section--alt" id="staff">
      <div className="mkt-container roi-section__inner roi-section__inner--b">

        {/* Calculator */}
        <div className="roi-calc">
          <span className="mkt-eyebrow">02 &middot; Staff efficiency</span>
          <h2 className="mkt-h2">Hours your team gets back every week</h2>
          <p className="roi-calc__sub">
            Every manual follow-up call, re-engagement text, and flagged-patient check
            is time your coordinators could spend on patients who need human attention.
          </p>

          <div className="roi-calc__inputs">
            <NumberInput id="s-coords" label="Care coordinators on your team" value={coordinators} onChange={setCoordinators} min={1} />
            <NumberInput id="s-hours" label="Hours per coordinator per week on manual follow-up" value={hoursPerWeek} onChange={setHoursPerWeek} suffix="hrs" step={0.5} min={0} />
          </div>

          <div className="roi-calc__outputs roi-calc__outputs--three">
            <div className="roi-output roi-output--neutral">
              <div className="roi-output__label">Hours saved per week</div>
              <div className="roi-output__num">{fmtN(weeklyHoursSaved)}</div>
              <div className="roi-output__sub">across your team</div>
            </div>
            <div className="roi-output roi-output--neutral">
              <div className="roi-output__label">Annual hours recovered</div>
              <div className="roi-output__num">{fmtN(annualHoursSaved)}</div>
              <div className="roi-output__sub">{fteEquivalent.toFixed(1)} FTE equivalent</div>
            </div>
            <div className="roi-output roi-output--protect">
              <div className="roi-output__label">Staff cost redirected</div>
              <div className="roi-output__num">{fmt(annualDollarValue)}<span className="roi-output__yr">/yr</span></div>
              <div className="roi-output__sub">at $35/hr coordinator rate</div>
            </div>
          </div>

          <Link href="/pilot" className="roi-cta">
            Free up your team &rarr;
          </Link>
          <p className="roi-disclaimer">
            Based on 65% automation of routine follow-up tasks. Adjust coordinator count
            and hours to reflect your program.
          </p>
        </div>

        {/* Visual */}
        <div className="roi-visual">
          <StaffVisual weeklyHours={weeklyHoursSaved} annualHours={annualHoursSaved} fte={fteEquivalent} />
        </div>

      </div>
    </section>
  );
}

function StaffVisual({ weeklyHours, annualHours, fte }: { weeklyHours: number; annualHours: number; fte: number }) {
  const bars = [
    { label: 'Mon', manual: 8, auto: Math.round(8 * 0.35) },
    { label: 'Tue', manual: 9, auto: Math.round(9 * 0.35) },
    { label: 'Wed', manual: 7, auto: Math.round(7 * 0.35) },
    { label: 'Thu', manual: 10, auto: Math.round(10 * 0.35) },
    { label: 'Fri', manual: 6, auto: Math.round(6 * 0.35) },
  ];
  const maxVal = 12;
  const barH   = 140;

  return (
    <svg viewBox="0 0 440 360" fill="none" xmlns="http://www.w3.org/2000/svg" className="roi-svg" aria-hidden="true">
      <rect x="20" y="20" width="400" height="320" rx="16" fill="var(--mkt-paper-soft)" stroke="var(--mkt-line)" strokeWidth="1"/>

      {/* Legend */}
      <rect x="40" y="42" width="14" height="14" rx="3" fill="var(--mkt-line)"/>
      <text x="60" y="53" fontFamily="Geist,system-ui,sans-serif" fontSize="11" fill="var(--mkt-graphite)">Without Adherix</text>
      <rect x="190" y="42" width="14" height="14" rx="3" fill="var(--mkt-sage)"/>
      <text x="210" y="53" fontFamily="Geist,system-ui,sans-serif" fontSize="11" fill="var(--mkt-graphite)">With Adherix</text>

      {/* Bars */}
      {bars.map((b, i) => {
        const x       = 52 + i * 72;
        const manualH = (b.manual / maxVal) * barH;
        const autoH   = (b.auto / maxVal) * barH;
        const baseY   = 230;
        return (
          <g key={b.label}>
            {/* Manual bar */}
            <rect x={x} y={baseY - manualH} width="28" height={manualH} rx="4" fill="var(--mkt-line)" opacity="0.7"/>
            {/* Auto bar */}
            <rect x={x + 32} y={baseY - autoH} width="28" height={autoH} rx="4" fill="var(--mkt-sage)"/>
            {/* Label */}
            <text x={x + 28} y={baseY + 18} fontFamily="Geist,system-ui,sans-serif" fontSize="11"
              textAnchor="middle" fill="var(--mkt-graphite)">{b.label}</text>
          </g>
        );
      })}

      {/* Baseline */}
      <line x1="40" y1="230" x2="410" y2="230" stroke="var(--mkt-line)" strokeWidth="1"/>

      {/* Y-axis labels */}
      <text x="36" y="234" fontFamily="Geist Mono,monospace" fontSize="10" textAnchor="end" fill="var(--mkt-graphite)">0h</text>
      <text x="36" y={234 - (barH * 0.5)} fontFamily="Geist Mono,monospace" fontSize="10" textAnchor="end" fill="var(--mkt-graphite)">6h</text>
      <text x="36" y={234 - barH} fontFamily="Geist Mono,monospace" fontSize="10" textAnchor="end" fill="var(--mkt-graphite)">12h</text>

      {/* Summary callout */}
      <rect x="40" y="262" width="360" height="58" rx="10" fill="var(--mkt-sage-mist)" stroke="var(--mkt-sage-soft)" strokeWidth="1"/>
      <text x="220" y="285" fontFamily="Fraunces,Georgia,serif" fontSize="22" fontWeight="500"
        textAnchor="middle" fill="var(--mkt-sage-deep)">{Math.round(weeklyHours)}h / week</text>
      <text x="220" y="305" fontFamily="Geist,system-ui,sans-serif" fontSize="11"
        textAnchor="middle" fill="var(--mkt-graphite)">
        {Math.round(annualHours).toLocaleString()} hrs/yr &middot; {fte.toFixed(1)} FTE equivalent
      </text>
    </svg>
  );
}

// ─── Calculator 3: Cost of Waiting ───────────────────────────────────────────
function WaitingCalc() {
  const [patients, setPatients] = useState(100);
  const [monthly,  setMonthly]  = useState(600);

  const ANNUAL_CHURN    = 0.35;
  const RECOVERY_48H    = 0.85;
  const RECOVERY_5DAY   = 0.58;
  const AVG_MONTHS_LEFT = 6;

  const annualChurners = patients * ANNUAL_CHURN;
  const revenuePerPatient = monthly * AVG_MONTHS_LEFT;

  const recoveredAt48h  = annualChurners * RECOVERY_48H * revenuePerPatient;
  const recoveredAt5Day = annualChurners * RECOVERY_5DAY * revenuePerPatient;
  const costOfWaiting   = recoveredAt48h - recoveredAt5Day;

  return (
    <section className="roi-section" id="timing">
      <div className="mkt-container roi-section__inner roi-section__inner--a">

        {/* Visual */}
        <div className="roi-visual">
          <EscalationVisual
            r48h={recoveredAt48h}
            r5day={recoveredAt5Day}
            churners={Math.round(annualChurners)}
          />
        </div>

        {/* Calculator */}
        <div className="roi-calc">
          <span className="mkt-eyebrow">03 &middot; Intervention timing</span>
          <h2 className="mkt-h2">What it costs to catch drift late</h2>
          <p className="roi-calc__sub">
            Adherix evaluates every patient every 60 seconds. The difference between a
            48-hour nudge and a 5-day escalation isn&rsquo;t just timing — it&rsquo;s
            recovery rate. Patients caught early re-engage at 85%. Patients who reach
            the flagged stage re-engage at 58%.
          </p>

          <div className="roi-calc__inputs">
            <NumberInput id="w-patients" label="Active GLP-1 patients" value={patients} onChange={setPatients} min={1} />
            <NumberInput id="w-monthly" label="Monthly program value per patient" value={monthly} onChange={setMonthly} prefix="$" step={25} min={0} />
          </div>

          <div className="roi-calc__outputs roi-calc__outputs--three">
            <div className="roi-output roi-output--protect">
              <div className="roi-output__label">Recovered at 48h</div>
              <div className="roi-output__num">{fmt(recoveredAt48h)}</div>
              <div className="roi-output__sub">85% re-engagement rate</div>
            </div>
            <div className="roi-output roi-output--warn">
              <div className="roi-output__label">Recovered at 5 days</div>
              <div className="roi-output__num">{fmt(recoveredAt5Day)}</div>
              <div className="roi-output__sub">58% re-engagement rate</div>
            </div>
            <div className="roi-output roi-output--risk">
              <div className="roi-output__label">Annual cost of waiting</div>
              <div className="roi-output__num">{fmt(costOfWaiting)}</div>
              <div className="roi-output__sub">lost by delaying to day 5</div>
            </div>
          </div>

          <Link href="/pilot" className="roi-cta">
            Catch drift at 48 hours &rarr;
          </Link>
          <p className="roi-disclaimer">
            Re-engagement rates modeled from behavioral intervention literature.
            Recovery rates vary by program and patient population.
          </p>
        </div>

      </div>
    </section>
  );
}

function EscalationVisual({ r48h, r5day, churners }: { r48h: number; r5day: number; churners: number }) {
  // Draw escalation cost curve: x = time (0 to 10 days), y = revenue loss
  const W = 400; const H = 240; const PAD = 50;
  const chartW = W - PAD * 2; const chartH = H - PAD * 1.5;

  // Cost curve: starts at 0, rises steeply after day 2, plateaus after day 7
  const points: [number, number][] = [
    [0, 0], [1, 5], [2, 12], [3, 28], [4, 42], [5, 57],
    [6, 68], [7, 76], [8, 82], [9, 86], [10, 90],
  ];
  const toSVG = ([x, y]: [number, number]) =>
    [PAD + (x / 10) * chartW, H - PAD * 0.5 - (y / 100) * chartH] as [number, number];

  const svgPoints = points.map(toSVG);
  const pathD = svgPoints.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');

  // Area fill
  const areaD = pathD + ` L ${svgPoints[svgPoints.length - 1][0]} ${H - PAD * 0.5} L ${PAD} ${H - PAD * 0.5} Z`;

  const [x48, y48] = toSVG([2, 12]);
  const [x5d, y5d] = toSVG([5, 57]);

  return (
    <svg viewBox={`0 0 ${W + 40} ${H + 120}`} fill="none" xmlns="http://www.w3.org/2000/svg" className="roi-svg" aria-hidden="true">
      <rect x="10" y="10" width={W + 20} height={H + 110} rx="16" fill="var(--mkt-paper-soft)" stroke="var(--mkt-line)" strokeWidth="1"/>

      {/* Title */}
      <text x="30" y="42" fontFamily="Geist,system-ui,sans-serif" fontSize="11" fontWeight="600"
        letterSpacing="0.08em" fill="var(--mkt-graphite)">COST OF DELAY</text>

      <g transform="translate(20, 55)">
        {/* Area fill */}
        <path d={areaD} fill="var(--mkt-sage-mist)" opacity="0.6"/>
        {/* Cost curve */}
        <path d={pathD} stroke="var(--mkt-sage-deep)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Baseline */}
        <line x1={PAD} y1={H - PAD * 0.5} x2={PAD + chartW} y2={H - PAD * 0.5} stroke="var(--mkt-line)" strokeWidth="1"/>
        <line x1={PAD} y1={PAD * 0.3} x2={PAD} y2={H - PAD * 0.5} stroke="var(--mkt-line)" strokeWidth="1"/>

        {/* X-axis labels */}
        {[0, 2, 5, 7, 10].map((d) => {
          const [sx] = toSVG([d, 0]);
          return <text key={d} x={sx} y={H - PAD * 0.5 + 16} fontFamily="Geist Mono,monospace" fontSize="10"
            textAnchor="middle" fill="var(--mkt-graphite)">Day {d}</text>;
        })}

        {/* 48h marker */}
        <line x1={x48} y1={y48} x2={x48} y2={H - PAD * 0.5} stroke="var(--mkt-sage-deep)" strokeWidth="1.5" strokeDasharray="4 3"/>
        <circle cx={x48} cy={y48} r="6" fill="var(--mkt-sage-deep)"/>
        <rect x={x48 - 36} y={y48 - 38} width="72" height="26" rx="6" fill="var(--mkt-sage-deep)"/>
        <text x={x48} y={y48 - 20} fontFamily="Geist,system-ui,sans-serif" fontSize="10" fontWeight="600"
          textAnchor="middle" fill="white">48h · 85% recovery</text>

        {/* 5-day marker */}
        <line x1={x5d} y1={y5d} x2={x5d} y2={H - PAD * 0.5} stroke="#b45309" strokeWidth="1.5" strokeDasharray="4 3"/>
        <circle cx={x5d} cy={y5d} r="6" fill="#b45309"/>
        <rect x={x5d - 40} y={y5d - 38} width="80" height="26" rx="6" fill="#b45309"/>
        <text x={x5d} y={y5d - 20} fontFamily="Geist,system-ui,sans-serif" fontSize="10" fontWeight="600"
          textAnchor="middle" fill="white">Day 5 · 58% recovery</text>
      </g>

      {/* Summary row */}
      <rect x="30" y={H + 82} width={W - 20} height="52" rx="10" fill="var(--mkt-ink)" />
      <text x={W / 2 + 10} y={H + 105} fontFamily="Geist,system-ui,sans-serif" fontSize="11"
        textAnchor="middle" fill="var(--mkt-sage-soft)">{churners} patients drift annually</text>
      <text x={W / 2 + 10} y={H + 123} fontFamily="Fraunces,Georgia,serif" fontSize="16" fontWeight="500"
        textAnchor="middle" fill="white">{fmt(r48h - r5day)} lost by waiting to Day 5</text>
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RoiPage() {
  return (
    <div className="mkt-page">
      <SiteHeader />
      <main>

        {/* Hero */}
        <section className="roi-hero">
          <div className="mkt-container roi-hero__inner">
            <span className="mkt-eyebrow">ROI calculator</span>
            <h1 className="mkt-h1 roi-hero__title">
              See exactly what patient drift
              <br />is costing your clinic.
            </h1>
            <p className="mkt-subhead roi-hero__sub">
              Three calculators. Three conversations. Each one shows a different dimension
              of what behavioral retention infrastructure returns — in revenue protected,
              staff hours recovered, and the compounding cost of catching drift too late.
            </p>
            <div className="roi-hero__nav">
              <a href="#revenue" className="roi-hero__jump">Revenue at risk</a>
              <a href="#staff" className="roi-hero__jump">Staff time recovered</a>
              <a href="#timing" className="roi-hero__jump">Cost of waiting</a>
            </div>
          </div>
        </section>

        <RevenueCalc />
        <StaffCalc />
        <WaitingCalc />

        {/* Bottom CTA */}
        <section className="roi-final">
          <div className="mkt-container roi-final__inner">
            <h2 className="mkt-h2">Ready to run these numbers against your actual program?</h2>
            <p className="mkt-subhead">
              A four-week pilot validates the model against your real patient panel.
              No commitment beyond the pilot window.
            </p>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
              Book a pilot &rarr;
            </Link>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
