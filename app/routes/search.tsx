import {useLoaderData} from 'react-router';
import type {Route} from './+types/search';
import {getCachePolicy, CACHE_NONE} from '~/lib/storefront-cache-policy';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {SearchResults} from '~/components/SearchResults';
import {ProductItem} from '~/components/ProductItem';
import {
  type RegularSearchReturn,
  type PredictiveSearchReturn,
  getEmptyPredictiveSearchResult,
} from '~/lib/search';
import type {
  RegularSearchQuery,
  PredictiveSearchQuery,
} from 'storefrontapi.generated';
import {useState, useMemo} from 'react';
import {CustomSelect} from '~/components/CustomSelect';
import {DesktopProductFilterRow} from '~/components/zehn/DesktopProductFilterRow';
import {MobileProductFilterDrawer} from '~/components/zehn/MobileProductFilterDrawer';
import {FILTER_BAR_SHELL} from '~/lib/product-filter-ui';
import {SlidersHorizontal} from 'lucide-react';
import {
  getAvailableFilteredProductValues,
  productMatchesSelectedFilters,
} from '~/lib/product-filters';
import {
  productMatchesCategory,
  resolveKnownCategoryHandle,
} from '~/lib/category-match';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Suche | ZEHN'},
    {
      name: 'description',
      content: 'Durchsuchen Sie das ZEHN Sortiment nach Premium Herrenmode.',
    },
    {name: 'robots', content: 'noindex, follow'},
  ];
};

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const isPredictive = url.searchParams.has('predictive');
  const searchPromise: Promise<PredictiveSearchReturn | RegularSearchReturn> =
    isPredictive
      ? predictiveSearch({request, context})
      : regularSearch({request, context});

  searchPromise.catch((error: Error) => {
    console.error(error);
    return {term: '', result: null, error: error.message};
  });

  return await searchPromise;
}

function productTitleIncludesSearchTerm(product: any, term: string) {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) return true;

  return product.title?.toLowerCase().includes(normalizedTerm) ?? false;
}

/**
 * Renders the /search route - Collections/All Style
 */
