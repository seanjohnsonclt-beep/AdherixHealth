export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// External cron (cron-job.org) hits this every 60s.
//
// Auth: if CRON_SECRET env var is set, require:
//   Authorization: Bearer <CRON_SECRET>
// If CRON_SECRET is not set, the endpoint is open (backwards-compatible).
//
// To activate auth:
//   1. Add CRON_SECRET=<random-string> to Vercel env vars
//   2. In cron-job.org → job settings → add header:
//      Authorization: Bearer <same-random-string>

import { NextRequest, NextResponse } from 'next/server';
import { tick } from '@/workers/tick';

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization') ?? '';
    if (auth !== `Bearer ${secret}`) {
      console.warn('[cron/tick] unauthorized request  -  wrong or missing CRON_SECRET');
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
  }

  await tick();
  return NextResponse.json({ ok: true });
}
