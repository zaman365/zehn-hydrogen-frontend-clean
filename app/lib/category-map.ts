// Centralized mapping between UI categories and Shopify collection handles.
// Keys must match the actual Shopify collection handle exactly.

export const MAIN_CATEGORY_MAP: Record<string, string[]> = {
  shorts: ['cargo-shorts', 'chino-shorts'],
  hosen: ['cargohosen', 'chinohosen', 'jeans'],
  jeans: [],
  jacken: ['uebergangsjacken', 'winterjacken'],
  tops: ['t-shirts', 'poloshirts'],
};

export const CATEGORY_LABELS: Record<string, string> = {
  shorts: 'SHORTS',
  'cargo-shorts': 'CARGO-SHORTS',
  'chino-shorts': 'CHINO-SHORTS',
  hosen: 'HOSEN',
  cargohosen: 'CARGOHOSEN',
  chinohosen: 'CHINOHOSEN',
  jeans: 'JEANS',
  jacken: 'JACKEN',
  uebergangsjacken: 'ÜBERGANGSJACKEN',
  winterjacken: 'WINTERJACKEN',
  tops: 'TOPS',
  't-shirts': 'T-SHIRTS',
  poloshirts: 'POLOSHIRTS',
};

// Keys map 1:1 to Shopify collection handles.
export const CATEGORY_HANDLES: Record<string, string> = Object.fromEntries(
  Object.keys(CATEGORY_LABELS).map((k) => [k, k]),
);

// Maps alle-* nav handles to their parent category handle (main + subcategory entries)
export const ALLE_PARENT_MAP: Record<string, string> = {
  'alle-shorts': 'shorts',
  'alle-hosen': 'hosen',
  'alle-jeans': 'jeans',
  'alle-jacken': 'jacken',
  'alle-tops': 'tops',
  'alle-cargo-shorts': 'cargo-shorts',
  'alle-chino-shorts': 'chino-shorts',
  'alle-cargohosen': 'cargohosen',
  'alle-chinohosen': 'chinohosen',
  'alle-uebergangsjacken': 'uebergangsjacken',
  'alle-winterjacken': 'winterjacken',
  'alle-t-shirts': 't-shirts',
  'alle-poloshirts': 'poloshirts',
};

export function resolveAlleCategory(handle: string): string | null {
  return ALLE_PARENT_MAP[handle] ?? null;
}

export function getCategoryLabel(slug: string): string {
  const parent = resolveAlleCategory(slug);
  if (parent) return CATEGORY_LABELS[parent] ?? parent.toUpperCase();
  return CATEGORY_LABELS[slug] ?? slug.toUpperCase();
}

export function getCategoryUrl(category: string): string {
  const handle = CATEGORY_HANDLES[category] ?? category;
  return `/collections/${handle}`;
}

export function getCollectionRootSlug(
  source: string | null | undefined,
  fallback = 'shop-all',
): string {
  if (!source) return fallback;

  let pathOrHandle = source.toLowerCase();
  try {
    pathOrHandle = new URL(source).pathname.toLowerCase();
  } catch {
    // `source` may already be a path or a Shopify collection handle.
  }

  const pathMatch = pathOrHandle.match(/(?:^|\/)collections\/([^/?#]+)/);
  const handle = pathMatch?.[1] ?? pathOrHandle.replace(/^\/+|\/+$/g, '');

  if (handle === 'neuheiten' || handle === 'new-arrival') return 'neuheiten';
  if (handle === 'bestseller') return 'bestseller';
  if (handle === 'sale') return 'sale';
  if (handle === 'shop-all' || handle === 'all') return 'shop-all';

  return fallback;
}

export function isMainCategory(category: string): boolean {
  return Object.prototype.hasOwnProperty.call(MAIN_CATEGORY_MAP, category);
}

export function getSubcategories(main: string): string[] {
  return MAIN_CATEGORY_MAP[main] ?? [];
}

export default MAIN_CATEGORY_MAP;
