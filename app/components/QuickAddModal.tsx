import {useState, useEffect, useCallback, useRef} from 'react';
import {createPortal} from 'react-dom';
import {type FetcherWithComponents} from 'react-router';
import {CartForm, Money} from '@shopify/hydrogen';
import {X, Check, Loader2} from 'lucide-react';
import {
  fireMetaAddToCart,
  type MetaProductEvent,
} from '~/components/zehn/MetaPixelEvents';
import {useScrollLock} from '~/hooks/useScrollLock';
import {ZEHN_SCROLL_EDGE} from '~/lib/zehn-scrollbar-styles';
import {cn} from '~/lib/utils';

/**
 * QuickAddModal – bottom-sheet / modal overlay for quickly adding products
 * to cart from collection or listing pages.
 *
 * Props (see QuickAddModalProps type below for full shape):
 *  - isOpen: boolean
 *  - onClose: () => void
 *  - product: Shopify product object with options, variants, images, price
 */

interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

interface SelectedOption {
  name: string;
  value: string;
}

interface VariantNode {
  id: string;
  availableForSale: boolean;
  title: string;
  image?: {url: string; altText?: string | null} | null;
  price: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
  selectedOptions: SelectedOption[];
}

interface OptionValue {
  name: string;
  firstSelectableVariant?: {
    id: string;
    availableForSale: boolean;
    image?: {url: string; altText?: string | null} | null;
    price: MoneyV2;
    compareAtPrice?: MoneyV2 | null;
    selectedOptions: SelectedOption[];
  } | null;
  swatch?: {
    color?: string | null;
    image?: {previewImage?: {url: string} | null} | null;
  } | null;
}

interface ProductOption {
  name: string;
  optionValues: OptionValue[];
}

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    handle: string;
    title: string;
    featuredImage?: {
      url: string;
      altText?: string | null;
      width?: number;
      height?: number;
    } | null;
    options?: ProductOption[];
    variants?: {
      nodes: VariantNode[];
    };
    selectedOrFirstAvailableVariant?: {
      id: string;
      availableForSale: boolean;
      price: MoneyV2;
      compareAtPrice?: MoneyV2 | null;
      selectedOptions: SelectedOption[];
    } | null;
    priceRange?: {
      minVariantPrice: MoneyV2;
    };
  };
}

/** Check whether the product has meaningful options (more than just "Default Title"). */
function hasRealOptions(options?: ProductOption[]): boolean {
  if (!options || options.length === 0) return false;
  // A single option with a single value named "Default Title" is not real
  if (
    options.length === 1 &&
    (options[0].optionValues?.length ?? 0) <= 1 &&
    options[0].optionValues?.[0]?.name === 'Default Title'
  ) {
    return false;
  }
  return options.some((opt) => (opt.optionValues?.length ?? 0) > 1);
}

/** Find variant matching selected options exactly. */
function findMatchingVariant(
  variants: VariantNode[],
  selectedOptions: Record<string, string>,
): VariantNode | undefined {
  return variants.find((variant) =>
    variant.selectedOptions.every(
      (so) => selectedOptions[so.name] === so.value,
    ),
  );
}

/** Determine whether a specific option value is available given current selections. */
function isOptionValueAvailable(
  optionName: string,
  optionValue: string,
  currentSelections: Record<string, string>,
  variants: VariantNode[],
): boolean {
  const testSelections = {...currentSelections, [optionName]: optionValue};
  return variants.some(
    (v) =>
      v.availableForSale &&
      v.selectedOptions.every((so) => testSelections[so.name] === so.value),
  );
}

/**
 * CartAddTracker – null-render sibling that detects fetcher state transitions
 * via useRef + useEffect. Never calls setState during render (React 18 safe).
 * Mirrors MetaCartAddTracker pattern from AddToCartButton.tsx.
 */
