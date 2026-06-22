/**
 * Shared glass surfaces for navbar, dropdowns, and floating panels.
 * REQ-0008 — consistent rounded-2xl shell + Signal-tinted outer glow.
 */
import {ZEHN_SCROLL_EDGE} from '~/lib/zehn-scrollbar-styles';

/** Base glass shell — rounded-2xl, blur, light border (navbar + dropdown). */
export const ZEHN_SURFACE_SHELL =
  'rounded-2xl backdrop-blur-md border border-white/30';

/** Navbar floating card — matches dropdown radius for visual unity. */
export const ZEHN_NAV_SURFACE = `${ZEHN_SURFACE_SHELL} bg-white/40`;

/** Desktop category dropdown panel — higher opacity for readability. */
export const ZEHN_DROPDOWN_SURFACE = `${ZEHN_SURFACE_SHELL} bg-white/95`;

/** Outer glow — indigo depth + subtle Signal (#FF5F1F) halo.
 *  Never pair with overflow-auto/hidden on the same node — clips the shadow. */
export const ZEHN_SURFACE_GLOW =
  'shadow-[0_0_0_1px_rgba(255,255,255,0.4),0_10px_50px_rgba(15,20,38,0.12),0_0_40px_rgba(255,95,31,0.1)]';

/** Inner scroll — child inside glow shell only (desktop category dropdown). */
export const ZEHN_DROPDOWN_SCROLL =
  `max-h-[75vh] overflow-y-auto overscroll-contain ${ZEHN_SCROLL_EDGE}`;

/** Open positioner — overflow-visible preserves glow bleed below rounded panel. */
export const ZEHN_DROPDOWN_POSITIONER_OPEN =
  'mt-3 opacity-100 overflow-visible';

/** Panel motion base — animate opacity/transform on shell only, not positioner. */
export const ZEHN_DROPDOWN_PANEL_MOTION_BASE =
  'transition-[opacity,transform] will-change-[opacity,transform]';

/** Panel enter — 400ms, matches hover open feel. */
export const ZEHN_DROPDOWN_PANEL_ENTER =
  'opacity-100 translate-y-0 scale-100 duration-[400ms] ease-out';

/** Panel enter start — applied one frame before ENTER (rAF slide-in). */
export const ZEHN_DROPDOWN_PANEL_ENTER_FROM =
  'opacity-0 translate-y-2 scale-[0.98]';

/** Panel exit — 280ms fade + slight lift; glow fades with opacity. */
export const ZEHN_DROPDOWN_PANEL_EXIT =
  'opacity-0 -translate-y-1.5 scale-[0.98] duration-[280ms] ease-in';

/** Extra padding on positioner for 40px halo spread — matches navbar visual weight. */
export const ZEHN_SURFACE_GLOW_BLEED = 'p-1';
