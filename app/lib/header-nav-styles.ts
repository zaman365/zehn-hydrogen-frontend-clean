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

/** Ring cutout — matches ZEHN_NAV_SURFACE bg-white/40 frosted nav card. */
export const HEADER_NAV_COUNT_BADGE_RING = 'ring-2 ring-white/40';

/** Shared digit shell — optical center in 16px circle (absolute + inline badges). */
export const HEADER_NAV_COUNT_BADGE_DIGIT =
  'inline-flex items-center justify-center size-4 font-semibold text-[10px] ' +
  'leading-[10px] tabular-nums';

/**
 * Accent count pill — wishlist + cart (16px circle, readable 10px type).
 * Ring creates a cutout gap over the icon on frosted nav surface.
 */
export const HEADER_NAV_COUNT_BADGE =
  `absolute rounded-full bg-accent text-accent-foreground ${HEADER_NAV_COUNT_BADGE_RING} ` +
  HEADER_NAV_COUNT_BADGE_DIGIT;

/** Wider shell when label exceeds single digit (e.g. 9+). */
export const HEADER_NAV_COUNT_BADGE_OVERFLOW =
  'min-w-[18px] px-0.5';

/** Default offset for w-5 h-5 icons inside 44px icon hosts. */
export const HEADER_NAV_COUNT_BADGE_POSITION = '-top-2 -right-2';

/** Offset for w-4 h-4 icons in mobile drawer rows — sits above icon corner. */
export const HEADER_NAV_COUNT_BADGE_POSITION_MOBILE_ROW = '-top-3 -right-3';

/** Pulse class toggled by useNavCountBadgePulse on count delta. */
export const HEADER_NAV_COUNT_BADGE_PULSE = 'zehn-nav-count-badge--pulse';

type HeaderNavCountBadgeOptions = {
  position?: string;
  className?: string;
};

/** Count badge shell — position override for mobile drawer icon hosts. */
export function cnHeaderNavCountBadge({
  position = HEADER_NAV_COUNT_BADGE_POSITION,
  className,
}: HeaderNavCountBadgeOptions = {}) {
  return cn(HEADER_NAV_COUNT_BADGE, position, className);
}

/** Inline count pill — beside drawer row label (no absolute anchor). */
export const HEADER_NAV_COUNT_BADGE_INLINE =
  `shrink-0 rounded-full bg-accent text-accent-foreground ${HEADER_NAV_COUNT_BADGE_RING} ` +
  HEADER_NAV_COUNT_BADGE_DIGIT;

export function cnHeaderNavCountBadgeInline(className?: string) {
  return cn(HEADER_NAV_COUNT_BADGE_INLINE, className);
}

/** Mobile drawer row — full-width with padded hover zone for ripple parity. */
export const HEADER_NAV_MOBILE_ROW =
  'py-2 min-h-[44px] px-3 flex items-center gap-2 text-left w-full ' +
  'rounded-lg transition-colors duration-[400ms] ease-out ' +
  'hover:bg-foreground/[0.06] active:bg-accent/10';

/** Icon + label + inline badge cluster (Wunschliste / Warenkorb drawer rows). */
export const HEADER_NAV_MOBILE_LABELED_ROW_INNER =
  'flex items-center gap-3 min-w-0';

/** Label + count badge — gap-2 sits badge directly beside title text. */
export const HEADER_NAV_MOBILE_LABELED_ROW_LABEL =
  'flex items-center gap-2 min-w-0';

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
