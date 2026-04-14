import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (code) {
    const supa = supabaseServer();
    await supa.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/', req.url));
}
