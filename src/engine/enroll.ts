import { query, queryOne } from '@/lib/db';
import { schedulePhaseMessages } from './scheduler';
import {
  findProtocol,
  computeTitrationSchedule,
  getNextTitrationDate,
} from './medications';

export type EnrollArgs = {
  clinicId: string;
  phone: string;          // E.164
  firstName?: string;
  // Adherence fields (optional — legacy enrollment without medication is still valid)
  medication?: string;    // MEDICATION_PROTOCOLS key
  startingDose?: string;  // override first titration step dose (rare)
  supplyQuantity?: number; // number of doses in current pen/pack
};

export async function enrollPatient({
  clinicId,
  phone,
  firstName,
  medication,
  startingDose,
  supplyQuantity,
}: EnrollArgs): Promise<string> {
  // Idempotent on (clinic_id, phone)
  const existing = await queryOne<{ id: string }>(
    `select id from patients where clinic_id = $1 and phone = $2`,
    [clinicId, phone]
  );
  if (existing) return existing.id;

  // Compute titration schedule from protocol if medication is set
  const now = new Date();
  let titrationSchedule: Array<{ weekOffset: number; dose: string; scheduledDate: string }> | null = null;
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

  const row = await queryOne<{ id: string }>(
    `insert into patients (
       clinic_id, phone, first_name, current_phase, phase_started_at,
       medication, starting_dose, current_dose, injection_frequency,
       titration_schedule, next_titration_date, supply_quantity
     )
     values ($1, $2, $3, 0, now(), $4, $5, $6, $7, $8, $9, $10)
     returning id`,
    [
      clinicId,
      phone,
      firstName ?? null,
      medication ?? null,
      startingDose ?? currentDose,
      currentDose,
      medication ? 'weekly' : null,
      titrationSchedule ? JSON.stringify(titrationSchedule) : null,
      nextTitrationDate,
      supplyQuantity ?? null,
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

  await schedulePhaseMessages(row.id, 0);
  return row.id;
}