function CartAddTracker({
  fetcher,
  onAdded,
  metaProduct,
}: {
  fetcher: FetcherWithComponents<any>;
  onAdded: () => void;
  metaProduct?: MetaProductEvent;
}) {
  const prevStateRef = useRef(fetcher.state);

  useEffect(() => {
    const wasSubmitting = prevStateRef.current !== 'idle';
    const isNowIdle = fetcher.state === 'idle';
    const hasData = Boolean(fetcher.data);
    const noErrors = !fetcher.data?.errors?.length;

    if (wasSubmitting && isNowIdle && hasData) {
      if (noErrors && metaProduct) {
        fireMetaAddToCart(metaProduct);
      }
      onAdded();
    }

    prevStateRef.current = fetcher.state;
  }, [fetcher.state, fetcher.data, metaProduct, onAdded]);

  return null;
}

/**
 * AddToCartForm – wraps CartForm, delegates state-transition detection to
 * CartAddTracker so zero setState calls happen inside the render prop.
 */
function AddToCartForm({
  selectedVariantId,
  selectedVariant,
  isAvailable,
  onClose,
  metaProduct,
}: {
  selectedVariantId: string;
  /** selectedVariant required for useOptimisticCart immediate badge/drawer feedback */
  selectedVariant?: Record<string, unknown>;
  isAvailable: boolean;
  onClose: () => void;
  metaProduct?: MetaProductEvent;
}) {
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up close-delay timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const handleAdded = useCallback(() => {
    setAdded(true);
    timerRef.current = setTimeout(() => {
      onClose();
      setAdded(false);
    }, 800);
  }, [onClose]);

  return (
    <CartForm
      route="/cart"
      inputs={{
        lines: [{merchandiseId: selectedVariantId, quantity: 1, selectedVariant}],
      }}
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher) => {
        const isSubmitting = fetcher.state !== 'idle';
        return (
          <>
            {/* Tracker is a null render — no setState in render prop */}
            <CartAddTracker
              fetcher={fetcher}
              onAdded={handleAdded}
              metaProduct={metaProduct}
            />
            <button
              type="submit"
              disabled={!isAvailable || isSubmitting || !selectedVariantId || added}
              className={`
                w-full rounded-full py-4 font-sans text-sm uppercase tracking-wider
                transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2
                ${
                  added
                    ? 'bg-green-600 text-white'
                    : isAvailable && selectedVariantId
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98]'
                      : 'bg-foreground/20 text-foreground/40 cursor-not-allowed'
                }
              `}
              data-testid="quick-add-to-cart-button"
            >
              {added ? (
                <span className="inline-flex items-center gap-2">
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Hinzugefügt!
                </span>
              ) : isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Wird hinzugefügt…
                </span>
              ) : !isAvailable ? (
                'Ausverkauft'
              ) : (
                'In den Warenkorb'
              )}
            </button>
          </>
        );
      }}
    </CartForm>
  );
}

