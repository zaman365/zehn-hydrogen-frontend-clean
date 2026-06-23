/**
 * Product count + sort row — band B below filters (ART-0040 / ART-0047 / ART-0049).
 * Mobile: stack count then full-width sort pill; desktop: inline with facet parity.
 * Sort panel uses content width — trigger pill stays filter-layout; panel fits long labels.
 */
import {CustomSelect} from '~/components/CustomSelect';
import {
  PRODUCT_COUNT_ICON,
  PRODUCT_SORT_COUNT_ROW,
  PRODUCT_SORT_DROPDOWN_WIDTH,
  PRODUCT_SORT_ICONS,
  PRODUCT_SORT_META_ROW,
  PRODUCT_SORT_OPTIONS,
  PRODUCT_SORT_PLACEHOLDER,
  PRODUCT_SORT_SELECT,
} from '~/lib/product-filter-ui';
import {cn} from '~/lib/utils';

export type ProductSortMetaRowProps = {
  productCount: number;
  sortBy: string;
  onSortChange: (value: string) => void;
  className?: string;
};

export function ProductSortMetaRow({
  productCount,
  sortBy,
  onSortChange,
  className,
}: ProductSortMetaRowProps) {
  const countLabel =
    productCount === 1 ? '1 Produkt' : `${productCount} Produkte`;

  const selectedSort = PRODUCT_SORT_OPTIONS.find(
    (option) => option.value === sortBy,
  );
  const sortIcon = selectedSort?.icon ?? PRODUCT_SORT_ICONS[sortBy];
  const CountIcon = PRODUCT_COUNT_ICON;

  return (
    <div className={cn(PRODUCT_SORT_META_ROW, className)}>
      <p className={PRODUCT_SORT_COUNT_ROW}>
        <CountIcon className="w-4 h-4 shrink-0 text-foreground/50" aria-hidden />
        {countLabel}
      </p>
      <CustomSelect
        value={sortBy}
        onChange={onSortChange}
        options={[...PRODUCT_SORT_OPTIONS]}
        icon={sortIcon}
        placeholder={PRODUCT_SORT_PLACEHOLDER}
        layout="filter"
        dropdownWidth={PRODUCT_SORT_DROPDOWN_WIDTH}
        menuAlign="start"
        className={PRODUCT_SORT_SELECT}
      />
    </div>
  );
}
