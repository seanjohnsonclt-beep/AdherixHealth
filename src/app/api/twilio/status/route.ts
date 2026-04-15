// Twilio POSTs here as messages move through queued -> sent -> delivered/failed.

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const sid = String(form.get('MessageSid') || '');
  const status = String(form.get('MessageStatus') || '');

  if (!sid || !status) return new NextResponse('ok');

  // Map Twilio statuses to ours. 'delivered' and 'failed' are terminal.
  const ourStatus =
    status === 'delivered' ? 'delivered' :
    status === 'failed' || status === 'undelivered' ? 'failed' :
    null;

  if (ourStatus) {
    await query(
      `update messages set status = $1 where twilio_sid = $2`,
      [ourStatus, sid]
    );
  }

  return new NextResponse('ok');
}
