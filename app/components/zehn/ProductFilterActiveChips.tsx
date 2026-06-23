/**
 * Removable pills for active price / size / color facets (ART-0040).
 * Desktop: per-chip X + clear-all when multiple facets active (toolbar-owned).
 */
import {X} from 'lucide-react';
import {FilterClearButton} from '~/components/zehn/FilterClearButton';
import {
  getActiveProductFilterChips,
  PRODUCT_FILTER_ACTIVE_CHIP,
  PRODUCT_FILTER_ACTIVE_CHIPS_ROW,
  PRODUCT_FILTER_CLEAR_ALL_MIN,
  type ProductFilterKind,
} from '~/lib/product-filter-ui';
import {cn} from '~/lib/utils';

export type ProductFilterActiveChipsProps = {
  selectedPriceRange: string;
  selectedSize: string;
  selectedColor: string;
  onRemove: (kind: ProductFilterKind) => void;
  /** Desktop clear-all — shown when active chip count >= clearAllMinCount. */
  onClear?: () => void;
  clearAllMinCount?: number;
  className?: string;
};

export function ProductFilterActiveChips({
  selectedPriceRange,
  selectedSize,
  selectedColor,
  onRemove,
  onClear,
  clearAllMinCount = PRODUCT_FILTER_CLEAR_ALL_MIN,
  className,
}: ProductFilterActiveChipsProps) {
  const chips = getActiveProductFilterChips(
    selectedSize,
    selectedColor,
    selectedPriceRange,
  );

  if (chips.length === 0) return null;

  const showDesktopClearAll =
    Boolean(onClear) && chips.length >= clearAllMinCount;

  return (
    <div className={cn(PRODUCT_FILTER_ACTIVE_CHIPS_ROW, className)}>
      {chips.map((chip) => (
        <button
          key={`${chip.kind}-${chip.value}`}
          type="button"
          className={PRODUCT_FILTER_ACTIVE_CHIP}
          onClick={() => onRemove(chip.kind)}
          aria-label={`${chip.label} entfernen`}
        >
          <span>{chip.label}</span>
          <X className="h-3.5 w-3.5 text-foreground/50" aria-hidden />
        </button>
      ))}
      {showDesktopClearAll && onClear && (
        <FilterClearButton
          onClick={onClear}
          className="hidden lg:inline-flex"
        />
      )}
    </div>
  );
}
