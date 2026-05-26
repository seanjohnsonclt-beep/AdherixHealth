'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';

// ─── Constants (mirror metrics.ts) ───────────────────────────────────────────
const MONTHLY_PATIENT_VALUE = 600;
const CHURN_PROBABILITY = 0.35;
const PROTECTED_MONTHS = 3.4;
const PER_PATIENT_RECOVERY = MONTHLY_PATIENT_VALUE * CHURN_PROBABILITY * PROTECTED_MONTHS; // $714
const ACTIVE_WINDOW_DAYS = 14;

// ─── Types ────────────────────────────────────────────────────────────────────
interface PatientRow {
  enrolled_at: Date;
  last_contact_at: Date;
}

interface RetentionPoint {
  label: string;
  days: number;
  pct: number;
  eligible: number;
}

interface PhaseDropoff {
  phase: string;
  short: string;
  lost: number;
  total: number;
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
  cohortMonths: number;
}

type Stage = 'idle' | 'analyzing' | 'results' | 'error';

// ─── CSV Parsing ──────────────────────────────────────────────────────────────
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { result.push(current); current = ''; }
    else { current += char; }
  }
  result.push(current);
  return result;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map(h =>
    h.trim().toLowerCase().replace(/["\s]/g, '').replace(/_/g, '')
  );
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (values[i] ?? '').trim().replace(/^"|"$/g, ''); });
    return row;
  }).filter(row => Object.values(row).some(v => v.trim()));
}

