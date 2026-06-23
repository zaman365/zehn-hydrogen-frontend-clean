/**
 * Homepage mobile collapsible filter stack — facets + chips inside; meta row stays outside (ART-0045 / ART-0046).
 */
import {ChevronDown, ChevronUp, SlidersHorizontal} from 'lucide-react';
import {CustomSelect} from '~/components/CustomSelect';
import {FilterClearButton} from '~/components/zehn/FilterClearButton';
import {HeaderNavIconButton} from '~/components/zehn/HeaderNavItem';
import {ProductFilterActiveChips} from '~/components/zehn/ProductFilterActiveChips';
import {
  buildColorFilterOptions,
  buildSizeFilterOptions,
  HOMEPAGE_MOBILE_FILTER_BODY,
  HOMEPAGE_MOBILE_FILTER_HEADER,
  HOMEPAGE_MOBILE_FILTER_HEADER_LABEL,
  isProductFilterActive,
  PRICE_FILTER_OPTIONS,
  PRODUCT_FILTER_ICONS,
  PRODUCT_FILTER_PLACEHOLDER,
  type ProductFilterKind,
} from '~/lib/product-filter-ui';
import {ZEHN_HOMEPAGE_STACK_GAP} from '~/lib/homepage-section-styles';
import {HEADER_NAV_ICON_SIZE} from '~/lib/header-nav-styles';
import {cn} from '~/lib/utils';

export type HomepageMobileFilterPanelProps = {
  open: boolean;
  onToggle: () => void;
  selectedPriceRange: string;
  selectedSize: string;
  selectedColor: string;
  availableSizes: string[];
  availableColors: string[];
  onPriceChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onClear: () => void;
  onRemoveChip: (kind: ProductFilterKind) => void;
  className?: string;
};

export function HomepageMobileFilterPanel({
  open,
  onToggle,
  selectedPriceRange,
  selectedSize,
  selectedColor,
  availableSizes,
  availableColors,
  onPriceChange,
  onSizeChange,
  onColorChange,
  onClear,
  onRemoveChip,
  className,
}: HomepageMobileFilterPanelProps) {
  const showClear = isProductFilterActive(
    selectedSize,
    selectedColor,
    selectedPriceRange,
  );

  const toggleLabel = open ? 'Filter ausblenden' : 'Filter einblenden';
  const ToggleIcon = open ? ChevronUp : ChevronDown;

  return (
    <div className={cn('w-full min-w-0', ZEHN_HOMEPAGE_STACK_GAP, className)}>
      <div className={HOMEPAGE_MOBILE_FILTER_HEADER}>
        <p className={HOMEPAGE_MOBILE_FILTER_HEADER_LABEL}>
          <SlidersHorizontal className="w-4 h-4 shrink-0" aria-hidden />
          Produkte filtern
        </p>
        <HeaderNavIconButton
          as="button"
          ariaLabel={toggleLabel}
          ariaExpanded={open}
          onClick={onToggle}
        >
          <ToggleIcon className={HEADER_NAV_ICON_SIZE} aria-hidden />
        </HeaderNavIconButton>
      </div>

      {open && (
        <div className={HOMEPAGE_MOBILE_FILTER_BODY}>
          <CustomSelect
            value={selectedPriceRange}
            onChange={onPriceChange}
            options={[...PRICE_FILTER_OPTIONS]}
            placeholder={PRODUCT_FILTER_PLACEHOLDER.price}
            icon={PRODUCT_FILTER_ICONS.price}
            layout="filter"
            className="w-full"
          />

          {availableSizes.length > 0 && (
            <CustomSelect
              value={selectedSize}
              onChange={onSizeChange}
              options={buildSizeFilterOptions(availableSizes)}
              placeholder={PRODUCT_FILTER_PLACEHOLDER.size}
              icon={PRODUCT_FILTER_ICONS.size}
              layout="filter"
              className="w-full"
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
              className="w-full"
            />
          )}

          {showClear && (
            <FilterClearButton onClick={onClear} className="w-full justify-center" />
          )}

          <ProductFilterActiveChips
            selectedPriceRange={selectedPriceRange}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            onRemove={onRemoveChip}
            onClear={onClear}
          />
        </div>
      )}
    </div>
  );
}
