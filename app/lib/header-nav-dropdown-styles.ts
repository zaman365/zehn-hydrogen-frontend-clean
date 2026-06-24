/**
 * Desktop nav category popover — Radix Popper owns position (BL-0018).
 * Shell tokens only; glow lives on inner ZehnGlassPanel.
 */

/** Portaled popover content — transparent wrapper; panel inside carries glass + glow. */
export const ZEHN_NAV_POPOVER_CONTENT =
  'z-50 w-max max-w-[calc(100vw-2rem)] p-0 border-0 bg-transparent shadow-none outline-none';

/** data attribute for outside-click + test hooks */
export const ZEHN_NAV_POPOVER_DATA_ATTR = 'data-zehn-nav-popover';

/** Portaled popover content — clicks inside should not close the hover menu. */
export function isNavPopoverPointerTarget(target: Node | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest(`[${ZEHN_NAV_POPOVER_DATA_ATTR}]`));
}
