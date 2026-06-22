/**
 * Nav menu row stagger — desktop category dropdown + mobile drawer top-level rows.
 * REQ-0008: CSS-only GPU transitions; enter stair down, exit reverse stair up.
 */
import {cn} from '~/lib/utils';

export type NavStaggerPhase = 'enter' | 'exit' | 'idle';

export const NAV_STAGGER_ITEM_DELAY_MS = 45;
export const NAV_STAGGER_ITEM_DURATION_MS = 220;

const NAV_STAGGER_MOTION_BASE =
  'transition-[opacity,transform] ease-out will-change-[opacity,transform]';

const NAV_STAGGER_ENTER_FROM = 'opacity-0 translate-y-2';
const NAV_STAGGER_ENTER_TO =
  'opacity-100 translate-y-0 duration-[220ms]';
const NAV_STAGGER_EXIT_TO =
  'opacity-0 -translate-y-1.5 duration-[220ms] ease-in';

/**
 * Enter: index * delay (stair down).
 * Exit: reverse order — last row exits first.
 */
export function getNavStaggerDelayMs(
  index: number,
  total: number,
  phase: NavStaggerPhase,
  reducedMotion = false,
): number {
  if (phase === 'idle' || reducedMotion || total <= 0) return 0;
  if (phase === 'enter') return index * NAV_STAGGER_ITEM_DELAY_MS;
  return (total - 1 - index) * NAV_STAGGER_ITEM_DELAY_MS;
}

/** Longest stagger cycle for a list — use as mobile shell collapse delay. */
export function getNavStaggerMaxDurationMs(total: number): number {
  if (total <= 0) return 0;
  return (total - 1) * NAV_STAGGER_ITEM_DELAY_MS + NAV_STAGGER_ITEM_DURATION_MS;
}

export function cnNavStaggerItem(
  phase: NavStaggerPhase,
  active = true,
  reducedMotion = false,
): string {
  if (phase === 'idle') return '';
  if (reducedMotion) {
    return phase === 'exit' ? 'opacity-0' : 'opacity-100';
  }
  if (phase === 'exit') {
    return cn(
      NAV_STAGGER_MOTION_BASE,
      'opacity-100 translate-y-0',
      NAV_STAGGER_EXIT_TO,
    );
  }
  return cn(
    NAV_STAGGER_MOTION_BASE,
    active ? NAV_STAGGER_ENTER_TO : NAV_STAGGER_ENTER_FROM,
  );
}
