// Medication protocol definitions for GLP-1 titration tracking.
// Same pattern as phases.ts / templates.ts — TypeScript config, type-checked, no drift.
//
// Clinic selects medication + starting dose at enrollment; the full titration
// schedule is auto-calculated and stored in patients.titration_schedule (JSONB).
//
// HIPAA note: medication names and doses NEVER appear in SMS bodies.
// All clinical data lives in the DB. SMS uses generic language only.

export type TitrationStep = {
  weekOffset: number; // weeks from enrollment_date
  dose: string;       // human-readable dose label (stored in DB only, never sent via SMS)
};

export type MedicationProtocol = {
  key: string;
  displayName: string;
  frequency: 'weekly';
  titrationSteps: TitrationStep[];
};

export const MEDICATION_PROTOCOLS: MedicationProtocol[] = [
  {
    key: 'semaglutide',
    displayName: 'Semaglutide (Ozempic / Wegovy)',
    frequency: 'weekly',
    titrationSteps: [
      { weekOffset: 0,  dose: '0.25mg' },
      { weekOffset: 4,  dose: '0.5mg'  },
      { weekOffset: 8,  dose: '1.0mg'  },
      { weekOffset: 12, dose: '1.7mg'  },
      { weekOffset: 16, dose: '2.4mg'  },
    ],
  },
  {
    key: 'tirzepatide',
    displayName: 'Tirzepatide (Mounjaro / Zepbound)',
    frequency: 'weekly',
    titrationSteps: [
      { weekOffset: 0,  dose: '2.5mg'  },
      { weekOffset: 4,  dose: '5mg'    },
      { weekOffset: 8,  dose: '7.5mg'  },
      { weekOffset: 12, dose: '10mg'   },
      { weekOffset: 16, dose: '12.5mg' },
      { weekOffset: 20, dose: '15mg'   },
    ],
  },
];

export function findProtocol(key: string): MedicationProtocol | undefined {
  return MEDICATION_PROTOCOLS.find(p => p.key === key);
}

/**
 * Given a protocol and an enrollment date, returns the full titration schedule
 * as an array of { weekOffset, dose, scheduledDate } objects ready for DB storage.
 */
export function computeTitrationSchedule(
  protocol: MedicationProtocol,
  enrolledAt: Date
): Array<TitrationStep & { scheduledDate: string }> {
  return protocol.titrationSteps.map(step => {
    const d = new Date(enrolledAt.getTime() + step.weekOffset * 7 * 24 * 60 * 60 * 1000);
    return { ...step, scheduledDate: d.toISOString().slice(0, 10) };
  });
}

/**
 * Returns the next titration date after the given reference date.
 * Used to populate patients.next_titration_date.
 */
export function getNextTitrationDate(
  schedule: Array<TitrationStep & { scheduledDate: string }>,
  afterDate: Date
): { date: string; dose: string } | null {
  const next = schedule.find(s => new Date(s.scheduledDate) > afterDate);
  return next ? { date: next.scheduledDate, dose: next.dose } : null;
}
