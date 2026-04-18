import { query } from '@/lib/db';
import { sendSms } from '@/lib/twilio';
import { sendDeliveryFailureAlert, type FailureRecord } from '@/lib/email';

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
};

export async function sendDueMessages() {
  if (DRY_RUN) {
    console.log('[sender] DRY_RUN mode — no Twilio credentials, marking due messages as sent');
  }

  const due = await query<DueMessage>(
    `select
       m.id, m.patient_id, m.template_key, m.body,
       p.phone, p.first_name,
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

  // Collect failures per clinic so we send one summary email, not one per message
  const failuresByClinic = new Map<string, {
    email: string;
    clinicName: string;
    failures: FailureRecord[];
  }>();

  for (const msg of due) {
    if (DRY_RUN) {
      const fakeSid = `DRY_${msg.id.replace(/-/g, '').slice(0, 16).toUpperCase()}`;
      await query(
        `update messages set status = 'sent', sent_at = now(), twilio_sid = $1 where id = $2`,
        [fakeSid, msg.id]
      );
      console.log(`[sender] dry-run sent ${msg.id} -> ${fakeSid}`);
      console.log(`  to=${msg.phone}  body="${msg.body.slice(0, 60)}${msg.body.length > 60 ? '...' : ''}"`);
      continue;
    }

    try {
      const result = await sendSms({
        to: msg.phone,
        from: msg.twilio_number || undefined,
        body: msg.body,
      });
      await query(
        `update messages set status = 'sent', sent_at = now(), twilio_sid = $1 where id = $2`,
        [result.sid, msg.id]
      );
      console.log(`[sender] sent ${msg.id} -> ${result.sid}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[sender] failed ${msg.id}:`, errMsg);

      await query(
        `update messages set status = 'failed', error = $1 where id = $2`,
        [errMsg, msg.id]
      );

      // Accumulate failure for this clinic
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

  // Send one summary alert per affected clinic
  for (const { email, clinicName, failures } of failuresByClinic.values()) {
    await sendDeliveryFailureAlert({ to: email, clinicName, failures });
  }
}
