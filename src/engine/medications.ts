// Medication and supplement protocol definitions for all Adherix modalities.
// GLP-1 titration tracking (existing) + pharmacotherapy, metabolic, and bariatric supplements.
//
// Design rules:
//   - TypeScript config only — type-checked, no YAML/DB config drift
//   - HIPAA: medication names and doses NEVER appear in SMS bodies
//   - All clinical data stays in DB; SMS uses generic behavioral language only
//   - Controlled substances: isControlled=true enforces 30-day supply hard cap
//     and triggers monthly Rx reminder logic in the scheduler

export type MedicationFrequency = 'weekly' | 'daily' | 'twice-daily' | 'three-daily';

export type TitrationStep = {
  daysOffset: number;   // days from enrollment_date (replaces weekOffset for all modalities)
  dose: string;         // human-readable dose label — stored in DB only, never sent via SMS
};

export type MedicationProtocol = {
  key: string;
  displayName: string;
  modality: 'glp1' | 'pharmacotherapy' | 'metabolic_health' | 'bariatric' | 'behavioral_therapy';
  category: 'injection' | 'pill' | 'supplement';
  frequency: MedicationFrequency;
  isControlled: boolean;     // CII-CIV controlled substance — monthly Rx, 30-day supply only
  supplyDays: number;        // standard supply cycle length for refill reminder trigger
  hasTitration: boolean;
  titrationSteps: TitrationStep[];
  notes?: string;            // clinical context for clinic dashboard — never in SMS
};