export default function SearchPage() {
  const {type, term, result, error} = useLoaderData<typeof loader>();

  const initialProducts = useMemo(
    () => ((result as any)?.items?.products?.nodes || []) as any[],
    [result],
  );
  const pages = (result as any)?.items?.pages?.nodes || [];
  const articles = (result as any)?.items?.articles?.nodes || [];
  const totalResults = (result as any)?.total || 0;

  // State for sorting and filtering
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');

  const categoryScopedProducts = useMemo(() => {
    const searchCategory = resolveKnownCategoryHandle(term);
    if (!searchCategory) return initialProducts;

    return initialProducts.filter((product: any) =>
      productMatchesCategory(product, searchCategory),
    );
  }, [initialProducts, term]);

  const availableSizes = useMemo(
    () =>
      getAvailableFilteredProductValues(
        categoryScopedProducts as any[],
        'size',
        {
          color: selectedColor,
          priceRange: selectedPriceRange,
        },
      ),
    [categoryScopedProducts, selectedColor, selectedPriceRange],
  );

  const availableColors = useMemo(
    () =>
      getAvailableFilteredProductValues(
        categoryScopedProducts as any[],
        'color',
        {
          size: selectedSize,
          priceRange: selectedPriceRange,
        },
      ),
    [categoryScopedProducts, selectedSize, selectedPriceRange],
  );

  const filteredProducts = useMemo(() => {
    return categoryScopedProducts.filter((product: any) =>
      productMatchesSelectedFilters(product, {
        size: selectedSize,
        color: selectedColor,
        priceRange: selectedPriceRange,
      }),
    );
  }, [categoryScopedProducts, selectedSize, selectedColor, selectedPriceRange]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a: any, b: any) => {
          const priceA = parseFloat(
            a.priceRange?.minVariantPrice?.amount || '0',
          );
          const priceB = parseFloat(
            b.priceRange?.minVariantPrice?.amount || '0',
          );
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        sorted.sort((a: any, b: any) => {
          const priceA = parseFloat(
            a.priceRange?.minVariantPrice?.amount || '0',
          );
          const priceB = parseFloat(
            b.priceRange?.minVariantPrice?.amount || '0',
          );
          return priceB - priceA;
        });
        break;
      case 'newest':
        sorted.sort(
          (a: any, b: any) =>
            new Date(b.publishedAt).getTime() -
            new Date(a.publishedAt).getTime(),
        );
        break;
      default:
        break;
    }

    return sorted;
  }, [filteredProducts, sortBy]);

  if (type === 'predictive') return null;

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Header - ZEHN Style */}
        <div className="text-center mb-12">
          {/* BL-0006: no entrance animation — heading paints frame-1 from SSR */}
          <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl text-foreground mb-4">
            {term ? `Ergebnisse für "${term}"` : 'Finden Sie Ihren Stil'}
          </h1>
          <p className="font-body text-body lg:text-body-lg text-muted max-w-md mx-auto">
            {term
              ? `${totalResults} ${
                  totalResults === 1 ? 'Ergebnis' : 'Ergebnisse'
                } gefunden`
              : 'Entdecken Sie Ihren perfekten Stil'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-accent/10 border border-accent/20 rounded-xl">
            <p className="font-body text-body text-accent">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {!term || !result?.total ? (
          <div className="text-center py-16">
            <p className="text-muted text-lg">
              {term
                ? 'Keine Ergebnisse gefunden. Versuchen Sie einen anderen Suchbegriff.'
                : 'Geben Sie einen Suchbegriff ein, um zu starten.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Filter and Sort Bar */}
            {categoryScopedProducts.length > 0 && (
              <div className="mb-4">
                <div className={FILTER_BAR_SHELL}>
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden inline-flex items-center gap-2 text-sm text-foreground"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter
                  </button>

                  <DesktopProductFilterRow
                    selectedPriceRange={selectedPriceRange}
                    selectedSize={selectedSize}
                    selectedColor={selectedColor}
                    availableSizes={availableSizes}
                    availableColors={availableColors}
                    onPriceChange={setSelectedPriceRange}
                    onSizeChange={setSelectedSize}
                    onColorChange={setSelectedColor}
                    onClear={() => {
                      setSelectedSize('');
                      setSelectedColor('');
                      setSelectedPriceRange('');
                    }}
                  />
                </div>

                {/* Product Count */}
                <div className="flex items-center justify-between pt-2 pb-2">
                  <span className="font-body text-sm text-muted">
                    {sortedProducts.length}{' '}
                    {sortedProducts.length === 1 ? 'Produkt' : 'Produkte'}
                  </span>
                  <CustomSelect
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                      {value: 'default', label: 'Empfohlen'},
                      {value: 'price-asc', label: 'Preis: Niedrig → Hoch'},
                      {value: 'price-desc', label: 'Preis: Hoch → Niedrig'},
                      {value: 'newest', label: 'Neueste'},
                    ]}
                    className="w-[220px] max-w-[70vw]"
                  />
                </div>
              </div>
            )}

            <MobileProductFilterDrawer
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              selectedPriceRange={selectedPriceRange}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              availableSizes={availableSizes}
              availableColors={availableColors}
              onPriceChange={setSelectedPriceRange}
              onSizeChange={setSelectedSize}
              onColorChange={setSelectedColor}
              onClear={() => {
                setSelectedSize('');
                setSelectedColor('');
                setSelectedPriceRange('');
              }}
            />

            {/* Products */}
            {sortedProducts.length > 0 && (
              <div
                id="products"
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                {sortedProducts.map((product: any, index: number) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    loading={index < 6 ? 'eager' : 'lazy'}
                  />
                ))}
              </div>
            )}

            {/* Pages */}
            {pages.length > 0 && (
              <div id="pages">
                <h2 className="text-2xl font-sans mb-6">Seiten</h2>
                <SearchResults.Pages pages={{nodes: pages}} term={term} />
              </div>
            )}

            {/* Articles */}
            {articles.length > 0 && (
              <div id="articles">
                <h2 className="text-2xl font-sans mb-6">Artikel</h2>
                <SearchResults.Articles
                  articles={{nodes: articles}}
                  term={term}
                />
              </div>
            )}
          </div>
        )}

        <Analytics.SearchView
          data={{searchTerm: term, searchResults: result}}
        />
      </div>
    </div>
  );
}

