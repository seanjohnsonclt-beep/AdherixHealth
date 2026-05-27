'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Constants ────────────────────────────────────────────────────────────────
const PROTECTED_MONTHS = 3.4;
const CHURN_PROBABILITY = 0.35;

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormInputs {
  activePatients: number;
  dropoutPct: number;
  monthlyValue: number;
  programMonths: number;
  activePatientsLabel: string;
  dropoutPctLabel: string;
  monthlyValueLabel: string;
  programMonthsLabel: string;
}

interface LeadInfo {
  firstName: string;
  clinicName: string;
  email: string;
}

interface RetentionPoint {
  label: string;
  days: number;
  pct: number;
}

interface PhaseDropoff {
  phase: string;
  lost: number;
  dropRate: number;
}

interface AuditResults {
  totalPatients: number;
  activePatients: number;
  lostPatients: number;
  retentionRate: number;
  retentionCurve: RetentionPoint[];
  phaseDropoff: PhaseDropoff[];
  annualLeakage: number;
  medianDaysToChurn: number;
  worstPhase: string;
  monthlyValue: number;
}

type Stage = 'form' | 'gate' | 'submitting' | 'results' | 'error';

// ─── Question config ──────────────────────────────────────────────────────────
const Q_PATIENTS = [
  { label: 'Under 25',   value: 17  },
  { label: '25 - 50',    value: 37  },
  { label: '50 - 100',   value: 75  },
  { label: '100 - 250',  value: 175 },
  { label: '250+',       value: 300 },
];
const Q_DROPOUT = [
  { label: 'Under 20%',    value: 15 },
  { label: '20 - 35%',    value: 27 },
  { label: '35 - 50%',    value: 42 },
  { label: 'Over 50%',    value: 57 },
  { label: "I don't know", value: 35 },
];
const Q_VALUE = [
  { label: 'Under $400',  value: 350 },
  { label: '$400 - $600', value: 500 },
  { label: '$600 - $800', value: 700 },
  { label: 'Over $800',   value: 900 },
];
const Q_AGE = [
  { label: 'Under 6 months', value: 4  },
  { label: '6 - 12 months',  value: 9  },
  { label: '1 - 2 years',    value: 18 },
  { label: '2+ years',       value: 30 },
];

// ─── Analysis from inputs ─────────────────────────────────────────────────────
function analyzeFromInputs(inputs: FormInputs): AuditResults {
  const { activePatients, dropoutPct, monthlyValue, programMonths } = inputs;
  const retentionRate = 100 - dropoutPct;

  // Derive historical totals
  const totalPatients = Math.round(activePatients / (retentionRate / 100));
  const lostPatients  = totalPatients - activePatients;

  // Revenue leakage
  const perPatientRecovery   = monthlyValue * CHURN_PROBABILITY * PROTECTED_MONTHS;
  const annualizationFactor  = Math.min(12 / programMonths, 3);
  const annualLeakage        = Math.round(lostPatients * perPatientRecovery * annualizationFactor);

  // Retention curve via exponential decay anchored to 90-day input
  const r90 = Math.max(retentionRate / 100, 0.01);
  const k   = -Math.log(r90) / 90;
  const curve = (days: number) => Math.min(100, Math.max(1, Math.round(Math.exp(-k * days) * 100)));

  const retentionCurve: RetentionPoint[] = [
    { days: 14,  label: 'Week 2',   pct: curve(14)  },
    { days: 30,  label: '30 days',  pct: curve(30)  },
    { days: 60,  label: '60 days',  pct: curve(60)  },
    { days: 90,  label: '90 days',  pct: retentionRate },
    { days: 180, label: '6 months', pct: curve(180) },
  ];

  // Modeled phase dropoff (published GLP-1 distribution)
  const dist = [
    { phase: 'Initiation',  pct: 0.08 },
    { phase: 'Onboarding',  pct: 0.27 },
    { phase: 'Activation',  pct: 0.33 },
    { phase: 'Momentum',    pct: 0.22 },
    { phase: 'Plateau',     pct: 0.10 },
  ];
  const phaseDropoff: PhaseDropoff[] = dist.map(d => ({
    phase:    d.phase,
    lost:     Math.max(1, Math.round(lostPatients * d.pct)),
    dropRate: Math.round(d.pct * dropoutPct),
  }));

  // Median days to churn from exponential distribution
  const medianDaysToChurn = Math.round(Math.log(2) / k);

  const worstPhase = [...phaseDropoff].sort((a, b) => b.lost - a.lost)[0]?.phase ?? 'Activation';

  return {
    totalPatients, activePatients, lostPatients,
    retentionRate, retentionCurve, phaseDropoff,
    annualLeakage, medianDaysToChurn, worstPhase, monthlyValue,
  };
}

