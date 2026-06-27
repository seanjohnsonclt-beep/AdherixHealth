'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SiteHeader } from '@/app/(marketing)/_components/SiteHeader';
import { SiteFooter } from '@/app/(marketing)/_components/SiteFooter';

// ── Shared helpers ─────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 10_000)    return '$' + Math.round(n / 1000) + 'k';
  return '$' + Math.round(n).toLocaleString('en-US');
}
function fmtN(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

// Platform fee lookup (monthly) by patient count + track
function platformFee(patients: number, track: 'keep' | 'quest'): number {
  if (track === 'quest') {
    if (patients <= 30)  return 799;
    if (patients <= 75)  return 1249;
    if (patients <= 150) return 1999;
    if (patients <= 300) return 3249;
    return 4999;
  }
  // keep
  if (patients <= 100)  return 999;
  if (patients <= 250)  return 1799;
  if (patients <= 500)  return 2999;
  if (patients <= 1000) return 4999;
  return 7999;
}

function platformTierLabel(patients: number, track: 'keep' | 'quest'): string {
  if (track === 'quest') {
    if (patients <= 30)  return 'Starter';
    if (patients <= 75)  return 'Launch';
    if (patients <= 150) return 'Growth';
    if (patients <= 300) return 'Performance';
    return 'Enterprise est.';
  }
  if (patients <= 100)  return 'Launch';
  if (patients <= 250)  return 'Growth';
  if (patients <= 500)  return 'Performance';
  if (patients <= 1000) return 'Advanced';
  return 'Enterprise est.';
}

// ── Field primitives ───────────────────────────────────────────────────────────

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

// ── Track toggle ───────────────────────────────────────────────────────────────

function TrackToggle({
  track, onChange,
}: {
  track: 'keep' | 'quest';
  onChange: (t: 'keep' | 'quest') => void;
}) {
  return (
    <div style={{
      display: 'inline-flex', border: '1px solid var(--mkt-line)', borderRadius: 10,
      overflow: 'hidden', marginBottom: 40,
    }}>
      {(['keep', 'quest'] as const).map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            padding: '10px 28px', fontSize: 14, fontWeight: track === t ? 600 : 400,
            background: track === t ? 'var(--mkt-ink)' : 'transparent',
            color: track === t ? 'var(--mkt-paper)' : 'var(--mkt-graphite)',
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: track === t ? 600 : 500 }}>
              {t === 'keep' ? 'Adherix Keep' : 'Adherix Quest'}
            </span>
            <span style={{
              fontSize: 11,
              color: track === t ? 'rgba(255,255,255,0.7)' : 'var(--mkt-graphite)',
              fontWeight: 400,
            }}>
              {t === 'keep' ? 'Adult GLP-1 program' : 'Teen / adolescent · ages 13-18'}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Calculator 1: Revenue at Risk ──────────────────────────────────────────────

function RevenueCalc({ track }: { track: 'keep' | 'quest' }) {
  const isQuest = track === 'quest';

  const [patients, setPatients] = useState(isQuest ? 75 : 100);
  const [monthly,  setMonthly]  = useState(isQuest ? 450 : 600);
  const [rewardPm, setRewardPm] = useState(2); // Quest only: avg $ reward per patient per month

  const churnRate = isQuest ? 0.42 : 0.35;
  const liftPct   = isQuest ? 0.22 : 0.18;

  const annualAtRisk   = patients * monthly * churnRate * 12;
  const protectedGross = annualAtRisk * liftPct;

  const platformMonthly = platformFee(patients, track);
  const platformAnnual  = platformMonthly * 12;
  const tierLabel       = platformTierLabel(patients, track);

  // Quest reward cost (clinic-funded, Adherix takes 10% admin fee)
  const rewardFundAnnual = isQuest ? patients * rewardPm * 12 : 0;
  const rewardAdminAnnual = rewardFundAnnual * 0.10;

  const totalCostAnnual = platformAnnual + rewardFundAnnual;
  const netAnnual       = protectedGross - totalCostAnnual;
  const roiMultiple     = totalCostAnnual > 0 ? protectedGross / totalCostAnnual : 0;

  return (
    <section className="roi-section" id="revenue">
      <div className="mkt-container roi-section__inner roi-section__inner--a">

        {/* Visual */}
        <div className="roi-visual">
          <RevenueVisual
            track={track}
            patients={patients}
            protected_={protectedGross}
            atRisk={annualAtRisk}
            platformAnnual={platformAnnual}
            rewardFund={rewardFundAnnual}
            netAnnual={netAnnual}
          />
        </div>

        {/* Calculator */}
        <div className="roi-calc">
          <span className="mkt-eyebrow">01 &middot; Revenue at risk</span>
          <h2 className="mkt-h2">
            {isQuest
              ? 'What teen dropout costs your pediatric program'
              : 'What drift costs your program annually'}
          </h2>
          <p className="roi-calc__sub">
            {isQuest
              ? 'Teen GLP-1 programs see 40-45% annual dropout. Quest reduces that through gamification, dual-channel engagement, and reward-driven accountability.'
              : 'At industry-baseline churn, 35% of active patients disengage within 12 months. Most clinics don\'t see it coming until the patient is already gone.'}
          </p>

          <div className="roi-calc__inputs">
            <NumberInput
              id="r-patients"
              label={isQuest ? 'Active Quest patients (teens)' : 'Active GLP-1 patients'}
              value={patients}
              onChange={setPatients}
              min={1}
            />
            <NumberInput
              id="r-monthly"
              label="Monthly program value per patient"
              value={monthly}
              onChange={setMonthly}
              prefix="$"
              step={25}
              min={0}
            />
            {isQuest && (
              <NumberInput
                id="r-reward"
                label="Avg gift card budget per patient per month"
                value={rewardPm}
                onChange={setRewardPm}
                prefix="$"
                step={0.50}
                min={0}
              />
            )}
          </div>

          <div className="roi-calc__outputs">
            <div className="roi-output roi-output--risk">
              <div className="roi-output__label">Annual revenue at risk</div>
              <div className="roi-output__num">{fmt(annualAtRisk)}</div>
              <div className="roi-output__sub">if dropout continues unchecked</div>
            </div>
            <div className="roi-output roi-output--protect">
              <div className="roi-output__label">Revenue protected</div>
              <div className="roi-output__num">{fmt(protectedGross)}<span className="roi-output__yr">/yr</span></div>
              <div className="roi-output__sub">
                {isQuest ? 'modeled at 22% retention improvement' : 'modeled at 18% retention improvement'}
              </div>
            </div>
          </div>

          {/* Quest cost breakdown */}
          {isQuest && (
            <div style={{
              marginTop: 24, padding: '16px 20px',
              border: '1px solid var(--mkt-line)', borderRadius: 10,
              fontSize: 14,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13, letterSpacing: '0.04em', color: 'var(--mkt-graphite)' }}>
                FULL COST PICTURE
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--mkt-line)' }}>
                <span style={{ color: 'var(--mkt-graphite)' }}>Platform ({tierLabel} tier)</span>
                <span style={{ fontWeight: 600 }}>{fmt(platformAnnual)}/yr</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--mkt-line)' }}>
                <span style={{ color: 'var(--mkt-graphite)' }}>Gift card fund (clinic-funded)</span>
                <span style={{ fontWeight: 600 }}>{fmt(rewardFundAnnual)}/yr</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--mkt-line)' }}>
                <span style={{ color: 'var(--mkt-graphite)', fontStyle: 'italic' }}>Reward admin fee (10%, paid to Adherix)</span>
                <span style={{ fontWeight: 500, color: 'var(--mkt-graphite)' }}>{fmt(rewardAdminAnnual)}/yr</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', marginTop: 4 }}>
                <span style={{ fontWeight: 600 }}>Net return for clinic</span>
                <span style={{
                  fontWeight: 700, fontSize: 16,
                  color: netAnnual >= 0 ? 'var(--mkt-sage-deep)' : '#92400E',
                }}>
                  {netAnnual >= 0 ? '+' : ''}{fmt(netAnnual)}/yr
                  <span style={{ fontWeight: 400, fontSize: 13, marginLeft: 8, color: 'var(--mkt-graphite)' }}>
                    ({roiMultiple.toFixed(1)}x ROI)
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Keep platform cost note */}
          {!isQuest && (
            <div style={{
              marginTop: 16, fontSize: 13, color: 'var(--mkt-graphite)',
              padding: '10px 14px', background: 'var(--mkt-paper-soft)', borderRadius: 8,
            }}>
              Platform cost ({tierLabel}): {fmt(platformAnnual)}/yr &nbsp;&middot;&nbsp; Net: {fmt(protectedGross - platformAnnual)}/yr
            </div>
          )}

          <Link href="/pilot" className="roi-cta" style={{ marginTop: 24 }}>
            {isQuest ? 'Build your Quest program →' : 'Protect this revenue →'}
          </Link>
          <p className="roi-disclaimer">
            {isQuest
              ? 'Modeled at 42% annual dropout baseline and 22% retention lift. Platform fee auto-calculated from patient count. Gift card budget is a clinic input - adjust to match your program.'
              : 'Modeled at 35% annual churn baseline and 18% retention lift. Pilots validate against your actual program data.'}
          </p>
        </div>

      </div>
    </section>
  );
}

