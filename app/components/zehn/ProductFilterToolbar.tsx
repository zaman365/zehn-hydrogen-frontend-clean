/**
 * Homepage filter toolbar — mobile collapsible stack + desktop single row (ART-0040 / ART-0048).
 */
import {DesktopProductFilterRow} from '~/components/zehn/DesktopProductFilterRow';
import {HomepageMobileFilterPanel} from '~/components/zehn/HomepageMobileFilterPanel';
import {ProductFilterActiveChips} from '~/components/zehn/ProductFilterActiveChips';
import {ProductSortMetaRow} from '~/components/zehn/ProductSortMetaRow';
import {useHomepageFilterStackOpen} from '~/hooks/useHomepageFilterStackOpen';
import {ZEHN_HOMEPAGE_INSET_PY} from '~/lib/homepage-section-styles';
import {
  FILTER_TOOLBAR_BAND_A_MOBILE,
  HOMEPAGE_FILTER_SEPARATOR,
  HOMEPAGE_FILTER_TOOLBAR_DESKTOP,
  HOMEPAGE_FILTER_TOOLBAR_DESKTOP_LEFT,
  HOMEPAGE_FILTER_TOOLBAR_SHELL,
  type ProductFilterKind,
} from '~/lib/product-filter-ui';
import {cn} from '~/lib/utils';

export type ProductFilterToolbarProps = {
  selectedPriceRange: string;
  selectedSize: string;
  selectedColor: string;
  availableSizes: string[];
  availableColors: string[];
  sortBy: string;
  productCount: number;
  onPriceChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onClear: () => void;
  onRemoveChip: (kind: ProductFilterKind) => void;
};

export function ProductFilterToolbar({
  selectedPriceRange,
  selectedSize,
  selectedColor,
  availableSizes,
  availableColors,
  sortBy,
  productCount,
  onPriceChange,
  onSizeChange,
  onColorChange,
  onSortChange,
  onClear,
  onRemoveChip,
}: ProductFilterToolbarProps) {
  const {open, toggle} = useHomepageFilterStackOpen(true);

  const filterRowProps = {
    selectedPriceRange,
    selectedSize,
    selectedColor,
    availableSizes,
    availableColors,
    onPriceChange,
    onSizeChange,
    onColorChange,
    onClear,
  };

  const chipProps = {
    selectedPriceRange,
    selectedSize,
    selectedColor,
    onRemove: onRemoveChip,
    onClear,
  };

  return (
    <div className={cn(HOMEPAGE_FILTER_TOOLBAR_SHELL, ZEHN_HOMEPAGE_INSET_PY)}>
      <div className={FILTER_TOOLBAR_BAND_A_MOBILE}>
        <HomepageMobileFilterPanel
          open={open}
          onToggle={toggle}
          {...filterRowProps}
          onRemoveChip={onRemoveChip}
        />
        <div className={HOMEPAGE_FILTER_SEPARATOR} aria-hidden />
        <ProductSortMetaRow
          productCount={productCount}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      </div>

      <div className={HOMEPAGE_FILTER_TOOLBAR_DESKTOP}>
        <div className={HOMEPAGE_FILTER_TOOLBAR_DESKTOP_LEFT}>
          <DesktopProductFilterRow
            {...filterRowProps}
            showClearButton={false}
          />
          <ProductFilterActiveChips
            {...chipProps}
            className="flex-wrap lg:inline-flex"
          />
        </div>
        <ProductSortMetaRow
          productCount={productCount}
          sortBy={sortBy}
          onSortChange={onSortChange}
          className="shrink-0"
        />
      </div>
    </div>
  );
}
