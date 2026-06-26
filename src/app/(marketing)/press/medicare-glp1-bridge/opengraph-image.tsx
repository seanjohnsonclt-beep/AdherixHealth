import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Press Release: Adherix Health Releases Free Medicare GLP-1 Bridge Preparation Resources';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: '#1F2A2A', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'Georgia, serif', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '72px 96px 0 96px', flex: 1, justifyContent: 'center' }}>

          {/* Badge row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ display: 'flex', background: 'rgba(91,155,148,0.15)', border: '1px solid rgba(91,155,148,0.4)', borderRadius: 4, padding: '5px 14px', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5B9B94', fontFamily: 'system-ui, sans-serif', fontWeight: 700 }}>
              Press Release
            </div>
            <div style={{ display: 'flex', fontSize: 13, color: 'rgba(244,239,230,0.35)', fontFamily: 'system-ui, sans-serif', fontWeight: 400, letterSpacing: '0.04em' }}>
              June 9, 2026
            </div>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', fontSize: 62, fontWeight: 400, color: '#F4EFE6', lineHeight: 1.06, letterSpacing: '-0.02em', marginBottom: 8 }}>
            Medicare GLP-1 Bridge:
          </div>
          <div style={{ display: 'flex', fontSize: 62, fontWeight: 400, color: '#5B9B94', lineHeight: 1.06, letterSpacing: '-0.02em', marginBottom: 36 }}>
            Free clinic resources released.
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', width: 48, height: 2, background: 'rgba(91,155,148,0.4)', marginBottom: 32 }} />

          {/* Stat strip */}
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', fontSize: 28, fontWeight: 400, color: '#F4EFE6' }}>$50/mo</div>
              <div style={{ display: 'flex', fontSize: 12, color: 'rgba(244,239,230,0.4)', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Medicare copay</div>
            </div>
            <div style={{ display: 'flex', width: 1, height: 40, background: 'rgba(244,239,230,0.1)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', fontSize: 28, fontWeight: 400, color: '#F4EFE6' }}>July 1, 2026</div>
              <div style={{ display: 'flex', fontSize: 12, color: 'rgba(244,239,230,0.4)', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Program launch</div>
            </div>
            <div style={{ display: 'flex', width: 1, height: 40, background: 'rgba(244,239,230,0.1)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', fontSize: 28, fontWeight: 400, color: '#F4EFE6' }}>Free</div>
              <div style={{ display: 'flex', fontSize: 12, color: 'rgba(244,239,230,0.4)', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Readiness tools</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 96px 28px 96px' }}>
          <div style={{ display: 'flex', fontSize: 13, color: 'rgba(244,239,230,0.3)', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.06em' }}>adherixhealth.com</div>
          <div style={{ display: 'flex', fontSize: 13, color: 'rgba(244,239,230,0.3)', fontFamily: 'system-ui, sans-serif' }}>Adherix Health</div>
        </div>
        <div style={{ display: 'flex', height: 6, background: '#3D7670' }} />
      </div>
    ),
    { ...size }
  );
}
