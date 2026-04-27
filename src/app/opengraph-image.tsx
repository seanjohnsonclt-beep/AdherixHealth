import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Adherix Health — Retention intelligence for GLP-1 programs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Dynamic OG image — rendered by Next.js at /opengraph-image
 * Automatically used by the root layout metadata.
 *
 * Design: dark Ink background, Adherix wordmark, tagline, three KPI pills,
 * and a sage accent bar across the bottom.
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
          padding: '72px 80px 0 80px',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Top: logo + eyebrow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              fontSize: 13,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#5B9B94',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 600,
            }}
          >
            Adherix Health
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 68,
              fontWeight: 400,
              color: '#F4EFE6',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              maxWidth: 820,
            }}
          >
            Keep more patients.
            <br />
            <span style={{ color: '#5B9B94' }}>Grow smarter.</span>
          </div>

          {/* Sub */}
          <div
            style={{
              marginTop: 20,
              fontSize: 22,
              color: 'rgba(244,239,230,0.55)',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 400,
              lineHeight: 1.5,
              maxWidth: 680,
            }}
          >
            Behavior-driven SMS adherence for GLP-1 clinics.
            Phase-based. Trigger-based. Pilot-ready.
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: 20,
            marginBottom: 56,
          }}
        >
          {[
            { n: '18%', l: 'fewer early drop-offs' },
            { n: '$714', l: 'protected revenue / patient' },
            { n: '8 hrs/wk', l: 'staff time recovered' },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 8,
                padding: '20px 28px',
                minWidth: 200,
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 400,
                  color: '#F4EFE6',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: 'rgba(244,239,230,0.45)',
                  fontFamily: 'system-ui, sans-serif',
                  fontWeight: 400,
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* Sage accent bar at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 5,
            background: '#3D7670',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
