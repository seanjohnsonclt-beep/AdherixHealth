// Engagement trajectory scorer.
//
// Runs at the start of every tick (before trigger evaluation) to update
// engagement_trajectory and consecutive_silences on the patients table.
//
// Trajectory values:
//   responsive    -  patient is actively replying (default / healthy)
//   inconsistent  -  gaps growing; reply rate dropped ≥ 50% vs prior week
//   declining     -  clear drop-off; 72h+ silence with falling trend
//
// These values are read by drift-correction.ts to select the correct pattern.

import { query } from '@/lib/db';

const HOUR_MS = 60 * 60 * 1000;

type PatientRow = {
  id:                   string;
  last_inbound_at:      Date | null;
  consecutive_silences: number;
  replies_last_7d:      number;
  replies_prev_7d:      number;
};

type Trajectory = 'responsive' | 'inconsistent' | 'declining';

function score(p: PatientRow): { trajectory: Trajectory; consecutiveSilences: number } {
  const hoursSinceReply = p.last_inbound_at
    ? (Date.now() - new Date(p.last_inbound_at).getTime()) / HOUR_MS
    : Infinity;

  // Declining: ≥ 72h silence AND reply trend is down
  if (
    hoursSinceReply >= 72 &&
    p.replies_last_7d < p.replies_prev_7d
  ) {
    return {
      trajectory: 'declining',
      consecutiveSilences: p.consecutive_silences + 1,
    };
  }

  // Inconsistent: ≥ 48h silence OR reply rate dropped ≥ 50%
  const rateDrop =
    p.replies_prev_7d > 0 &&
    p.replies_last_7d / p.replies_prev_7d < 0.5;

  if (hoursSinceReply >= 48 || rateDrop) {
    return {
      trajectory: 'inconsistent',
      // Only increment consecutive_silences on true silence windows (48h+), not rate drops alone
      consecutiveSilences: hoursSinceReply >= 48
        ? p.consecutive_silences + 1
        : p.consecutive_silences,
    };
  }

  // Responsive: reset silence counter
  return { trajectory: 'responsive', consecutiveSilences: 0 };
}

export async function updateAllTrajectories(): Promise<void> {
  const patients = await query<PatientRow>(
    `select
       p.id,
       p.last_inbound_at,
       COALESCE(p.consecutive_silences, 0) as consecutive_silences,

       -- inbound replies in last 7 days
       (select count(*)::int
        from messages m
        where m.patient_id = p.id
          and m.direction  = 'inbound'
          and m.created_at > now() - interval '7 days'
       ) as replies_last_7d,

       -- inbound replies 8-14 days ago (comparison window)
       (select count(*)::int
        from messages m
        where m.patient_id = p.id
          and m.direction  = 'inbound'
          and m.created_at between now() - interval '14 days'
                               and now() - interval '7 days'
       ) as replies_prev_7d

     from patients p
     where p.status in ('active', 'flagged')`,
  );

  let changed = 0;

  for (const p of patients) {
    const { trajectory, consecutiveSilences } = score(p);

    // Only write if something changed (avoids noisy UPDATE churn on every tick)
    const result = await query<{ id: string }>(
      `update patients set
         engagement_trajectory = $2,
         consecutive_silences  = $3
       where id = $1
         and (
           engagement_trajectory IS DISTINCT FROM $2 OR
           consecutive_silences  IS DISTINCT FROM $3
         )
       returning id`,
      [p.id, trajectory, consecutiveSilences],
    );

    if (result.length > 0) changed++;
  }

  console.log(
    `[DC] trajectory: ${patients.length} evaluated, ${changed} updated`,
  );
}
