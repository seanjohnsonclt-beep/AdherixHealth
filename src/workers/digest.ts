// Weekly digest worker.
//
// Called from every tick(). Checks "is it roughly 8am on Monday in the
// digest timezone, and have we NOT already sent this week's digest to this
// clinic?" — if both true, builds the digest and sends it to every admin
// for that clinic.
//
// Dedupe: the clinic_digests table has a unique index on
// (clinic_id, week_start, kind). We insert optimistically — if the insert
// succeeds the clinic is ours to send; if it fails on unique-violation the
// digest already went out this week and we move on.
//
// Safe to call on every 60s cron tick — it does ~1 query to find eligible
// clinics, and most ticks will find zero.

import { query, queryOne } from '@/lib/db';
import { sendWeeklyDigest, type WeeklyDigestData } from '@/lib/email';
import { getClinicMetrics } from '@/lib/metrics';

const DIGEST_TIMEZONE = process.env.DEFAULT_TIMEZONE || 'America/New_York';
const DIGEST_DOW = 1;      // Monday (0 = Sunday)
const DIGEST_HOUR = 8;     // 8am local
const DIGEST_WINDOW_HRS = 2; // 8am–10am window so we don't miss it if cron hiccups

type ClinicRow = { id: string; name: string };
type AdminRow = { email: string };

// Return {weekStart: Date (Monday 00:00 local), shouldSendNow: boolean}
function digestTimingForTz(tz: string): { weekStart: string; shouldSendNow: boolean } {
  // Format the current time in the target timezone
  const now = new Date();
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  });
  const parts = fmt.formatToParts(now).reduce<Record<string, string>>((a, p) => {
    if (p.type !== 'literal') a[p.type] = p.value;
    return a;
  }, {});

  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const dow = weekdayMap[parts.weekday] ?? -1;
  const hour = parseInt(parts.hour);

  const shouldSendNow =
    dow === DIGEST_DOW &&
    hour >= DIGEST_HOUR &&
    hour < DIGEST_HOUR + DIGEST_WINDOW_HRS;

  // Compute the Monday date we're covering — always today if dow=1,
  // otherwise the Monday immediately before now.
  const todayISO = `${parts.year}-${parts.month}-${parts.day}`;
  const todayDate = new Date(`${todayISO}T00:00:00Z`);
  const offsetDays = (dow - DIGEST_DOW + 7) % 7;
  const weekStartDate = new Date(todayDate.getTime() - offsetDays * 86400_000);
  const weekStart = weekStartDate.toISOString().slice(0, 10);

  return { weekStart, shouldSendNow };
}

function fmtMonthDay(iso: string): string {
  // iso is YYYY-MM-DD
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export async function runWeeklyDigestIfDue() {
  const { weekStart, shouldSendNow } = digestTimingForTz(DIGEST_TIMEZONE);
  if (!shouldSendNow) return;

  const clinics = await query<ClinicRow>(`select id, name from clinics`);
  if (clinics.length === 0) return;

  // Compute the display date range: Monday → Sunday of the covered week
  const weekEndDate = new Date(`${weekStart}T00:00:00Z`);
  weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);
  const weekEnd = weekEndDate.toISOString().slice(0, 10);

  for (const clinic of clinics) {
    try {
      // Try to claim this week for this clinic. If the unique constraint
      // trips, another tick already sent it and we skip.
      const claim = await queryOne<{ id: string }>(
        `insert into clinic_digests (clinic_id, week_start, kind)
         values ($1, $2, 'weekly')
         on conflict (clinic_id, week_start, kind) do nothing
         returning id`,
        [clinic.id, weekStart]
      );
      if (!claim) continue;

      const admins = await query<AdminRow>(
        `select email from clinic_users where clinic_id = $1 and email is not null`,
        [clinic.id]
      );
      if (admins.length === 0) {
        console.log(`[digest] no admins for ${clinic.name} (${clinic.id}) — skipping`);
        continue;
      }

      const metrics = await getClinicMetrics(clinic.id);

      // Per-week message counts — just from the covered Monday → now
      const msgCounts = await queryOne<{ out: string; inb: string }>(
        `select
           count(*) filter (where m.direction = 'outbound' and m.status = 'sent')::text as out,
           count(*) filter (where m.direction = 'inbound')::text                        as inb
         from messages m
         join patients p on p.id = m.patient_id
         where p.clinic_id = $1
           and m.created_at >= $2::date`,
        [clinic.id, weekStart]
      );

      const data: WeeklyDigestData = {
        clinicName: clinic.name,
        weekStart: fmtMonthDay(weekStart),
        weekEnd: fmtMonthDay(weekEnd),
        recoveredThisWeek: metrics.recoveredThisWeek,
        driftingNow: metrics.driftingNow,
        needStaffOutreach: metrics.needStaffOutreach,
        revenueProtected30d: metrics.revenueProtected30d,
        revenueProtectedIsModeled: metrics.revenueProtectedIsModeled,
        outboundSent: parseInt(msgCounts?.out || '0'),
        inboundReceived: parseInt(msgCounts?.inb || '0'),
      };

      const recipients = admins.map((a) => a.email);
      for (const email of recipients) {
        await sendWeeklyDigest({ to: email, data });
      }

      await query(
        `update clinic_digests set recipients = $1
         where clinic_id = $2 and week_start = $3 and kind = 'weekly'`,
        [recipients.join(','), clinic.id, weekStart]
      );

      console.log(`[digest] sent weekly to ${clinic.name}: ${recipients.length} recipient(s)`);
    } catch (err) {
      console.error(`[digest] failed for clinic ${clinic.id}:`, err);
      // Continue with the next clinic — one failure doesn't cancel the batch.
    }
  }
}
