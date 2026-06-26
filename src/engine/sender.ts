import { query } from '@/lib/db';
import { sendSms } from '@/lib/twilio';
import { sendDeliveryFailureAlert, type FailureRecord } from '@/lib/email';
import { personalizeMessage, fetchRecentReplies, fetchWeightContext } from '@/lib/ai';
import { findPhase } from '@/lib/config';

const DRY_RUN = !process.env.TWILIO_ACCOUNT_SID || process.env.DRY_RUN === 'true';

type DueMessage = {
  id: string;
  patient_id: string;
  first_name: string | null;
  body: string;
  phone: string;
  template_key: string | null;
  twilio_number: string | null;
  clinic_id: string;
  clinic_name: string;
  clinic_admin_email: string | null;
  // Quest dual-channel
  guardian_phone: string | null;
  guardian_name: string | null;
  // Phase context
  current_phase: number;
  phase_started_at: string | null;
  // Rich behavioral context from existing engine signals
  engagement_trajectory: string | null;
  modality: string | null;
  medication: string | null;
  last_titration_date: string | null;
  consecutive_missed_injections: number;
  confirmed_injection_streak: number;
  enrolled_at: string | null;
};

export async function sendDueMessages() {
  if (DRY_RUN) {
    console.log('[sender] DRY_RUN mode  -  no Twilio credentials, marking due messages as sent');
  }

  const due = await query<DueMessage>(
    `select
       m.id, m.patient_id, m.template_key, m.body,
       p.phone, p.first_name, p.current_phase, p.phase_started_at,
       p.guardian_phone, p.guardian_name,
       coalesce(p.modality, 'glp1') as modality,
       p.medication,
       p.engagement_trajectory,
       p.last_titration_date,
       coalesce(p.consecutive_missed_injections, 0) as consecutive_missed_injections,
       coalesce(p.confirmed_injection_streak, 0) as confirmed_injection_streak,
       p.enrolled_at,
       c.id as clinic_id, c.name as clinic_name, c.twilio_number,
       cu.email as clinic_admin_email
     from messages m
     join patients p on p.id = m.patient_id
     join clinics c on c.id = p.clinic_id
     left join clinic_users cu on cu.clinic_id = c.id
     where m.status = 'pending'
       and m.direction = 'outbound'
       and m.scheduled_for <= now()
       and p.status in ('active', 'flagged')
     order by m.scheduled_for asc
     limit 50`
  );

  const failuresByClinic = new Map<string, {
    email: string;
    clinicName: string;
    failures: FailureRecord[];
  }>();

  for (const msg of due) {
    // AI personalization - runs at send time so context is always current.
    // Falls back to original template body on any failure.
    let finalBody = msg.body;
    let aiPersonalized = false;

    const skipPersonalization = !msg.template_key
      || msg.template_key === 'trigger.flagged_for_clinic';

    if (!skipPersonalization) {
      const phase = findPhase(msg.current_phase);
      const daysInPhase = msg.phase_started_at
        ? Math.floor((Date.now() - new Date(msg.phase_started_at).getTime()) / 86_400_000)
        : 0;
      const daysSinceTitration = msg.last_titration_date
        ? Math.floor((Date.now() - new Date(msg.last_titration_date).getTime()) / 86_400_000)
        : null;
      const daysEnrolled = msg.enrolled_at
        ? Math.floor((Date.now() - new Date(msg.enrolled_at).getTime()) / 86_400_000)
        : 0;

      const [recentReplies, weightContext] = await Promise.all([
        fetchRecentReplies(msg.patient_id),
        fetchWeightContext(msg.patient_id),
      ]);

      const result = await personalizeMessage({
        body: msg.body,
        firstName: msg.first_name || 'there',
        phaseName: phase?.name ?? `Phase ${msg.current_phase}`,
        daysInPhase,
        recentReplies,
        engagementTrajectory: (msg.engagement_trajectory as any) ?? null,
        medicationKey: msg.medication,
        modality: msg.modality,
        daysSinceTitration,
        consecutiveMisses: msg.consecutive_missed_injections,
        injectionStreak: msg.confirmed_injection_streak,
        daysEnrolled,
        lbsLost: weightContext.lbsLost,
        pctLost: weightContext.pctLost,
        recentMilestone: weightContext.recentMilestone,
      });

      finalBody = result.body;
      aiPersonalized = result.personalized;
    }

    if (DRY_RUN) {
      const fakeSid = `DRY_${msg.id.replace(/-/g, '').slice(0, 16).toUpperCase()}`;
      await query(
        `update messages set status = 'sent', sent_at = now(), twilio_sid = $1, ai_personalized = $2 where id = $3`,
        [fakeSid, aiPersonalized, msg.id]
      );
      const preview = finalBody.slice(0, 60) + (finalBody.length > 60 ? '...' : '');
      const tag = aiPersonalized ? ' (AI)' : '';
      console.log(`[sender] dry-run sent ${msg.id} -> ${fakeSid}${tag}`);
      console.log(`  to=${msg.phone}  body="${preview}"`);
      continue;
    }

    try {
      const smsResult = await sendSms({
        to: msg.phone,
        from: msg.twilio_number || undefined,
        body: finalBody,
      });
      await query(
        `update messages set status = 'sent', sent_at = now(), twilio_sid = $1, ai_personalized = $2 where id = $3`,
        [smsResult.sid, aiPersonalized, msg.id]
      );
      const tag = aiPersonalized ? ' (AI)' : '';
      console.log(`[sender] sent ${msg.id} -> ${smsResult.sid}${tag}`);

      // Quest dual-send: if guardian_phone exists and template is a 'both' or 'guardian' track,
      // send the guardian version. For now we send the same body to guardian unless
      // quest-config specifies guardian_body. Full track routing handled by quest-consent layer.
      if (msg.modality === 'quest' && msg.guardian_phone && msg.template_key?.startsWith('quest.')) {
        try {
          await sendSms({
            to: msg.guardian_phone,
            from: msg.twilio_number || undefined,
            body: `[For ${msg.first_name || 'your teen'}] ` + finalBody,
          });
          console.log(`[sender] quest guardian-send -> ${msg.guardian_phone}`);
        } catch (gErr) {
          console.error(`[sender] guardian send failed:`, gErr);
          // Non-fatal - teen message already sent
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[sender] failed ${msg.id}:`, errMsg);

      await query(
        `update messages set status = 'failed', error = $1 where id = $2`,
        [errMsg, msg.id]
      );

      if (msg.clinic_admin_email) {
        const existing = failuresByClinic.get(msg.clinic_id);
        const record: FailureRecord = {
          messageId: msg.id,
          patientId: msg.patient_id,
          firstName: msg.first_name,
          templateKey: msg.template_key,
          error: errMsg,
        };
        if (existing) {
          existing.failures.push(record);
        } else {
          failuresByClinic.set(msg.clinic_id, {
            email: msg.clinic_admin_email,
            clinicName: msg.clinic_name,
            failures: [record],
          });
        }
      }
    }
  }

  for (const { email, clinicName, failures } of failuresByClinic.values()) {
    await sendDeliveryFailureAlert({ to: email, clinicName, failures });
  }
}
