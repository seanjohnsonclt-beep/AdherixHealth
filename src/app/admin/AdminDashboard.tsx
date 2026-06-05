'use client';

import { useState } from 'react';
import type {
  QueueStats,
  ClinicSnapshot,
  PhaseDistribution,
  RecentEvent,
  SignalCounts,
  InjectionStats,
  DriftStat,
  DeliveryStats,
  FailedMessage,
  RevenueRow,
  Alert,
} from './page';

// Serialized versions (Date -> string) for client transport
type SerializedRecentEvent = Omit<RecentEvent, 'created_at'> & { created_at: string };
type SerializedFailedMessage = Omit<FailedMessage, 'sent_at'> & { sent_at: string | null };
type SerializedRevenueRow = Omit<RevenueRow, 'created_at'> & { created_at: string };

type Props = {
  secret: string;
  queueStats: QueueStats;
  clinicSnapshots: ClinicSnapshot[];
  phaseDistribution: PhaseDistribution[];
  recentEvents: SerializedRecentEvent[];
  signalCounts: SignalCounts;
  injectionStats: InjectionStats;
  driftStats: DriftStat[];
  deliveryStats: DeliveryStats;
  failedMessages: SerializedFailedMessage[];
  revenueRows: SerializedRevenueRow[];
  alerts: Alert[];
  dryRun: boolean;
};

const PHASE_NAMES: Record<number, string> = {
  0: 'Initiation',
  1: 'Onboarding',
  2: 'Activation',
  3: 'Momentum',
  4: 'Plateau',
  5: 'Maintenance',
};

const INFRA_LINKS = [
  { label: 'Vercel', url: 'https://vercel.com/seanjohnsonclt-beep/adherix-health', icon: '▲' },
  { label: 'Supabase', url: 'https://supabase.com/dashboard/project/intpbbojlfspnohulgps', icon: '⚡' },
  { label: 'cron-job.org', url: 'https://cron-job.org', icon: '⏱' },
  { label: 'Twilio', url: 'https://console.twilio.com', icon: '📱' },
  { label: 'Resend', url: 'https://resend.com/emails', icon: '✉' },
  { label: 'GitHub', url: 'https://github.com/seanjohnsonclt-beep/AdherixHealth', icon: '⌥' },
  { label: 'Live site', url: 'https://adherixhealth.com', icon: '🌐' },
  { label: 'Manual tick', url: 'https://adherixhealth.com/api/cron/tick', icon: '⚙' },
];

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtDateTime(iso: string): string {
  return `${fmtDate(iso)} ${fmtTime(iso)}`;
}

function Kpi({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: '#162020',
      border: '1px solid #2a3838',
      borderRadius: 8,
      padding: '16px 20px',
    }}>
      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#6B7878', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, color: '#F4EFE6', fontWeight: 400, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 12, color: '#6B7878', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Badge({ severity }: { severity: 'critical' | 'warning' }) {
  return (
    <span style={{
      fontFamily: "'Geist Mono', monospace",
      fontSize: 10,
      fontWeight: 500,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      padding: '2px 7px',
      borderRadius: 4,
      background: severity === 'critical' ? 'rgba(220,80,80,0.18)' : 'rgba(232,201,137,0.18)',
      color: severity === 'critical' ? '#e05555' : '#E8C989',
    }}>{severity}</span>
  );
}

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 8, height: 8,
      borderRadius: '50%',
      background: ok ? '#5B9B94' : '#E8C989',
      marginRight: 8,
      flexShrink: 0,
    }} />
  );
}

const TABS = ['Engine', 'Cohorts', 'Signals', 'Drift', 'Delivery', 'Alerts', 'Revenue', 'Infra'] as const;
type Tab = typeof TABS[number];