export const MEDICATION_PROTOCOLS: MedicationProtocol[] = [

  // ─── GLP-1 — Adherix Keep ────────────────────────────────────────────────
  {
    key: 'semaglutide',
    displayName: 'Semaglutide (Ozempic / Wegovy)',
    modality: 'glp1',
    category: 'injection',
    frequency: 'weekly',
    isControlled: false,
    supplyDays: 28,
    hasTitration: true,
    titrationSteps: [
      { daysOffset: 0,   dose: '0.25mg' },
      { daysOffset: 28,  dose: '0.5mg'  },
      { daysOffset: 56,  dose: '1.0mg'  },
      { daysOffset: 84,  dose: '1.7mg'  },
      { daysOffset: 112, dose: '2.4mg'  },
    ],
  },
  {
    key: 'tirzepatide',
    displayName: 'Tirzepatide (Mounjaro / Zepbound)',
    modality: 'glp1',
    category: 'injection',
    frequency: 'weekly',
    isControlled: false,
    supplyDays: 28,
    hasTitration: true,
    titrationSteps: [
      { daysOffset: 0,   dose: '2.5mg'  },
      { daysOffset: 28,  dose: '5mg'    },
      { daysOffset: 56,  dose: '7.5mg'  },
      { daysOffset: 84,  dose: '10mg'   },
      { daysOffset: 112, dose: '12.5mg' },
      { daysOffset: 140, dose: '15mg'   },
    ],
  },

  // ─── Pharmacotherapy — Adherix Rx ────────────────────────────────────────
  {
    key: 'phentermine',
    displayName: 'Phentermine',
    modality: 'pharmacotherapy',
    category: 'pill',
    frequency: 'daily',
    isControlled: true,   // Schedule IV — monthly Rx required, 30-day supply hard cap
    supplyDays: 30,
    hasTitration: false,
    titrationSteps: [],
    notes: 'Controlled substance (CIV). Monthly prescription required. No refills. 30-day supply window is a hard dropout trigger.',
  },
  {
    key: 'topiramate',
    displayName: 'Topiramate (Topamax)',
    modality: 'pharmacotherapy',
    category: 'pill',
    frequency: 'daily',
    isControlled: false,
    supplyDays: 30,
    hasTitration: true,
    titrationSteps: [
      { daysOffset: 0,  dose: '25mg daily' },
      { daysOffset: 7,  dose: '50mg daily' },
      { daysOffset: 14, dose: '100mg daily' },
      { daysOffset: 21, dose: '200mg daily' },
    ],
    notes: 'Titrate slowly to reduce cognitive side effects. Patients commonly stop in week 1-2 due to brain fog — engine addresses this proactively.',
  },
  {
    key: 'phentermine_topiramate',
    displayName: 'Phentermine/Topiramate (Qsymia)',
    modality: 'pharmacotherapy',
    category: 'pill',
    frequency: 'daily',
    isControlled: true,   // Schedule IV — monthly Rx required
    supplyDays: 30,
    hasTitration: true,
    titrationSteps: [
      { daysOffset: 0,  dose: '3.75mg/23mg' },
      { daysOffset: 14, dose: '7.5mg/46mg'  },
      { daysOffset: 56, dose: '11.25mg/69mg' },
      { daysOffset: 70, dose: '15mg/92mg'   },
    ],
    notes: 'Controlled substance (CIV). REMS program required. Monthly Rx. Titration must be followed exactly — do not skip steps.',
  },
  {
    key: 'bupropion_naltrexone',
    displayName: 'Bupropion/Naltrexone (Contrave)',
    modality: 'pharmacotherapy',
    category: 'pill',
    frequency: 'twice-daily',
    isControlled: false,
    supplyDays: 30,
    hasTitration: true,
    titrationSteps: [
      { daysOffset: 0,  dose: '1 tablet morning' },
      { daysOffset: 7,  dose: '1 tablet morning + 1 tablet evening' },
      { daysOffset: 14, dose: '2 tablets morning + 1 tablet evening' },
      { daysOffset: 21, dose: '2 tablets morning + 2 tablets evening' },
    ],
    notes: '4-week titration to full dose. Nausea is most common in week 1-2 — engine addresses this before it causes dropout. Take with food.',
  },
  {
    key: 'orlistat',
    displayName: 'Orlistat (Xenical / Alli)',
    modality: 'pharmacotherapy',
    category: 'pill',
    frequency: 'three-daily',
    isControlled: false,
    supplyDays: 30,
    hasTitration: false,
    titrationSteps: [],
    notes: 'Take with each main meal containing fat. GI side effects are the primary dropout driver — engine frames these as expected and dose-responsive.',
  },

  // ─── Metabolic Health — Adherix Metabolic ────────────────────────────────
  {
    key: 'metformin',
    displayName: 'Metformin',
    modality: 'metabolic_health',
    category: 'pill',
    frequency: 'twice-daily',
    isControlled: false,
    supplyDays: 90,
    hasTitration: true,
    titrationSteps: [
      { daysOffset: 0,  dose: '500mg once daily with dinner' },
      { daysOffset: 7,  dose: '500mg twice daily' },
      { daysOffset: 14, dose: '1000mg twice daily' },
    ],
    notes: 'Titrate slowly to reduce GI side effects. Take with food. 90-day supply standard for stable pre-diabetic patients. Engine checks for GI side effect keywords in weeks 1-2.',
  },
  {
    key: 'berberine',
    displayName: 'Berberine (supplement)',
    modality: 'metabolic_health',
    category: 'supplement',
    frequency: 'three-daily',
    isControlled: false,
    supplyDays: 30,
    hasTitration: false,
    titrationSteps: [],
    notes: 'OTC supplement. Take 500mg with each meal. Used as adjunct to lifestyle intervention in pre-diabetes management.',
  },

  // ─── Bariatric — Adherix Bridge ──────────────────────────────────────────
  // Post-op supplements are tracked for adherence, not titration.
  // These are not prescription medications but are clinically critical post-op.
  {
    key: 'bariatric_supplements',
    displayName: 'Post-op supplement protocol (B12, Iron, Calcium, Vitamin D)',
    modality: 'bariatric',
    category: 'supplement',
    frequency: 'daily',
    isControlled: false,
    supplyDays: 30,
    hasTitration: false,
    titrationSteps: [],
    notes: 'Standard post-bariatric supplement stack. B12 (sublingual or injection), iron, calcium citrate (NOT carbonate — absorption requires acid), vitamin D3. Non-adherence is a leading cause of long-term complications post-op.',
  },
  {
    key: 'bariatric_protein',
    displayName: 'Protein target protocol (60-80g/day)',
    modality: 'bariatric',
    category: 'supplement',
    frequency: 'daily',
    isControlled: false,
    supplyDays: 30,
    hasTitration: false,
    titrationSteps: [],
    notes: 'Not a supplement but tracked as an adherence behavior. Patients hitting 60-80g protein/day in weeks 1-6 have significantly better 1-year weight outcomes. Engine tracks via reply prompts.',
  },

  // ─── Behavioral Therapy — Adherix IBT ────────────────────────────────────
  // IBT is a purely behavioral program. No medications tracked.
  // Enrollment still requires a protocol entry for type consistency.
  {
    key: 'ibt_no_medication',
    displayName: 'No medication — behavioral program only',
    modality: 'behavioral_therapy',
    category: 'supplement',
    frequency: 'daily',
    isControlled: false,
    supplyDays: 0,
    hasTitration: false,
    titrationSteps: [],
    notes: 'IBT is a behavioral-only program. No medication tracking required. Placeholder for type consistency at enrollment.',
  },
];