function RevenueVisual({
  track, patients, protected_, atRisk, platformAnnual, rewardFund, netAnnual,
}: {
  track: 'keep' | 'quest';
  patients: number;
  protected_: number;
  atRisk: number;
  platformAnnual: number;
  rewardFund: number;
  netAnnual: number;
}) {
  const isQuest = track === 'quest';
  const churn   = isQuest ? 0.42 : 0.35;
  const lift    = isQuest ? 0.22 : 0.18;
  const BAR_W   = 340;
  const X0      = 50;

  return (
    <svg viewBox="0 0 440 290" fill="none" xmlns="http://www.w3.org/2000/svg" className="roi-svg" aria-hidden="true">
      <rect x="10" y="10" width="420" height="270" rx="16" fill="var(--mkt-paper-soft)" stroke="var(--mkt-line)" strokeWidth="1"/>

      <text x={X0} y="44" fontFamily="Geist,system-ui,sans-serif" fontSize="11" fontWeight="600"
        letterSpacing="0.08em" fill="var(--mkt-graphite)">
        {isQuest ? 'ANNUAL PROGRAM REVENUE PICTURE' : 'WHERE YOUR PROGRAM REVENUE GOES ANNUALLY'}
      </text>

      {/* Retained */}
      <text x={X0} y="72" fontFamily="Geist,system-ui,sans-serif" fontSize="13" fontWeight="600"
        fill="var(--mkt-sage-deep)">Patients retained ({isQuest ? '58%' : '65%'})</text>
      <rect x={X0} y="80" width={BAR_W} height="26" rx="6" fill="var(--mkt-line)" opacity="0.4"/>
      <rect x={X0} y="80" width={BAR_W * (1 - churn)} height="26" rx="6" fill="var(--mkt-sage-mist)" stroke="var(--mkt-sage-soft)" strokeWidth="1"/>
      <text x={X0 + BAR_W * (1 - churn) - 10} y="97" fontFamily="Geist,system-ui,sans-serif"
        fontSize="12" fontWeight="600" textAnchor="end" fill="var(--mkt-sage-deep)">on track</text>

      {/* Drifting */}
      <text x={X0} y="126" fontFamily="Geist,system-ui,sans-serif" fontSize="13" fontWeight="600"
        fill="#92400E">Dropout risk ({isQuest ? '42%' : '35%'})</text>
      <rect x={X0} y="134" width={BAR_W} height="26" rx="6" fill="var(--mkt-line)" opacity="0.4"/>
      <rect x={X0} y="134" width={BAR_W * churn} height="26" rx="6" fill="#fed7aa" stroke="#fdba74" strokeWidth="1"/>
      <text x={X0 + BAR_W * churn - 10} y="151" fontFamily="Geist Mono,monospace"
        fontSize="12" fontWeight="600" textAnchor="end" fill="#92400E">{fmt(atRisk)}/yr</text>

      {/* Recovered */}
      <text x={X0} y="180" fontFamily="Geist,system-ui,sans-serif" fontSize="13" fontWeight="600"
        fill="var(--mkt-sage-deep)">Recovered with Adherix ({Math.round(lift * 100)}% of at-risk)</text>
      <rect x={X0} y="188" width={BAR_W} height="26" rx="6" fill="var(--mkt-line)" opacity="0.4"/>
      <rect x={X0} y="188" width={BAR_W * churn * lift} height="26" rx="6" fill="var(--mkt-sage)" stroke="var(--mkt-sage-deep)" strokeWidth="1"/>
      <text x={X0 + BAR_W * churn * lift + 10} y="205" fontFamily="Geist Mono,monospace"
        fontSize="12" fontWeight="600" textAnchor="start" fill="var(--mkt-sage-deep)">{fmt(protected_)}/yr</text>

      {/* Bottom band */}
      <rect x="30" y="226" width="380" height="44" rx="12" fill="var(--mkt-ink)"/>
      <text x="220" y="245" fontFamily="Geist,system-ui,sans-serif" fontSize="11"
        textAnchor="middle" fill="rgba(244,239,230,0.55)" letterSpacing="0.05em">
        {isQuest ? 'NET AFTER PLATFORM + REWARDS' : 'ANNUAL PROGRAM EXPOSURE'}
      </text>
      <text x="220" y="262" fontFamily="Fraunces,Georgia,serif" fontSize="15" fontWeight="500"
        textAnchor="middle" fill="white">
        {isQuest
          ? `${fmt(protected_)} protected · ${netAnnual >= 0 ? '+' : ''}${fmt(netAnnual)} net`
          : `${fmt(protected_)} recovered · ${fmt(atRisk)} at risk`}
      </text>
    </svg>
  );
}

