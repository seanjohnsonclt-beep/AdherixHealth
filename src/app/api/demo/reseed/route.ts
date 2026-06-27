// Demo reseed endpoint. Wipes and regenerates realistic patients for a clinic.
//
// Usage:
//   POST /api/demo/reseed                  -> reseeds GLP-1 demo (15 patients)
//   POST /api/demo/reseed?modality=quest   -> reseeds Quest demo (5 teens)
//   POST /api/demo/reseed?clinic_id=X      -> reseeds a specific clinic (auth still required)
//
// Gated behind auth so random visitors can't trigger it on prod.
// NOTE: In demo phase there are no real patients to protect  -  this is fine.

import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { reseedDemo, reseedQuestDemo } from '@/engine/demoSeed';

export async function POST(req: NextRequest) {
  const user = await requireUser();

  const url = new URL(req.url);
  const clinicId = url.searchParams.get('clinic_id') ?? user.clinicId;
  const modality = url.searchParams.get('modality') ?? 'glp1';
  const countParam = url.searchParams.get('count');
  const targetCount = countParam ? parseInt(countParam, 10) : undefined;

  try {
    const result = modality === 'quest'
      ? await reseedQuestDemo({ clinicId })
      : await reseedDemo({ clinicId, targetCount });
    return NextResponse.json({ ok: true, modality, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'seed failed';
    console.error('[demo/reseed]', msg, err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// Also allow GET for convenience (one-click from browser while logged in)
export async function GET(req: NextRequest) {
  return POST(req);
}
