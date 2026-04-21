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

export async function signOutAction() {
  const supa = supabaseServer();
  await supa.auth.signOut();
  redirect('/');
}
