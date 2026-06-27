import { query, queryOne } from '@/lib/db';
import { schedulePhaseMessages } from './scheduler';
import {
  findProtocol,
  computeTitrationSchedule,
  getNextTitrationDate,
} from './medications';
import { generateHandle, assignToSquad } from './quest-game';

export type EnrollArgs = {
  clinicId: string;
  phone: string;          // E.164
  firstName?: string;
  modality?: string;      // 'glp1' | 'bariatric' | 'quest' etc - defaults to clinic modality
  // Adherence fields (optional  -  legacy enrollment without medication is still valid)
  medication?: string;    // MEDICATION_PROTOCOLS key
  startingDose?: string;  // override first titration step dose (rare)
  supplyQuantity?: number; // number of doses in current pen/pack
  // Quest (pediatric) fields
  dateOfBirth?: string;          // YYYY-MM-DD
  state?: string;                // 2-letter state code for minor consent routing
  guardianName?: string;
  guardianPhone?: string;        // E.164 - receives separate guardian message track
  questRewardCategory?: string;  // 'gamer' | 'wellness' | 'reader'
};

export async function enrollPatient({
  clinicId,
  phone,
  firstName,
  modality: explicitModality,
  medication,
  questRewardCategory,
  startingDose,
  supplyQuantity,
  dateOfBirth,
  state,
  guardianName,
  guardianPhone,
}: EnrollArgs): Promise<string> {
  // Idempotent on (clinic_id, phone)
  const existing = await queryOne<{ id: string }>(
    `select id from patients where clinic_id = $1 and phone = $2`,
    [clinicId, phone]
  );
  if (existing) return existing.id;

  // Modality: use explicit value from enrollment form, fall back to clinic default
  let modality = explicitModality ?? 'glp1';
  if (!explicitModality) {
    const clinicRow = await queryOne<{ modality: string }>(
      `select coalesce(modality, 'glp1') as modality from clinics where id = $1`,
      [clinicId]
    );
    modality = clinicRow?.modality ?? 'glp1';
  }

  // Compute titration schedule from protocol if medication is set
  const now = new Date();
  let titrationSchedule: Array<{ daysOffset: number; dose: string; scheduledDate: string }> | null = null;
  let currentDose: string | null = null;
  let nextTitrationDate: string | null = null;

  const protocol = medication ? findProtocol(medication) : null;
  if (protocol) {
    titrationSchedule = computeTitrationSchedule(protocol, now);
    // Starting dose: first step (or explicit override)
    currentDose = startingDose ?? titrationSchedule[0]?.dose ?? null;
    // Next titration: second step in the schedule
    const nextStep = getNextTitrationDate(titrationSchedule, now);
    nextTitrationDate = nextStep?.date ?? null;
  }

  // Quest: compute consent_type from age + state
  let consentType: string | null = null;
  if (modality === 'quest' && dateOfBirth && state) {
    const { getConsentType, getPatientAge } = await import('./quest-consent');
    const age = getPatientAge(dateOfBirth);
    consentType = getConsentType(age, state);
  }

  // Quest: generate anonymous handle
  const questHandle = modality === 'quest' ? generateHandle() : null;

    const row = await queryOne<{ id: string }>(
    `insert into patients (
       clinic_id, phone, first_name, current_phase, phase_started_at,
       medication, starting_dose, current_dose, injection_frequency,
       titration_schedule, next_titration_date, supply_quantity, modality,
       date_of_birth, state, guardian_name, guardian_phone, consent_type, consent_status,
       quest_reward_category, quest_handle
     )
     values ($1, $2, $3, 0, now(), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
     returning id`,
    [
      clinicId,
      phone,
      firstName ?? null,
      medication ?? null,
      startingDose ?? currentDose,
      currentDose,
      protocol?.frequency ?? null,
      titrationSchedule ? JSON.stringify(titrationSchedule) : null,
      nextTitrationDate,
      supplyQuantity ?? null,
      modality,
      dateOfBirth ?? null,
      state ?? null,
      guardianName ?? null,
      guardianPhone ?? null,
      consentType,
      consentType ? 'obtained' : null,
      modality === 'quest' ? (questRewardCategory ?? 'gamer') : null,
      questHandle,
    ]
  );
  if (!row) throw new Error('Failed to insert patient');

  await query(
    `insert into events (patient_id, kind, payload) values ($1, 'enrolled', $2)`,
    [row.id, JSON.stringify({
      phone_last4: phone.slice(-4),
      medication: medication ?? null,
      starting_dose: currentDose ?? null,
    })]
  );

  // Quest post-enrollment: assign to squad
  if (modality === 'quest') {
    try {
      await assignToSquad(row.id, clinicId);
    } catch (err) {
      console.warn('[enroll] squad assignment failed (non-fatal):', err);
    }
  }

  await schedulePhaseMessages(row.id, 0);
  return row.id;
}
