'use client';

import { useMemo, useState } from 'react';

/**
 * Simple, transparent ROI estimator. Conservative defaults — the brief
 * explicitly calls out: "no inflated startup math."
 *
 * Inputs:
 *   - active patients
 *   - monthly value per patient
 *   - annual churn % (% of patients lost per year without intervention)
 *   - retention window (months added per recovered patient)
 *   - estimated retention lift (% of churners recovered)
 *
 * Outputs:
 *   - monthly revenue leakage  (active × monthly × annual churn / 12)
 *   - annualized leakage       (active × monthly × annual churn × avg lifetime adjustment)
 *   - revenue protected (annual)  (annual churners × lift × retention window × monthly value)
 */

const fmt = (n: number) =>
  '$' + Math.round(n).toLocaleString('en-US');

export function RoiCalculator() {
  const [active, setActive]       = useState(450);
  const [monthly, setMonthly]     = useState(600);
  const [annualChurn, setChurn]   = useState(35);   // % per year
  const [windowMonths, setWindow] = useState(4);    // additional months kept per recovered patient
  const [lift, setLift]           = useState(15);   // % of churners recovered

  const out = useMemo(() => {
    const churners        = (active * annualChurn) / 100;
    const monthlyLeak     = (churners * monthly) / 12;
    const annualLeak      = churners * monthly * (windowMonths / 12 + 1); // conservative weighted
    const recovered       = (churners * lift) / 100;
    const protectedAnnual = recovered * monthly * windowMonths;
    return { monthlyLeak, annualLeak, protectedAnnual, recovered };
  }, [active, monthly, annualChurn, windowMonths, lift]);

  return (
    <div className="mkt-roi" id="roi-calc">
      {/* ─── Inputs ────────────────────────────────────────────────────── */}
      <div className="mkt-roi__inputs">
        <NumberField
          label="Active patients"
          value={active}
          onChange={setActive}
          min={10}
          step={10}
          hint="Currently enrolled in your program"
        />
        <NumberField
          label="Monthly patient value"
          value={monthly}
          onChange={setMonthly}
          min={100}
          step={25}
          prefix="$"
          hint="Avg monthly program revenue per patient"
        />
        <SliderField
          label="Annual churn rate"
          value={annualChurn}
          onChange={setChurn}
          min={5}
          max={70}
          step={1}
          suffix="%"
          hint="Industry baseline for GLP-1 programs is 30–45%"
        />
        <SliderField
          label="Retention window per recovered patient"
          value={windowMonths}
          onChange={setWindow}
          min={1}
          max={12}
          step={1}
          suffix={windowMonths === 1 ? ' month' : ' months'}
          hint="Average extra months of revenue per save"
        />
        <SliderField
          label="Estimated retention lift"
          value={lift}
          onChange={setLift}
          min={5}
          max={40}
          step={1}
          suffix="%"
          hint="Conservative pilot range: 10–20%"
        />
      </div>

      {/* ─── Output ────────────────────────────────────────────────────── */}
      <div className="mkt-roi__output">
        <div className="mkt-roi__big">Estimated revenue protected (annual)</div>
        <div className="mkt-roi__big-num">{fmt(out.protectedAnnual)}</div>

        <div className="mkt-roi__row">
          <span>Monthly revenue leakage</span>
          <strong>{fmt(out.monthlyLeak)}</strong>
        </div>
        <div className="mkt-roi__row">
          <span>Annualized leakage exposure</span>
          <strong>{fmt(out.annualLeak)}</strong>
        </div>
        <div className="mkt-roi__row">
          <span>Patients recovered / yr</span>
          <strong>{Math.round(out.recovered)}</strong>
        </div>

        <p className="mkt-roi__note">
          Modeled estimate. Even a modest retention improvement typically
          covers the platform many times over. Pilots are scoped to validate
          these assumptions against your actual program data.
        </p>
      </div>
    </div>
  );
}

// ─── Field primitives ──────────────────────────────────────────────────────

function NumberField({
  label, value, onChange, min, step, prefix, hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  step?: number;
  prefix?: string;
  hint?: string;
}) {
  return (
    <div className="mkt-roi__field">
      <div className="mkt-roi__label">
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </div>
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--mkt-graphite, #6B7878)', fontSize: 15, pointerEvents: 'none',
          }}>{prefix}</span>
        )}
        <input
          type="number"
          className="mkt-roi__input"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          style={prefix ? { paddingLeft: 26 } : undefined}
        />
      </div>
    </div>
  );
}

function SliderField({
  label, value, onChange, min, max, step, suffix, hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  hint?: string;
}) {
  return (
    <div className="mkt-roi__field">
      <div className="mkt-roi__label">
        <span>{label}</span>
        <strong style={{ color: 'var(--mkt-sage-deep, #3D7670)', fontSize: 14 }}>
          {value}{suffix || ''}
        </strong>
      </div>
      <input
        type="range"
        className="mkt-roi__range"
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && (
        <div style={{ fontSize: 12, color: 'var(--mkt-faint, #8A9494)', marginTop: 6 }}>{hint}</div>
      )}
    </div>
  );
}
