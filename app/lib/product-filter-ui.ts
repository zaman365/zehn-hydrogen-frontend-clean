/**
 * Collection product filter UI tokens — icons, min-widths, shared options (REQ-0008).
 * Logic lives in product-filters.ts; this file is presentation-only.
 */
import {
  ZEHN_HOMEPAGE_ROW_GAP,
  ZEHN_HOMEPAGE_STACK_GAP,
} from '~/lib/homepage-section-styles';
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Clock,
  Euro,
  ListFilter,
  Package,
  Palette,
  Ruler,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export type ProductFilterKind = 'price' | 'size' | 'color';

export type FilterSelectOption = {
  value: string;
  label: string;
  icon?: LucideIcon;
};

/** Shared price-range options for desktop + mobile filter selects. */
export const PRICE_FILTER_OPTIONS: readonly FilterSelectOption[] = [
  {value: '0-50', label: '€0 - €50'},
  {value: '50-100', label: '€50 - €100'},
  {value: '100-150', label: '€100 - €150'},
  {value: '150+', label: '€150+'},
] as const;

/** Meaningful Lucide icons per filter kind (trigger label affordance). */
export const PRODUCT_FILTER_ICONS: Record<ProductFilterKind, LucideIcon> = {
  price: Euro,
  size: Ruler,
  color: Palette,
};

/** Shared min pill width — facet + sort triggers at idle (BL-0014). */
export const ZEHN_FILTER_PILL_MIN_W = 'min-w-[11rem]' as const;

/**
 * Desktop facet trigger — min width at idle; grows when value selected (BL-0014).
 * max-w matches CustomSelect popover content cap.
 */
export const PRODUCT_FILTER_TRIGGER_SHELL =
  `${ZEHN_FILTER_PILL_MIN_W} w-auto max-w-[22rem] shrink-0` as const;

/** @deprecated BL-0014 — use PRODUCT_FILTER_TRIGGER_SHELL */
export const PRODUCT_FILTER_TRIGGER_WIDTH = PRODUCT_FILTER_TRIGGER_SHELL;

export const PRODUCT_FILTER_PLACEHOLDER: Record<ProductFilterKind, string> = {
  price: 'Preis',
  size: 'Größe',
  color: 'Farbe',
};

/**
 * Desktop row — flex-wrap at lg; overflow-visible (never overflow-x-hidden:
 * that forces overflow-y:auto and clips shadows + dropdowns).
 */
export const DESKTOP_FILTER_ROW =
  'hidden lg:flex flex-wrap items-center gap-3 overflow-visible';

/** Parent bar shell — extra pb for boty-shadow clearance above border. */
export const FILTER_BAR_SHELL =
  'flex items-center justify-between overflow-visible pb-4 border-b border-border/50';

/** Filter trigger — icon / label(auto) / chevron; label drives pill width (BL-0014). */
export const FILTER_SELECT_TRIGGER =
  'grid grid-cols-[1.25rem_auto_1.25rem] items-center gap-2 px-3 h-[40px] text-xs xl:text-sm';

/** Radix Popover panel shell — portaled selects (ART-0046). */
export type FilterSelectMenuAlign = 'start' | 'end';

export const ZEHN_SELECT_CONTENT =
  'rounded-3xl boty-shadow bg-card border-0 p-0 z-[100] overflow-hidden';

/** Row lead — SlidersHorizontal + responsive label (inline before facet selects). */
export const FILTER_ROW_LEAD =
  'inline-flex items-center gap-2 shrink-0 text-foreground/60 select-none';

export const FILTER_ROW_LEAD_LABEL =
  'font-sans font-normal text-xs xl:text-sm whitespace-nowrap';

export const FILTER_SELECT_SHELL = 'w-auto';

/** Mobile full-screen facet drawer — below lg breakpoint only. */
export const MOBILE_FILTER_DRAWER_SHELL =
  'lg:hidden fixed inset-0 z-50 bg-background';

export const MOBILE_FILTER_DRAWER_BODY = 'p-6';

export const MOBILE_FILTER_DRAWER_FACETS = 'space-y-3';

export const MOBILE_FILTER_DRAWER_ACTIONS = 'grid grid-cols-2 gap-3 pt-4';

/** Primary close action — German label for collection filter drawer. */
export const MOBILE_FILTER_APPLY_BUTTON =
  'w-full px-4 py-3 rounded-3xl text-sm bg-primary text-primary-foreground ' +
  'hover:bg-primary/90 transition-colors min-h-[44px]';

