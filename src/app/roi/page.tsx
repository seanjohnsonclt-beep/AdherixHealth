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
  // Segment bar widths (out of 360px usable)
  const BAR_W = 360;
  const retainedW = Math.round(BAR_W * 0.65);
  const driftW    = Math.round(BAR_W * 0.35);
  const recovW    = Math.round(driftW * 0.18);
  const X0 = 40;
  const BAR_Y1 = 108; // "without" bar top
  const BAR_Y2 = 196; // "with" bar top
  const BAR_H = 44;

  return (
    <svg viewBox="0 0 440 370" fill="none" xmlns="http://www.w3.org/2000/svg" className="roi-svg" aria-hidden="true">
      {/* Card */}
      <rect x="10" y="10" width="420" height="350" rx="16" fill="var(--mkt-paper-soft)" stroke="var(--mkt-line)" strokeWidth="1"/>

      {/* ── Row label: Without ── */}
      <text x={X0} y="92" fontFamily="Geist,system-ui,sans-serif" fontSize="12" fontWeight="600"
        fill="var(--mkt-graphite)" letterSpacing="-0.01em">WITHOUT ADHERIX</text>

      {/* Without bar: retained */}
      <rect x={X0} y={BAR_Y1} width={retainedW} height={BAR_H} rx="0"
        fill="var(--mkt-sage-mist)" stroke="none"/>
      {/* Without bar: drift */}
      <rect x={X0 + retainedW} y={BAR_Y1} width={driftW} height={BAR_H} rx="0"
        fill="#F5E1DB" stroke="none"/>
      {/* Without bar: outline */}
      <rect x={X0} y={BAR_Y1} width={BAR_W} height={BAR_H} rx="6" fill="none"
        stroke="var(--mkt-line)" strokeWidth="1.5"/>
      {/* Divider tick */}
      <line x1={X0 + retainedW} y1={BAR_Y1} x2={X0 + retainedW} y2={BAR_Y1 + BAR_H}
        stroke="var(--mkt-line)" strokeWidth="1.5"/>

      {/* Without bar labels inside */}
      <text x={X0 + retainedW / 2} y={BAR_Y1 + BAR_H / 2 + 5}
        fontFamily="Geist,system-ui,sans-serif" fontSize="13" fontWeight="600"
        textAnchor="middle" fill="var(--mkt-sage-deep)">65% retained</text>
      <text x={X0 + retainedW + driftW / 2} y={BAR_Y1 + BAR_H / 2 + 5}
        fontFamily="Geist,system-ui,sans-serif" fontSize="13" fontWeight="600"
        textAnchor="middle" fill="#A8584A">35% drifting</text>

      {/* Without loss callout */}
      <text x={X0 + retainedW + driftW / 2} y={BAR_Y1 + BAR_H + 18}
        fontFamily="Geist Mono,monospace" fontSize="12" fontWeight="500"
        textAnchor="middle" fill="#A8584A">{fmt(atRisk)} at risk / yr</text>

      {/* ── Row label: With ── */}
      <text x={X0} y="182" fontFamily="Geist,system-ui,sans-serif" fontSize="12" fontWeight="600"
        fill="var(--mkt-sage-deep)" letterSpacing="-0.01em">WITH ADHERIX</text>

      {/* With bar: retained */}
      <rect x={X0} y={BAR_Y2} width={retainedW} height={BAR_H} rx="0"
        fill="var(--mkt-sage-mist)" stroke="none"/>
      {/* With bar: recovered slice */}
      <rect x={X0 + retainedW} y={BAR_Y2} width={recovW} height={BAR_H} rx="0"
        fill="var(--mkt-sage)" stroke="none"/>
      {/* With bar: still-drifting slice */}
      <rect x={X0 + retainedW + recovW} y={BAR_Y2} width={driftW - recovW} height={BAR_H} rx="0"
        fill="#F5E1DB" opacity="0.55" stroke="none"/>
      {/* With bar: outline */}
      <rect x={X0} y={BAR_Y2} width={BAR_W} height={BAR_H} rx="6" fill="none"
        stroke="var(--mkt-sage-soft)" strokeWidth="1.5"/>
      {/* Divider ticks */}
      <line x1={X0 + retainedW} y1={BAR_Y2} x2={X0 + retainedW} y2={BAR_Y2 + BAR_H}
        stroke="var(--mkt-line)" strokeWidth="1.5"/>
      <line x1={X0 + retainedW + recovW} y1={BAR_Y2} x2={X0 + retainedW + recovW} y2={BAR_Y2 + BAR_H}
        stroke="var(--mkt-sage-soft)" strokeWidth="1.5" strokeDasharray="3 2"/>

      {/* With bar labels inside */}
      <text x={X0 + retainedW / 2} y={BAR_Y2 + BAR_H / 2 + 5}
        fontFamily="Geist,system-ui,sans-serif" fontSize="13" fontWeight="600"
        textAnchor="middle" fill="var(--mkt-sage-deep)">65% retained</text>
      <text x={X0 + retainedW + recovW / 2} y={BAR_Y2 + BAR_H / 2 + 5}
        fontFamily="Geist,system-ui,sans-serif" fontSize="10" fontWeight="700"
        textAnchor="middle" fill="white">↑ back</text>

      {/* Recovered callout */}
      <text x={X0 + retainedW + recovW / 2} y={BAR_Y2 + BAR_H + 18}
        fontFamily="Geist Mono,monospace" fontSize="12" fontWeight="500"
        textAnchor="middle" fill="var(--mkt-sage-deep)">{fmt(protected_)} recovered</text>

      {/* ── Bottom: dark summary band ── */}
      <rect x="30" y="278" width="380" height="62" rx="12" fill="var(--mkt-ink)"/>

      <text x="220" y="302" fontFamily="Geist,system-ui,sans-serif" fontSize="11"
        textAnchor="middle" fill="rgba(244,239,230,0.6)" letterSpacing="0.04em">
        ADHERIX PROTECTS
      </text>
      <text x="220" y="325" fontFamily="Fraunces,Georgia,serif" fontSize="22" fontWeight="500"
        textAnchor="middle" fill="white">
        {fmt(protected_)} of your {fmt(atRisk)} at-risk revenue
      </text>
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
  // Chart area
  const CX = 52;   // chart left
  const CY = 54;   // chart top
  const CW = 330;  // chart width
  const CH = 150;  // chart height

  // Cost-of-delay curve (day 0–10, loss 0–100%)
  const pts: [number, number][] = [
    [0,0],[1,5],[2,12],[3,28],[4,42],[5,57],[6,68],[7,76],[8,82],[9,86],[10,90],
  ];
  const sx = (d: number) => CX + (d / 10) * CW;
  const sy = (v: number) => CY + CH - (v / 100) * CH;

  const linePath = pts.map(([d, v], i) => `${i === 0 ? 'M' : 'L'}${sx(d)},${sy(v)}`).join(' ');
  const areaPath = linePath + ` L${sx(10)},${sy(0)} L${sx(0)},${sy(0)} Z`;

  // Shaded gap area between Day 2 and Day 5
  const gapPts: [number, number][] = [[2,12],[3,28],[4,42],[5,57]];
  const gapTop = gapPts.map(([d,v]) => `${sx(d)},${sy(v)}`).join(' L');
  const gapPath = `M${sx(2)},${sy(0)} L${gapTop} L${sx(5)},${sy(0)} Z`;

  // Marker coords
  const m48x = sx(2); const m48y = sy(12);
  const m5dx = sx(5); const m5dy = sy(57);

  return (
    <svg viewBox="0 0 440 390" fill="none" xmlns="http://www.w3.org/2000/svg" className="roi-svg" aria-hidden="true">
      {/* Card */}
      <rect x="10" y="10" width="420" height="370" rx="16" fill="var(--mkt-paper-soft)" stroke="var(--mkt-line)" strokeWidth="1"/>

      {/* Title */}
      <text x="32" y="38" fontFamily="Geist,system-ui,sans-serif" fontSize="11" fontWeight="600"
        letterSpacing="0.08em" fill="var(--mkt-graphite)">REVENUE RECOVERY RATE vs. RESPONSE TIME</text>

      {/* Area under curve */}
      <path d={areaPath} fill="var(--mkt-sage-mist)" opacity="0.5"/>
      {/* Gap zone (Day 2 → Day 5): cost of waiting */}
      <path d={gapPath} fill="#F5E1DB" opacity="0.7"/>

      {/* Curve line */}
      <path d={linePath} stroke="var(--mkt-sage-deep)" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"/>

      {/* Axes */}
      <line x1={CX} y1={CY} x2={CX} y2={CY + CH} stroke="var(--mkt-line)" strokeWidth="1"/>
      <line x1={CX} y1={CY + CH} x2={CX + CW} y2={CY + CH} stroke="var(--mkt-line)" strokeWidth="1"/>

      {/* X-axis day labels */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
        <text key={d} x={sx(d)} y={CY + CH + 16} fontFamily="Geist Mono,monospace" fontSize="10"
          textAnchor="middle" fill="var(--mkt-graphite)">
          {d === 0 ? '0' : d === 2 ? '2' : d === 5 ? '5' : d === 10 ? '10' : ''}
        </text>
      ))}
      <text x={CX + CW / 2} y={CY + CH + 30} fontFamily="Geist,system-ui,sans-serif" fontSize="10"
        textAnchor="middle" fill="var(--mkt-graphite)" letterSpacing="0.04em">Days since last patient response</text>

      {/* Y-axis label */}
      <text x="18" y={CY + CH / 2} fontFamily="Geist,system-ui,sans-serif" fontSize="10"
        textAnchor="middle" fill="var(--mkt-graphite)" transform={`rotate(-90, 18, ${CY + CH / 2})`}>
        Revenue recovered
      </text>

      {/* ── 48h marker ── */}
      <line x1={m48x} y1={m48y} x2={m48x} y2={CY + CH}
        stroke="var(--mkt-sage-deep)" strokeWidth="1.5" strokeDasharray="4 3"/>
      <circle cx={m48x} cy={m48y} r="7" fill="var(--mkt-sage-deep)"/>
      {/* Label below x-axis */}
      <rect x={m48x - 68} y={CY + CH + 38} width="136" height="36" rx="8"
        fill="var(--mkt-sage-deep)"/>
      <text x={m48x} y={CY + CH + 53} fontFamily="Geist,system-ui,sans-serif" fontSize="11"
        fontWeight="700" textAnchor="middle" fill="white">48-hour nudge</text>
      <text x={m48x} y={CY + CH + 67} fontFamily="Geist,system-ui,sans-serif" fontSize="10"
        textAnchor="middle" fill="rgba(255,255,255,0.8)">85% re-engagement rate</text>

      {/* ── Day 5 marker ── */}
      <line x1={m5dx} y1={m5dy} x2={m5dx} y2={CY + CH}
        stroke="#b45309" strokeWidth="1.5" strokeDasharray="4 3"/>
      <circle cx={m5dx} cy={m5dy} r="7" fill="#b45309"/>
      {/* Label below x-axis */}
      <rect x={m5dx - 68} y={CY + CH + 38} width="136" height="36" rx="8" fill="#b45309"/>
      <text x={m5dx} y={CY + CH + 53} fontFamily="Geist,system-ui,sans-serif" fontSize="11"
        fontWeight="700" textAnchor="middle" fill="white">Day 5 escalation</text>
      <text x={m5dx} y={CY + CH + 67} fontFamily="Geist,system-ui,sans-serif" fontSize="10"
        textAnchor="middle" fill="rgba(255,255,255,0.8)">58% re-engagement rate</text>

      {/* Gap label in the shaded zone */}
      <text x={(m48x + m5dx) / 2} y={sy(35)} fontFamily="Geist,system-ui,sans-serif" fontSize="10"
        fontWeight="600" textAnchor="middle" fill="#92400E">← gap →</text>

      {/* Bottom summary band */}
      <rect x="30" y="318" width="380" height="52" rx="12" fill="var(--mkt-ink)"/>
      <text x="220" y="340" fontFamily="Geist,system-ui,sans-serif" fontSize="11"
        textAnchor="middle" fill="rgba(244,239,230,0.6)" letterSpacing="0.04em">
        {churners} PATIENTS DRIFT / YR · COST OF WAITING
      </text>
      <text x="220" y="360" fontFamily="Fraunces,Georgia,serif" fontSize="20" fontWeight="500"
        textAnchor="middle" fill="white">
        {fmt(r48h - r5day)} lost by not acting at 48 hours
      </text>
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