// ─── Formspree submission ─────────────────────────────────────────────────────
async function submitLead(lead: LeadInfo, inputs: FormInputs, leakage: number): Promise<boolean> {
  const formId = process.env.NEXT_PUBLIC_FORMSPREE_CAPTURE_ID;
  if (!formId) return true; // graceful degradation in dev
  try {
    const res = await fetch(`https://formspree.io/f/${formId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject:   `Audit lead - ${lead.clinicName}`,
        name:       lead.firstName,
        clinic:     lead.clinicName,
        email:      lead.email,
        active_patients:    inputs.activePatientsLabel,
        dropout_rate:       inputs.dropoutPctLabel,
        monthly_value:      inputs.monthlyValueLabel,
        program_age:        inputs.programMonthsLabel,
        est_annual_leakage: fmt$(leakage),
      }),
    });
    return res.ok;
  } catch {
    return true; // don't block results on network failure
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt$(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}
function retentionColor(pct: number) {
  if (pct >= 70) return 'var(--mkt-sage)';
  if (pct >= 50) return '#D99877';
  return '#C0392B';
}
function retentionLabel(pct: number) {
  if (pct >= 75) return 'Strong';
  if (pct >= 60) return 'Average';
  if (pct >= 45) return 'Below average';
  return 'High risk';
}

// ─── Tile button ──────────────────────────────────────────────────────────────
function TileBtn({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`audit-tile${selected ? ' audit-tile--selected' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

// ─── Question form ────────────────────────────────────────────────────────────
function QuestionForm({ onSubmit }: { onSubmit: (inputs: FormInputs) => void }) {
  const [patients,   setPatients]   = useState<typeof Q_PATIENTS[0]   | null>(null);
  const [dropout,    setDropout]    = useState<typeof Q_DROPOUT[0]    | null>(null);
  const [value,      setValue]      = useState<typeof Q_VALUE[0]      | null>(null);
  const [age,        setAge]        = useState<typeof Q_AGE[0]        | null>(null);

  const ready = patients && dropout && value && age;

  const handleSubmit = () => {
    if (!patients || !dropout || !value || !age) return;
    onSubmit({
      activePatients:       patients.value,
      dropoutPct:           dropout.value,
      monthlyValue:         value.value,
      programMonths:        age.value,
      activePatientsLabel:  patients.label,
      dropoutPctLabel:      dropout.label,
      monthlyValueLabel:    value.label,
      programMonthsLabel:   age.label,
    });
  };

  return (
    <div className="audit-qform">
      <div className="audit-q">
        <p className="audit-q__label">How many active GLP-1 patients do you currently have?</p>
        <div className="audit-tile-group">
          {Q_PATIENTS.map(o => (
            <TileBtn key={o.label} label={o.label} selected={patients?.label === o.label} onClick={() => setPatients(o)} />
          ))}
        </div>
      </div>

      <div className="audit-q">
        <p className="audit-q__label">Roughly what percentage drop off in the first 90 days?</p>
        <div className="audit-tile-group">
          {Q_DROPOUT.map(o => (
            <TileBtn key={o.label} label={o.label} selected={dropout?.label === o.label} onClick={() => setDropout(o)} />
          ))}
        </div>
      </div>

      <div className="audit-q">
        <p className="audit-q__label">Average monthly revenue per GLP-1 patient?</p>
        <div className="audit-tile-group">
          {Q_VALUE.map(o => (
            <TileBtn key={o.label} label={o.label} selected={value?.label === o.label} onClick={() => setValue(o)} />
          ))}
        </div>
      </div>

      <div className="audit-q">
        <p className="audit-q__label">How long has your GLP-1 program been running?</p>
        <div className="audit-tile-group">
          {Q_AGE.map(o => (
            <TileBtn key={o.label} label={o.label} selected={age?.label === o.label} onClick={() => setAge(o)} />
          ))}
        </div>
      </div>

      <button
        className={`mkt-btn mkt-btn--primary audit-qform__submit${ready ? '' : ' audit-qform__submit--disabled'}`}
        onClick={handleSubmit}
        disabled={!ready}
      >
        Calculate my leakage
      </button>
      {!ready && <p className="audit-qform__hint">Answer all four questions to continue</p>}
    </div>
  );
}

// ─── Email gate ───────────────────────────────────────────────────────────────
function EmailGate({
  leakage,
  onSubmit,
  submitting,
}: {
  leakage: number;
  onSubmit: (lead: LeadInfo) => void;
  submitting: boolean;
}) {
  const [firstName,  setFirstName]  = useState('');
  const [clinicName, setClinicName] = useState('');
  const [email,      setEmail]      = useState('');

  const ready = firstName.trim() && clinicName.trim() && email.includes('@');

  return (
    <div className="audit-gate">
      <div className="audit-gate__teaser">
        <p className="audit-eyebrow">Your results are ready</p>
        <p className="audit-gate__leakage-label">Estimated annual revenue leakage</p>
        <p className="audit-gate__leakage-num">{fmt$(leakage)}</p>
        <p className="audit-gate__leakage-sub">
          Based on your program inputs - see the full phase-by-phase breakdown below.
        </p>
      </div>

      <div className="audit-gate__form">
        <p className="audit-gate__form-label">Where should we send your report?</p>
        <div className="audit-gate__fields">
          <input
            className="audit-gate__input"
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
          <input
            className="audit-gate__input"
            type="text"
            placeholder="Clinic or practice name"
            value={clinicName}
            onChange={e => setClinicName(e.target.value)}
          />
          <input
            className="audit-gate__input"
            type="email"
            placeholder="Work email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <button
          className={`mkt-btn mkt-btn--primary audit-gate__btn${ready && !submitting ? '' : ' audit-qform__submit--disabled'}`}
          disabled={!ready || submitting}
          onClick={() => onSubmit({ firstName, clinicName, email })}
        >
          {submitting ? 'Loading...' : 'See my full results'}
        </button>
        <p className="audit-gate__privacy">No spam. We'll follow up once with a pilot offer - that's it.</p>
      </div>
    </div>
  );
}

// ─── Retention chart ──────────────────────────────────────────────────────────
function RetentionChart({ data }: { data: RetentionPoint[] }) {
  if (data.length < 2) return null;
  const W = 520, H = 200;
  const padL = 44, padR = 20, padT = 16, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const xPos = (i: number) => padL + (i / (data.length - 1)) * chartW;
  const yPos = (pct: number) => padT + (1 - pct / 100) * chartH;
  const pts  = data.map((d, i) => `${xPos(i)},${yPos(d.pct)}`);
  const area = [`${xPos(0)},${padT + chartH}`, ...pts, `${xPos(data.length - 1)},${padT + chartH}`].join(' ');
  const gridLines = [0, 25, 50, 75, 100];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="audit-chart-svg" aria-label="Retention curve">
      {gridLines.map(pct => (
        <g key={pct}>
          <line x1={padL} x2={W - padR} y1={yPos(pct)} y2={yPos(pct)} stroke="var(--mkt-sage-mist)" strokeWidth={1} />
          <text x={padL - 6} y={yPos(pct)} textAnchor="end" dominantBaseline="middle" fill="var(--mkt-graphite)" fontSize={10}>{pct}%</text>
        </g>
      ))}
      <polygon points={area} fill="var(--mkt-sage-soft)" opacity={0.25} />
      <polyline points={pts.join(' ')} fill="none" stroke="var(--mkt-sage)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xPos(i)} cy={yPos(d.pct)} r={4} fill="var(--mkt-sage)" />
          <text x={xPos(i)} y={yPos(d.pct) - 10} textAnchor="middle" fill="var(--mkt-ink)" fontSize={11} fontWeight="600">{d.pct}%</text>
          <text x={xPos(i)} y={padT + chartH + 14} textAnchor="middle" fill="var(--mkt-graphite)" fontSize={10}>{d.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ─── Results view ─────────────────────────────────────────────────────────────
function ResultsView({ results, onReset }: { results: AuditResults; onReset: () => void }) {
  const ninetyDay  = results.retentionCurve.find(p => p.days === 90);
  const maxLost    = Math.max(...results.phaseDropoff.map(p => p.lost), 1);
  const worstDropoff = results.phaseDropoff.find(p => p.phase === results.worstPhase);

  return (
    <div className="audit-results">
      <div className="audit-results__header">
        <div>
          <p className="audit-eyebrow">Modeled estimates based on your inputs</p>
          <h2 className="audit-results__title">Here&apos;s where your program stands</h2>
        </div>
        <div className="audit-results__actions">
          <button className="mkt-btn mkt-btn--ghost mkt-btn--sm" onClick={onReset}>Start over</button>
          <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--sm">Book a pilot</Link>
        </div>
      </div>

      <div className="audit-stat-row">
        <div className="audit-stat">
          <span className="audit-stat__num" style={{ color: retentionColor(results.retentionRate) }}>{results.retentionRate}%</span>
          <span className="audit-stat__label">Estimated 90-day retention</span>
          <span className="audit-stat__sub" style={{ color: retentionColor(results.retentionRate) }}>{retentionLabel(results.retentionRate)}</span>
        </div>
        <div className="audit-stat">
          <span className="audit-stat__num">{results.lostPatients}</span>
          <span className="audit-stat__label">Estimated patients lost</span>
          <span className="audit-stat__sub">{results.activePatients} currently active</span>
        </div>
        <div className="audit-stat">
          <span className="audit-stat__num" style={{ color: '#C0392B' }}>{fmt$(results.annualLeakage)}</span>
          <span className="audit-stat__label">Est. annual revenue leakage</span>
          <span className="audit-stat__sub">At ${results.monthlyValue}/patient/mo</span>
        </div>
      </div>

      <div className="audit-grid">
        <div className="audit-card">
          <h3 className="audit-card__title">Modeled retention curve</h3>
          <p className="audit-card__sub">
            {ninetyDay
              ? `Your program retains ~${ninetyDay.pct}% of patients at 90 days. The national GLP-1 average is around 40%.`
              : 'Projected retention over time based on your 90-day dropout rate.'}
          </p>
          <RetentionChart data={results.retentionCurve} />
        </div>

        <div className="audit-card">
          <h3 className="audit-card__title">Where patients go silent</h3>
          <p className="audit-card__sub">
            {worstDropoff
              ? `${results.worstPhase} is typically the highest-risk window - about ${worstDropoff.lost} patients lost here based on published GLP-1 dropout patterns.`
              : 'Modeled phase-by-phase dropout distribution.'}
          </p>
          <div className="audit-phase-list">
            {results.phaseDropoff.map(p => (
              <div key={p.phase} className="audit-phase-row">
                <span className="audit-phase-row__name">{p.phase}</span>
                <div className="audit-phase-row__bar-wrap">
                  <div className="audit-phase-row__bar" style={{
                    width: `${(p.lost / maxLost) * 100}%`,
                    background: p.phase === results.worstPhase ? 'var(--mkt-sage-deep)' : 'var(--mkt-sage-soft)',
                  }} />
                </div>
                <span className="audit-phase-row__count">~{p.lost} lost</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="audit-card audit-card--leakage">
        <div className="audit-leakage__left">
          <h3 className="audit-card__title">Revenue leakage breakdown</h3>
          <p className="audit-card__sub">Each patient who drops off represents approximately {fmt$(Math.round(results.monthlyValue * CHURN_PROBABILITY * PROTECTED_MONTHS))} in revenue that could be protected with timely behavioral intervention.</p>
          <div className="audit-leakage__math">
            <div className="audit-leakage__row"><span>Est. patients lost</span><span className="audit-leakage__val">{results.lostPatients}</span></div>
            <div className="audit-leakage__row"><span>Monthly patient value</span><span className="audit-leakage__val">{fmt$(results.monthlyValue)}</span></div>
            <div className="audit-leakage__row"><span>Churn probability without intervention</span><span className="audit-leakage__val">35%</span></div>
            <div className="audit-leakage__row"><span>Protected months per recovery</span><span className="audit-leakage__val">3.4 mo</span></div>
            <div className="audit-leakage__row audit-leakage__row--total"><span>Annualized leakage estimate</span><span className="audit-leakage__val audit-leakage__val--total">{fmt$(results.annualLeakage)}</span></div>
          </div>
          <p className="audit-leakage__disclaimer">Modeled estimates. Actual results depend on program size, patient population, and intervention timing.</p>
        </div>
        <div className="audit-leakage__right">
          <div className="audit-leakage__highlight">
            <p className="audit-leakage__highlight-label">Median days to dropout</p>
            <p className="audit-leakage__highlight-num">{results.medianDaysToChurn}</p>
            <p className="audit-leakage__highlight-sub">days from enrollment</p>
          </div>
          <div className="audit-leakage__highlight">
            <p className="audit-leakage__highlight-label">Highest risk phase</p>
            <p className="audit-leakage__highlight-phase">{results.worstPhase}</p>
          </div>
        </div>
      </div>

      <div className="audit-cta-band">
        <div className="audit-cta-band__inner">
          <div>
            <h3 className="audit-cta-band__title">This is what Adherix Keep is built to close.</h3>
            <p className="audit-cta-band__body">Phase-based SMS sequences, behavioral drift detection, and automated escalation - designed to keep patients active before they go silent. Average setup under an hour.</p>
          </div>
          <div className="audit-cta-band__btns">
            <Link href="/pilot" className="mkt-btn mkt-btn--primary">Book a 90-day pilot</Link>
            <Link href="/platform" className="mkt-btn mkt-btn--ghost-on-dark">See how it works</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function CohortAuditPage() {
  const [stage,      setStage]      = useState<Stage>('form');
  const [inputs,     setInputs]     = useState<FormInputs | null>(null);
  const [results,    setResults]    = useState<AuditResults | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFormSubmit = (f: FormInputs) => {
    setInputs(f);
    setStage('gate');
  };

  const handleLeadSubmit = async (lead: LeadInfo) => {
    if (!inputs) return;
    setSubmitting(true);
    const computed = analyzeFromInputs(inputs);
    await submitLead(lead, inputs, computed.annualLeakage);
    setResults(computed);
    setSubmitting(false);
    setStage('results');
  };

  const reset = () => { setStage('form'); setInputs(null); setResults(null); };

  const previewLeakage = inputs
    ? Math.round(
        (inputs.activePatients / (( 100 - inputs.dropoutPct) / 100) - inputs.activePatients)
        * (inputs.monthlyValue * CHURN_PROBABILITY * PROTECTED_MONTHS)
        * Math.min(12 / inputs.programMonths, 3)
      )
    : 0;

  return (
    <main className="audit-page">
      <section className="audit-hero">
        <div className="mkt-container">
          <p className="audit-eyebrow">Free cohort audit</p>
          <h1 className="audit-hero__title">
            Where are your GLP-1 patients <span className="audit-hero__accent">dropping off?</span>
          </h1>
          <p className="audit-hero__sub">
            Answer four questions. Get your estimated 90-day retention rate, a phase-by-phase
            breakdown of where patients go silent, and your annual revenue leakage.
          </p>
        </div>
      </section>

      <div className="mkt-container">
        {stage === 'form' && (
          <QuestionForm onSubmit={handleFormSubmit} />
        )}

        {(stage === 'gate' || stage === 'submitting') && (
          <EmailGate
            leakage={previewLeakage}
            onSubmit={handleLeadSubmit}
            submitting={submitting}
          />
        )}

        {stage === 'results' && results && (
          <ResultsView results={results} onReset={reset} />
        )}
      </div>
    </main>
  );
}