/** Size facet options — value + label stay identical (Shopify Size option text). */
export function buildSizeFilterOptions(sizes: string[]): FilterSelectOption[] {
  return sizes.map((size) => ({value: size, label: size}));
}

/** Color facet options — value + label stay identical (Shopify Color option text). */
export function buildColorFilterOptions(colors: string[]): FilterSelectOption[] {
  return colors.map((color) => ({value: color, label: color}));
}

/** Min active facets before desktop clear-all appears in chip row (BL-0013: show with any filter). */
export const PRODUCT_FILTER_CLEAR_ALL_MIN = 1;

/** True when any facet is active — show clear button. */
export function isProductFilterActive(
  size: string,
  color: string,
  priceRange: string,
): boolean {
  return Boolean(size || color || priceRange);
}

export type ActiveProductFilterChip = {
  kind: ProductFilterKind;
  label: string;
  value: string;
};

/** Active facet chips for removable pill row (ART-0040). */
export function getActiveProductFilterChips(
  size: string,
  color: string,
  priceRange: string,
): ActiveProductFilterChip[] {
  const chips: ActiveProductFilterChip[] = [];

  if (priceRange) {
    const match = PRICE_FILTER_OPTIONS.find((option) => option.value === priceRange);
    chips.push({
      kind: 'price',
      label: match?.label ?? priceRange,
      value: priceRange,
    });
  }

  if (size) {
    chips.push({kind: 'size', label: size, value: size});
  }

  if (color) {
    chips.push({kind: 'color', label: color, value: color});
  }

  return chips;
}

/** Shared sort options — desktop + mobile meta row (ART-0045 icons). */
export const PRODUCT_SORT_ICONS: Record<string, LucideIcon> = {
  default: Sparkles,
  'price-asc': ArrowUpNarrowWide,
  'price-desc': ArrowDownWideNarrow,
  newest: Clock,
};

export const PRODUCT_SORT_OPTIONS: readonly FilterSelectOption[] = [
  {value: 'default', label: 'Empfohlen', icon: Sparkles},
  {value: 'price-asc', label: 'Preis: Niedrig → Hoch', icon: ArrowUpNarrowWide},
  {value: 'price-desc', label: 'Preis: Hoch → Niedrig', icon: ArrowDownWideNarrow},
  {value: 'newest', label: 'Neueste', icon: Clock},
] as const;

/** Homepage section divider — matches category-nav-sub-row divider (ART-0045). */
export const HOMEPAGE_FILTER_SEPARATOR =
  'border-b border-[rgba(15,20,38,0.1)]';

/** Filter toolbar shell — vertical rhythm via STACK_GAP above + GRID_TOP below (BL-0016). */
export const HOMEPAGE_FILTER_TOOLBAR_SHELL = 'w-full min-w-0';

/** Shared alias — homepage + collection catalog band (REQ-0008). */
export const PRODUCT_FILTER_TOOLBAR_SHELL = HOMEPAGE_FILTER_TOOLBAR_SHELL;

/** Band A — mobile collapsible filter panel shell (no bottom border). */
export const FILTER_TOOLBAR_BAND_A_MOBILE =
  `lg:hidden overflow-visible w-full min-w-0 ${ZEHN_HOMEPAGE_STACK_GAP}`;

/** Desktop toolbar — two-row stack: facets+meta, then active chips (BL-0013). */
export const HOMEPAGE_FILTER_TOOLBAR_DESKTOP =
  `hidden lg:flex lg:flex-col w-full min-w-0 overflow-visible ${ZEHN_HOMEPAGE_STACK_GAP}`;

export const PRODUCT_FILTER_TOOLBAR_DESKTOP = HOMEPAGE_FILTER_TOOLBAR_DESKTOP;

/** Row 1 — facet row left, count+sort right; items-start keeps meta on facet baseline. */
export const HOMEPAGE_FILTER_TOOLBAR_DESKTOP_ROW_PRIMARY =
  'flex items-center justify-between gap-4 w-full min-w-0';

export const PRODUCT_FILTER_TOOLBAR_DESKTOP_ROW_PRIMARY =
  HOMEPAGE_FILTER_TOOLBAR_DESKTOP_ROW_PRIMARY;

/** @deprecated BL-0013 — chips moved to row 2; alias kept for grep/tests. */
export const HOMEPAGE_FILTER_TOOLBAR_DESKTOP_LEFT =
  'flex flex-wrap items-center gap-3 min-w-0 flex-1';

