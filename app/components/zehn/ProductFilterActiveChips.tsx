/**
 * Removable pills for active price / size / color facets (ART-0040 / BL-0013 / BL-0014).
 * ListFilter lead: icon on mobile; icon + DE copy on desktop; RippleButton chips.
 */
import {ListFilter, X} from 'lucide-react';
import {FilterClearButton} from '~/components/zehn/FilterClearButton';
import {RippleButton} from '~/components/zehn/RippleButton';
import {HEADER_NAV_COLOR} from '~/lib/header-nav-styles';
import {
  getActiveProductFilterChips,
  PRODUCT_FILTER_ACTIVE_CHIP,
  PRODUCT_FILTER_ACTIVE_CHIP_REMOVE_ICON,
  PRODUCT_FILTER_ACTIVE_CHIPS_LEAD,
  PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_ICON,
  PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_LONG,
  PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_SHORT,
  PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_TEXT,
  PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_TEXT_LONG,
  PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_TEXT_SHORT,
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
      <span className={PRODUCT_FILTER_ACTIVE_CHIPS_LEAD} aria-hidden>
        <ListFilter
          className={PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_ICON}
          aria-hidden
        />
        <span className={PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_TEXT}>
          <span className={PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_LONG}>
            {PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_TEXT_LONG}
          </span>
          <span className={PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_SHORT}>
            {PRODUCT_FILTER_ACTIVE_CHIPS_LEAD_TEXT_SHORT}
          </span>
        </span>
      </span>
      {chips.map((chip) => (
        <RippleButton
          key={`${chip.kind}-${chip.value}`}
          type="button"
          className={cn(PRODUCT_FILTER_ACTIVE_CHIP, HEADER_NAV_COLOR)}
          onClick={() => onRemove(chip.kind)}
          aria-label={`${chip.label} entfernen`}
        >
          <span>{chip.label}</span>
          <X className={PRODUCT_FILTER_ACTIVE_CHIP_REMOVE_ICON} aria-hidden />
        </RippleButton>
      ))}
      {showDesktopClearAll && onClear && (
        <FilterClearButton
          onClick={onClear}
          size="compact"
          className="hidden lg:inline-flex"
        />
      )}
    </div>
  );
}
