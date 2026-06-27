// /admin/rewards - Boss Challenge reward fulfillment queue
//
// Shows Quest patients who have hit a monthly XP reward threshold.
// Clinic admin manually sends the gift card, then marks as fulfilled here.
// Resets that patient's monthly XP after fulfillment.

import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { Topbar } from '@/app/_components/Topbar';
import { REWARD_TIERS, REWARD_CATEGORY_LABELS, getRewardTier } from '@/engine/boss-challenge';
import Link from 'next/link';
import { fulfillRewardAction } from './actions';

type RewardRow = {
  id: string;
  first_name: string | null;
  quest_xp: number;
  quest_monthly_xp: number;
  quest_level: number;
  quest_reward_category: string | null;
  quest_streak: number;
  clinic_id: string;
  phone: string;
  enrolled_at: string;
  // Latest boss challenge outcome
  last_boss_status: string | null;
  last_boss_week: string | null;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RewardsPage() {
  const user = await requireUser();

  let rows: RewardRow[] = [];
  try {
    rows = await query<RewardRow>(
      `SELECT
         p.id, p.first_name, p.quest_xp, COALESCE(p.quest_monthly_xp, 0) as quest_monthly_xp,
         COALESCE(p.quest_level, 1) as quest_level,
         COALESCE(p.quest_reward_category, 'gamer') as quest_reward_category,
         COALESCE(p.quest_streak, 0) as quest_streak,
         p.clinic_id, p.phone, p.enrolled_at::text,
         (SELECT qb.status FROM quest_boss_challenges qb
          WHERE qb.patient_id = p.id
          ORDER BY qb.week_start DESC LIMIT 1) as last_boss_status,
         (SELECT qb.week_start::text FROM quest_boss_challenges qb
          WHERE qb.patient_id = p.id
          ORDER BY qb.week_start DESC LIMIT 1) as last_boss_week
       FROM patients p
       WHERE p.clinic_id = $1
         AND p.modality = 'quest'
         AND p.status = 'active'
         AND COALESCE(p.quest_monthly_xp, 0) >= $2
       ORDER BY p.quest_monthly_xp DESC`,
      [user.clinicId, REWARD_TIERS[0].xp] // minimum tier threshold
    );
  } catch (err) {
    console.error('[rewards page] query failed:', err);
  }

  const all = rows
    .map(r => ({ ...r, tier: getRewardTier(r.quest_monthly_xp) }))
    .filter(r => r.tier !== null);

  return (
    <div className="shell">
      <Topbar clinicName={user.clinicName} email={user.email} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28 }}>Rewards Due</h1>
          <p className="small muted" style={{ marginTop: 6 }}>
            Quest patients who hit a monthly XP threshold - fulfill the gift card, then mark complete.
          </p>
        </div>
        {all.length > 0 && (
          <span className="pill flagged" style={{ fontSize: 12, alignSelf: 'center' }}>
            {all.length} reward{all.length === 1 ? '' : 's'} pending
          </span>
        )}
      </div>

      {/* Tier legend */}
      <div className="section" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {REWARD_TIERS.map(t => (
            <div key={t.xp} style={{
              padding: '10px 16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              fontSize: 13,
            }}>
              <span style={{ fontWeight: 600 }}>{t.label} gift card</span>
              <span className="small muted" style={{ marginLeft: 8 }}>{t.xp} XP</span>
            </div>
          ))}
        </div>
        <p className="small muted" style={{ marginTop: 12 }}>
          Monthly XP resets after fulfillment. Total XP (leaderboard) is never reduced.
        </p>
      </div>

      {all.length === 0 ? (
        <div className="section">
          <div className="empty">
            <p>No rewards due this month. Check back after Monday boss challenges resolve.</p>
          </div>
        </div>
      ) : (
        <div className="section">
          <div className="section-head">
            <h2>Pending fulfillment</h2>
            <span className="small faint mono">{all.length} patients</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Monthly XP</th>
                <th>Reward</th>
                <th>Gift card type</th>
                <th>Level</th>
                <th>Last boss</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {all.map(r => (
                <tr key={r.id}>
                  <td className="name">
                    <Link href={`/patients/${r.id}`}>{r.first_name || '-'}</Link>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                      {r.quest_monthly_xp} XP
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: r.tier!.value >= 25 ? 'var(--good)' : r.tier!.value >= 10 ? 'var(--accent)' : 'var(--fg)',
                    }}>
                      {r.tier!.label}
                    </span>
                  </td>
                  <td className="small">
                    {REWARD_CATEGORY_LABELS[r.quest_reward_category ?? 'gamer'] ?? r.quest_reward_category}
                  </td>
                  <td className="small muted">
                    Lv {r.quest_level}
                  </td>
                  <td className="small muted">
                    {r.last_boss_status ? (
                      <span style={{
                        color: r.last_boss_status === 'completed' ? 'var(--good)'
                             : r.last_boss_status === 'failed'    ? 'var(--warn)'
                             : 'var(--fg-muted)',
                      }}>
                        {r.last_boss_status}
                        {r.last_boss_week ? ` (${r.last_boss_week})` : ''}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <form action={fulfillRewardAction}>
                      <input type="hidden" name="patientId" value={r.id} />
                      <input type="hidden" name="tier" value={r.tier!.label} />
                      <button
                        type="submit"
                        className="btn"
                        style={{ fontSize: 12, padding: '4px 12px' }}
                      >
                        Mark fulfilled
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>All Quest patients</h2>
        <QuestSummaryTable clinicId={user.clinicId} />
      </div>
    </div>
  );
}

async function QuestSummaryTable({ clinicId }: { clinicId: string }) {
  let patients: {
    id: string;
    first_name: string | null;
    quest_xp: number;
    quest_monthly_xp: number;
    quest_level: number;
    quest_streak: number;
    quest_reward_category: string | null;
  }[] = [];

  try {
    patients = await query(
      `SELECT id, first_name, COALESCE(quest_xp, 0) as quest_xp,
              COALESCE(quest_monthly_xp, 0) as quest_monthly_xp,
              COALESCE(quest_level, 1) as quest_level,
              COALESCE(quest_streak, 0) as quest_streak,
              COALESCE(quest_reward_category, 'gamer') as quest_reward_category
       FROM patients
       WHERE clinic_id = $1 AND modality = 'quest' AND status = 'active'
       ORDER BY quest_xp DESC`,
      [clinicId]
    );
  } catch { return null; }

  if (!patients.length) return null;

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Patient</th>
          <th>Total XP</th>
          <th>Monthly XP</th>
          <th>Level</th>
          <th>Streak</th>
          <th>Gift card pref</th>
        </tr>
      </thead>
      <tbody>
        {patients.map(p => {
          const tier = getRewardTier(p.quest_monthly_xp);
          const nextTier = REWARD_TIERS.find(t => t.xp > p.quest_monthly_xp);
          return (
            <tr key={p.id}>
              <td className="name">
                <Link href={`/patients/${p.id}`}>{p.first_name || '-'}</Link>
              </td>
              <td style={{ fontWeight: 600 }}>{p.quest_xp}</td>
              <td>
                {p.quest_monthly_xp}
                {tier && (
                  <span className="small" style={{ color: 'var(--good)', marginLeft: 6 }}>
                    {tier.label} earned
                  </span>
                )}
                {!tier && nextTier && (
                  <span className="small faint" style={{ marginLeft: 6 }}>
                    {nextTier.xp - p.quest_monthly_xp} to {nextTier.label}
                  </span>
                )}
              </td>
              <td className="small">Lv {p.quest_level}</td>
              <td className="small">{p.quest_streak}d</td>
              <td className="small muted">
                {REWARD_CATEGORY_LABELS[p.quest_reward_category ?? 'gamer']}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