export const PRODUCT_FILTER_TOOLBAR_DESKTOP_LEFT =
  HOMEPAGE_FILTER_TOOLBAR_DESKTOP_LEFT;

/** Band B — product count + sort (mobile stack, desktop inline — ART-0047). */
export const PRODUCT_COUNT_ICON: LucideIcon = Package;

export const PRODUCT_SORT_PLACEHOLDER = 'Sortieren';

/** Count label row — centered mobile; left on desktop (ART-0048). */
export const PRODUCT_SORT_COUNT_ROW =
  'inline-flex items-center justify-center gap-2 w-full font-body text-xs ' +
  'text-foreground/70 font-medium shrink-0 lg:w-auto lg:justify-start';

/** Mobile: stack count then full-width sort; desktop: inline row — no extra py. */
export const PRODUCT_SORT_META_ROW =
  `flex flex-col min-w-0 lg:flex-row lg:items-center ${ZEHN_HOMEPAGE_ROW_GAP}`;

/** Sort trigger — w-auto growth parity with facet shells (BL-0014). */
export const PRODUCT_SORT_SELECT = `w-full lg:w-auto ${ZEHN_FILTER_PILL_MIN_W}`;

/** Sort dropdown — content width for long German labels; trigger pill unchanged (ART-0049). */
export const PRODUCT_SORT_DROPDOWN_WIDTH = 'content' as const;

/** Mobile collapsible filter panel header row. */
export const HOMEPAGE_MOBILE_FILTER_HEADER =
  'flex items-center justify-between gap-3 w-full min-w-0';

export const HOMEPAGE_MOBILE_FILTER_HEADER_LABEL =
  'inline-flex items-center gap-2 font-sans text-xs font-normal text-foreground/70';

/** Collapsible facet stack body — homepage mobile only. */
export const HOMEPAGE_MOBILE_FILTER_BODY =
  `w-full min-w-0 ${ZEHN_HOMEPAGE_STACK_GAP}`;

/** Removable active filter pill — ripple clip + group hover on X (BL-0013). */
export const PRODUCT_FILTER_ACTIVE_CHIP =
  'group relative overflow-hidden inline-flex items-center gap-1.5 h-8 px-3 rounded-full ' +
  'text-xs font-sans bg-card text-foreground border border-border/50 boty-shadow ' +
  'transition-colors duration-[400ms] ease-out hover:bg-foreground/[0.06] active:bg-accent/10';

/** X affordance — Signal on group hover (navbar parity). */
export const PRODUCT_FILTER_ACTIVE_CHIP_REMOVE_ICON =
  'h-3.5 w-3.5 shrink-0 text-foreground/50 transition-colors duration-[400ms] ' +
  'ease-out group-hover:text-accent';

export const PRODUCT_FILTER_ACTIVE_CHIPS_ROW =
  'flex flex-wrap items-center gap-2 w-full min-w-0';

/** Applied-filter affordance — distinct from facet row SlidersHorizontal (BL-0014). */
export const PRODUCT_FILTER_ACTIVE_CHIPS_ICON: LucideIcon = ListFilter;

/** Lead row — ListFilter + optional DE copy; visible on mobile (icon) and desktop (icon + text). */
export const PRODUCT_FILTER_ACTIVE_CHIPS_LEAD =
  'inline-flex items-center gap-2 shrink-0 font-sans font-normal text-xs xl:text-sm text-foreground/60';

export const PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_ICON =
  'w-4 h-4 shrink-0 text-foreground/50';

/** DE copy wrapper — hidden below lg; mobile shows icon-only beside chips. */
export const PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_TEXT = 'hidden lg:inline';

export const PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_LONG = 'hidden xl:inline';

export const PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_SHORT = 'xl:hidden';

/** German lead copy — full @ xl, short @ lg–xl. */
export const PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_TEXT_LONG =
  'Produkte werden angezeigt basierend auf:';

export const PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_TEXT_SHORT = 'Angezeigt nach:';

/** Compact clear-all — matches active chip h-8 in desktop chip row (BL-0013). */
export const PRODUCT_FILTER_CLEAR_CHIP =
  'h-8 px-3 rounded-full text-xs inline-flex items-center gap-1.5 boty-shadow ' +
  'bg-card text-foreground border border-border/50 transition-colors duration-[400ms] ease-out ' +
  'hover:bg-foreground/[0.06] active:bg-accent/10';
