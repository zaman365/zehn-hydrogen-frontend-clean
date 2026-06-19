import {CATEGORY_LABELS} from './category-map';

type ProductCategoryFields = {
  handle?: string | null;
  productType?: string | null;
  tags?: string[] | null;
  title?: string | null;
};

const CATEGORY_ALIASES: Record<string, string> = {
  'alle-cargo-shorts': 'cargo-shorts',
  'alle-chino-shorts': 'chino-shorts',
  'alle-cargohosen': 'cargohosen',
  'alle-chinohosen': 'chinohosen',
  'alle-hosen': 'hosen',
  'alle-jacken': 'jacken',
  'alle-jeans': 'jeans',
  'alle-poloshirts': 'poloshirts',
  'alle-shorts': 'shorts',
  'alle-t-shirts': 't-shirts',
  'alle-tops': 'tops',
  'alle-uebergangsjacken': 'uebergangsjacken',
  'alle-winterjacken': 'winterjacken',
  chinos: 'chinohosen',
  cargos: 'cargohosen',
  kurze: 'shorts',
  ubergangsjacken: 'uebergangsjacken',
  übergangsjacken: 'uebergangsjacken',
};

export function normalizeCategoryText(value: string | null | undefined) {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/ü/g, 'ue')
    .replace(/ö/g, 'oe')
    .replace(/ä/g, 'ae')
    .replace(/ß/g, 'ss');
}

export function normalizeCategoryHandle(category: string) {
  const normalized = normalizeCategoryText(category);
  return CATEGORY_ALIASES[normalized] ?? normalized;
}

export function resolveKnownCategoryHandle(
  category: string | null | undefined,
) {
  const normalizedCategory = normalizeCategoryHandle(category ?? '');

  if (
    Object.prototype.hasOwnProperty.call(CATEGORY_LABELS, normalizedCategory)
  ) {
    return normalizedCategory;
  }

  return null;
}

function getSearchableValues(product: ProductCategoryFields) {
  return [
    product.productType,
    product.title,
    product.handle,
    ...(product.tags ?? []),
  ]
    .map(normalizeCategoryText)
    .filter(Boolean);
}

function productHas(searchableValues: string[], ...keywords: string[]) {
  const normalizedKeywords = keywords.map(normalizeCategoryText);

  return searchableValues.some((value) =>
    normalizedKeywords.some((keyword) => keyword && value.includes(keyword)),
  );
}

function productHasExact(searchableValues: string[], category: string) {
  const normalizedCategory = normalizeCategoryHandle(category);
  return searchableValues.some((value) => value === normalizedCategory);
}

export function productMatchesCategory(
  product: ProductCategoryFields,
  category: string,
) {
  const normalizedCategory = normalizeCategoryHandle(category);
  const searchableValues = getSearchableValues(product);

  if (productHasExact(searchableValues, normalizedCategory)) return true;

  switch (normalizedCategory) {
    case 'shorts':
      return productHas(
        searchableValues,
        'short',
        'shorts',
        'bermuda',
        'kurze',
      );

    case 'cargo-shorts':
      return (
        productHas(searchableValues, 'cargo') &&
        productHas(searchableValues, 'short', 'shorts', 'kurze')
      );

    case 'chino-shorts':
      return (
        (productHas(searchableValues, 'chino') &&
          productHas(searchableValues, 'short', 'shorts', 'kurze')) ||
        productHas(searchableValues, 'chino-short', 'chinoshort')
      );

    case 'hosen':
      return (
        productHas(
          searchableValues,
          'hose',
          'hosen',
          'pant',
          'pants',
          'trouser',
        ) ||
        productHas(searchableValues, 'cargohose', 'chinohose') ||
        productHas(searchableValues, 'cargo', 'chino', 'jeans', 'jean', 'denim')
      );

    case 'cargohosen':
      return (
        productHas(searchableValues, 'cargohose', 'cargo-hose', 'cargohosen') ||
        (productHas(searchableValues, 'cargo') &&
          !productHas(searchableValues, 'short', 'shorts', 'kurze'))
      );

    case 'chinohosen':
      return (
        productHas(searchableValues, 'chinohose', 'chino-hose', 'chinohosen') ||
        (productHas(searchableValues, 'chino') &&
          !productHas(searchableValues, 'short', 'shorts', 'kurze'))
      );

    case 'jeans':
      return productHas(searchableValues, 'jeans', 'jean', 'denim');

    case 'jacken':
      return productHas(
        searchableValues,
        'jack',
        'jacke',
        'jacket',
        'coat',
        'uebergangsjacke',
        'winterjacke',
        'puffer',
      );

    case 'uebergangsjacken':
      return (
        productHas(
          searchableValues,
          'uebergangsjacke',
          'uebergangsjacken',
          'uebergang',
          'transition',
          'spring',
          'herbst',
          'autumn',
        ) ||
        (productHas(searchableValues, 'jack', 'jacke', 'jacket', 'coat') &&
          !productHas(searchableValues, 'winter', 'puffer', 'down', 'daunen'))
      );

    case 'winterjacken':
      return (
        productHas(
          searchableValues,
          'winterjacke',
          'winterjacken',
          'puffer',
          'down',
          'daunen',
        ) ||
        (productHas(searchableValues, 'jack', 'jacke', 'jacket', 'coat') &&
          productHas(searchableValues, 'winter'))
      );

    case 'tops':
      return productHas(
        searchableValues,
        'shirt',
        'hemd',
        'oberteil',
        'top',
        'tops',
        'polo',
        'poloshirt',
        'polo-shirt',
        'polohemd',
        't-shirt',
        'tshirt',
        'tee',
        'sweatshirt',
        'sweater',
        'hoodie',
      );

    case 't-shirts':
      return (
        productHas(searchableValues, 't-shirt', 'tshirt', 'tee') ||
        (productHas(searchableValues, 'shirt') &&
          !productHas(searchableValues, 'polo', 'poloshirt', 'polohemd'))
      );

    case 'poloshirts':
      return productHas(
        searchableValues,
        'polo',
        'poloshirt',
        'poloshirts',
        'polo-shirt',
        'polohemd',
        'polohemden',
      );

    default:
      return productHasExact(searchableValues, normalizedCategory);
  }
}
