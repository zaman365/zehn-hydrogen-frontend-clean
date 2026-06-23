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

/** Min-width per kind — size needs room for pants labels (28W / 30L). */
export const PRODUCT_FILTER_MIN_WIDTH: Record<ProductFilterKind, string> = {
  price: 'min-w-[176px]',
  size: 'min-w-[200px] xl:min-w-[220px]',
  color: 'min-w-[176px]',
};

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

/** Filter trigger — icon left, label center, chevron right (CustomSelect layout=filter). */
export const FILTER_SELECT_TRIGGER =
  'grid grid-cols-[1.25rem_1fr_1.25rem] items-center gap-2 px-3 h-[40px] text-xs xl:text-sm';

/** Radix Popover panel shell — portaled selects (ART-0046). */
export type FilterSelectMenuAlign = 'start' | 'end';

export const ZEHN_SELECT_CONTENT =
  'rounded-3xl boty-shadow bg-card border-0 p-0 z-[100] overflow-hidden';

/** Row lead — SlidersHorizontal + responsive label (inline before facet selects). */
export const FILTER_ROW_LEAD =
  'inline-flex items-center gap-2 shrink-0 text-foreground/60 select-none';

export const FILTER_ROW_LEAD_LABEL =
  'font-sans font-medium text-xs xl:text-sm whitespace-nowrap';

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

/** Min active facets before desktop clear-all appears in chip row. */
export const PRODUCT_FILTER_CLEAR_ALL_MIN = 2;

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

/** Filter toolbar shell — padding via ZEHN_HOMEPAGE_INSET_PY in ProductFilterToolbar (ART-0048). */
export const HOMEPAGE_FILTER_TOOLBAR_SHELL = 'w-full min-w-0';

/** Band A — mobile collapsible filter panel shell (no bottom border). */
export const FILTER_TOOLBAR_BAND_A_MOBILE =
  `lg:hidden overflow-visible w-full min-w-0 ${ZEHN_HOMEPAGE_STACK_GAP}`;

/** Desktop homepage — filters + chips left, count + sort right (ART-0043 / ART-0045). */
export const HOMEPAGE_FILTER_TOOLBAR_DESKTOP =
  'hidden lg:flex lg:items-center lg:justify-between lg:gap-4 w-full min-w-0 overflow-visible';

export const HOMEPAGE_FILTER_TOOLBAR_DESKTOP_LEFT =
  'flex flex-wrap items-center gap-3 min-w-0 flex-1';

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

/** Sort trigger — same shell as facet selects (no h-9 override). */
export const PRODUCT_SORT_SELECT = 'w-full lg:w-auto lg:min-w-[11rem]';

/** Sort dropdown — content width for long German labels; trigger pill unchanged (ART-0049). */
export const PRODUCT_SORT_DROPDOWN_WIDTH = 'content' as const;

/** Mobile collapsible filter panel header row. */
export const HOMEPAGE_MOBILE_FILTER_HEADER =
  'flex items-center justify-between gap-3 w-full min-w-0';

export const HOMEPAGE_MOBILE_FILTER_HEADER_LABEL =
  'inline-flex items-center gap-2 font-sans text-xs font-medium text-foreground/70';

/** Collapsible facet stack body — homepage mobile only. */
export const HOMEPAGE_MOBILE_FILTER_BODY =
  `w-full min-w-0 ${ZEHN_HOMEPAGE_STACK_GAP}`;

/** Removable active filter pill. */
export const PRODUCT_FILTER_ACTIVE_CHIP =
  'inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-sans ' +
  'bg-card text-foreground border border-border/50 boty-shadow';

export const PRODUCT_FILTER_ACTIVE_CHIPS_ROW =
  'flex flex-wrap items-center gap-2 w-full min-w-0';
