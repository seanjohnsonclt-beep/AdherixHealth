'use client';

import { useState } from 'react';
import { MEDICATION_PROTOCOLS } from '@/engine/medications';
import { enrollPatientAction } from '@/app/patients/actions';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export const PRODUCT_TYPES = [
  { value: 'glp1',                label: 'GLP-1 (Adherix Keep)',              available: true  },
  { value: 'bariatric',           label: 'Bariatric Surgery (Adherix Bridge)', available: true  },
  { value: 'pharmacotherapy',     label: 'Pharmacotherapy (Adherix Rx)',       available: true  },
  { value: 'behavioral_therapy',  label: 'Behavioral Therapy (Adherix IBT)',   available: true  },
  { value: 'metabolic_health',    label: 'Metabolic Health (Adherix Metabolic)', available: true },
] as const;

export function EnrollForm({ error, defaultModality = 'glp1' }: { error?: string; defaultModality?: string }) {
  const [selectedMed, setSelectedMed] = useState('');
  const [modality, setModality] = useState(defaultModality);

  const protocol = MEDICATION_PROTOCOLS.find(p => p.key === selectedMed);
  const firstDose = protocol?.titrationSteps[0]?.dose ?? '';
  const isGlp1 = modality === 'glp1';

  return (
    <form action={enrollPatientAction}>
      {/* -- Patient basics ------------------------------------------------ */}
      <div style={{ marginBottom: 16 }}>
        <label className="label" htmlFor="first_name">First name</label>
        <input className="input" type="text" name="first_name" id="first_name" autoFocus />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label className="label" htmlFor="phone">Phone (US)</label>
        <input
          className="input"
          type="tel"
          name="phone"
          id="phone"
          placeholder="(555) 123-4567"
          required
        />
        <p className="small faint" style={{ marginTop: 6 }}>
          Patient will receive an SMS asking them to reply YES to begin.
        </p>
      </div>

      {/* -- Product type -------------------------------------------------- */}
      <div style={{ marginBottom: 24 }}>
        <label className="label" htmlFor="modality">Product type</label>
        <select
          className="input"
          name="modality"
          id="modality"
          value={modality}
          onChange={e => {
            setModality(e.target.value);
            // Clear medication fields when switching away from GLP-1
            if (e.target.value !== 'glp1') setSelectedMed('');
          }}
        >
          {PRODUCT_TYPES.map(pt => (
            <option key={pt.value} value={pt.value} disabled={!pt.available}>
              {pt.label}{!pt.available ? ' — coming soon' : ''}
            </option>
          ))}
        </select>
        <p className="small faint" style={{ marginTop: 6 }}>
          Determines which message cadence and behavioral engine the patient receives.
        </p>
      </div>

      {/* -- Medication (GLP-1 only) --------------------------------------- */}
      {isGlp1 && (
        <div style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="medication">Medication</label>
          <select
            className="input"
            name="medication"
            id="medication"
            value={selectedMed}
            onChange={e => setSelectedMed(e.target.value)}
          >
            <option value=""> - None / Other (no injection tracking) - </option>
            {MEDICATION_PROTOCOLS.map(p => (
              <option key={p.key} value={p.key}>{p.displayName}</option>
            ))}
          </select>
        </div>
      )}

      {/* Starting dose */}
      {isGlp1 && protocol && (
        <div style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="starting_dose">Starting dose</label>
          <select className="input" name="starting_dose" id="starting_dose">
            {protocol.titrationSteps.map(step => (
              <option key={step.dose} value={step.dose}>
                {step.dose}
                {step === protocol.titrationSteps[0] ? ' (standard start)' : ''}
              </option>
            ))}
          </select>
          <p className="small faint" style={{ marginTop: 6 }}>
            Titration schedule auto-calculated from enrollment date.
          </p>
        </div>
      )}

      {/* Injection day */}
      {isGlp1 && protocol && (
        <div style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="next_dose_day">Injection day</label>
          <select className="input" name="next_dose_day" id="next_dose_day">
            <option value=""> - Unknown - </option>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <p className="small faint" style={{ marginTop: 6 }}>
            Used in correction messages (e.g. "your next dose is Thursday").
          </p>
        </div>
      )}

      {/* Supply quantity */}
      {isGlp1 && protocol && (
        <div style={{ marginBottom: 24 }}>
          <label className="label" htmlFor="supply_quantity">
            Supply quantity (doses in current pen/pack)
          </label>
          <input
            className="input"
            type="number"
            name="supply_quantity"
            id="supply_quantity"
            min="1"
            max="52"
            placeholder="e.g. 4"
          />
          <p className="small faint" style={{ marginTop: 6 }}>
            Used to trigger refill reminders. Leave blank to skip.
          </p>
        </div>
      )}

      {isGlp1 && protocol && (
        <input type="hidden" name="_protocol_first_dose" value={firstDose} />
      )}

      {/* -- Error --------------------------------------------------------- */}
      {error === 'invalid_phone' && (
        <p style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 16 }}>
          That phone number does not look right.
        </p>
      )}

      <div className="actions">
        <button className="btn" type="submit">Enroll &amp; start</button>
        <a href="/dashboard" className="btn ghost">Cancel</a>
      </div>
    </form>
  );
}
