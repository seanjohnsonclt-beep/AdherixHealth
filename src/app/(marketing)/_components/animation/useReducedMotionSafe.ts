'use client';

import { useReducedMotion } from 'framer-motion';

/**
 * Wrapper around framer-motion's useReducedMotion that returns a stable
 * boolean (default: false) on the server, and the user's actual preference
 * after hydration. Use this instead of useReducedMotion directly so
 * SSR + first paint don't mismatch.
 */
export function useReducedMotionSafe(): boolean {
  const reduced = useReducedMotion();
  return reduced === true;
}
