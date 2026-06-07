import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const RESOURCES: Record<string, string> = {
  checklist: '/adherix-bridge-checklist.pdf',
  workflow:  '/adherix-bridge-workflow.pdf',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, clinic_name, email, resource_key } = body;

    if (!name || !email || !resource_key) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fileUrl = RESOURCES[resource_key];
    if (!fileUrl) {
      return NextResponse.json({ error: 'Unknown resource' }, { status: 400 });
    }

    // Best-effort DB write - don't block the download if it fails
    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
        ?? req.headers.get('x-real-ip')
        ?? null;
      const ua = req.headers.get('user-agent') ?? null;

      await db().query(
        `insert into resource_downloads (name, clinic_name, email, resource_key, ip_address, user_agent)
         values ($1, $2, $3, $4, $5, $6)`,
        [name, clinic_name || null, email, resource_key, ip, ua]
      );
    } catch (dbErr) {
      console.error('[download-resource] db write failed:', dbErr);
    }

    return NextResponse.json({ url: fileUrl });
  } catch (err) {
    console.error('[download-resource] error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
