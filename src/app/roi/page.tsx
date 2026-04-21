'use client';

import { useState, useMemo } from 'react';

// ─── ROI assumptions (conservative, defensible) ──────────────────────────────
// Baseline GLP-1 discontinuation from peer-reviewed meta-analyses is >50% at 12
// months. We use a user-controllable monthly churn rate and a modeled
// "retention lift" that represents the share of would-be-churners Adherix keeps
// on the program through behavioral re-engagement.

const DEFAULT_LIFT = 0.28; // 28% of would-be churners recovered (conservative)

function fmtMoney(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 10_000) return `$${Math.round(v / 1000)}k`;
  return `$${Math.round(v).toLocaleString()}`;
}

function NumField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min = 0,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label
        style={{
          display: 'block',
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#6b6b66',
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid #c8c7c0',
          background: 'white',
          padding: '0 12px',
        }}
      >
        {prefix && (
          <span style={{ color: '#6b6b66', fontSize: 15, marginRight: 6 }}>{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(Number.isFinite(v) ? v : 0);
          }}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            padding: '12px 0',
            fontSize: 15,
            background: 'transparent',
            fontFamily: 'inherit',
            color: '#111110',
            width: '100%',
          }}
        />
        {suffix && (
          <span style={{ color: '#6b6b66', fontSize: 15, marginLeft: 6 }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

export default function RoiPage() {
  const [activePatients, setActivePatients] = useState(100);
  const [monthlyValue, setMonthlyValue] = useState(600);
  const [monthlyChurnPct, setMonthlyChurnPct] = useState(8);
  const [monthsRetained, setMonthsRetained] = useState(12);
  const [lift, setLift] = useState(DEFAULT_LIFT * 100);

  const results = useMemo(() => {
    const patients = Math.max(0, activePatients);
    const value = Math.max(0, monthlyValue);
    const churn = Math.max(0, Math.min(100, monthlyChurnPct)) / 100;
    const months = Math.max(1, monthsRetained);
    const liftPct = Math.max(0, Math.min(100, lift)) / 100;

    // Expected churners over the retention window (simple linear approximation)
    const churnersBaseline = Math.round(patients * churn * months);
    const lostRevenueBaseline =
      // each churner costs (remaining months they would have paid) × monthlyValue
      // approximate as half the window per churner on average
      churnersBaseline * value * (months / 2);

    const churnersWithAdherix = Math.round(churnersBaseline * (1 - liftPct));
    const savedChurners = churnersBaseline - churnersWithAdherix;
    const protectedRevenue = savedChurners * value * (months / 2);

    const retainedRevenue = patients * value * months - lostRevenueBaseline;
    const retainedRevenueWithAdherix = retainedRevenue + protectedRevenue;

    return {
      churnersBaseline,
      churnersWithAdherix,
      savedChurners,
      lostRevenueBaseline,
      protectedRevenue,
      retainedRevenue,
      retainedRevenueWithAdherix,
    };
  }, [activePatients, monthlyValue, monthlyChurnPct, monthsRetained, lift]);

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '32px 40px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 22,
            fontWeight: 500,
            color: '#111110',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
          }}
        >
          MyAdherix
        </a>
        <a
          href="/demo"
          style={{
            fontSize: 13,
            color: '#6b6b66',
            textDecoration: 'none',
            borderBottom: '1px solid #c8c7c0',
          }}
        >
          ← Back to overview
        </a>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 40px 80px' }}>
        <p
          style={{
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#6b6b66',
            marginBottom: 16,
          }}
        >
          Retention ROI calculator
        </p>
        <h1
          style={{
            fontFamily: 'Fraunces, Georgia, serif',
            fontSize: 42,
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: '#111110',
            marginBottom: 16,
            maxWidth: 640,
          }}
        >
          What drift is quietly costing your program.
        </h1>
        <p style={{ fontSize: 16, color: '#3a3a35', lineHeight: 1.65, maxWidth: 600, marginBottom: 48 }}>
          Every patient who goes quiet is revenue leaving your clinic. Plug in your
          numbers to see the leakage — and what gets recovered with automated
          behavioral retention.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>
          {/* Inputs */}
          <div style={{ background: 'white', border: '1px solid #e6e5df', padding: 28 }}>
            <h2
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 20,
                fontWeight: 500,
                marginBottom: 20,
                color: '#111110',
              }}
            >
              Your program
            </h2>
            <NumField
              label="Active patients"
              value={activePatients}
              onChange={setActivePatients}
              min={0}
            />
            <NumField
              label="Monthly revenue per patient"
              value={monthlyValue}
              onChange={setMonthlyValue}
              prefix="$"
              step={25}
              min={0}
            />
            <NumField
              label="Current monthly churn rate"
              value={monthlyChurnPct}
              onChange={setMonthlyChurnPct}
              suffix="%"
              step={0.5}
              min={0}
              max={100}
            />
            <NumField
              label="Typical retention window"
              value={monthsRetained}
              onChange={setMonthsRetained}
              suffix="months"
              step={1}
              min={1}
              max={36}
            />
            <NumField
              label="Adherix retention lift (modeled)"
              value={lift}
              onChange={setLift}
              suffix="%"
              step={1}
              min={0}
              max={100}
            />
            <p style={{ fontSize: 12, color: '#a5a5a0', lineHeight: 1.6, marginTop: 12 }}>
              Default lift of 28% reflects the share of drifting patients re-engaged
              through automated behavioral outreach in comparable programs. Adjust to
              your comfort level.
            </p>
          </div>

          {/* Output */}
          <div
            style={{
              background: '#111110',
              color: '#fafaf7',
              padding: 28,
              border: '1px solid #111110',
            }}
          >
            <h2
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 20,
                fontWeight: 500,
                marginBottom: 24,
                color: '#fafaf7',
              }}
            >
              Your annual retention math
            </h2>

            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#a5a5a0',
                  marginBottom: 8,
                }}
              >
                Revenue leakage without Adherix
              </div>
              <div
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 40,
                  fontWeight: 500,
                  lineHeight: 1,
                  color: '#fca5a5',
                }}
              >
                -{fmtMoney(results.lostRevenueBaseline)}
              </div>
              <div style={{ fontSize: 12, color: '#a5a5a0', marginTop: 6 }}>
                ≈ {results.churnersBaseline} patient{results.churnersBaseline === 1 ? '' : 's'} lost
                over {monthsRetained} months
              </div>
            </div>

            <div style={{ height: 1, background: '#3a3a35', margin: '20px 0' }} />

            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#a5a5a0',
                  marginBottom: 8,
                }}
              >
                Revenue protected with Adherix
              </div>
              <div
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 44,
                  fontWeight: 500,
                  lineHeight: 1,
                  color: '#86efac',
                }}
              >
                +{fmtMoney(results.protectedRevenue)}
              </div>
              <div style={{ fontSize: 12, color: '#a5a5a0', marginTop: 6 }}>
                ≈ {results.savedChurners} patient{results.savedChurners === 1 ? '' : 's'} kept on program
              </div>
            </div>

            <div style={{ height: 1, background: '#3a3a35', margin: '20px 0' }} />

            <div>
              <div
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: '#a5a5a0',
                  marginBottom: 8,
                }}
              >
                Net retained program revenue
              </div>
              <div
                style={{
                  fontFamily: 'Fraunces, Georgia, serif',
                  fontSize: 32,
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                {fmtMoney(results.retainedRevenueWithAdherix)}
              </div>
              <div style={{ fontSize: 12, color: '#a5a5a0', marginTop: 6 }}>
                over {monthsRetained}-month window
              </div>
            </div>

            <a
              href="mailto:seanjohnsonclt@gmail.com?subject=Adherix%20Demo%20Inquiry"
              style={{
                display: 'block',
                marginTop: 28,
                padding: '12px 20px',
                background: '#fafaf7',
                color: '#111110',
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Request a demo for your clinic →
            </a>
          </div>
        </div>

        <p
          style={{
            fontSize: 11,
            color: '#a5a5a0',
            marginTop: 32,
            lineHeight: 1.6,
            maxWidth: 720,
          }}
        >
          Modeled values. Churn rates and retention lift vary by program design, patient
          population, and intervention cadence. Adherix does not guarantee specific
          retention outcomes. Figures here are intended as a directional planning tool
          only.
        </p>
      </div>
    </div>
  );
}
