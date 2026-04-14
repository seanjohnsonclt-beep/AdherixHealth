import { query } from '@/lib/db';
import { sendSms } from '@/lib/twilio';

type DueMessage = {
  id: string;
  patient_id: string;
  body: string;
  phone: string;
  twilio_number: string | null;
};

export async function sendDueMessages() {
  const due = await query<DueMessage>(
    `select m.id, m.patient_id, m.body, p.phone, c.twilio_number
     from messages m
     join patients p on p.id = m.patient_id
     join clinics c on c.id = p.clinic_id
     where m.status = 'pending'
       and m.direction = 'outbound'
       and m.scheduled_for <= now()
       and p.status in ('active', 'flagged')
     order by m.scheduled_for asc
     limit 50`
  );

  for (const msg of due) {
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
      await query(`update messages set status = 'failed' where id = $1`, [msg.id]);
      await query(
        `insert into events (patient_id, kind, payload) values ($1, 'send_failed', $2)`,
        [msg.patient_id, JSON.stringify({ message_id: msg.id, error: errMsg })]
      );
    }
  }
}
