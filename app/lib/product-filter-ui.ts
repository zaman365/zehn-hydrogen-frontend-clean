/**
 * Collection product filter UI tokens — icons, min-widths, shared options (REQ-0008).
 * Logic lives in product-filters.ts; this file is presentation-only.
 */
import {Euro, Palette, Ruler, type LucideIcon} from 'lucide-react';

export type ProductFilterKind = 'price' | 'size' | 'color';

export type FilterSelectOption = {
  value: string;
  label: string;
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

/** True when any facet is active — show clear button. */
export function isProductFilterActive(
  size: string,
  color: string,
  priceRange: string,
): boolean {
  return Boolean(size || color || priceRange);
}