function parseDate(str: string): Date | null {
  if (!str) return null;
  str = str.trim();
  const iso = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const d = new Date(parseInt(iso[1]), parseInt(iso[2]) - 1, parseInt(iso[3]));
    return isNaN(d.getTime()) ? null : d;
  }
  const us = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (us) {
    const year = us[3].length === 2 ? 2000 + parseInt(us[3]) : parseInt(us[3]);
    const d = new Date(year, parseInt(us[1]) - 1, parseInt(us[2]));
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function findColumnKey(sample: Record<string, string>, candidates: string[]): string | null {
  const keys = Object.keys(sample);
  for (const candidate of candidates) {
    const found = keys.find(k => k.includes(candidate));
    if (found) return found;
  }
  return null;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Analysis ─────────────────────────────────────────────────────────────────
function analyzePatients(rows: Record<string, string>[]): AuditResults | null {
  if (rows.length === 0) return null;

  const sample = rows[0];
  const enrolledKey = findColumnKey(sample, ['enrolled', 'enroll', 'startdate', 'start', 'admitdate', 'admit']);
  const contactKey  = findColumnKey(sample, ['lastcontact', 'lastreply', 'lastactive', 'lastseen', 'lastvisit', 'contact', 'reply', 'active', 'seen']);

  if (!enrolledKey || !contactKey) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const patients: PatientRow[] = [];
  for (const row of rows) {
    const enrolled    = parseDate(row[enrolledKey]);
    const lastContact = parseDate(row[contactKey]);
    if (!enrolled || !lastContact) continue;
    if (enrolled > today || lastContact > today) continue;
    if (lastContact < enrolled) continue;
    patients.push({ enrolled_at: enrolled, last_contact_at: lastContact });
  }

  if (patients.length < 3) return null;

  const isActive = (p: PatientRow) => daysBetween(p.last_contact_at, today) <= ACTIVE_WINDOW_DAYS;

  // Retention curve
  const milestones = [
    { days: 14,  label: 'Week 2' },
    { days: 30,  label: '30 days' },
    { days: 60,  label: '60 days' },
    { days: 90,  label: '90 days' },
    { days: 180, label: '6 months' },
  ];
  const retentionCurve: RetentionPoint[] = milestones
    .map(({ days, label }) => {
      const eligible = patients.filter(p => daysBetween(p.enrolled_at, today) >= days);
      if (eligible.length < 3) return null;
      const retained = eligible.filter(p => daysBetween(p.enrolled_at, p.last_contact_at) >= days || isActive(p));
      return { label, days, pct: Math.round(retained.length / eligible.length * 100), eligible: eligible.length };
    })
    .filter((p): p is RetentionPoint => p !== null);

  // Phase drop-off
  const phaseRanges = [
    { phase: 'Initiation',   short: 'Init.',      min: 0,   max: 7   },
    { phase: 'Onboarding',   short: 'Onboard',    min: 7,   max: 21  },
    { phase: 'Activation',   short: 'Activation', min: 21,  max: 52  },
    { phase: 'Momentum',     short: 'Momentum',   min: 52,  max: 82  },
    { phase: 'Plateau',      short: 'Plateau',    min: 82,  max: 180 },
    { phase: 'Maintenance',  short: 'Maintain',   min: 180, max: Infinity },
  ];

  const lostPatients = patients.filter(p => !isActive(p));

  const phaseDropoff: PhaseDropoff[] = phaseRanges.map(range => {
    const inRange = patients.filter(p => {
      const d = daysBetween(p.enrolled_at, today);
      return d >= range.min && d < range.max;
    });
    const dropped = lostPatients.filter(p => {
      const d = daysBetween(p.enrolled_at, p.last_contact_at);
      return d >= range.min && d < range.max;
    });
    const total = inRange.length + dropped.length;
    return {
      phase: range.phase,
      short: range.short,
      lost: dropped.length,
      total,
      dropRate: total > 0 ? Math.round(dropped.length / total * 100) : 0,
    };
  }).filter(p => p.total > 0);

  // Revenue leakage - annualize based on cohort span
  const maxEnrolledDays = Math.max(...patients.map(p => daysBetween(p.enrolled_at, today)));
  const cohortMonths = Math.max(maxEnrolledDays / 30, 1);
  const annualizationFactor = Math.min(12 / cohortMonths, 3); // cap at 3x to stay conservative
  const annualLeakage = Math.round(lostPatients.length * PER_PATIENT_RECOVERY * annualizationFactor);

  // Median days to churn
  const churnDays = lostPatients
    .map(p => daysBetween(p.enrolled_at, p.last_contact_at))
    .sort((a, b) => a - b);
  const medianDaysToChurn = churnDays[Math.floor(churnDays.length / 2)] ?? 0;

  const worstPhase = [...phaseDropoff].sort((a, b) => b.lost - a.lost)[0]?.phase ?? '';

  return {
    totalPatients: patients.length,
    activePatients: patients.filter(isActive).length,
    lostPatients: lostPatients.length,
    retentionRate: Math.round(patients.filter(isActive).length / patients.length * 100),
    retentionCurve,
    phaseDropoff,
    annualLeakage,
    medianDaysToChurn,
    worstPhase,
    cohortMonths: Math.round(cohortMonths),
  };
}

// ─── Sample CSV ───────────────────────────────────────────────────────────────
function downloadSample() {
  const today = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };
  const rows = [
    ['enrolled_at', 'last_contact_at'],
    [daysAgo(180), daysAgo(5)],
    [daysAgo(170), daysAgo(160)],
    [daysAgo(160), daysAgo(2)],
    [daysAgo(150), daysAgo(120)],
    [daysAgo(140), daysAgo(10)],
    [daysAgo(130), daysAgo(105)],
    [daysAgo(120), daysAgo(8)],
    [daysAgo(110), daysAgo(90)],
    [daysAgo(100), daysAgo(3)],
    [daysAgo(90),  daysAgo(70)],
    [daysAgo(80),  daysAgo(1)],
    [daysAgo(70),  daysAgo(55)],
    [daysAgo(60),  daysAgo(4)],
    [daysAgo(50),  daysAgo(30)],
    [daysAgo(40),  daysAgo(7)],
    [daysAgo(30),  daysAgo(12)],
    [daysAgo(20),  daysAgo(2)],
    [daysAgo(10),  daysAgo(1)],
    [daysAgo(5),   daysAgo(1)],
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'adherix-cohort-sample.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Retention Curve Chart ────────────────────────────────────────────────────
function RetentionChart({ data }: { data: RetentionPoint[] }) {
  if (data.length < 2) return null;

  const W = 520, H = 200;
  const padL = 44, padR = 20, padT = 16, padB = 36;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const xPos = (i: number) => padL + (i / (data.length - 1)) * chartW;
  const yPos = (pct: number) => padT + (1 - pct / 100) * chartH;

  const pts = data.map((d, i) => `${xPos(i)},${yPos(d.pct)}`);
  const polyline = pts.join(' ');
  const area = [
    `${xPos(0)},${padT + chartH}`,
    ...pts,
    `${xPos(data.length - 1)},${padT + chartH}`,
  ].join(' ');

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="audit-chart-svg" aria-label="Retention curve chart">
      {/* Grid lines */}
      {gridLines.map(pct => (
        <g key={pct}>
          <line
            x1={padL} x2={W - padR}
            y1={yPos(pct)} y2={yPos(pct)}
            stroke="var(--mkt-sage-mist)" strokeWidth={1}
          />
          <text x={padL - 6} y={yPos(pct)} textAnchor="end" dominantBaseline="middle"
            fill="var(--mkt-graphite)" fontSize={10}>
            {pct}%
          </text>
        </g>
      ))}

      {/* Area fill */}
      <polygon points={area} fill="var(--mkt-sage-soft)" opacity={0.25} />

      {/* Line */}
      <polyline points={polyline} fill="none" stroke="var(--mkt-sage)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

      {/* Points + labels */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xPos(i)} cy={yPos(d.pct)} r={4} fill="var(--mkt-sage)" />
          <text x={xPos(i)} y={yPos(d.pct) - 10} textAnchor="middle"
            fill="var(--mkt-ink)" fontSize={11} fontWeight="600">
            {d.pct}%
          </text>
          <text x={xPos(i)} y={padT + chartH + 14} textAnchor="middle"
            fill="var(--mkt-graphite)" fontSize={10}>
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt$(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

function retentionColor(pct: number): string {
  if (pct >= 70) return 'var(--mkt-sage)';
  if (pct >= 50) return '#D99877';
  return '#C0392B';
}

function retentionLabel(pct: number): string {
  if (pct >= 75) return 'Strong';
  if (pct >= 60) return 'Average';
  if (pct >= 45) return 'Below average';
  return 'High risk';
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({
  onFile,
  dragging,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  onFile: (f: File) => void;
  dragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={`audit-upload${dragging ? ' audit-upload--dragging' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Upload CSV file"
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <div className="audit-upload__icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--mkt-sage)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <polyline points="9 15 12 12 15 15" />
        </svg>
      </div>
      <p className="audit-upload__label">
        {dragging ? 'Drop your CSV here' : 'Drop CSV here or click to browse'}
      </p>
      <p className="audit-upload__hint">Two columns required: enrolled_at and last_contact_at</p>
    </div>
  );
}

// ─── Results View ─────────────────────────────────────────────────────────────
function ResultsView({ results, onReset }: { results: AuditResults; onReset: () => void }) {
  const ninetyDay = results.retentionCurve.find(p => p.days === 90);
  const retentionRateLabel = retentionLabel(results.retentionRate);
  const worstDropoff = results.phaseDropoff.sort((a, b) => b.lost - a.lost)[0];
  const maxLost = Math.max(...results.phaseDropoff.map(p => p.lost), 1);

  return (
    <div className="audit-results">

      {/* Results header */}
      <div className="audit-results__header">
        <div>
          <p className="audit-eyebrow">Cohort analysis - {results.totalPatients} patients</p>
          <h2 className="audit-results__title">Here&apos;s where your program stands</h2>
        </div>
        <div className="audit-results__actions">
          <button className="mkt-btn mkt-btn--ghost mkt-btn--sm" onClick={onReset}>
            Upload new file
          </button>
          <Link href="/pilot" className="mkt-btn mkt-btn--primary mkt-btn--sm">
            Book a pilot
          </Link>
        </div>
      </div>

      {/* Stat row */}
      <div className="audit-stat-row">
        <div className="audit-stat">
          <span className="audit-stat__num" style={{ color: retentionColor(results.retentionRate) }}>
            {results.retentionRate}%
          </span>
          <span className="audit-stat__label">Current retention rate</span>
          <span className="audit-stat__sub" style={{ color: retentionColor(results.retentionRate) }}>
            {retentionRateLabel}
          </span>
        </div>
        <div className="audit-stat">
          <span className="audit-stat__num">{results.lostPatients}</span>
          <span className="audit-stat__label">Patients lost to dropout</span>
          <span className="audit-stat__sub">{results.activePatients} still active</span>
        </div>
        <div className="audit-stat">
          <span className="audit-stat__num" style={{ color: '#C0392B' }}>
            {fmt$(results.annualLeakage)}
          </span>
          <span className="audit-stat__label">Est. annual revenue leakage</span>
          <span className="audit-stat__sub">Modeled at $600/patient/mo</span>
        </div>
      </div>

      {/* Retention curve + phase breakdown */}
      <div className="audit-grid">

        {/* Retention curve */}
        <div className="audit-card">
          <h3 className="audit-card__title">Retention curve</h3>
          <p className="audit-card__sub">
            {ninetyDay
              ? `${ninetyDay.pct}% of eligible patients remained active at 90 days - the national GLP-1 average is around 40%.`
              : 'How your cohort retains over time from enrollment.'}
          </p>
          {results.retentionCurve.length >= 2
            ? <RetentionChart data={results.retentionCurve} />
            : <p className="audit-card__empty">Not enough historical data for a full curve. Add earlier enrollment dates to see the full picture.</p>
          }
        </div>

        {/* Phase drop-off */}
        <div className="audit-card">
          <h3 className="audit-card__title">Where patients go silent</h3>
          <p className="audit-card__sub">
            {worstDropoff
              ? `${results.worstPhase} is your highest drop-off phase - ${worstDropoff.lost} patients lost here.`
              : 'Breakdown of patient dropout by program phase.'}
          </p>
          <div className="audit-phase-list">
            {results.phaseDropoff.map(p => (
              <div key={p.phase} className="audit-phase-row">
                <span className="audit-phase-row__name">{p.phase}</span>
                <div className="audit-phase-row__bar-wrap">
                  <div
                    className="audit-phase-row__bar"
                    style={{
                      width: `${(p.lost / maxLost) * 100}%`,
                      background: p.lost === worstDropoff?.lost ? 'var(--mkt-sage-deep)' : 'var(--mkt-sage-soft)',
                    }}
                  />
                </div>
                <span className="audit-phase-row__count">
                  {p.lost} lost
                  {p.dropRate > 0 && <em> ({p.dropRate}%)</em>}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Revenue leakage breakdown */}
      <div className="audit-card audit-card--leakage">
        <div className="audit-leakage__left">
          <h3 className="audit-card__title">Revenue leakage breakdown</h3>
          <p className="audit-card__sub">
            Each patient who drops off represents approximately {fmt$(Math.round(PER_PATIENT_RECOVERY))} in revenue that
            could have been protected with timely behavioral intervention.
          </p>
          <div className="audit-leakage__math">
            <div className="audit-leakage__row">
              <span>Patients lost</span>
              <span className="audit-leakage__val">{results.lostPatients}</span>
            </div>
            <div className="audit-leakage__row">
              <span>Avg. monthly patient value</span>
              <span className="audit-leakage__val">$600</span>
            </div>
            <div className="audit-leakage__row">
              <span>Churn probability without intervention</span>
              <span className="audit-leakage__val">35%</span>
            </div>
            <div className="audit-leakage__row">
              <span>Protected months per recovery</span>
              <span className="audit-leakage__val">3.4 mo</span>
            </div>
            <div className="audit-leakage__row audit-leakage__row--total">
              <span>Annualized leakage estimate</span>
              <span className="audit-leakage__val audit-leakage__val--total">{fmt$(results.annualLeakage)}</span>
            </div>
          </div>
          <p className="audit-leakage__disclaimer">
            Modeled estimates based on published GLP-1 retention research. Not a guarantee of outcomes.
          </p>
        </div>
        <div className="audit-leakage__right">
          <div className="audit-leakage__highlight">
            <p className="audit-leakage__highlight-label">Median days to patient dropout</p>
            <p className="audit-leakage__highlight-num">{results.medianDaysToChurn}</p>
            <p className="audit-leakage__highlight-sub">days from enrollment</p>
          </div>
          <div className="audit-leakage__highlight">
            <p className="audit-leakage__highlight-label">Highest risk phase</p>
            <p className="audit-leakage__highlight-phase">{results.worstPhase || '-'}</p>
          </div>
        </div>
      </div>

      {/* CTA band */}
      <div className="audit-cta-band">
        <div className="audit-cta-band__inner">
          <div>
            <h3 className="audit-cta-band__title">This is what Adherix Keep is built to close.</h3>
            <p className="audit-cta-band__body">
              Phase-based SMS sequences, behavioral drift detection, and automated escalation -
              designed to keep patients active before they go silent. Average setup is under an hour.
            </p>
          </div>
          <div className="audit-cta-band__btns">
            <Link href="/pilot" className="mkt-btn mkt-btn--primary">
              Book a 90-day pilot
            </Link>
            <Link href="/platform" className="mkt-btn mkt-btn--ghost-on-dark">
              See how it works
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CohortAuditPage() {
  const [stage, setStage]     = useState<Stage>('idle');
  const [results, setResults] = useState<AuditResults | null>(null);
  const [error, setError]     = useState<string>('');
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a .csv file.');
      setStage('error');
      return;
    }
    setStage('analyzing');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length === 0) {
          setError('The file appears to be empty or could not be parsed.');
          setStage('error');
          return;
        }
        const r = analyzePatients(rows);
        if (!r) {
          setError(
            'Could not find the required columns. Make sure your CSV has "enrolled_at" and "last_contact_at" columns with dates in YYYY-MM-DD or MM/DD/YYYY format.'
          );
          setStage('error');
          return;
        }
        setResults(r);
        setStage('results');
      } catch {
        setError('Something went wrong parsing the file. Please check the format and try again.');
        setStage('error');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const reset = () => { setStage('idle'); setResults(null); setError(''); };

  return (
    <main className="audit-page">

      {/* Page hero - always visible */}
      <section className="audit-hero">
        <div className="mkt-container">
          <p className="audit-eyebrow">Free cohort audit</p>
          <h1 className="audit-hero__title">
            Know your real<br />
            <span className="audit-hero__accent">retention rate.</span>
          </h1>
          <p className="audit-hero__sub">
            Upload a de-identified patient list. In seconds you&apos;ll see where your cohort is losing
            patients, your 90-day retention rate, and your estimated annual revenue leakage.
          </p>
          <p className="audit-privacy-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 5 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Your data never leaves your browser. All analysis is done locally.
          </p>
        </div>
      </section>

      <div className="mkt-container">

        {/* Idle - upload zone */}
        {stage === 'idle' && (
          <div className="audit-idle-layout">
            <UploadZone
              onFile={processFile}
              dragging={dragging}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />

            <div className="audit-format-block">
              <h3 className="audit-format-block__title">Required CSV format</h3>
              <div className="audit-format-block__table">
                <div className="audit-format-block__row audit-format-block__row--head">
                  <span>enrolled_at</span>
                  <span>last_contact_at</span>
                </div>
                <div className="audit-format-block__row">
                  <span>2025-01-15</span>
                  <span>2025-04-20</span>
                </div>
                <div className="audit-format-block__row">
                  <span>2025-02-01</span>
                  <span>2025-03-12</span>
                </div>
                <div className="audit-format-block__row">
                  <span>2025-02-18</span>
                  <span>2025-05-08</span>
                </div>
              </div>
              <div className="audit-format-block__footer">
                <p>Dates accepted in YYYY-MM-DD or MM/DD/YYYY format. No PHI required - patient names and IDs are ignored.</p>
                <button className="audit-sample-btn" onClick={downloadSample}>
                  Download sample CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analyzing */}
        {stage === 'analyzing' && (
          <div className="audit-analyzing">
            <div className="audit-analyzing__spinner" />
            <p className="audit-analyzing__label">Analyzing your cohort...</p>
          </div>
        )}

        {/* Error */}
        {stage === 'error' && (
          <div className="audit-error">
            <p className="audit-error__msg">{error}</p>
            <button className="mkt-btn mkt-btn--primary mkt-btn--sm" onClick={reset}>
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {stage === 'results' && results && (
          <ResultsView results={results} onReset={reset} />
        )}

      </div>
    </main>
  );
}
