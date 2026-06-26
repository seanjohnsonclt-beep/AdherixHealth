'use client';

import { useState } from 'react';
import { MEDICATION_PROTOCOLS } from '@/engine/medications';
import { enrollPatientAction } from '@/app/patients/actions';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export const PRODUCT_TYPES = [
  { value: 'glp1',                label: 'GLP-1 (Adherix Keep)',                available: true  },
  { value: 'bariatric',           label: 'Bariatric Surgery (Adherix Bridge)',   available: true  },
  { value: 'pharmacotherapy',     label: 'Pharmacotherapy (Adherix Rx)',         available: true  },
  { value: 'behavioral_therapy',  label: 'Behavioral Therapy (Adherix IBT)',     available: true  },
  { value: 'metabolic_health',    label: 'Metabolic Health (Adherix Metabolic)', available: true  },
  { value: 'quest',               label: 'Pediatric / Adolescent (Adherix Quest)',  available: true  },
] as const;

export function EnrollForm({ error, defaultModality = 'glp1' }: { error?: string; defaultModality?: string }) {
  const [selectedMed, setSelectedMed] = useState('');
  const [modality, setModality] = useState(defaultModality);

  // Protocols available for the selected modality
  const modalityProtocols = MEDICATION_PROTOCOLS.filter(p => p.modality === modality);

  // IBT is behavioral-only - auto-assign the placeholder, no picker needed
  const isIbt = modality === 'behavioral_therapy';

  // For GLP-1: weekly injections have an injection day concept
  const isGlp1 = modality === 'glp1';
  const isQuest = modality === 'quest';

  // The active protocol (selected or first if IBT)
  const protocol = isIbt
    ? modalityProtocols[0]
    : MEDICATION_PROTOCOLS.find(p => p.key === selectedMed);

  const firstDose = protocol?.titrationSteps[0]?.dose ?? '';

  // Show supply quantity field for controlled substances and GLP-1 pens
  const showSupply = protocol && protocol.supplyDays > 0 && protocol.supplyDays <= 30;

  function handleModalityChange(val: string) {
    setModality(val);
    setSelectedMed('');
  }

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
        
      {/* -- Quest fields (pediatric) --------------------------------------- */}
      {isQuest && (
        <>
          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="date_of_birth">Date of birth</label>
            <input className="input" type="date" name="date_of_birth" id="date_of_birth" required={isQuest} />
            <div style={{ fontSize: 12, color: 'rgba(244,239,230,0.45)', marginTop: 6 }}>
              Used to determine consent type (COPPA for under-13).
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="state">Patient state</label>
            <input className="input" type="text" name="state" id="state" maxLength={2} placeholder="WA" required={isQuest} />
            <div style={{ fontSize: 12, color: 'rgba(244,239,230,0.45)', marginTop: 6 }}>
              2-letter state code. Determines minor consent rules for 13+.
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="label" htmlFor="guardian_name">Guardian name</label>
            <input className="input" type="text" name="guardian_name" id="guardian_name" placeholder="Parent / guardian full name" required={isQuest} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="label" htmlFor="guardian_phone">Guardian phone (US)</label>
            <input className="input" type="tel" name="guardian_phone" id="guardian_phone" placeholder="(555) 123-4567" required={isQuest} />
            <div style={{ fontSize: 12, color: 'rgba(244,239,230,0.45)', marginTop: 6 }}>
              Guardian receives a separate message track from the teen.
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="label">Consent confirmation</label>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" name="consent_confirmed" value="1" required={isQuest} style={{ marginTop: 3 }} />
              <span style={{ fontSize: 14, color: 'rgba(244,239,230,0.7)', lineHeight: 1.5 }}>
                I confirm that appropriate consent has been obtained from the patient and/or guardian per HIPAA, COPPA, and applicable state minor-consent laws.
              </span>
            </label>
          </div>
        </>
      )}

      <label className="label" htmlFor="modality">Product type</label>
        <select
          className="input"
          name="modality"
          id="modality"
          value={modality}
          onChange={e => handleModalityChange(e.target.value)}
        >
          {PRODUCT_TYPES.map(pt => (
            <option key={pt.value} value={pt.value} disabled={!pt.available}>
              {pt.label}{!pt.available ? ' - coming soon' : ''}
            </option>
          ))}
        </select>
        <p className="small faint" style={{ marginTop: 6 }}>
          Determines which message cadence and behavioral engine the patient receives.
        </p>
      </div>

      {/* -- Medication / supplement --------------------------------------- */}
      {/* IBT: auto-assigned, no picker */}
      {isIbt && (
        <input type="hidden" name="medication" value="ibt_no_medication" />
      )}

      {/* All other modalities: show filtered picker */}
      {!isIbt && modalityProtocols.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="medication">
            {modality === 'bariatric' ? 'Supplement protocol' : 'Medication'}
          </label>
          <select
            className="input"
            name="medication"
            id="medication"
            value={selectedMed}
            onChange={e => setSelectedMed(e.target.value)}
          >
            <option value="">- None / skip tracking -</option>
            {modalityProtocols.map(p => (
              <option key={p.key} value={p.key}>{p.displayName}</option>
            ))}
          </select>
          {protocol?.isControlled && (
            <p className="small faint" style={{ marginTop: 6, color: 'var(--accent)' }}>
              Controlled substance - 30-day supply. Monthly refill reminder will fire at day 23.
            </p>
          )}
        </div>
      )}

      {/* -- Starting dose (only when protocol has titration) -------------- */}
      {protocol?.hasTitration && (
        <div style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="starting_dose">Starting dose</label>
          <select className="input" name="starting_dose" id="starting_dose">
            {protocol.titrationSteps.map((step, i) => (
              <option key={step.dose} value={step.dose}>
                {step.dose}{i === 0 ? ' (standard start)' : ''}
              </option>
            ))}
          </select>
          <p className="small faint" style={{ marginTop: 6 }}>
            Titration schedule auto-calculated from enrollment date.
          </p>
        </div>
      )}

      {/* -- Injection day (GLP-1 weekly only) ----------------------------- */}
      {isGlp1 && protocol && (
        <div style={{ marginBottom: 16 }}>
          <label className="label" htmlFor="next_dose_day">Injection day</label>
          <select className="input" name="next_dose_day" id="next_dose_day">
            <option value="">- Unknown -</option>
            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <p className="small faint" style={{ marginTop: 6 }}>
            Used in correction messages (e.g. "your next dose is Thursday").
          </p>
        </div>
      )}

      {/* -- Supply quantity (controlled substances + GLP-1 pens) ---------- */}
      {showSupply && (
        <div style={{ marginBottom: 24 }}>
          <label className="label" htmlFor="supply_quantity">
            {protocol?.isControlled ? 'Days in current supply (1-30)' : 'Doses in current pen/pack'}
          </label>
          <input
            className="input"
            type="number"
            name="supply_quantity"
            id="supply_quantity"
            min="1"
            max={protocol?.isControlled ? 30 : 52}
            placeholder={protocol?.isControlled ? 'e.g. 30' : 'e.g. 4'}
          />
          <p className="small faint" style={{ marginTop: 6 }}>
            Used to trigger refill reminders. Leave blank to skip.
          </p>
        </div>
      )}

      {protocol?.hasTitration && (
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
