// ============================================
// PRODUCT CONTEXT FOR AI SYSTEM PROMPT
// ============================================

/**
 * Fetches products from Shopify Storefront API and formats them
 * as a text summary for the AI system prompt.
 *
 * Falls back to a static catalog if the API call fails.
 */
export async function fetchProductContext(
  storefront: {
    query: (query: string, options?: {variables?: Record<string, unknown>}) => Promise<unknown>;
  }
): Promise<string> {
  try {
    const data = await storefront.query(AI_PRODUCTS_QUERY) as ProductQueryResult;
    const products = data?.products?.nodes;

    if (!products || products.length === 0) {
      return STATIC_PRODUCT_CATALOG;
    }

    return formatProducts(products);
  } catch (error) {
    console.error('[AI Chat] Failed to fetch products, using static fallback:', error);
    return STATIC_PRODUCT_CATALOG;
  }
}

// ============================================
// PRODUCT QUERY
// ============================================

const AI_PRODUCTS_QUERY = `#graphql
  query AIChatProducts {
    products(first: 50, sortKey: BEST_SELLING) {
      nodes {
        id
        title
        description
        productType
        tags
        handle
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 20) {
          nodes {
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

// ============================================
// TYPES
// ============================================

interface ProductVariant {
  title: string;
  availableForSale: boolean;
  price: {amount: string; currencyCode: string};
  selectedOptions: Array<{name: string; value: string}>;
}

interface Product {
  id: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  handle: string;
  priceRange: {
    minVariantPrice: {amount: string; currencyCode: string};
    maxVariantPrice: {amount: string; currencyCode: string};
  };
  variants: {nodes: ProductVariant[]};
}

interface ProductQueryResult {
  products: {nodes: Product[]};
}

// ============================================
// FORMATTER
// ============================================

function formatProducts(products: Product[]): string {
  const lines: string[] = ['Aktuelle ZEHN Produkte im Shop:\n'];

  for (const product of products) {
    const minPrice = parseFloat(product.priceRange.minVariantPrice.amount);
    const maxPrice = parseFloat(product.priceRange.maxVariantPrice.amount);
    const currency = product.priceRange.minVariantPrice.currencyCode;

    const priceStr =
      minPrice === maxPrice
        ? `${minPrice.toFixed(2)}${currency}`
        : `${minPrice.toFixed(2)}–${maxPrice.toFixed(2)}${currency}`;

    // Extract available sizes
    const sizes = new Set<string>();
    const colors = new Set<string>();
    let inStock = false;

    for (const variant of product.variants.nodes) {
      if (variant.availableForSale) inStock = true;
      for (const opt of variant.selectedOptions) {
        if (opt.name.toLowerCase() === 'size' || opt.name.toLowerCase() === 'größe') {
          sizes.add(opt.value);
        }
        if (opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'farbe') {
          colors.add(opt.value);
        }
      }
    }

    lines.push(`• ${product.title}`);
    lines.push(`  Preis: ${priceStr}`);
    if (product.productType) lines.push(`  Kategorie: ${product.productType}`);
    if (sizes.size > 0) lines.push(`  Größen: ${[...sizes].join(', ')}`);
    if (colors.size > 0) lines.push(`  Farben: ${[...colors].join(', ')}`);
    lines.push(`  Verfügbar: ${inStock ? 'Ja' : 'Ausverkauft'}`);
    lines.push(`  Link: /products/${product.handle}`);
    lines.push('');
  }

  return lines.join('\n');
}

// ============================================
// STATIC FALLBACK
// ============================================

const STATIC_PRODUCT_CATALOG = `Aktuelle ZEHN Produkte im Shop:

• ZEHN Signature Polo — Premium Polo Shirt
  Preis: ab 59,90€
  Größen: S, M, L, XL, XXL
  Farben: Schwarz, Navy, Weiß, Olive
  Material: Bio-Baumwolle Piqué
  Link: /collections/all

• ZEHN Cargo Pants — Relaxed Fit Cargo
  Preis: ab 89,90€
  Größen: 28–36
  Farben: Schwarz, Olive, Sand
  Material: Recycled Cotton Twill
  Link: /collections/all

• ZEHN Chino — Slim Fit Chino
  Preis: ab 79,90€
  Größen: 28–36
  Farben: Navy, Beige, Schwarz, Olive
  Material: Bio-Baumwolle Stretch
  Link: /collections/all

• ZEHN Jacket — Utility Jacket
  Preis: ab 129,90€
  Größen: S, M, L, XL, XXL
  Farben: Schwarz, Olive
  Material: Recycled Polyester / Tencel™
  Link: /collections/all
`;
