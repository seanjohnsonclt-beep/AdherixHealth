// Public API — no auth required.
// Enrolls a prospect's phone number into a demo patient sequence.
// Uses a shared "Adherix Demo" clinic so real clinic data is never touched.
//
// Rate limiting: 1 active demo per phone number (idempotent).
// Auto-expiry: demo patients are flagged after 7 days with no action needed.

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { enrollPatient } from '@/engine/enroll';

// Normalize phone to E.164. Handles US numbers with/without country code.
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (digits.length > 7 && digits.length <= 15) return `+${digits}`;
  return null;
}

export async function POST(req: NextRequest) {
  let body: { phone?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const phone = normalizePhone(body.phone ?? '');
  if (!phone) {
    return NextResponse.json(
      { error: 'Please enter a valid US phone number.' },
      { status: 400 }
    );
  }

  const firstName = (body.name ?? '').trim().split(' ')[0] || null;

  try {
    // Find or create the shared demo clinic
    let clinic = await queryOne<{ id: string }>(
      `select id from clinics where name = 'Adherix Demo' limit 1`
    );
    if (!clinic) {
      clinic = await queryOne<{ id: string }>(
        `insert into clinics (name, plan) values ('Adherix Demo', 'pilot') returning id`
      );
    }
    if (!clinic) throw new Error('Could not create demo clinic');

    // Check if this phone already has an active demo
    const existing = await queryOne<{ id: string; status: string; enrolled_at: Date }>(
      `select id, status, enrolled_at from patients
       where clinic_id = $1 and phone = $2 limit 1`,
      [clinic.id, phone]
    );

    if (existing && existing.status !== 'churned') {
      // Already enrolled — return their patient ID so the UI can show status
      return NextResponse.json({
        success: true,
        patientId: existing.id,
        alreadyEnrolled: true,
        message: 'A demo is already running for this number.',
      });
    }

    // Enroll (or re-enroll if previously churned)
    if (existing) {
      // Reset a churned demo patient
      await query(
        `update patients set status = 'active', current_phase = 0,
         phase_started_at = now(), last_inbound_at = null
         where id = $1`,
        [existing.id]
      );
      if (firstName) {
        await query(`update patients set first_name = $1 where id = $2`, [firstName, existing.id]);
      }
      // Re-schedule phase 0
      await query(`delete from messages where patient_id = $1 and status = 'pending'`, [existing.id]);
      const { schedulePhaseMessages } = await import('@/engine/scheduler');
      await schedulePhaseMessages(existing.id, 0);

      return NextResponse.json({ success: true, patientId: existing.id, alreadyEnrolled: false });
    }

    const patientId = await enrollPatient({
      clinicId: clinic.id,
      phone,
      firstName: firstName ?? undefined,
    });

    // Fast-forward all pending messages to now so the welcome fires on the very next cron tick
    await query(
      `update messages set scheduled_for = now() where patient_id = $1 and status = 'pending'`,
      [patientId]
    );
    console.log(`[demo/enroll] enrolled ${patientId}, messages fast-forwarded to now`);

    return NextResponse.json({ success: true, patientId, alreadyEnrolled: false });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Server error';
    console.error('[demo/enroll]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
