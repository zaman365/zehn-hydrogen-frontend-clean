/**
 * Shared nav menu lifecycle phase — desktop category dropdown + mobile drawer.
 * REQ-0008: idle | open | closing mirrors panel/shell mount, stagger, and aria state.
 */
import type {NavStaggerPhase} from '~/lib/nav-stagger-motion';

/** Menu mount lifecycle — matches desktop categoryMenuPhase and mobileMenuPhase. */
export type NavMenuPhase = 'idle' | 'open' | 'closing';

/** Surface that owns row stagger — desktop dropdown vs mobile drawer. */
export type NavMenuSurface = 'desktop' | 'mobile';

/**
 * Map menu phase to row stagger phase.
 * Desktop closing → exit (reverse stair). Mobile closing → idle (rows stay visible).
 */
export function menuPhaseToStagger(
  phase: NavMenuPhase,
  surface: NavMenuSurface = 'desktop',
): NavStaggerPhase {
  if (phase === 'open') return 'enter';
  if (phase === 'closing') return surface === 'desktop' ? 'exit' : 'idle';
  return 'idle';
}

/** Shell/positioner is in the DOM (open or animating closed). */
export function isMenuShellMounted(phase: NavMenuPhase): boolean {
  return phase !== 'idle';
}

/** Burger aria-expanded and close icon — true while open or finishing close. */
export function isMenuAriaExpanded(phase: NavMenuPhase): boolean {
  return phase === 'open' || phase === 'closing';
}

/** Block pathname auto-expand and accordion resets during close animation. */
export function shouldFreezeMobileAccordion(phase: NavMenuPhase): boolean {
  return phase === 'closing';
}
