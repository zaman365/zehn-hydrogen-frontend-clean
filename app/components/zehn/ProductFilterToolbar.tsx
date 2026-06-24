/**
 * Catalog filter toolbar — mobile collapsible stack + desktop single row (ART-0040 / ART-0048).
 * Shared by homepage ProductGrid and collection routes (REQ-0008).
 */
import {DesktopProductFilterRow} from '~/components/zehn/DesktopProductFilterRow';
import {HomepageMobileFilterPanel} from '~/components/zehn/HomepageMobileFilterPanel';
import {ProductFilterActiveChips} from '~/components/zehn/ProductFilterActiveChips';
import {ProductSortMetaRow} from '~/components/zehn/ProductSortMetaRow';
import {useProductFilterStackOpen} from '~/hooks/useHomepageFilterStackOpen';
import {
  FILTER_TOOLBAR_BAND_A_MOBILE,
  HOMEPAGE_FILTER_SEPARATOR,
  PRODUCT_FILTER_TOOLBAR_DESKTOP,
  PRODUCT_FILTER_TOOLBAR_DESKTOP_ROW_PRIMARY,
  PRODUCT_FILTER_TOOLBAR_SHELL,
  type ProductFilterKind,
} from '~/lib/product-filter-ui';

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
  const {open, toggle} = useProductFilterStackOpen(true);

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
    <div className={PRODUCT_FILTER_TOOLBAR_SHELL}>
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

      <div className={PRODUCT_FILTER_TOOLBAR_DESKTOP}>
        <div className={PRODUCT_FILTER_TOOLBAR_DESKTOP_ROW_PRIMARY}>
          <DesktopProductFilterRow
            {...filterRowProps}
            showClearButton={false}
          />
          <ProductSortMetaRow
            productCount={productCount}
            sortBy={sortBy}
            onSortChange={onSortChange}
            className="shrink-0"
          />
        </div>
        <ProductFilterActiveChips {...chipProps} />
      </div>
    </div>
  );
}
