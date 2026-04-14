'use server';

import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';

export async function sendMagicLinkAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  if (!email) redirect('/login?error=missing_email');

  const supa = supabaseServer();
  const { error } = await supa.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.APP_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error('[auth] magic link failed:', error.message);
    redirect('/login?error=send_failed');
  }

  redirect('/login?sent=1');
}

export async function signOutAction() {
  const supa = supabaseServer();
  await supa.auth.signOut();
  redirect('/login');
}
