import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Adherix Health — Retention intelligence for GLP-1 programs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
            padding: '88px 96px 0 96px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              fontSize: 13,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#5B9B94',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            Adherix Health
          </div>

          {/* Headline line 1 */}
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 400,
              color: '#F4EFE6',
              lineHeight: 1.06,
              letterSpacing: '-0.025em',
            }}
          >
            Keep more patients.
          </div>

          {/* Headline line 2 — sage */}
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              fontWeight: 400,
              color: '#5B9B94',
              lineHeight: 1.06,
              letterSpacing: '-0.025em',
              marginBottom: 36,
            }}
          >
            Grow smarter.
          </div>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              width: 48,
              height: 2,
              background: 'rgba(91,155,148,0.4)',
              marginBottom: 32,
            }}
          />

          {/* Subhead */}
          <div
            style={{
              display: 'flex',
              fontSize: 22,
              color: 'rgba(244,239,230,0.5)',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 400,
              lineHeight: 1.55,
              maxWidth: 620,
            }}
          >
            Retention intelligence for GLP-1 treatment programs.
          </div>
        </div>

        {/* ── Sage accent bar ── */}
        <div style={{ display: 'flex', height: 6, background: '#3D7670' }} />
      </div>
    ),
    { ...size }
  );
}
