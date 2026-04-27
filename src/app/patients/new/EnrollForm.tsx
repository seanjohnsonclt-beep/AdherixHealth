'use client';

import { useState } from 'react';
import { MEDICATION_PROTOCOLS } from '@/engine/medications';
import { enrollPatientAction } from '@/app/patients/actions';

export function EnrollForm({ error }: { error?: string }) {
  const [selectedMed, setSelectedMed] = useState('');

  const protocol = MEDICATION_PROTOCOLS.find(p => p.key === selectedMed);
  const firstDose = protocol?.titrationSteps[0]?.dose ?? '';

  return (
    <form action={enrollPatientAction}>
      {/* ── Patient basics ──────────────────────────────────────────────── */}
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

      {/* ── Medication ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <label className="label" htmlFor="medication">Medication</label>
        <select
          className="input"
          name="medication"
          id="medication"
          value={selectedMed}
          onChange={e => setSelectedMed(e.target.value)}
        >
          <option value="">— None / Other (no injection tracking) —</option>
          {MEDICATION_PROTOCOLS.map(p => (
            <option key={p.key} value={p.key}>{p.displayName}</option>
          ))}
        </select>
      </div>

      {/* Starting dose — auto-populated from protocol, shown when med is selected */}
      {protocol && (
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

      {/* ── Supply quantity ─────────────────────────────────────────────── */}
      {protocol && (
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

      {/* Hidden field for first dose (so server action can read it without JS magic) */}
      {protocol && (
        <input type="hidden" name="_protocol_first_dose" value={firstDose} />
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error === 'invalid_phone' && (
        <p style={{ color: 'var(--accent)', fontSize: 13, marginBottom: 16 }}>
          That phone number doesn't look right.
        </p>
      )}

      <div className="actions">
        <button className="btn" type="submit">Enroll &amp; start</button>
        <a href="/dashboard" className="btn ghost">Cancel</a>
      </div>
    </form>
  );
}
