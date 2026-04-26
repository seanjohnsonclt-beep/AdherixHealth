'use client';

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionProps,
  type Variants,
} from 'framer-motion';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
import { useReducedMotionSafe } from './useReducedMotionSafe';

/* =========================================================================
   FadeRise — fades + lifts an element into place when scrolled into view.
   Default: 12px Y offset, 500ms easeOut, fires once.
   ========================================================================= */

type FadeRiseProps = {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
  amount?: number; // viewport amount visible to trigger
  id?: string;
};

export function FadeRise({
  children,
  as: Tag = 'div',
  delay = 0,
  y = 12,
  duration = 0.5,
  className,
  style,
  amount = 0.35,
  id,
}: FadeRiseProps) {
  const reduced = useReducedMotionSafe();
  const MotionTag = motion(Tag as ElementType);

  if (reduced) {
    const Plain = Tag as ElementType;
    return (
      <Plain className={className} style={style} id={id}>
        {children}
      </Plain>
    );
  }

  return (
    <MotionTag
      className={className}
      style={style}
      id={id}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/* =========================================================================
   StaggerGroup — wraps children that should fade-rise sequentially.
   Each direct child becomes a motion.div with a staggered delay.
   ========================================================================= */

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  stagger?: number; // seconds between children
  initialDelay?: number;
  y?: number;
  amount?: number;
  as?: ElementType;
};

const containerVariants: Variants = {
  hidden: {},
  visible: (custom: { stagger: number; initialDelay: number }) => ({
    transition: {
      staggerChildren: custom.stagger,
      delayChildren: custom.initialDelay,
    },
  }),
};

const itemVariants = (y: number): Variants => ({
  hidden: { opacity: 0, y },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
});

export function StaggerGroup({
  children,
  className,
  style,
  stagger = 0.08,
  initialDelay = 0,
  y = 14,
  amount = 0.3,
  as: Tag = 'div',
}: StaggerGroupProps) {
  const reduced = useReducedMotionSafe();
  const MotionTag = motion(Tag as ElementType);

  if (reduced) {
    const Plain = Tag as ElementType;
    return (
      <Plain className={className} style={style}>
        {children}
      </Plain>
    );
  }

  // Wrap each direct child in a motion.div with item variants.
  const wrapped =
    typeof children === 'object' && children !== null && Symbol.iterator in (children as object)
      ? Array.from(children as Iterable<ReactNode>)
      : [children];

  return (
    <MotionTag
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={containerVariants}
      custom={{ stagger, initialDelay }}
    >
      {wrapped.map((child, i) => (
        <motion.div key={i} variants={itemVariants(y)}>
          {child}
        </motion.div>
      ))}
    </MotionTag>
  );
}

/* =========================================================================
   CountUp — animates a number from 0 → target when in view.
   Renders inside a span. Format the value with formatter (e.g., commas, $).
   ========================================================================= */

type CountUpProps = {
  to: number;
  duration?: number; // seconds
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: CSSProperties;
  formatter?: (n: number) => string;
};

export function CountUp({
  to,
  duration = 0.8,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  style,
  formatter,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotionSafe();
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    stiffness: 80,
    damping: 22,
    mass: 1,
  });
  const display = useTransform(spring, (latest) => {
    const v = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toString();
    const n = Number(v);
    return formatter ? formatter(n) : `${prefix}${n.toLocaleString('en-US')}${suffix}`;
  });

  const [text, setText] = useState<string>(
    formatter ? formatter(0) : `${prefix}${(0).toLocaleString('en-US')}${suffix}`,
  );

  useEffect(() => {
    if (reduced) {
      setText(formatter ? formatter(to) : `${prefix}${to.toLocaleString('en-US')}${suffix}`);
      return;
    }
    if (inView) {
      motionValue.set(to);
    }
  }, [inView, reduced, to, motionValue, formatter, prefix, suffix]);

  useEffect(() => {
    if (reduced) return;
    const unsubscribe = display.on('change', (v) => setText(v));
    return () => unsubscribe();
  }, [display, reduced]);

  // Apply duration via spring config — not directly tunable here, but kept
  // as a parameter for future swap to tween-based count.
  void duration;

  return (
    <span ref={ref} className={className} style={style}>
      {text}
    </span>
  );
}

/* =========================================================================
   ScrollDraw — strokes an SVG path on scroll-into-view.
   Pass children inside an <svg>; this wraps a single <path d=...>.
   ========================================================================= */

type ScrollDrawProps = {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  strokeLinecap?: 'butt' | 'round' | 'square';
  strokeLinejoin?: 'miter' | 'round' | 'bevel';
  fill?: string;
  duration?: number;
  delay?: number;
  className?: string;
};

export function ScrollDraw({
  d,
  stroke = 'currentColor',
  strokeWidth = 2,
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  fill = 'none',
  duration = 1.1,
  delay = 0,
  className,
}: ScrollDrawProps) {
  const reduced = useReducedMotionSafe();

  return (
    <motion.path
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      fill={fill}
      className={className}
      initial={reduced ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        pathLength: { duration: reduced ? 0 : duration, ease: [0.42, 0, 0.58, 1], delay },
        opacity: { duration: reduced ? 0 : 0.3, delay },
      }}
    />
  );
}

/* =========================================================================
   ScrollWidth — animates width 0 → 100% on a child container (for phase bars).
   ========================================================================= */

type ScrollWidthProps = {
  children?: ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

export function ScrollWidth({
  children,
  duration = 0.9,
  delay = 0,
  className,
  style,
}: ScrollWidthProps) {
  const reduced = useReducedMotionSafe();

  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? { width: '100%' } : { width: 0 }}
      whileInView={{ width: '100%' }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: reduced ? 0 : duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* =========================================================================
   TapButton — a motion.div wrapper that adds 0.98 scale on tap.
   Use as a wrapper around <Link> / <button>.
   ========================================================================= */

export function TapButton({
  children,
  className,
  style,
  ...rest
}: { children: ReactNode; className?: string; style?: CSSProperties } & MotionProps) {
  const reduced = useReducedMotionSafe();
  return (
    <motion.span
      className={className}
      style={{ display: 'inline-flex', ...style }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      {...rest}
    >
      {children}
    </motion.span>
  );
}
