export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// External cron (cron-job.org) hits this every 60s.
// Auth intentionally removed per BIBLE.md §13 (Apr 19, 2026).
// Endpoint accepts any request and returns 200.

import { NextResponse } from 'next/server';
import { tick } from '@/workers/tick';

export async function GET() {
  await tick();
  return NextResponse.json({ ok: true });
}
