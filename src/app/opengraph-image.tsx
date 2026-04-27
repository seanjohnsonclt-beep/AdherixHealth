import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Adherix Health — Retention intelligence for GLP-1 programs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Dynamic OG image — Satori-safe (no .map, no position:absolute, no <br />).
 * Served at /opengraph-image and wired into layout.tsx metadata.
 */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#1F2A2A',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'Georgia, serif',
          overflow: 'hidden',
        }}
      >
        {/* ── Main content ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '72px 80px 0 80px',
            flex: 1,
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              fontSize: 13,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#5B9B94',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            Adherix Health
          </div>

          {/* Headline line 1 */}
          <div
            style={{
              display: 'flex',
              fontSize: 68,
              fontWeight: 400,
              color: '#F4EFE6',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
            }}
          >
            Keep more patients.
          </div>

          {/* Headline line 2 — sage */}
          <div
            style={{
              display: 'flex',
              fontSize: 68,
              fontWeight: 400,
              color: '#5B9B94',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              marginBottom: 24,
            }}
          >
            Grow smarter.
          </div>

          {/* Subhead */}
          <div
            style={{
              display: 'flex',
              fontSize: 21,
              color: 'rgba(244,239,230,0.5)',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 400,
              lineHeight: 1.5,
              maxWidth: 660,
            }}
          >
            Behavior-driven SMS adherence for GLP-1 clinics. Phase-based. Trigger-based. Pilot-ready.
          </div>
        </div>

        {/* ── Bottom: stats + accent bar ── */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Stats row */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              padding: '0 80px 48px 80px',
            }}
          >
            {/* Stat 1 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 8,
                padding: '18px 28px',
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', fontSize: 34, fontWeight: 400, color: '#F4EFE6', letterSpacing: '-0.02em', lineHeight: 1 }}>
                18%
              </div>
              <div style={{ display: 'flex', fontSize: 13, color: 'rgba(244,239,230,0.4)', fontFamily: 'system-ui, sans-serif' }}>
                fewer early drop-offs
              </div>
            </div>

            {/* Stat 2 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 8,
                padding: '18px 28px',
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', fontSize: 34, fontWeight: 400, color: '#F4EFE6', letterSpacing: '-0.02em', lineHeight: 1 }}>
                $714
              </div>
              <div style={{ display: 'flex', fontSize: 13, color: 'rgba(244,239,230,0.4)', fontFamily: 'system-ui, sans-serif' }}>
                protected revenue / patient
              </div>
            </div>

            {/* Stat 3 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 8,
                padding: '18px 28px',
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', fontSize: 34, fontWeight: 400, color: '#F4EFE6', letterSpacing: '-0.02em', lineHeight: 1 }}>
                8 hrs/wk
              </div>
              <div style={{ display: 'flex', fontSize: 13, color: 'rgba(244,239,230,0.4)', fontFamily: 'system-ui, sans-serif' }}>
                staff time recovered
              </div>
            </div>
          </div>

          {/* Sage accent bar */}
          <div style={{ display: 'flex', height: 6, background: '#3D7670' }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
