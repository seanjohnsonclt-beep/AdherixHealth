import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Free Cohort Audit - Adherix Health';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: '#1F2A2A', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'Georgia, serif', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '72px 96px 0 96px', flex: 1, justifyContent: 'center' }}>
          <div style={{ display: 'flex', background: 'rgba(91,155,148,0.15)', border: '1px solid rgba(91,155,148,0.4)', borderRadius: 4, padding: '5px 14px', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5B9B94', fontFamily: 'system-ui, sans-serif', fontWeight: 700, marginBottom: 32, width: 'fit-content' }}>
            Free - No signup required
          </div>
          <div style={{ display: 'flex', fontSize: 68, fontWeight: 400, color: '#F4EFE6', lineHeight: 1.06, letterSpacing: '-0.025em', marginBottom: 8 }}>
            Your free cohort audit
          </div>
          <div style={{ display: 'flex', fontSize: 68, fontWeight: 400, color: '#5B9B94', lineHeight: 1.06, letterSpacing: '-0.025em', marginBottom: 36 }}>
            is ready in 60 seconds.
          </div>
          <div style={{ display: 'flex', width: 48, height: 2, background: 'rgba(91,155,148,0.4)', marginBottom: 32 }} />
          <div style={{ display: 'flex', fontSize: 21, color: 'rgba(244,239,230,0.5)', fontFamily: 'system-ui, sans-serif', fontWeight: 400, lineHeight: 1.55, maxWidth: 620 }}>
            4 questions. See your 90-day retention rate, dropout curve, and annual revenue leakage.
          </div>
        </div>
        <div style={{ display: 'flex', height: 6, background: '#3D7670' }} />
      </div>
    ),
    { ...size }
  );
}
