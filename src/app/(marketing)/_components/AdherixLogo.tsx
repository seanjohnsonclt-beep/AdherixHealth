/**
 * Cohort A mark + Adherix wordmark.
 *
 * Design: an "A" letterform whose interior crossbar is replaced by three
 * ascending cohort bars (a visual metaphor for patients progressing through
 * phases), trailed by a small signal dot. Sage on Ink, per Brand Kit.
 *
 * Inline (not <img>) so it renders instantly with the page, scales without
 * pixel loss, and inherits text color where useful.
 *
 * variant="full"  → mark + Adherix wordmark + Health tag
 * variant="mark"  → mark only (favicon, footer collapse, tight spaces)
 */

type Props = {
  variant?: 'full' | 'mark';
  /** Caller controls width via className/style. */
  className?: string;
  style?: React.CSSProperties;
  /** Inverts wordmark to Paper on Ink for footer / dark sections. */
  invert?: boolean;
};

// Brand palette
const SAGE       = '#5B9B94';
const SAGE_DEEP  = '#3D7670';
const INK        = '#1F2A2A';
const PAPER      = '#F4EFE6';
const GRAPHITE   = '#6B7878';

export function AdherixLogo({ variant = 'full', className, style, invert = false }: Props) {
  const wordmarkFill = invert ? PAPER : INK;
  const tagFill      = invert ? '#B8D4CF' : GRAPHITE;

  if (variant === 'mark') {
    return (
      <svg
        viewBox="0 0 120 120"
        className={className}
        style={style}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Adherix"
      >
        <CohortA originX={12} width={72} />
        {/* Signal dot — trailing indicator of active engagement */}
        <circle cx="100" cy="86" r="6" fill={SAGE_DEEP} />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 520 140"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Adherix Health"
    >
      <CohortA originX={10} width={96} />
      <circle cx="126" cy="92" r="7" fill={SAGE_DEEP} />

      {/* Wordmark: Fraunces for the serif brand feel, with light tracking */}
      <g fontFamily="Fraunces, Georgia, serif">
        <text
          x="158"
          y="88"
          fontSize="56"
          fontWeight="400"
          fill={wordmarkFill}
          letterSpacing="-1"
        >
          Adherix
        </text>
        <text
          x="160"
          y="118"
          fontSize="14"
          fontWeight="500"
          fill={tagFill}
          fontFamily="Geist, system-ui, sans-serif"
          letterSpacing="6"
        >
          HEALTH
        </text>
      </g>
    </svg>
  );
}

/**
 * The Cohort A letterform:
 *   - Two sage strokes forming the outer A
 *   - Three ascending horizontal cohort bars inside, instead of a crossbar
 * Drawn relative to (originX, 14) with a given width, 96 tall.
 */
function CohortA({ originX, width }: { originX: number; width: number }) {
  const x = originX;
  const w = width;
  const topY = 14;
  const botY = 110;
  const strokeW = Math.max(10, Math.round(w * 0.14));

  // Outer A strokes — two slanted rectangles meeting at apex
  const apexX = x + w / 2;
  const leftBotX = x;
  const rightBotX = x + w;

  // Apex slightly inset so the sides are visually thick
  const apexHalf = strokeW / 2;

  // Left and right slanted legs as polygons
  const leftLeg = [
    `${apexX - apexHalf},${topY}`,
    `${apexX + apexHalf},${topY}`,
    `${leftBotX + strokeW},${botY}`,
    `${leftBotX},${botY}`,
  ].join(' ');

  const rightLeg = [
    `${apexX - apexHalf},${topY}`,
    `${apexX + apexHalf},${topY}`,
    `${rightBotX},${botY}`,
    `${rightBotX - strokeW},${botY}`,
  ].join(' ');

  // Cohort bars — three ascending horizontal bars inside the A.
  // They sit between the legs, each a little wider and higher than the last.
  const innerLeftAt = (y: number) =>
    leftBotX + strokeW + ((apexX - apexHalf - (leftBotX + strokeW)) * (botY - y)) / (botY - topY);
  const innerRightAt = (y: number) =>
    rightBotX - strokeW - ((rightBotX - strokeW - (apexX + apexHalf)) * (botY - y)) / (botY - topY);

  const bars = [
    { y: 84, h: 6 },
    { y: 68, h: 6 },
    { y: 52, h: 6 },
  ];

  return (
    <g>
      <polygon points={leftLeg} fill={SAGE} />
      <polygon points={rightLeg} fill={SAGE} />
      {bars.map((b, i) => {
        const L = innerLeftAt(b.y) + 4;
        const R = innerRightAt(b.y) - 4;
        return (
          <rect
            key={i}
            x={L}
            y={b.y}
            width={Math.max(0, R - L)}
            height={b.h}
            rx={1.5}
            fill={SAGE_DEEP}
            opacity={0.6 + i * 0.2}
          />
        );
      })}
    </g>
  );
}