export function QuickAddModal({isOpen, onClose, product}: QuickAddModalProps) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const variants = product.variants?.nodes ?? [];
  const defaultVariant = product.selectedOrFirstAvailableVariant;

  const getInitialSelections = (): Record<string, string> => {
    const map: Record<string, string> = {};
    if (defaultVariant?.selectedOptions) {
      for (const so of defaultVariant.selectedOptions) {
        map[so.name] = so.value;
      }
    } else if (variants.length > 0) {
      for (const so of (variants[0]?.selectedOptions ?? [])) {
        map[so.name] = so.value;
      }
    }
    return map;
  };

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >(getInitialSelections);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Reset selections when product changes
  useEffect(() => {
    setSelectedOptions(getInitialSelections());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // Mount / unmount animation orchestration
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Defer to next frame so the enter animation triggers
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useScrollLock(isOpen);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);


  // ---------------------------------------------------------------------------
  // Derived
  // ---------------------------------------------------------------------------
  const showOptions = hasRealOptions(product.options);
  const matchedVariant = findMatchingVariant(variants, selectedOptions);
  const activeVariant = matchedVariant ?? defaultVariant;
  const isAvailable = activeVariant?.availableForSale ?? false;
  const selectedVariantId = activeVariant?.id ?? '';

  const displayPrice = activeVariant?.price ??
    product.priceRange?.minVariantPrice ?? {amount: '0', currencyCode: 'EUR'};
  const compareAtPrice = activeVariant?.compareAtPrice ?? null;
  const isOnSale = Boolean(
    compareAtPrice &&
      parseFloat(compareAtPrice.amount) > 0 &&
      parseFloat(compareAtPrice.amount) > parseFloat(displayPrice.amount),
  );

  const imageUrl =
    product.featuredImage?.url ?? '/placeholder-product.webp';
  const imageAlt =
    product.featuredImage?.altText ?? product.title;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleOptionSelect = useCallback(
    (optionName: string, value: string) => {
      setSelectedOptions((prev) => ({...prev, [optionName]: value}));
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  /** Render a color swatch button. */
  function renderColorSwatch(
    ov: OptionValue,
    optionName: string,
    isSelected: boolean,
    available: boolean,
  ) {
    const swatchColor = ov.swatch?.color;
    const swatchImageUrl = ov.swatch?.image?.previewImage?.url;
    const letter = ov.name.charAt(0).toUpperCase();

    return (
      <button
        key={ov.name}
        type="button"
        aria-label={`${optionName}: ${ov.name}${!available ? ' (ausverkauft)' : ''}`}
        aria-pressed={isSelected}
        disabled={!available}
        onClick={() => handleOptionSelect(optionName, ov.name)}
        className={`
          relative flex items-center justify-center
          w-11 h-11 rounded-full border-2 transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2
          ${isSelected ? 'border-foreground scale-110' : 'border-border/50 hover:border-foreground/40'}
          ${!available ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
        `}
        data-testid={`option-swatch-${optionName}-${ov.name}`}
      >
        {swatchImageUrl ? (
          <img
            src={swatchImageUrl}
            alt={ov.name}
            className="w-8 h-8 rounded-full object-cover"
            loading="lazy"
          />
        ) : swatchColor ? (
          <span
            className="w-8 h-8 rounded-full block"
            style={{backgroundColor: swatchColor}}
          />
        ) : (
          <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-sans text-muted">
            {letter}
          </span>
        )}
        {isSelected && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Check
              className="w-4 h-4 text-primary-foreground drop-shadow-md"
              strokeWidth={3}
              aria-hidden="true"
            />
          </span>
        )}
        {!available && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="block w-[2px] h-10 bg-foreground/40 rotate-45 rounded-full" />
          </span>
        )}
      </button>
    );
  }

  /** Render a pill / chip button for non-color options. */
  function renderPillOption(
    ov: OptionValue,
    optionName: string,
    isSelected: boolean,
    available: boolean,
  ) {
    return (
      <button
        key={ov.name}
        type="button"
        aria-label={`${optionName}: ${ov.name}${!available ? ' (ausverkauft)' : ''}`}
        aria-pressed={isSelected}
        disabled={!available}
        onClick={() => handleOptionSelect(optionName, ov.name)}
        className={`
          px-4 py-2 rounded-full text-sm font-sans transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2
          ${
            isSelected
              ? 'bg-foreground text-primary-foreground'
              : 'bg-card text-foreground border border-border/50 hover:border-foreground/40'
          }
          ${!available ? 'opacity-30 cursor-not-allowed line-through' : 'cursor-pointer'}
        `}
        data-testid={`option-pill-${optionName}-${ov.name}`}
      >
        {ov.name}
      </button>
    );
  }

  // ---------------------------------------------------------------------------
  // Portal render
  // ---------------------------------------------------------------------------
  if (!mounted) return null;

  const isColorOption = (name: string) =>
    /^(color|colour|farbe)$/i.test(name);

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${product.title} – Schnellansicht`}
      className={`
        fixed inset-0 z-50 flex items-end justify-center
        transition-opacity duration-300
        ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
      data-testid="quick-add-modal-backdrop"
    >
      {/* Backdrop — click target only; aria-hidden valid because onMouseDown preventDefault stops focus transfer */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
        onMouseDown={(e) => e.preventDefault()}
      />

      {/* Modal card */}
      <div
        className={`
          relative z-10 w-full sm:max-w-md bg-background rounded-t-3xl
          shadow-2xl overflow-hidden
          transition-all duration-300 ease-out
          ${
            visible
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0'
          }
        `}
        role="document"
        data-testid="quick-add-modal-card"
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden" aria-hidden="true">
          <span className="block w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="
            absolute top-4 right-4 z-20
            w-8 h-8 flex items-center justify-center
            rounded-full bg-card text-foreground hover:bg-foreground hover:text-primary-foreground
            transition-colors duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2
          "
          data-testid="quick-add-modal-close"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Content */}
        <div className={cn('p-6 pt-4 sm:pt-6 max-h-[85vh] overflow-y-auto', ZEHN_SCROLL_EDGE)}>
          {/* Product header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-white overflow-hidden">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-contain"
                loading="eager"
                width={80}
                height={80}
              />
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <h2 className="font-sans text-base text-foreground leading-tight line-clamp-2">
                {product.title}
              </h2>

              <div className="mt-1 flex items-center gap-2 font-sans text-sm">
                <Money
                  data={displayPrice as any}
                  className={`font-medium ${isOnSale ? 'text-accent' : 'text-foreground'}`}
                />
                {isOnSale && (
                    <Money
                      data={compareAtPrice as any}
                      className="text-foreground/55 line-through decoration-foreground/40 text-xs"
                    />
                  )}
              </div>
            </div>
          </div>

          {/* Options */}
          {showOptions &&
            product.options?.map((option) => {
              // Skip options with only one value
              if ((option.optionValues?.length ?? 0) <= 1) return null;

              const isColor = isColorOption(option.name);

              return (
                <fieldset key={option.name} className="mb-5">
                  <legend className="font-sans text-xs uppercase tracking-wider text-muted mb-2.5">
                    {option.name}
                    {selectedOptions[option.name] && (
                      <span className="ml-1.5 normal-case tracking-normal text-foreground">
                        — {selectedOptions[option.name]}
                      </span>
                    )}
                  </legend>

                  <div
                    className={`flex flex-wrap ${isColor ? 'gap-2.5' : 'gap-2'}`}
                    role="radiogroup"
                    aria-label={option.name}
                  >
                    {option.optionValues?.map((ov) => {
                      const isSelected =
                        selectedOptions[option.name] === ov.name;
                      const available = isOptionValueAvailable(
                        option.name,
                        ov.name,
                        selectedOptions,
                        variants,
                      );

                      return isColor
                        ? renderColorSwatch(ov, option.name, isSelected, available)
                        : renderPillOption(ov, option.name, isSelected, available);
                    })}
                  </div>
                </fieldset>
              );
            })}

          {/* Add to cart */}
          <div className="mt-6">
            <AddToCartForm
              selectedVariantId={selectedVariantId}
              selectedVariant={
                activeVariant
                  ? {
                      ...activeVariant,
                      // useOptimisticCart needs product.handle+title to build merchandise
                      product: {handle: product.handle, title: product.title},
                    }
                  : undefined
              }
              isAvailable={isAvailable}
              onClose={onClose}
              metaProduct={
                activeVariant
                  ? {
                      contentId: activeVariant.id,
                      contentName: product.title,
                      currency: activeVariant.price.currencyCode,
                      value: Number(activeVariant.price.amount),
                      quantity: 1,
                    }
                  : undefined
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Portal to document.body bypasses any parent CSS transform / stacking context
  // (ProductItem has translate-y + scale transforms that break fixed positioning).
  return createPortal(modalContent, document.body);
}
