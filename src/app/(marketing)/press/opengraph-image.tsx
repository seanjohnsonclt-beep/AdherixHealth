import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Adherix Health - Press & Media';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: '#1F2A2A', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'Georgia, serif', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '88px 96px 0 96px', flex: 1, justifyContent: 'center' }}>
          <div style={{ display: 'flex', fontSize: 13, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5B9B94', fontFamily: 'system-ui, sans-serif', fontWeight: 600, marginBottom: 28 }}>
            Adherix Health
          </div>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 400, color: '#F4EFE6', lineHeight: 1.06, letterSpacing: '-0.025em' }}>
            Press &amp; media.
          </div>
          <div style={{ display: 'flex', width: 48, height: 2, background: 'rgba(91,155,148,0.4)', margin: '32px 0' }} />
          <div style={{ display: 'flex', fontSize: 22, color: 'rgba(244,239,230,0.5)', fontFamily: 'system-ui, sans-serif', fontWeight: 400, lineHeight: 1.55, maxWidth: 640 }}>
            Press releases, brand assets, and media contact for Adherix Health.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 96px 28px 96px' }}>
          <div style={{ display: 'flex', fontSize: 13, color: 'rgba(244,239,230,0.3)', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.06em' }}>press@adherixhealth.com</div>
        </div>
        <div style={{ display: 'flex', height: 6, background: '#3D7670' }} />
      </div>
    ),
    { ...size }
  );
}
