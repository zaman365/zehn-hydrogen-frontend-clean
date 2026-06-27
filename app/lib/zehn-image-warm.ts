/**
 * Proactive image warm — `new Image()` prefetch (Hero pattern, BL-0020).
 * Dedupes URLs and skips keys already in zehn-image-cache.
 */
import {
  isImageCached,
  markImageCached,
  normalizeImageCacheKey,
} from '~/lib/zehn-image-cache';
import {ZEHN_COLLECTION_GRID_ABOVE_FOLD_LIMIT} from '~/lib/zehn-product-image-loading';

export type ProductWithFeaturedImage = {
  featuredImage?: {url?: string | null} | null;
};

/** Collect featuredImage.url from product nodes. */
export function collectFeaturedImageUrls(
  products: ProductWithFeaturedImage[],
): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  for (const product of products) {
    const url = product?.featuredImage?.url;
    if (!url) continue;
    const key = normalizeImageCacheKey(url);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    urls.push(url);
  }

  return urls;
}

/** Start browser fetch for URLs not yet cached; marks cache on load. */
export function warmImageUrls(urls: string[]): void {
  if (typeof window === 'undefined') return;

  for (const url of urls) {
    const key = normalizeImageCacheKey(url);
    if (!key || isImageCached(key)) continue;

    const img = new Image();
    img.onload = () => {
      markImageCached(img.currentSrc || img.src || url);
    };
    img.src = url;
  }
}

/**
 * Pull product nodes from catalog loader payloads.
 * Supports collections.all `{ products: { nodes } }` and
 * collections.$handle `{ collection: { products: { nodes } } }`.
 */
export function extractCatalogProducts(data: unknown): ProductWithFeaturedImage[] {
  if (!data || typeof data !== 'object') return [];

  const record = data as Record<string, unknown>;

  const directProducts = record.products;
  if (
    directProducts &&
    typeof directProducts === 'object' &&
    'nodes' in directProducts &&
    Array.isArray((directProducts as {nodes?: unknown}).nodes)
  ) {
    return (directProducts as {nodes: ProductWithFeaturedImage[]}).nodes;
  }

  const collection = record.collection;
  if (
    collection &&
    typeof collection === 'object' &&
    'products' in collection
  ) {
    const collectionProducts = (collection as {products?: unknown}).products;
    if (
      collectionProducts &&
      typeof collectionProducts === 'object' &&
      'nodes' in collectionProducts &&
      Array.isArray((collectionProducts as {nodes?: unknown}).nodes)
    ) {
      return (collectionProducts as {nodes: ProductWithFeaturedImage[]}).nodes;
    }
  }

  return [];
}

/** Warm above-fold featured images from loader data — client-only, before React paint. */
export function warmCatalogLoaderProducts(
  data: unknown,
  limit: number = ZEHN_COLLECTION_GRID_ABOVE_FOLD_LIMIT,
): void {
  if (typeof window === 'undefined') return;

  const products = extractCatalogProducts(data);
  if (products.length === 0) return;

  warmImageUrls(collectFeaturedImageUrls(products.slice(0, limit)));
}