export function AdminDashboard({
  secret,
  queueStats,
  clinicSnapshots,
  phaseDistribution,
  recentEvents,
  signalCounts,
  injectionStats,
  driftStats,
  deliveryStats,
  failedMessages,
  revenueRows,
  alerts,
  dryRun,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Engine');

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1F2A2A',
      fontFamily: "'Geist', sans-serif",
      color: '#F4EFE6',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #2a3838',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#162020',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, color: '#5B9B94' }}>Adherix</span>
          <span style={{ color: '#2a3838', fontSize: 18 }}>|</span>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: '#6B7878', letterSpacing: '0.08em' }}>OPERATOR OPS</span>
          {dryRun && (
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, background: 'rgba(232,201,137,0.18)', color: '#E8C989', padding: '2px 8px', borderRadius: 4, letterSpacing: '0.06em' }}>
              DRY RUN
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {criticalCount > 0 && (
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#e05555', background: 'rgba(220,80,80,0.12)', padding: '3px 10px', borderRadius: 4 }}>
              {criticalCount} critical
            </span>
          )}
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#6B7878' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #2a3838', padding: '0 32px', display: 'flex', gap: 0 }}>
        {TABS.map(tab => {
          const isActive = tab === activeTab;
          const hasAlert = tab === 'Alerts' && alerts.length > 0;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid #5B9B94' : '2px solid transparent',
                padding: '12px 16px',
                cursor: 'pointer',
                fontFamily: "'Geist', sans-serif",
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#B8D4CF' : '#6B7878',
                position: 'relative',
                marginBottom: -1,
              }}
            >
              {tab}
              {hasAlert && (
                <span style={{
                  display: 'inline-block',
                  width: 6, height: 6,
                  borderRadius: '50%',
                  background: criticalCount > 0 ? '#e05555' : '#E8C989',
                  position: 'absolute',
                  top: 8, right: 6,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ padding: '28px 32px', maxWidth: 1200 }}>

        {/* ── Engine ── */}
        {activeTab === 'Engine' && (
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6, color: '#F4EFE6' }}>Engine health</h2>
            <p style={{ color: '#6B7878', fontSize: 13, marginBottom: 24 }}>Message queue stats - live on page load. Cron ticks every 60s via cron-job.org.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
              <Kpi label="Pending" value={queueStats.pending} sub="in queue now" />
              <Kpi label="Sent 24h" value={queueStats.sent_24h} sub="outbound messages" />
              <Kpi label="Failed 24h" value={queueStats.failed_24h} sub={queueStats.failed_24h > 0 ? 'check Delivery tab' : 'all clear'} />
              <Kpi label="Scheduled next 24h" value={queueStats.scheduled_next_24h} sub="pending in window" />
            </div>
            <div style={{ background: '#162020', border: '1px solid #2a3838', borderRadius: 8, padding: '20px 24px' }}>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#6B7878', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Cron</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ fontSize: 13, color: '#B8D4CF' }}>
                  <span style={{ color: '#6B7878', marginRight: 8 }}>Endpoint</span>
                  <a href="https://adherixhealth.com/api/cron/tick" target="_blank" rel="noopener" style={{ color: '#5B9B94', fontFamily: "'Geist Mono', monospace", fontSize: 12 }}>
                    adherixhealth.com/api/cron/tick
                  </a>
                </div>
                <div style={{ fontSize: 13, color: '#B8D4CF' }}>
                  <span style={{ color: '#6B7878', marginRight: 8 }}>Auth</span>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 12, color: process.env.CRON_SECRET ? '#5B9B94' : '#E8C989' }}>
                    {process.env.CRON_SECRET ? 'secured' : 'open (no CRON_SECRET)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Cohorts ── */}
        {activeTab === 'Cohorts' && (
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6, color: '#F4EFE6' }}>Cohort overview</h2>
            <p style={{ color: '#6B7878', fontSize: 13, marginBottom: 24 }}>Per-clinic snapshot. Retention = active patients who replied in last 14 days.</p>

            {/* Phase distribution totals */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {phaseDistribution.map(pd => (
                <div key={pd.phase} style={{ background: '#162020', border: '1px solid #2a3838', borderRadius: 6, padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: '#6B7878', letterSpacing: '0.08em', marginBottom: 4 }}>PH{pd.phase}</div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: '#5B9B94' }}>{pd.count}</div>
                  <div style={{ fontSize: 10, color: '#6B7878', marginTop: 2 }}>{PHASE_NAMES[pd.phase]}</div>
                </div>
              ))}
              {phaseDistribution.length === 0 && (
                <div style={{ color: '#6B7878', fontSize: 13 }}>No active patients.</div>
              )}
            </div>

            {/* Clinic table */}
            <div style={{ background: '#162020', border: '1px solid #2a3838', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a3838' }}>
                    {['Clinic', 'Active', 'Flagged', 'Paused', 'Retention', 'Ph0', 'Ph1', 'Ph2', 'Ph3', 'Ph4', 'Ph5'].map(h => (
                      <th key={h} style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: '#6B7878', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: h === 'Clinic' ? 'left' : 'center', padding: '10px 12px', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clinicSnapshots.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i < clinicSnapshots.length - 1 ? '1px solid #1d2d2d' : 'none' }}>
                      <td style={{ padding: '10px 12px', color: '#F4EFE6', fontWeight: 500 }}>{c.name}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#5B9B94' }}>{c.active_patients}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: c.flagged_patients > 0 ? '#e05555' : '#6B7878' }}>{c.flagged_patients}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#6B7878' }}>{c.paused_patients}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: c.retention_pct !== null && c.retention_pct < 80 ? '#E8C989' : '#B8D4CF', fontFamily: "'Geist Mono', monospace" }}>
                        {c.retention_pct !== null ? `${c.retention_pct}%` : '-'}
                      </td>
                      {[c.phase_0, c.phase_1, c.phase_2, c.phase_3, c.phase_4, c.phase_5].map((n, pi) => (
                        <td key={pi} style={{ padding: '10px 12px', textAlign: 'center', color: n > 0 ? '#B8D4CF' : '#2a3838', fontFamily: "'Geist Mono', monospace", fontSize: 12 }}>{n}</td>
                      ))}
                    </tr>
                  ))}
                  {clinicSnapshots.length === 0 && (
                    <tr><td colSpan={11} style={{ padding: 20, color: '#6B7878', textAlign: 'center' }}>No clinics yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Signals ── */}
        {activeTab === 'Signals' && (
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6, color: '#F4EFE6' }}>Live signals</h2>
            <p style={{ color: '#6B7878', fontSize: 13, marginBottom: 24 }}>Behavioral events across all clinics. Last 50 events shown.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
              <Kpi label="Events today" value={signalCounts.events_today} />
              <Kpi label="Phase advances today" value={signalCounts.phase_advances_today} />
              <Kpi label="Newly flagged (2h)" value={signalCounts.newly_flagged_2h} sub={signalCounts.newly_flagged_2h > 0 ? 'needs attention' : 'all clear'} />
              <Kpi label="Injections confirmed today" value={injectionStats.confirmed_today} sub={`${injectionStats.no_response_today} pending`} />
            </div>

            <div style={{ background: '#162020', border: '1px solid #2a3838', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a3838' }}>
                    {['Time', 'Event', 'Patient', 'Clinic'].map(h => (
                      <th key={h} style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: '#6B7878', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'left', padding: '10px 12px', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((e, i) => (
                    <tr key={i} style={{ borderBottom: i < recentEvents.length - 1 ? '1px solid #1d2d2d' : 'none' }}>
                      <td style={{ padding: '8px 12px', fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#6B7878', whiteSpace: 'nowrap' }}>{fmtDateTime(e.created_at)}</td>
                      <td style={{ padding: '8px 12px', color: '#B8D4CF', fontFamily: "'Geist Mono', monospace", fontSize: 12 }}>{e.kind}</td>
                      <td style={{ padding: '8px 12px', color: '#F4EFE6' }}>{e.first_name ?? 'Unknown'}</td>
                      <td style={{ padding: '8px 12px', color: '#6B7878' }}>{e.clinic_name}</td>
                    </tr>
                  ))}
                  {recentEvents.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 20, color: '#6B7878', textAlign: 'center' }}>No events yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Drift ── */}
        {activeTab === 'Drift' && (
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6, color: '#F4EFE6' }}>Drift correction</h2>
            <p style={{ color: '#6B7878', fontSize: 13, marginBottom: 24 }}>Drift correction events in last 24h. Requires migration 0006 to be applied.</p>

            {driftStats.length === 0 ? (
              <div style={{ background: '#162020', border: '1px solid #2a3838', borderRadius: 8, padding: '32px 24px', color: '#6B7878', textAlign: 'center', fontSize: 13 }}>
                No drift corrections fired in last 24h - or migration 0006 not yet applied.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {driftStats.map(ds => (
                  <div key={ds.drift_pattern} style={{ background: '#162020', border: '1px solid #2a3838', borderRadius: 8, padding: '16px 20px' }}>
                    <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#5B9B94', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{ds.drift_pattern}</div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: '#F4EFE6' }}>{ds.total}</div>
                        <div style={{ fontSize: 11, color: '#6B7878' }}>total</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: '#5B9B94' }}>{ds.resolved}</div>
                        <div style={{ fontSize: 11, color: '#6B7878' }}>resolved</div>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: '#E8C989' }}>{ds.escalated}</div>
                        <div style={{ fontSize: 11, color: '#6B7878' }}>escalated</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 10, background: '#1F2A2A', borderRadius: 4, height: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#5B9B94', width: `${ds.total > 0 ? Math.round((ds.resolved / ds.total) * 100) : 0}%`, transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#6B7878', marginTop: 4 }}>
                      {ds.total > 0 ? `${Math.round((ds.resolved / ds.total) * 100)}% resolution rate` : '-'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Delivery ── */}
        {activeTab === 'Delivery' && (
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6, color: '#F4EFE6' }}>Delivery health</h2>
            <p style={{ color: '#6B7878', fontSize: 13, marginBottom: 24 }}>SMS delivery stats for last 24h. Failed message details below.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
              <Kpi label="Sent (24h)" value={deliveryStats.sent} sub="outbound delivered" />
              <Kpi label="Failed (24h)" value={deliveryStats.failed} sub={deliveryStats.failed > 0 ? 'check errors below' : 'all clear'} />
              <Kpi label="Inbound replies (24h)" value={deliveryStats.inbound_replies} sub="patient responses" />
            </div>

            <div style={{ background: '#162020', border: '1px solid #2a3838', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #2a3838', fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#6B7878', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Failed messages - last 24h
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a3838' }}>
                    {['Time', 'Phone', 'Clinic', 'Error'].map(h => (
                      <th key={h} style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: '#6B7878', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'left', padding: '10px 12px', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {failedMessages.map((m, i) => (
                    <tr key={i} style={{ borderBottom: i < failedMessages.length - 1 ? '1px solid #1d2d2d' : 'none' }}>
                      <td style={{ padding: '8px 12px', fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#6B7878', whiteSpace: 'nowrap' }}>{m.sent_at ? fmtDateTime(m.sent_at) : '-'}</td>
                      <td style={{ padding: '8px 12px', fontFamily: "'Geist Mono', monospace", fontSize: 12, color: '#B8D4CF' }}>{m.phone}</td>
                      <td style={{ padding: '8px 12px', color: '#6B7878' }}>{m.clinic_name}</td>
                      <td style={{ padding: '8px 12px', color: '#e05555', fontSize: 12, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.error ?? 'Unknown error'}</td>
                    </tr>
                  ))}
                  {failedMessages.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 20, color: '#6B7878', textAlign: 'center' }}>No failures in last 24h.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Alerts ── */}
        {activeTab === 'Alerts' && (
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6, color: '#F4EFE6' }}>Alerts</h2>
            <p style={{ color: '#6B7878', fontSize: 13, marginBottom: 24 }}>System-computed. These need your attention today.</p>

            {alerts.length === 0 ? (
              <div style={{ background: '#162020', border: '1px solid #2a3838', borderRadius: 8, padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: '#5B9B94', marginBottom: 8 }}>All clear</div>
                <div style={{ color: '#6B7878', fontSize: 13 }}>No alerts to surface right now.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {alerts.map((a, i) => (
                  <div key={i} style={{
                    background: '#162020',
                    border: `1px solid ${a.severity === 'critical' ? 'rgba(220,80,80,0.3)' : 'rgba(232,201,137,0.3)'}`,
                    borderRadius: 8,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                  }}>
                    <div style={{ paddingTop: 2, flexShrink: 0 }}>
                      <Badge severity={a.severity} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#F4EFE6', marginBottom: 4 }}>{a.title}</div>
                      <div style={{ fontSize: 13, color: '#6B7878' }}>{a.detail}</div>
                    </div>
                    {a.link && (
                      <a href={a.link} target="_blank" rel="noopener" style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#5B9B94', flexShrink: 0, textDecoration: 'none', paddingTop: 2 }}>
                        Open →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Revenue ── */}
        {activeTab === 'Revenue' && (
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6, color: '#F4EFE6' }}>Revenue & pipeline</h2>
            <p style={{ color: '#6B7878', fontSize: 13, marginBottom: 8 }}>Per-clinic summary. MRR column is a placeholder - wire to Stripe/billing when ready.</p>
            <div style={{ fontSize: 12, color: '#3D7670', background: 'rgba(61,118,112,0.12)', border: '1px solid rgba(61,118,112,0.25)', borderRadius: 6, padding: '8px 14px', marginBottom: 24, fontFamily: "'Geist Mono', monospace" }}>
              TODO: Add billing_status / mrr columns to clinics table via migration when Stripe is wired.
            </div>

            <div style={{ background: '#162020', border: '1px solid #2a3838', borderRadius: 8, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2a3838' }}>
                    {['Clinic', 'Plan', 'Active Patients', 'Est. MRR', 'Since'].map(h => (
                      <th key={h} style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: '#6B7878', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: h === 'Clinic' ? 'left' : 'center', padding: '10px 12px', fontWeight: 400 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {revenueRows.map((r, i) => {
                    // TODO: replace with real billing data from DB
                    const estMrr = r.active_patients * 50; // placeholder: $50/patient/mo
                    return (
                      <tr key={r.id} style={{ borderBottom: i < revenueRows.length - 1 ? '1px solid #1d2d2d' : 'none' }}>
                        <td style={{ padding: '10px 12px', color: '#F4EFE6', fontWeight: 500 }}>{r.name}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontFamily: "'Geist Mono', monospace", fontSize: 12, color: '#B8D4CF' }}>{r.plan}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#5B9B94', fontFamily: "'Geist Mono', monospace" }}>{r.active_patients}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#E8C989', fontFamily: "'Geist Mono', monospace', fontSize: 12" }}>
                          ${estMrr.toLocaleString()}<span style={{ fontSize: 10, color: '#6B7878', marginLeft: 4 }}>est*</span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#6B7878', fontFamily: "'Geist Mono', monospace", fontSize: 12 }}>{fmtDate(r.created_at)}</td>
                      </tr>
                    );
                  })}
                  {revenueRows.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 20, color: '#6B7878', textAlign: 'center' }}>No clinics yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 10, fontSize: 11, color: '#6B7878', fontFamily: "'Geist Mono', monospace" }}>* Estimated at $50/active patient/month placeholder. Not from real billing data.</div>
          </div>
        )}

        {/* ── Infra ── */}
        {activeTab === 'Infra' && (
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6, color: '#F4EFE6' }}>Infrastructure</h2>
            <p style={{ color: '#6B7878', fontSize: 13, marginBottom: 24 }}>Quick links to all services. Status derived from 24h delivery data.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {INFRA_LINKS.map(link => {
                // Derive status from known signals
                let statusOk = true;
                let statusNote = 'operational';
                if (link.label === 'Twilio') {
                  statusOk = deliveryStats.failed === 0;
                  statusNote = deliveryStats.failed > 0 ? `${deliveryStats.failed} failures today` : 'operational';
                }
                return (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: '#162020',
                      border: '1px solid #2a3838',
                      borderRadius: 8,
                      padding: '14px 18px',
                      textDecoration: 'none',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{link.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: '#F4EFE6', fontWeight: 500 }}>{link.label}</div>
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                        <StatusDot ok={statusOk} />
                        <span style={{ fontSize: 11, color: '#6B7878', fontFamily: "'Geist Mono', monospace" }}>{statusNote}</span>
                      </div>
                    </div>
                    <span style={{ color: '#2a3838', fontSize: 16 }}>→</span>
                  </a>
                );
              })}
            </div>

            {/* Env summary */}
            <div style={{ marginTop: 24, background: '#162020', border: '1px solid #2a3838', borderRadius: 8, padding: '20px 24px' }}>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, color: '#6B7878', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Env checks</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                {[
                  { key: 'DATABASE_URL', set: !!process.env.DATABASE_URL },
                  { key: 'TWILIO_ACCOUNT_SID', set: !!process.env.TWILIO_ACCOUNT_SID },
                  { key: 'RESEND_API_KEY', set: !!process.env.RESEND_API_KEY },
                  { key: 'CRON_SECRET', set: !!process.env.CRON_SECRET },
                  { key: 'DRY_RUN', set: process.env.DRY_RUN === 'true', warn: process.env.DRY_RUN === 'true' },
                  { key: 'SUPABASE_SERVICE_ROLE_KEY', set: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusDot ok={item.warn ? false : item.set} />
                    <span style={{ fontFamily: "'Geist Mono', monospace", color: '#6B7878' }}>{item.key}</span>
                    <span style={{ marginLeft: 'auto', color: item.warn ? '#E8C989' : item.set ? '#5B9B94' : '#e05555', fontFamily: "'Geist Mono', monospace" }}>
                      {item.warn ? 'WARN' : item.set ? 'set' : 'missing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
