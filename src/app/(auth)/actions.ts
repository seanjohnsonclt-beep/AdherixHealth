'use server';

import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase';

export async function signInWithPasswordAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!email || !password) redirect('/login?error=missing_fields');

  const supa = supabaseServer();
  const { error } = await supa.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('[auth] sign in failed:', error.message);
    redirect('/login?error=invalid_credentials');
  }

  redirect('/dashboard');
}

export async function sendMagicLinkAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();

  if (!email) redirect('/login?error=missing_email');

  const supa = supabaseServer();
  const appUrl = process.env.APP_URL ?? 'https://adherix-health.vercel.app';

  const { error } = await supa.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    console.error('[auth] magic link failed:', error.message);
    redirect('/login?error=magic_link_failed');
  }

  // Success  -  tell the user to check their inbox
  redirect('/login?magic=sent&email=' + encodeURIComponent(email));
}

export async function signOutAction() {
  const supa = supabaseServer();
  await supa.auth.signOut();
  redirect('/');
}
