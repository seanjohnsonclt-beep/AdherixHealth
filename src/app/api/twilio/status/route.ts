// Twilio POSTs here as messages move through queued → sent → delivered/failed.
// Validates signature and updates message status in DB.

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const params: Record<string, string> = {};
  form.forEach((val, key) => { params[key] = String(val); });

  const authToken = process.env.TWILIO_AUTH_TOKEN ?? '';
  if (authToken) {
    const signature = req.headers.get('x-twilio-signature') ?? '';
    const url = `${process.env.APP_URL}/api/twilio/status`;
    if (!twilio.validateRequest(authToken, signature, url, params)) {
      console.warn('[status] invalid Twilio signature — rejected');
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  const sid    = params['MessageSid'] ?? '';
  const status = params['MessageStatus'] ?? '';

  if (!sid || !status) return new NextResponse('ok');

  const ourStatus =
    status === 'delivered'                           ? 'delivered' :
    status === 'failed' || status === 'undelivered'  ? 'failed'    :
    null;

  if (ourStatus) {
    await query(
      `update messages set status = $1 where twilio_sid = $2`,
      [ourStatus, sid]
    );
    console.log(`[status] ${sid} → ${ourStatus}`);
  }

  return new NextResponse('ok');
}
