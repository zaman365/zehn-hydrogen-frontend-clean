/**
 * Shared scrollbar tokens — transparent track, thin thumb (REQ-0008).
 * Pairs with `.zehn-scroll-edge` in app/styles/app.css.
 * Use on inner scroll regions (cart, search, dropdowns, filters) — not on `html`.
 */

/** CSS class — thin transparent-edge scrollbar for overlay panels. */
export const ZEHN_SCROLL_EDGE = 'zehn-scroll-edge';

/**
 * Filter/select list — grows with content until cap, then scrolls.
 * Replaces fixed max-h boxes that always reserve scroll chrome.
 */
export const ZEHN_SELECT_LIST_SCROLL =
  'min-h-0 max-h-[min(280px,50vh)] overflow-y-auto overscroll-contain';
