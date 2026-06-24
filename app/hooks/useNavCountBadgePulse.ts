import {useEffect, useRef, useState} from 'react';
import {HEADER_NAV_COUNT_BADGE_PULSE} from '~/lib/header-nav-styles';
import {usePrefersReducedMotion} from '~/hooks/usePrefersReducedMotion';

/**
 * Single-play pulse when nav count changes (wishlist add/remove, cart qty delta).
 * Skips first mount; respects prefers-reduced-motion.
 */
export function useNavCountBadgePulse(count: number): string | undefined {
  const prefersReducedMotion = usePrefersReducedMotion();
  const prevCountRef = useRef<number | null>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      prevCountRef.current = count;
      return;
    }

    const prev = prevCountRef.current;
    prevCountRef.current = count;

    if (prev === null) return;
    if (prev === count) return;

    setPulse(true);
    const timer = window.setTimeout(() => setPulse(false), 400);
    return () => window.clearTimeout(timer);
  }, [count, prefersReducedMotion]);

  return pulse ? HEADER_NAV_COUNT_BADGE_PULSE : undefined;
}