// ── Calculator 2: Staff Time Recovered ─────────────────────────────────────────

function StaffCalc({ track }: { track: 'keep' | 'quest' }) {
  const isQuest = track === 'quest';

  const [coordinators, setCoordinators] = useState(isQuest ? 2 : 3);
  const [hoursPerWeek, setHoursPerWeek] = useState(isQuest ? 6 : 8);

  const AUTOMATION_RATE = 0.65;
  const HOURLY_RATE     = 35;

  const weeklyHoursSaved  = coordinators * hoursPerWeek * AUTOMATION_RATE;
  const annualHoursSaved  = weeklyHoursSaved * 52;
  const fteEquivalent     = annualHoursSaved / 2080;
  const annualDollarValue = annualHoursSaved * HOURLY_RATE;

  return (
    <section className="roi-section roi-section--alt" id="staff">
      <div className="mkt-container roi-section__inner roi-section__inner--b">

        <div className="roi-calc">
          <span className="mkt-eyebrow">02 &middot; Staff efficiency</span>
          <h2 className="mkt-h2">Hours your team gets back every week</h2>
          <p className="roi-calc__sub">
            {isQuest
              ? 'Guardian calls, consent follow-ups, reward fulfillment, and manual check-in tracking all eat coordinator time. Adherix Quest automates 65% of it.'
              : 'Every manual follow-up call, re-engagement text, and flagged-patient check is time your coordinators could spend on patients who need human attention.'}
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
      <rect x="40" y="42" width="14" height="14" rx="3" fill="var(--mkt-line)"/>
      <text x="60" y="53" fontFamily="Geist,system-ui,sans-serif" fontSize="11" fill="var(--mkt-graphite)">Without Adherix</text>
      <rect x="190" y="42" width="14" height="14" rx="3" fill="var(--mkt-sage)"/>
      <text x="210" y="53" fontFamily="Geist,system-ui,sans-serif" fontSize="11" fill="var(--mkt-graphite)">With Adherix</text>
      {bars.map((b, i) => {
        const x       = 52 + i * 72;
        const manualH = (b.manual / maxVal) * barH;
        const autoH   = (b.auto / maxVal) * barH;
        const baseY   = 230;
        return (
          <g key={b.label}>
            <rect x={x} y={baseY - manualH} width="28" height={manualH} rx="4" fill="var(--mkt-line)" opacity="0.7"/>
            <rect x={x + 32} y={baseY - autoH} width="28" height={autoH} rx="4" fill="var(--mkt-sage)"/>
            <text x={x + 28} y={baseY + 18} fontFamily="Geist,system-ui,sans-serif" fontSize="11"
              textAnchor="middle" fill="var(--mkt-graphite)">{b.label}</text>
          </g>
        );
      })}
      <line x1="40" y1="230" x2="410" y2="230" stroke="var(--mkt-line)" strokeWidth="1"/>
      <text x="36" y="234" fontFamily="Geist Mono,monospace" fontSize="10" textAnchor="end" fill="var(--mkt-graphite)">0h</text>
      <text x="36" y={234 - (barH * 0.5)} fontFamily="Geist Mono,monospace" fontSize="10" textAnchor="end" fill="var(--mkt-graphite)">6h</text>
      <text x="36" y={234 - barH} fontFamily="Geist Mono,monospace" fontSize="10" textAnchor="end" fill="var(--mkt-graphite)">12h</text>
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

// ── Calculator 3: Cost of Waiting ──────────────────────────────────────────────

function WaitingCalc({ track }: { track: 'keep' | 'quest' }) {
  const isQuest = track === 'quest';

  const [patients, setPatients] = useState(isQuest ? 75 : 100);
  const [monthly,  setMonthly]  = useState(isQuest ? 450 : 600);

  const ANNUAL_CHURN    = isQuest ? 0.42 : 0.35;
  const RECOVERY_48H    = 0.85;
  const RECOVERY_5DAY   = 0.58;
  const AVG_MONTHS_LEFT = 6;

  const annualChurners  = patients * ANNUAL_CHURN;
  const revenuePerPatient = monthly * AVG_MONTHS_LEFT;

  const recoveredAt48h  = annualChurners * RECOVERY_48H * revenuePerPatient;
  const recoveredAt5Day = annualChurners * RECOVERY_5DAY * revenuePerPatient;
  const costOfWaiting   = recoveredAt48h - recoveredAt5Day;

  return (
    <section className="roi-section" id="timing">
      <div className="mkt-container roi-section__inner roi-section__inner--a">

        <div className="roi-visual">
          <EscalationVisual
            r48h={recoveredAt48h}
            r5day={recoveredAt5Day}
            churners={Math.round(annualChurners)}
          />
        </div>

        <div className="roi-calc">
          <span className="mkt-eyebrow">03 &middot; Intervention timing</span>
          <h2 className="mkt-h2">What it costs to catch drift late</h2>
          <p className="roi-calc__sub">
            Adherix evaluates every patient every 60 seconds. The difference between a
            48-hour nudge and a 5-day escalation isn&rsquo;t just timing - it&rsquo;s
            recovery rate. Patients caught early re-engage at 85%. Patients who reach
            the flagged stage re-engage at 58%.
          </p>

          <div className="roi-calc__inputs">
            <NumberInput
              id="w-patients"
              label={isQuest ? 'Active Quest patients (teens)' : 'Active GLP-1 patients'}
              value={patients}
              onChange={setPatients}
              min={1}
            />
            <NumberInput
              id="w-monthly"
              label="Monthly program value per patient"
              value={monthly}
              onChange={setMonthly}
              prefix="$"
              step={25}
              min={0}
            />
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
  const BAR_W = 340;
  const X0    = 50;

  return (
    <svg viewBox="0 0 440 310" fill="none" xmlns="http://www.w3.org/2000/svg" className="roi-svg" aria-hidden="true">
      <rect x="10" y="10" width="420" height="290" rx="16" fill="var(--mkt-paper-soft)" stroke="var(--mkt-line)" strokeWidth="1"/>
      <text x={X0} y="44" fontFamily="Geist,system-ui,sans-serif" fontSize="11" fontWeight="600"
        letterSpacing="0.08em" fill="var(--mkt-graphite)">RE-ENGAGEMENT RATE BY RESPONSE TIME</text>
      <text x={X0} y="74" fontFamily="Geist,system-ui,sans-serif" fontSize="13" fontWeight="600"
        fill="var(--mkt-sage-deep)">Adherix nudge at 48 hours</text>
      <rect x={X0} y="82" width={BAR_W} height="28" rx="6" fill="var(--mkt-line)" opacity="0.5"/>
      <rect x={X0} y="82" width={BAR_W * 0.85} height="28" rx="6" fill="var(--mkt-sage)"/>
      <text x={X0 + BAR_W * 0.85 - 10} y="101" fontFamily="Geist,system-ui,sans-serif"
        fontSize="13" fontWeight="700" textAnchor="end" fill="white">85%</text>
      <text x={X0} y="124" fontFamily="Geist,system-ui,sans-serif" fontSize="12"
        fill="var(--mkt-graphite)">of drifting patients re-engage</text>
      <text x={X0} y="154" fontFamily="Geist,system-ui,sans-serif" fontSize="13" fontWeight="600"
        fill="#92400E">Manual check-in at Day 5+</text>
      <rect x={X0} y="162" width={BAR_W} height="28" rx="6" fill="var(--mkt-line)" opacity="0.5"/>
      <rect x={X0} y="162" width={BAR_W * 0.58} height="28" rx="6" fill="#d97706"/>
      <text x={X0 + BAR_W * 0.58 - 10} y="181" fontFamily="Geist,system-ui,sans-serif"
        fontSize="13" fontWeight="700" textAnchor="end" fill="white">58%</text>
      <text x={X0} y="204" fontFamily="Geist,system-ui,sans-serif" fontSize="12"
        fill="var(--mkt-graphite)">of drifting patients re-engage</text>
      <rect x="30" y="218" width="380" height="62" rx="12" fill="var(--mkt-ink)"/>
      <text x="220" y="240" fontFamily="Geist,system-ui,sans-serif" fontSize="11"
        textAnchor="middle" fill="rgba(244,239,230,0.55)" letterSpacing="0.05em">
        {churners} PATIENTS DRIFT / YR - 27 POINT RECOVERY GAP
      </text>
      <text x="220" y="264" fontFamily="Fraunces,Georgia,serif" fontSize="21" fontWeight="500"
        textAnchor="middle" fill="white">
        {fmt(r48h - r5day)} lost every year by waiting
      </text>
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function RoiPage() {
  const [track, setTrack] = useState<'keep' | 'quest'>('keep');

  return (
    <div className="mkt-page">
      <SiteHeader />
      <main>

        <section className="roi-hero">
          <div className="mkt-container roi-hero__inner">
            <span className="mkt-eyebrow">ROI calculator</span>
            <h1 className="mkt-h1 roi-hero__title">
              See exactly what patient drift
              <br />is costing your clinic.
            </h1>
            <p className="mkt-subhead roi-hero__sub">
              Three calculators. Three conversations. Each one shows a different dimension
              of what behavioral retention infrastructure returns - in revenue protected,
              staff hours recovered, and the compounding cost of catching drift too late.
            </p>

            <div style={{ marginTop: 32 }}>
              <TrackToggle track={track} onChange={setTrack} />
            </div>

            <div className="roi-hero__nav">
              <a href="#revenue" className="roi-hero__jump">Revenue at risk</a>
              <a href="#staff" className="roi-hero__jump">Staff time recovered</a>
              <a href="#timing" className="roi-hero__jump">Cost of waiting</a>
            </div>
          </div>
        </section>

        <RevenueCalc track={track} />
        <StaffCalc track={track} />
        <WaitingCalc track={track} />

        <section className="roi-final">
          <div className="mkt-container roi-final__inner">
            <h2 className="mkt-h2">Ready to run these numbers against your actual program?</h2>
            <p className="mkt-subhead">
              A three-month pilot validates the model against your real patient panel.
              No commitment beyond the pilot window.
            </p>
            <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--lg">
                     Book a demo
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
