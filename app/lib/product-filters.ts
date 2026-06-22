type ProductLike = {
  options?: Array<{
    name?: string | null;
    optionValues?: Array<{name?: string | null} | null> | null;
  } | null> | null;
  priceRange?: {
    minVariantPrice?: {amount?: string | null} | null;
    maxVariantPrice?: {amount?: string | null} | null;
  } | null;
  variants?: {
    nodes?: Array<{
      price?: {amount?: string | null} | null;
      selectedOptions?: Array<{name?: string | null; value?: string | null} | null> | null;
    } | null> | null;
  } | null;
};

type FilterKind = 'size' | 'color';

type SelectedProductFilters = {
  size?: string;
  color?: string;
  priceRange?: string;
};

function normalizeFilterValue(value: string | null | undefined) {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/ü/g, 'ue')
    .replace(/ö/g, 'oe')
    .replace(/ä/g, 'ae')
    .replace(/ß/g, 'ss');
}

function isOptionKind(name: string | null | undefined, kind: FilterKind) {
  const normalizedName = normalizeFilterValue(name);

  if (kind === 'size') {
    return ['size', 'groesse', 'grösse', 'grosse'].includes(normalizedName);
  }

  return ['color', 'colour', 'farbe'].includes(normalizedName);
}

function valuesMatch(left: string | null | undefined, right: string | null | undefined) {
  return normalizeFilterValue(left) === normalizeFilterValue(right);
}

function uniqueSorted(values: string[]) {
  const uniqueValues = new Map<string, string>();

  values.forEach((value) => {
    const trimmedValue = value.trim();
    const normalizedValue = normalizeFilterValue(trimmedValue);
    if (!trimmedValue || !normalizedValue || uniqueValues.has(normalizedValue)) return;

    uniqueValues.set(normalizedValue, trimmedValue);
  });

  return Array.from(uniqueValues.values()).sort((left, right) =>
    left.localeCompare(right, 'de', {numeric: true}),
  );
}

function isWaistOptionName(name: string | null | undefined) {
  const normalizedName = normalizeFilterValue(name);
  return ['waist', 'bund', 'bundweite', 'taillenweite'].includes(normalizedName);
}

function isLengthOptionName(name: string | null | undefined) {
  const normalizedName = normalizeFilterValue(name);
  return [
    'length',
    'inseam',
    'laenge',
    'beinlaenge',
    'beinlänge',
    'länge',
  ].includes(normalizedName);
}

/** Pants display label — e.g. 28 + 30 → "28W / 30L". */
export function formatPantSizeLabel(waist: string, length: string) {
  const waistDigits = waist.replace(/\D/g, '');
  const lengthDigits = length.replace(/\D/g, '');
  const waistPart = /\d+W/i.test(waist)
    ? waist.trim().toUpperCase().replace(/\s+/g, '')
    : `${waistDigits}W`;
  const lengthPart = /\d+L/i.test(length)
    ? length.trim().toUpperCase().replace(/\s+/g, '')
    : `${lengthDigits}L`;
  return `${waistPart} / ${lengthPart}`;
}

function getCompositeSizesFromVariants(product: ProductLike) {
  const values: string[] = [];

  product.variants?.nodes?.forEach((variant) => {
    let waist: string | undefined;
    let length: string | undefined;
    let singleSize: string | undefined;

    variant?.selectedOptions?.forEach((option) => {
      if (!option?.value || option.value === 'Default Title') return;

      if (isOptionKind(option.name, 'size')) {
        singleSize = option.value;
      } else if (isWaistOptionName(option.name)) {
        waist = option.value;
      } else if (isLengthOptionName(option.name)) {
        length = option.value;
      }
    });

    if (waist && length) {
      values.push(formatPantSizeLabel(waist, length));
    } else if (singleSize) {
      values.push(singleSize);
    }
  });

  return values;
}

function collectOptionValues(product: ProductLike, kind: FilterKind) {
  const values: string[] = [];

  product.options?.forEach((option) => {
    if (!isOptionKind(option?.name, kind)) return;

    option?.optionValues?.forEach((value) => {
      if (value?.name && value.name !== 'Default Title') {
        values.push(value.name);
      }
    });
  });

  return values;
}

function collectVariantOptionValues(product: ProductLike, kind: FilterKind) {
  const values: string[] = [];

  product.variants?.nodes?.forEach((variant) => {
    variant?.selectedOptions?.forEach((option) => {
      if (isOptionKind(option?.name, kind) && option?.value && option.value !== 'Default Title') {
        values.push(option.value);
      }
    });
  });

  return values;
}

