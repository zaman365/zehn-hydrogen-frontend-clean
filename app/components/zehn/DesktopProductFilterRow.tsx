/**
 * Desktop collection filter row — Preis / Größe / Farbe + clear (REQ-0008).
 * Shared across collection routes, search, and ProductGrid.
 */
import {CustomSelect} from '~/components/CustomSelect';
import {FilterClearButton} from '~/components/zehn/FilterClearButton';
import {SlidersHorizontal} from 'lucide-react';
import {
  buildColorFilterOptions,
  buildSizeFilterOptions,
  DESKTOP_FILTER_ROW,
  FILTER_ROW_LEAD,
  FILTER_ROW_LEAD_LABEL,
  FILTER_SELECT_SHELL,
  isProductFilterActive,
  PRICE_FILTER_OPTIONS,
  PRODUCT_FILTER_ICONS,
  PRODUCT_FILTER_MIN_WIDTH,
  PRODUCT_FILTER_PLACEHOLDER,
} from '~/lib/product-filter-ui';
import {cn} from '~/lib/utils';

export type DesktopProductFilterRowProps = {
  selectedPriceRange: string;
  selectedSize: string;
  selectedColor: string;
  availableSizes: string[];
  availableColors: string[];
  onPriceChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onClear: () => void;
  className?: string;
};

export function DesktopProductFilterRow({
  selectedPriceRange,
  selectedSize,
  selectedColor,
  availableSizes,
  availableColors,
  onPriceChange,
  onSizeChange,
  onColorChange,
  onClear,
  className,
}: DesktopProductFilterRowProps) {
  const showClear = isProductFilterActive(
    selectedSize,
    selectedColor,
    selectedPriceRange,
  );

  return (
    <div className={cn(DESKTOP_FILTER_ROW, className)}>
      <div className={FILTER_ROW_LEAD} aria-hidden>
        <SlidersHorizontal className="w-4 h-4 shrink-0" />
        <span className={cn(FILTER_ROW_LEAD_LABEL, 'xl:hidden')}>Filtern</span>
        <span className={cn(FILTER_ROW_LEAD_LABEL, 'hidden xl:inline')}>
          Produkte filtern
        </span>
      </div>

      <CustomSelect
        value={selectedPriceRange}
        onChange={onPriceChange}
        options={[...PRICE_FILTER_OPTIONS]}
        placeholder={PRODUCT_FILTER_PLACEHOLDER.price}
        icon={PRODUCT_FILTER_ICONS.price}
        layout="filter"
        className={cn(FILTER_SELECT_SHELL, PRODUCT_FILTER_MIN_WIDTH.price)}
      />

      {availableSizes.length > 0 && (
        <CustomSelect
          value={selectedSize}
          onChange={onSizeChange}
          options={buildSizeFilterOptions(availableSizes)}
          placeholder={PRODUCT_FILTER_PLACEHOLDER.size}
          icon={PRODUCT_FILTER_ICONS.size}
          layout="filter"
          className={cn(FILTER_SELECT_SHELL, PRODUCT_FILTER_MIN_WIDTH.size)}
        />
      )}

      {availableColors.length > 0 && (
        <CustomSelect
          value={selectedColor}
          onChange={onColorChange}
          options={buildColorFilterOptions(availableColors)}
          placeholder={PRODUCT_FILTER_PLACEHOLDER.color}
          icon={PRODUCT_FILTER_ICONS.color}
          layout="filter"
          className={cn(FILTER_SELECT_SHELL, PRODUCT_FILTER_MIN_WIDTH.color)}
        />
      )}

      {showClear && <FilterClearButton onClick={onClear} />}
    </div>
  );
}
