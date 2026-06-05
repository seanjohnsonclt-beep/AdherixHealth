import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function fetchAllMetrics() {
  const [queue, delivery, signalCounts] = await Promise.all([
    query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'sent' AND sent_at >= NOW() - INTERVAL '24 hours')::int AS sent_24h,
        COUNT(*) FILTER (WHERE status = 'failed' AND sent_at >= NOW() - INTERVAL '24 hours')::int AS failed_24h,
        COUNT(*) FILTER (WHERE status = 'pending' AND scheduled_for BETWEEN NOW() AND NOW() + INTERVAL '24 hours')::int AS scheduled_next_24h
      FROM messages
    `),
    query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'sent' AND direction = 'outbound' AND sent_at >= NOW() - INTERVAL '24 hours')::int AS sent,
        COUNT(*) FILTER (WHERE status = 'failed' AND direction = 'outbound' AND sent_at >= NOW() - INTERVAL '24 hours')::int AS failed,
        COUNT(*) FILTER (WHERE direction = 'inbound' AND created_at >= NOW() - INTERVAL '24 hours')::int AS inbound_replies,
        COUNT(*) FILTER (WHERE status = 'failed' AND direction = 'outbound' AND sent_at >= NOW() - INTERVAL '1 hour')::int AS failed_last_hour
      FROM messages
    `),
    query(`
      SELECT
        COUNT(*) FILTER (WHERE kind = 'phase_advanced' AND created_at >= NOW() - INTERVAL '24 hours')::int AS phase_advances_today,
        COUNT(*) FILTER (WHERE kind = 'patient_flagged' AND created_at >= NOW() - INTERVAL '2 hours')::int AS newly_flagged_2h,
        COUNT(*)::int AS events_today
      FROM events
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    `),
  ]);

  return {
    queue: queue[0],
    delivery: delivery[0],
    signals: signalCounts[0],
    ts: new Date().toISOString(),
  };
}

export async function GET(req: Request) {
  const secret = process.env.ADMIN_SECRET;
  const authHeader = req.headers.get('x-admin-secret');
  const url = new URL(req.url);
  const querySecret = url.searchParams.get('secret');

  if (!secret || (authHeader !== secret && querySecret !== secret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const metrics = await fetchAllMetrics();
    return NextResponse.json(metrics);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
