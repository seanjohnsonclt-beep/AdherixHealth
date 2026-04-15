// Vercel Cron hits this every minute. Configure in vercel.json:
//   { "crons": [{ "path": "/api/cron/tick", "schedule": "* * * * *" }] }
//
// Protected by CRON_SECRET header so it can't be triggered by random traffic.

import { NextRequest, NextResponse } from 'next/server';
import { tick } from '@/workers/tick';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('unauthorized', { status: 401 });
  }

  await tick();
  return NextResponse.json({ ok: true });
}