// ─── Lookup helpers ──────────────────────────────────────────────────────────

export function findProtocol(key: string): MedicationProtocol | undefined {
  return MEDICATION_PROTOCOLS.find(p => p.key === key);
}

export function protocolsByModality(modality: string): MedicationProtocol[] {
  return MEDICATION_PROTOCOLS.filter(p => p.modality === modality);
}

export function controlledProtocols(): MedicationProtocol[] {
  return MEDICATION_PROTOCOLS.filter(p => p.isControlled);
}

// ─── Titration schedule computation ──────────────────────────────────────────

/**
 * Given a protocol and enrollment date, returns the full titration schedule
 * as dated steps ready for DB storage in patients.titration_schedule (JSONB).
 */
export function computeTitrationSchedule(
  protocol: MedicationProtocol,
  enrolledAt: Date
): Array<TitrationStep & { scheduledDate: string }> {
  if (!protocol.hasTitration) return [];
  return protocol.titrationSteps.map(step => {
    const d = new Date(enrolledAt.getTime() + step.daysOffset * 24 * 60 * 60 * 1000);
    return { ...step, scheduledDate: d.toISOString().slice(0, 10) };
  });
}

/**
 * Returns the next titration step after the given reference date.
 * Used to populate patients.next_titration_date.
 */
export function getNextTitrationDate(
  schedule: Array<TitrationStep & { scheduledDate: string }>,
  afterDate: Date
): { date: string; dose: string } | null {
  const next = schedule.find(s => new Date(s.scheduledDate) > afterDate);
  return next ? { date: next.scheduledDate, dose: next.dose } : null;
}

/**
 * Returns the next refill date based on supply cycle.
 * Fires the refill_due trigger when within 7 days of this date.
 */
export function getNextRefillDate(
  protocol: MedicationProtocol,
  lastFillDate: Date
): Date {
  return new Date(lastFillDate.getTime() + protocol.supplyDays * 24 * 60 * 60 * 1000);
}

/**
 * Returns true if the patient's refill window is opening within the next N days.
 * Used by the refill_due trigger in pharmacotherapy-config.ts.
 */
export function isRefillWindowOpen(
  protocol: MedicationProtocol,
  lastFillDate: Date,
  warningDaysBeforeRefill = 7
): boolean {
  if (protocol.supplyDays === 0) return false;
  const refillDate = getNextRefillDate(protocol, lastFillDate);
  const now = new Date();
  const daysUntilRefill = (refillDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
  return daysUntilRefill <= warningDaysBeforeRefill && daysUntilRefill >= 0;
}
