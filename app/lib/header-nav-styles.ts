/**
 * Shared navbar label / icon styling for Header.tsx.
 * Keeps desktop + mobile nav controls visually consistent (REQ-0001, REQ-0008).
 */
import {cn} from '~/lib/utils';

/** Base label typography — matches nav title text (12px semibold caps). */
export const HEADER_NAV_LABEL =
  'text-xs font-semibold uppercase tracking-[0.3em]';

/** Default idle + hover/focus accent (Signal #FF5F1F via text-accent). */
export const HEADER_NAV_COLOR =
  'text-foreground/70 hover:text-accent focus-visible:text-accent ' +
  'no-underline hover:no-underline focus-visible:no-underline';

/** Selected / active route or open toggle state. */
export const HEADER_NAV_COLOR_ACTIVE =
  'text-accent no-underline hover:no-underline';

/**
 * Circular icon host — 44px touch target, soft hover disc, ripple clip boundary.
 * Used by HeaderNavIconButton for burger, search, account, wishlist, cart.
 */
export const HEADER_NAV_ICON_HOST =
  'relative overflow-hidden rounded-full flex items-center justify-center ' +
  'min-w-[44px] min-h-[44px] transition-colors duration-[400ms] ease-out ' +
  'hover:bg-foreground/[0.06] active:bg-accent/10';

/**
 * Pill text host — optional wider layout with hover disc (use variant="pill").
 * min-h-[44px] matches icon touch target inside fixed h-[68px] nav row (no CLS).
 */
export const HEADER_NAV_TEXT_HOST =
  'relative overflow-hidden rounded-full inline-flex items-center justify-center ' +
  'min-h-[44px] px-3 xl:px-4 transition-colors duration-[400ms] ease-out ' +
  'hover:bg-foreground/[0.06] active:bg-accent/10';

/**
 * Compact desktop titles — text-width, color hover, ripple clip (production spacing).
 * Default for HeaderNavLink; no horizontal pill padding.
 */
export const HEADER_NAV_TEXT_HOST_COMPACT =
  'relative overflow-hidden inline-flex items-center py-1 ' +
  'transition-colors duration-[400ms] ease-out';

/** Shop-all label — desktop nav link + TITLE_OVERRIDES in Header.tsx (mobile drawer titles). */
export const DESKTOP_SHOP_ALL_NAV_LABEL = 'Kollektion';

/** Lucide icon dimensions inside nav controls. */
export const HEADER_NAV_ICON_SIZE = 'w-5 h-5';

/** Stroke weight tuned to match font-semibold nav titles. */
export const HEADER_NAV_ICON_STROKE = 2.25;

/** Mobile drawer row — full-width with padded hover zone for ripple parity. */
export const HEADER_NAV_MOBILE_ROW =
  'py-2 min-h-[44px] px-3 flex items-center gap-2 text-left w-full ' +
  'rounded-lg transition-colors duration-[400ms] ease-out ' +
  'hover:bg-foreground/[0.06] active:bg-accent/10';

/** Accordion row — SHORTS, HOSEN (desktop dropdown + mobile nested). */
export const HEADER_NAV_DROPDOWN_SECTION =
  'flex min-h-[44px] w-full items-center justify-between gap-3 text-left ' +
  'transition-colors duration-[400ms] ease-out';

/** Child link row — Alle SHORTS, subcategory links. */
export const HEADER_NAV_DROPDOWN_LINK =
  'block w-full text-left transition-colors duration-[400ms] ease-out';

/** Nested category list indent under mobile collection title (Kollektion, Neuheiten). */
export const HEADER_NAV_MOBILE_SUBMENU_INDENT = 'mt-2 pl-4 ml-1';

/** Sub-list container — left border + padding under open accordion section. */
export const HEADER_NAV_DROPDOWN_SUBLIST =
  'mt-2 flex flex-col gap-1.5 border-l border-foreground/10 pl-4';

/** Split row: navigable label + chevron toggle (mobile accordion). */
export const HEADER_NAV_ACCORDION_ROW =
  'flex min-h-[44px] w-full items-center gap-1';

/**
 * Mobile drawer max height — viewport below frozen header stack (102px).
 * Sync with SITE_HEADER_STACK.mobile in site-header-stack.ts.
 */
export const HEADER_NAV_MOBILE_MENU_MAX_H = 'max-h-[calc(100dvh-102px)]';

type HeaderNavStateOptions = {
  active?: boolean;
  className?: string;
};

export type HeaderNavTextHostVariant = 'compact' | 'pill';

/** Merge idle vs active color classes for nav text/icon hosts. */
export function cnHeaderNavState({
  active = false,
  className,
}: HeaderNavStateOptions = {}) {
  return cn(
    HEADER_NAV_LABEL,
    active ? HEADER_NAV_COLOR_ACTIVE : HEADER_NAV_COLOR,
    className,
  );
}

/** Icon host classes with active accent when selected/toggled open. */
export function cnHeaderNavIconHost({
  active = false,
  className,
}: HeaderNavStateOptions = {}) {
  return cn(
    HEADER_NAV_ICON_HOST,
    active ? HEADER_NAV_COLOR_ACTIVE : HEADER_NAV_COLOR,
    className,
  );
}

/** Desktop nav title host — compact (default) or pill variant. */
export function cnHeaderNavTextHost({
  active = false,
  className,
  variant = 'compact',
}: HeaderNavStateOptions & {variant?: HeaderNavTextHostVariant} = {}) {
  const host =
    variant === 'pill' ? HEADER_NAV_TEXT_HOST : HEADER_NAV_TEXT_HOST_COMPACT;
  return cn(
    host,
    HEADER_NAV_LABEL,
    active ? HEADER_NAV_COLOR_ACTIVE : HEADER_NAV_COLOR,
    className,
  );
}

/** Dropdown accordion section — open state uses accent (no underline). */
export function cnHeaderNavDropdownSection({
  active = false,
  className,
}: HeaderNavStateOptions = {}) {
  return cn(
    HEADER_NAV_DROPDOWN_SECTION,
    HEADER_NAV_LABEL,
    active ? HEADER_NAV_COLOR_ACTIVE : HEADER_NAV_COLOR,
    className,
  );
}

/** Dropdown child link — navbar colors; active when route matches. */
export function cnHeaderNavDropdownLink({
  active = false,
  className,
}: HeaderNavStateOptions = {}) {
  return cn(
    HEADER_NAV_DROPDOWN_LINK,
    HEADER_NAV_LABEL,
    active ? HEADER_NAV_COLOR_ACTIVE : HEADER_NAV_COLOR,
    className,
  );
}
