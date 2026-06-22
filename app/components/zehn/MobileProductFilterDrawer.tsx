/**
 * Mobile collection filter drawer — Preis / Größe / Farbe parity with desktop row (REQ-0008).
 * Shared across collection routes, search, and ProductGrid; client-only (isOpen gated).
 */
import type {ReactNode} from 'react';
import {useEffect} from 'react';
import {X} from 'lucide-react';
import {CustomSelect} from '~/components/CustomSelect';
import {FilterClearButton} from '~/components/zehn/FilterClearButton';
import {useScrollLock} from '~/hooks/useScrollLock';
import {
  buildColorFilterOptions,
  buildSizeFilterOptions,
  MOBILE_FILTER_APPLY_BUTTON,
  MOBILE_FILTER_DRAWER_ACTIONS,
  MOBILE_FILTER_DRAWER_BODY,
  MOBILE_FILTER_DRAWER_FACETS,
  MOBILE_FILTER_DRAWER_SHELL,
  PRICE_FILTER_OPTIONS,
  PRODUCT_FILTER_ICONS,
  PRODUCT_FILTER_PLACEHOLDER,
} from '~/lib/product-filter-ui';
import {cn} from '~/lib/utils';

export type MobileProductFilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedPriceRange: string;
  selectedSize: string;
  selectedColor: string;
  availableSizes: string[];
  availableColors: string[];
  onPriceChange: (value: string) => void;
  onSizeChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onClear: () => void;
  /** Optional sort control — ProductGrid passes sort CustomSelect here. */
  sortSlot?: ReactNode;
  className?: string;
};

export function MobileProductFilterDrawer({
  isOpen,
  onClose,
  selectedPriceRange,
  selectedSize,
  selectedColor,
  availableSizes,
  availableColors,
  onPriceChange,
  onSizeChange,
  onColorChange,
  onClear,
  sortSlot,
  className,
}: MobileProductFilterDrawerProps) {
  useScrollLock(isOpen);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(MOBILE_FILTER_DRAWER_SHELL, className)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-product-filter-title"
    >
      <div className={MOBILE_FILTER_DRAWER_BODY}>
        <div className="flex items-center justify-between mb-8">
          <h2
            id="mobile-product-filter-title"
            className="font-sans text-h2 text-foreground"
          >
            Filter
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground/70 hover:text-foreground"
            aria-label="Filter schließen"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        <div className={MOBILE_FILTER_DRAWER_FACETS}>
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

          {sortSlot}

          <div className={MOBILE_FILTER_DRAWER_ACTIONS}>
            <FilterClearButton
              onClick={onClear}
              className="w-full justify-center"
            />
            <button type="button" onClick={onClose} className={MOBILE_FILTER_APPLY_BUTTON}>
              Anwenden
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