/**
 * Regular search query and fragments
 * (adjust as needed)
 */
const SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment SearchProduct on Product {
    __typename
    handle
    id
    publishedAt
    title
    trackingParameters
    vendor
    productType
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    media(first: 50) {
      nodes {
        ... on MediaImage {
          id
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
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
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          id
          availableForSale
          image {
            url
            altText
            width
            height
          }
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    variants(first: 50) {
      nodes {
        id
        availableForSale
        title
        image {
          url
          altText
          width
          height
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        selectedOptions {
          name
          value
        }
      }
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
      product {
        handle
        title
      }
    }
  }
` as const;

const SEARCH_PAGE_FRAGMENT = `#graphql
  fragment SearchPage on Page {
     __typename
     handle
    id
    title
    trackingParameters
  }
` as const;

const SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment SearchArticle on Article {
    __typename
    handle
    id
    title
    trackingParameters
  }
` as const;

const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfoFragment on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/search
export const SEARCH_QUERY = `#graphql
  query RegularSearch(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $term: String!
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    articles: search(
      query: $term,
      types: [ARTICLE],
      first: $first,
    ) {
      nodes {
        ...on Article {
          ...SearchArticle
        }
      }
    }
    pages: search(
      query: $term,
      types: [PAGE],
      first: $first,
    ) {
      nodes {
        ...on Page {
          ...SearchPage
        }
      }
    }
    products: search(
      after: $endCursor,
      before: $startCursor,
      first: $first,
      last: $last,
      query: $term,
      sortKey: RELEVANCE,
      types: [PRODUCT],
      unavailableProducts: HIDE,
    ) {
      nodes {
        ...on Product {
          ...SearchProduct
        }
      }
      pageInfo {
        ...PageInfoFragment
      }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
  ${SEARCH_PAGE_FRAGMENT}
  ${SEARCH_ARTICLE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
` as const;

/**
 * Regular search fetcher
 */
async function regularSearch({
  request,
  context,
}: Pick<
  Route.LoaderArgs,
  'request' | 'context'
>): Promise<RegularSearchReturn> {
  const {storefront} = context;
  const url = new URL(request.url);
  const variables = getPaginationVariables(request, {pageBy: 100}); // Increase to get more results for filtering
  const term = String(url.searchParams.get('q') || '').toLowerCase();

  // Search articles, pages, and products for the `q` term
  const {
    errors,
    ...items
  }: {errors?: Array<{message: string}>} & RegularSearchQuery =
    await storefront.query(SEARCH_QUERY, {
      variables: {...variables, term},
      cache: getCachePolicy(storefront, CACHE_NONE),
    });

  if (!items) {
    throw new Error('No search data returned from Shopify API');
  }

  if (term && items.products?.nodes) {
    items.products.nodes = items.products.nodes.filter((product: any) =>
      productTitleIncludesSearchTerm(product, term),
    );
  }

  // If Shopify didn't return products but we have a search term,
  // search all products by case-insensitive title substring.
  if (term && items.products && items.products.nodes) {
    // Get all products if no results from Shopify search
    if (items.products.nodes.length === 0) {
      const allProductsQuery = `#graphql
        query GetAllProducts($first: Int!) {
          products(first: $first) {
            nodes {
              ...SearchProduct
            }
          }
        }
        ${SEARCH_PRODUCT_FRAGMENT}
      `;

      const {products: allProducts}: any = await storefront.query(
        allProductsQuery,
        {
          variables: {first: 100},
          cache: getCachePolicy(storefront, CACHE_NONE),
        },
      );

      if (allProducts && allProducts.nodes) {
        const matchingProducts = allProducts.nodes.filter((product: any) =>
          productTitleIncludesSearchTerm(product, term),
        );

        items.products.nodes = matchingProducts;
      }
    }
  }

  const total = Object.values(items).reduce((acc: number, item: any) => {
    // Check if item has nodes array before accessing length
    if (item && item.nodes && Array.isArray(item.nodes)) {
      return acc + item.nodes.length;
    }
    return acc;
  }, 0);

  const error = errors
    ? errors.map(({message}: {message: string}) => message).join(', ')
    : undefined;

  return {type: 'regular', term, error, result: {total, items}};
}

/**
 * Predictive search query and fragments
 * (adjust as needed)
 */
const PREDICTIVE_SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment PredictiveArticle on Article {
    __typename
    id
    title
    handle
    blog {
      handle
    }
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_COLLECTION_FRAGMENT = `#graphql
  fragment PredictiveCollection on Collection {
    __typename
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_PAGE_FRAGMENT = `#graphql
  fragment PredictivePage on Page {
    __typename
    id
    title
    handle
    trackingParameters
  }
` as const;

const PREDICTIVE_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    trackingParameters
    tags
    productType
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          id
          image {
            url
            altText
            width
            height
          }
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
    }
  }
` as const;

const PREDICTIVE_SEARCH_QUERY_FRAGMENT = `#graphql
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch
const PREDICTIVE_SEARCH_QUERY = `#graphql
  query PredictiveSearch(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $term: String!
    $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $term,
      types: $types,
    ) {
      articles {
        ...PredictiveArticle
      }
      collections {
        ...PredictiveCollection
      }
      pages {
        ...PredictivePage
      }
      products {
        ...PredictiveProduct
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
  ${PREDICTIVE_SEARCH_ARTICLE_FRAGMENT}
  ${PREDICTIVE_SEARCH_COLLECTION_FRAGMENT}
  ${PREDICTIVE_SEARCH_PAGE_FRAGMENT}
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
  ${PREDICTIVE_SEARCH_QUERY_FRAGMENT}
` as const;

/**
 * Predictive search fetcher
 */
async function predictiveSearch({
  request,
  context,
}: Pick<
  Route.ActionArgs,
  'request' | 'context'
>): Promise<PredictiveSearchReturn> {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '')
    .trim()
    .toLowerCase();
  const limit = Number(url.searchParams.get('limit') || 10);
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  // Predictively search articles, collections, pages, products, and queries (suggestions)
  const {
    predictiveSearch: items,
    errors,
  }: PredictiveSearchQuery & {errors?: Array<{message: string}>} =
    await storefront.query(PREDICTIVE_SEARCH_QUERY, {
      variables: {
        limit,
        limitScope: 'EACH',
        term,
      },
      cache: getCachePolicy(storefront, CACHE_NONE),
    });

  if (errors) {
    throw new Error(
      `Shopify API errors: ${errors.map(({message}: {message: string}) => message).join(', ')}`,
    );
  }

  if (!items) {
    throw new Error('No predictive search data returned from Shopify API');
  }

  if (items.products) {
    items.products = items.products.filter((product: any) =>
      productTitleIncludesSearchTerm(product, term),
    );
  }

  // Always supplement with a full-catalog title search so products Shopify
  // doesn't rank highly (e.g. "Polo Shirt" for query "shirt") are not missed.
  {
    const allProductsQuery = `#graphql
      query GetAllProductsForPredictive($first: Int!) {
        products(first: $first) {
          nodes {
            ...PredictiveProduct
          }
        }
      }
      ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
    `;

    const {products: allProducts}: any = await storefront.query(
      allProductsQuery,
      {
        variables: {first: 50},
        cache: getCachePolicy(storefront, CACHE_NONE),
      },
    );

    if (allProducts && allProducts.nodes) {
      const shopifyIds = new Set((items.products ?? []).map((p: any) => p.id));
      const extra = allProducts.nodes.filter(
        (product: any) =>
          productTitleIncludesSearchTerm(product, term) &&
          !shopifyIds.has(product.id),
      );
      items.products = [...(items.products ?? []), ...extra].slice(0, limit);
    }
  }

  const total = Object.values(items).reduce(
    (acc: number, item: Array<unknown>) => acc + item.length,
    0,
  );

  return {type, term, result: {items, total}};
}