export function getProductOptionValues(product: ProductLike, kind: FilterKind) {
  const fromOptions = collectOptionValues(product, kind);

  if (kind === 'size') {
    if (fromOptions.length > 0) {
      return uniqueSorted(fromOptions);
    }

    const compositeSizes = getCompositeSizesFromVariants(product);
    if (compositeSizes.length > 0) {
      return uniqueSorted(compositeSizes);
    }

    return uniqueSorted(collectVariantOptionValues(product, kind));
  }

  if (fromOptions.length > 0) {
    return uniqueSorted(fromOptions);
  }

  return uniqueSorted(collectVariantOptionValues(product, kind));
}

export function getAvailableProductFilterValues(products: ProductLike[], kind: FilterKind) {
  return uniqueSorted(products.flatMap((product) => getProductOptionValues(product, kind)));
}

export function getAvailableFilteredProductValues(
  products: ProductLike[],
  kind: FilterKind,
  selectedFilters: SelectedProductFilters = {},
) {
  const filtersForOption =
    kind === 'size'
      ? {...selectedFilters, size: undefined}
      : {...selectedFilters, color: undefined};

  return getAvailableProductFilterValues(
    products.filter((product) =>
      productMatchesSelectedFilters(product, filtersForOption),
    ),
    kind,
  );
}

function priceRangeBounds(priceRange: string) {
  switch (priceRange) {
    case '0-50':
      return {min: 0, max: 50};
    case '50-100':
      return {min: 50, max: 100};
    case '100-150':
      return {min: 100, max: 150};
    case '150+':
      return {min: 150, max: Number.POSITIVE_INFINITY};
    default:
      return null;
  }
}

function priceMatchesRange(price: number, priceRange: string | undefined) {
  if (!priceRange) return true;

  const bounds = priceRangeBounds(priceRange);
  if (!bounds) return true;

  if (priceRange === '150+') {
    return price > bounds.min;
  }

  return price >= bounds.min && price <= bounds.max;
}

function variantMatchesOption(
  variant: NonNullable<NonNullable<ProductLike['variants']>['nodes']>[number],
  kind: FilterKind,
  selectedValue: string | undefined,
) {
  if (!selectedValue) return true;

  if (kind === 'size') {
    let waist: string | undefined;
    let length: string | undefined;

    for (const option of variant?.selectedOptions ?? []) {
      if (!option?.value) continue;

      if (isOptionKind(option.name, 'size') && valuesMatch(option.value, selectedValue)) {
        return true;
      }
      if (isWaistOptionName(option.name)) waist = option.value;
      if (isLengthOptionName(option.name)) length = option.value;
    }

    if (waist && length) {
      return valuesMatch(formatPantSizeLabel(waist, length), selectedValue);
    }

    return false;
  }

  return Boolean(
    variant?.selectedOptions?.some(
      (option) => isOptionKind(option?.name, kind) && valuesMatch(option?.value, selectedValue),
    ),
  );
}

function productPriceRangeOverlaps(product: ProductLike, selectedPriceRange: string | undefined) {
  if (!selectedPriceRange) return true;

  const bounds = priceRangeBounds(selectedPriceRange);
  if (!bounds) return true;

  const minPrice = parseFloat(product.priceRange?.minVariantPrice?.amount ?? '0');
  const maxPrice = parseFloat(
    product.priceRange?.maxVariantPrice?.amount ??
      product.priceRange?.minVariantPrice?.amount ??
      '0',
  );

  if (selectedPriceRange === '150+') {
    return maxPrice > bounds.min;
  }

  return maxPrice >= bounds.min && minPrice <= bounds.max;
}

export function productMatchesSelectedFilters(
  product: ProductLike,
  {size, color, priceRange}: SelectedProductFilters,
) {
  const variants = product.variants?.nodes?.filter(Boolean) ?? [];

  if (variants.length > 0) {
    return variants.some((variant) => {
      const price = parseFloat(variant?.price?.amount ?? '0');

      return (
        variantMatchesOption(variant, 'size', size) &&
        variantMatchesOption(variant, 'color', color) &&
        priceMatchesRange(price, priceRange)
      );
    });
  }

  const sizeMatches = !size || getProductOptionValues(product, 'size').some((value) => valuesMatch(value, size));
  const colorMatches = !color || getProductOptionValues(product, 'color').some((value) => valuesMatch(value, color));

  return sizeMatches && colorMatches && productPriceRangeOverlaps(product, priceRange);
}
