import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Adherix Bridge - Bariatric Surgery Adherence and Rebound Prevention';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: '#1F2A2A', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'Georgia, serif', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '72px 96px 0 96px', flex: 1, justifyContent: 'center' }}>
          <div style={{ display: 'flex', fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5B9B94', fontFamily: 'system-ui, sans-serif', fontWeight: 600, marginBottom: 28 }}>
            Adherix Bridge
          </div>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 400, color: '#F4EFE6', lineHeight: 1.06, letterSpacing: '-0.025em', marginBottom: 8 }}>
            40% of bariatric patients
          </div>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 400, color: '#5B9B94', lineHeight: 1.06, letterSpacing: '-0.025em', marginBottom: 36 }}>
            regain within 5 years.
          </div>
          <div style={{ display: 'flex', width: 48, height: 2, background: 'rgba(91,155,148,0.4)', marginBottom: 32 }} />
          <div style={{ display: 'flex', fontSize: 21, color: 'rgba(244,239,230,0.5)', fontFamily: 'system-ui, sans-serif', fontWeight: 400, lineHeight: 1.55, maxWidth: 620 }}>
            Phase-based SMS adherence built for the full bariatric journey - from pre-op to long-term maintenance.
          </div>
        </div>
        <div style={{ display: 'flex', height: 6, background: '#3D7670' }} />
      </div>
    ),
    { ...size }
  );
}
