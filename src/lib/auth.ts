import { redirect } from 'next/navigation';
import { supabaseServer } from './supabase';
import { queryOne } from './db';

export type CurrentUser = {
  userId: string;
  email: string;
  clinicId: string;
  clinicName: string;
  clinicModality: string;
};

export async function requireUser(): Promise<CurrentUser> {
  const supa = supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect('/login');

  const row = await queryOne<{ clinic_id: string; clinic_name: string; email: string; clinic_modality: string }>(
    `select cu.clinic_id, c.name as clinic_name, cu.email, coalesce(c.modality, 'glp1') as clinic_modality
     from clinic_users cu
     join clinics c on c.id = cu.clinic_id
     where cu.user_id = $1`,
    [user.id]
  );

  if (!row) {
    // Authenticated but not provisioned to a clinic
    redirect('/login?error=no_clinic');
  }

  return {
    userId: user.id,
    email: row.email,
    clinicId: row.clinic_id,
    clinicName: row.clinic_name,
    clinicModality: row.clinic_modality,
  };
}
