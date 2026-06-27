import {
  redirect,
  useLoaderData,
  Link,
  useSearchParams,
  useRouteError,
  isRouteErrorResponse,
  useLocation,
  useNavigate,
  data as routeData,
} from 'react-router';
import type {Route} from './+types/collections.$handle';
import type {ClientLoaderFunctionArgs} from 'react-router';
import {catalogClientLoader, catalogClientLoaderHydrate} from '~/lib/catalog-client-loader';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import {
  resolveProductImageLoading,
  ZEHN_COLLECTION_GRID_ABOVE_FOLD_LIMIT,
} from '~/lib/zehn-product-image-loading';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {useMemo} from 'react';
import {useAboveFoldImageWarm} from '~/hooks/useAboveFoldImageWarm';
import {ShoppingBag} from 'lucide-react';
import {ProductCatalogBand} from '~/components/zehn/ProductCatalogBand';
import {ZEHN_HOMEPAGE_GRID_TOP} from '~/lib/homepage-section-styles';
import {useProductCatalogFilters} from '~/hooks/useProductCatalogFilters';
import {ZEHN_SITE_CONTENT_ROW} from '~/lib/site-content-row';
import {
  MAIN_CATEGORY_MAP,
  getCategoryLabel,
  getCategoryUrl,
  getCollectionRootSlug,
  isMainCategory,
  resolveAlleCategory,
  ALLE_PARENT_MAP,
} from '~/lib/category-map';
import {shuffleWithSeed} from '~/lib/seeded-shuffle';
import {CATALOG_QUERY} from '~/routes/collections.all';
import {getCachePolicy, CACHE_CATALOG} from '~/lib/storefront-cache-policy';
import {getOxygenPageCacheHeaders} from '~/lib/oxygen-page-cache';
import {catalogShouldRevalidate} from '~/lib/route-revalidation';
import {
  getCategorySectionCopy,
  resolveCategorySectionContext,
} from '~/lib/category-section-copy';
import {
  isCatalogBandPath,
  resolveCatalogPageContext,
} from '~/lib/catalog-band-context';
import type {CatalogFreshNavState} from '~/lib/catalog-band-context';

export const meta: Route.MetaFunction = ({data}) => {
  const collection = data?.collection;
  if (!collection) return [{title: 'Kollektion | ZEHN'}];
  const description =
    collection.description ||
    `${collection.title} – Entdecken Sie unsere ${collection.title} Kollektion bei ZEHN.`;
  const image = (collection as any).image;
  return [
    {title: `${collection.title} | ZEHN`},
    {name: 'description', content: description},
    {
      tagName: 'link',
      rel: 'canonical',
      href: `/collections/${collection.handle}`,
    },
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: `${collection.title} | ZEHN`},
    {property: 'og:description', content: description},
    {property: 'og:url', content: `/collections/${collection.handle}`},
    {property: 'og:site_name', content: 'ZEHN'},
    {property: 'og:locale', content: 'de_DE'},
    ...(image
      ? [
          {property: 'og:image', content: image.url},
          {
            property: 'og:image:alt',
            content: image.altText || collection.title,
          },
        ]
      : []),
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: `${collection.title} | ZEHN`},
    {name: 'twitter:description', content: description},
  ];
};

export const shouldRevalidate = catalogShouldRevalidate;

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return routeData(
    {...deferredData, ...criticalData},
    {headers: getOxygenPageCacheHeaders('catalog')},
  );
}

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return catalogClientLoader<Awaited<ReturnType<typeof loader>>>(args);
}
clientLoader.hydrate = catalogClientLoaderHydrate;

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 250,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  // shop-all: virtual root collection — loads the full product catalog
  if (handle === 'shop-all') {
    const {products} = await storefront.query(CATALOG_QUERY, {
      variables: {first: 250},
      cache: getCachePolicy(storefront, CACHE_CATALOG),
    });
    return {
      collection: {
        id: 'virtual-shop-all',
        handle: 'shop-all',
        title: 'Alle Produkte',
        description: '',
        seo: {title: 'Alle Produkte', description: ''},
        image: null,
        products: {nodes: products?.nodes ?? []},
      },
    };
  }

  // alle-* handles (e.g. alle-shorts) show all products filtered by that category
  if (handle in ALLE_PARENT_MAP) {
    const {products} = await storefront.query(CATALOG_QUERY, {
      variables: {first: 250},
      cache: getCachePolicy(storefront, CACHE_CATALOG),
    });
    const categoryLabel = getCategoryLabel(handle);
    return {
      collection: {
        id: `virtual-${handle}`,
        handle,
        title: categoryLabel,
        description: '',
        seo: {title: categoryLabel, description: ''},
        image: null,
        products: {nodes: products?.nodes ?? []},
      },
    };
  }

  const [{collection: initialCollection}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
      cache: getCachePolicy(storefront, CACHE_CATALOG),
    }),
  ]);

  const collection = initialCollection;

  if (!collection) {
    const fallbackHandle = await resolveCollectionHandle(storefront, handle);

    if (fallbackHandle && fallbackHandle !== handle) {
      const fallbackUrl = new URL(request.url);
      fallbackUrl.pathname = `/collections/${fallbackHandle}`;
      throw redirect(`${fallbackUrl.pathname}${fallbackUrl.search}`);
    }
  }

  if (!collection) {
    // Provide helpful error message for missing collections
    const collectionName = handle
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
    throw new Response(
      JSON.stringify({
        message: `Die Kollektion "${collectionName}" wurde in Shopify noch nicht erstellt.`,
        handle,
        suggestion:
          'Bitte erstellen Sie diese Kollektion in Shopify Admin oder sehen Sie sich alle Produkte an.',
      }),
      {
        status: 404,
        statusText: 'Kollektion nicht gefunden',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

const COLLECTION_HANDLE_CANDIDATES: Record<string, string[]> = {
  bestseller: ['bestseller', 'best-seller', 'best-sellers', 'besteller'],
  'new-arrival': ['new-arrival', 'new-arrivals', 'neuheiten'],
  neuheiten: ['neuheiten', 'new-arrival', 'new-arrivals'],
  sale: ['sale', 'angebote', 'offers'],
  shorts: ['shorts', 'short', 'kurze-hosen', 'kurzehosen'],
  'cargo-shorts': ['cargo-shorts', 'cargoshorts', 'cargo-kurze'],
  'chino-shorts': ['chino-shorts', 'chinoshorts', 'chino-kurze'],
  hosen: ['hosen', 'hose', 'pants'],
  cargohosen: ['cargohosen', 'cargo-hosen', 'cargos', 'cargo'],
  chinohosen: ['chinohosen', 'chino-hosen', 'chinos', 'chino'],
  jeans: ['jeans', 'jean', 'denim'],
  jacken: ['jacken', 'jacke', 'jackets', 'jacken-maentel'],
  uebergangsjacken: ['uebergangsjacken', 'übergangsjacken', 'ubergangsjacken'],
  winterjacken: ['winterjacken', 'winter-jackets', 'winter-jacken'],
  tops: ['tops', 'top', 'oberteile', 'shirts'],
  't-shirts': ['t-shirts', 'tshirts', 'tee-shirts', 'shirts'],
  poloshirts: ['poloshirts', 'polo-shirts', 'polo', 'polohemden'],
};

const COLLECTION_SEARCH_TERMS: Record<string, string[]> = {
  bestseller: ['bestseller', 'best seller', 'best-seller'],
  'new-arrival': ['new arrival', 'new arrivals', 'neuheiten'],
  neuheiten: ['neuheiten', 'new arrival', 'new arrivals'],
  sale: ['sale', 'angebote', 'offer'],
  shorts: ['shorts', 'kurze hosen', 'bermuda'],
  'cargo-shorts': ['cargo shorts', 'cargo kurze hosen'],
  'chino-shorts': ['chino shorts', 'chino kurze hosen'],
  hosen: ['hosen', 'hose', 'pants'],
  cargohosen: ['cargohosen', 'cargo hosen'],
  chinohosen: ['chinohosen', 'chino hosen'],
  jeans: ['jeans', 'denim'],
  jacken: ['jacken', 'jacke', 'jackets'],
  uebergangsjacken: [
    'uebergangsjacken',
    'übergangsjacken',
    'uebergangs jacken',
  ],
  winterjacken: ['winterjacken', 'winter jacken', 'winter jackets'],
  tops: ['tops', 'oberteile', 'shirts'],
  't-shirts': ['t-shirts', 'tshirts', 'shirts'],
  poloshirts: ['poloshirts', 'polo shirts', 'polohemden'],
};

async function resolveCollectionHandle(
  storefront: Route.LoaderArgs['context']['storefront'],
  requestedHandle: string,
) {
  const normalizedHandle = requestedHandle.toLowerCase();
  const handleCandidates = COLLECTION_HANDLE_CANDIDATES[normalizedHandle] ?? [
    normalizedHandle,
  ];
  const searchTerms = COLLECTION_SEARCH_TERMS[normalizedHandle] ?? [
    normalizedHandle,
  ];

  for (const candidateHandle of handleCandidates) {
    const result = await storefront.query(COLLECTION_HANDLE_BY_HANDLE_QUERY, {
      variables: {handle: candidateHandle},
      cache: getCachePolicy(storefront, CACHE_CATALOG),
    });

    const matchedHandle = result.collection?.handle;
    if (matchedHandle) {
      return matchedHandle;
    }
  }

  for (const term of searchTerms) {
    const result = await storefront.query(COLLECTION_HANDLE_FALLBACK_QUERY, {
      variables: {query: term},
      cache: getCachePolicy(storefront, CACHE_CATALOG),
    });

    const matchedHandle = result.collections?.nodes?.[0]?.handle;
    if (matchedHandle) {
      return matchedHandle;
    }
  }

  return null;
}

// Category labels and order are sourced from `app/lib/category-map.ts`.

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const allCategoryHandles = useMemo(() => {
    const handles = new Set(Object.keys(MAIN_CATEGORY_MAP));
    Object.values(MAIN_CATEGORY_MAP)
      .flat()
      .forEach((h) => handles.add(h));
    return handles;
  }, []);
  const isCuratedCollection = !allCategoryHandles.has(collection.handle);

  const effectiveHandle =
    resolveAlleCategory(collection.handle) ?? collection.handle;
  const isMainCategoryPage = isMainCategory(effectiveHandle);
  const isSubCategoryPage =
    !isMainCategoryPage && allCategoryHandles.has(effectiveHandle);
  const isCuratedPage = !isMainCategoryPage && !isSubCategoryPage;

  const {pathname, state: locationState} = useLocation();
  const navigate = useNavigate();
  const catalogFresh = Boolean(
    (locationState as CatalogFreshNavState | null)?.catalogFresh,
  );
  const rootSlug = getCollectionRootSlug(
    pathname,
    getCollectionRootSlug(collection.handle),
  );

  const activeMainCat = isMainCategory(collection.handle)
    ? collection.handle
    : (Object.entries(MAIN_CATEGORY_MAP).find(([, subs]) =>
        subs.includes(collection.handle),
      )?.[0] ?? '');
  const activeSubCat = isMainCategory(collection.handle)
    ? ''
    : collection.handle;

  const shuffledProducts = useMemo(() => {
    return shuffleWithSeed(
      (collection.products.nodes as any[]).filter(Boolean),
      collection.handle,
    );
  }, [collection.products.nodes, collection.handle]);

  const catalogBand = isCatalogBandPath(pathname);
  const filterChipNav = catalogBand && isCuratedCollection;
  const catalogPageContext = catalogBand
    ? resolveCatalogPageContext(pathname)
    : undefined;

  const filterState = useProductCatalogFilters({
    mode: 'collection',
    baseProducts: shuffledProducts,
    initialCategory: resolveAlleCategory(collection.handle) ?? '',
    curatedMainToggle: isCuratedCollection,
    alwaysShowFacetToolbar: true,
    routeSync: {
      pathname,
      collectionHandle: collection.handle,
      catalogFresh,
      searchCategory: searchParams.get('category') ?? '',
    },
    onCatalogFreshConsumed: () => {
      if (!catalogFresh) return;
      void navigate(
        {
          pathname,
          search: searchParams.toString()
            ? `?${searchParams.toString()}`
            : '',
        },
        {replace: true, state: null},
      );
    },
  });

  const {selectedCategory, displayProducts, mainCategories, activeMainCategory, showFacetToolbar} =
    filterState;

  useAboveFoldImageWarm(collection.products.nodes);

  const navActiveMain = useMemo(() => {
    if (isMainCategoryPage) return effectiveHandle;
    if (isSubCategoryPage) {
      return (
        Object.entries(MAIN_CATEGORY_MAP).find(([, subs]) =>
          subs.includes(effectiveHandle),
        )?.[0] ?? ''
      );
    }
    if (!selectedCategory) return activeMainCat;
    if (mainCategories.has(selectedCategory)) return selectedCategory;
    for (const [main, subs] of mainCategories) {
      if (subs.has(selectedCategory)) return main;
    }
    return activeMainCat;
  }, [
    activeMainCat,
    effectiveHandle,
    isMainCategoryPage,
    isSubCategoryPage,
    mainCategories,
    selectedCategory,
  ]);

  const categoryNavCopy = useMemo(() => {
    if (catalogBand) return undefined;
    if (isMainCategoryPage || isSubCategoryPage) {
      return getCategorySectionCopy('category', effectiveHandle);
    }
    return undefined;
  }, [catalogBand, effectiveHandle, isMainCategoryPage, isSubCategoryPage]);

  const navSelectedCategory = filterChipNav
    ? selectedCategory
    : isSubCategoryPage
      ? effectiveHandle
      : isCuratedCollection
        ? selectedCategory
        : activeSubCat || activeMainCat;

  const navActiveMainResolved = filterChipNav
    ? activeMainCategory
    : navActiveMain;

  const showCatalogNav =
    isCuratedPage || isMainCategoryPage || isSubCategoryPage;

  const miscBandCopy = useMemo(() => {
    if (showCatalogNav) return undefined;
    const ctx = resolveCategorySectionContext(collection.handle, {
      isCuratedCollection,
      isMainCategoryPage,
      isSubCategoryPage,
    });
    if (ctx === 'category') {
      return getCategorySectionCopy('category', effectiveHandle);
    }
    return getCategorySectionCopy(ctx);
  }, [
    collection.handle,
    effectiveHandle,
    isCuratedCollection,
    isMainCategoryPage,
    isSubCategoryPage,
    showCatalogNav,
  ]);

  return (
    <div className="pt-3 sm:pt-6 lg:pt-12 pb-20">
      <div className={ZEHN_SITE_CONTENT_ROW}>
        {showCatalogNav && (
          <ProductCatalogBand
            pageContext={catalogPageContext}
            copy={categoryNavCopy}
            navVariant="default"
            filterState={filterState}
            showFilterToolbar={showFacetToolbar}
            showMainRow={catalogBand}
            showMainAlleChip={catalogBand}
            curatedMainToggle={isCuratedCollection}
            mainInteraction={isCuratedCollection ? 'filter' : 'link'}
            subInteraction={isCuratedCollection ? 'filter' : 'link'}
            navSelectedCategory={navSelectedCategory}
            navActiveMainCategory={navActiveMainResolved}
            subHighlightActive={filterChipNav || !isSubCategoryPage}
            getMainHref={getCategoryUrl}
            getSubHref={(main, sub) => {
              if (isCuratedCollection) {
                // Canonical URL: curated collection + ?category= param keeps the product set scoped.
                // subInteraction='filter' means clicks are in-memory; href is for accessibility/prefetch only.
                return `/collections/${rootSlug}?category=${sub}`;
              }
              if (isMainCategoryPage) {
                return `/collections/shop-all/alle-${effectiveHandle}/${sub}`;
              }
              const parentCat =
                Object.entries(MAIN_CATEGORY_MAP).find(([, subs]) =>
                  subs.includes(effectiveHandle),
                )?.[0] ?? main;
              return `/collections/alle-${parentCat}/${sub}`;
            }}
          />
        )}

        {!showCatalogNav && (
          <ProductCatalogBand
            copy={miscBandCopy}
            navVariant="default"
            filterState={filterState}
            showFilterToolbar
            showMainRow={false}
          />
        )}

        <div className={`${ZEHN_HOMEPAGE_GRID_TOP} grid sm:grid-cols-2 lg:grid-cols-3 gap-3`}>
          {displayProducts.map((product: any, index: number) => {
            const imageContext =
              index < ZEHN_COLLECTION_GRID_ABOVE_FOLD_LIMIT
                ? 'gridAboveFold'
                : 'gridBelowFold';
            const imageLoad = resolveProductImageLoading(imageContext, index, {
              aboveFoldLimit: ZEHN_COLLECTION_GRID_ABOVE_FOLD_LIMIT,
            });

            return (
            <ProductItem
              key={product.id}
              product={product}
              loading={imageLoad.loading}
              priority={imageLoad.priority}
              isLCP={imageLoad.isLCP}
              index={index}
            />
            );
          })}
        </div>

        {displayProducts.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 mx-auto bg-muted/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted" />
              </div>
              <div className="space-y-3">
                <h3 className="font-sans text-h3 text-foreground">
                  {selectedCategory
                    ? `Keine ${getCategoryLabel(selectedCategory)} verfügbar`
                    : 'Coming Soon'}
                </h3>
                <p className="font-sans text-body text-muted">
                  {selectedCategory
                    ? `In dieser Kollektion gibt es derzeit keine ${getCategoryLabel(selectedCategory)}.`
                    : `Wir arbeiten daran, Ihnen tolle ${getCategoryLabel(collection.handle)} Produkte anzubieten. Bleiben Sie dran!`}
                </p>
              </div>
            </div>
          </div>
        )}

        <Analytics.CollectionView
          data={{
            collection: {
              id: collection.id,
              handle: collection.handle,
            },
          }}
        />
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    let errorData: {message: string; handle: string; suggestion: string} = {
      message: 'Kollektion nicht gefunden',
      handle: '',
      suggestion: '',
    };

    try {
      const parsed =
        typeof error.data === 'string'
          ? (JSON.parse(error.data) as any)
          : (error.data as any);
      errorData = {
        message: parsed?.message || 'Kollektion nicht gefunden',
        handle: parsed?.handle || '',
        suggestion: parsed?.suggestion || '',
      };
    } catch {
      errorData.message =
        typeof error.data === 'string'
          ? error.data
          : 'Kollektion nicht gefunden';
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
        <div className="max-w-lg text-center space-y-6">
          <div className="space-y-2">
            <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-foreground">
              Kollektion nicht gefunden
            </h1>
            <p className="text-lg text-foreground/70">{errorData.message}</p>
          </div>

          <div className="bg-muted/30 border border-muted rounded-lg p-6 space-y-4">
            <p className="text-sm text-foreground/60">{errorData.suggestion}</p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/collections/all"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Alle Produkte ansehen
              </Link>
              <Link
                to="/"
                className="px-6 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Zurück zur Startseite
              </Link>
            </div>
          </div>

          {errorData.handle && (
            <details className="text-left text-sm text-foreground/50">
              <summary className="cursor-pointer hover:text-foreground/70">
                Für Shop-Administratoren
              </summary>
              <div className="mt-4 space-y-2 bg-muted/20 p-4 rounded border border-muted">
                <p>
                  Um dieses Problem zu beheben, erstellen Sie in Shopify Admin
                  eine Kollektion mit:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    Handle:{' '}
                    <code className="bg-muted px-2 py-1 rounded">
                      {errorData.handle}
                    </code>
                  </li>
                  <li>Titel: Gewünschter Kollektionsname</li>
                  <li>Produkte zur Kollektion hinzufügen</li>
                </ul>
                <p className="mt-4">
                  Siehe{' '}
                  <a
                    href="/Docs/SHOPIFY_COLLECTIONS_SETUP.md"
                    className="underline hover:text-foreground/70"
                  >
                    Einrichtungsanleitung
                  </a>{' '}
                  für detaillierte Anweisungen.
                </p>
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-foreground">
          Etwas ist schiefgelaufen
        </h1>
        <p className="text-lg text-foreground/70">
          {error instanceof Error
            ? error.message
            : 'Ein unerwarteter Fehler ist aufgetreten'}
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    media(first: 20) {
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
        ...MoneyProductItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
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
    variants(first: 25) {
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
          ...MoneyProductItem
        }
        compareAtPrice {
          ...MoneyProductItem
        }
        selectedOptions {
          name
          value
        }
      }
    }
    selectedOrFirstAvailableVariant {
      id
      availableForSale
      image {
        url
        altText
        width
        height
      }
      price {
        ...MoneyProductItem
      }
      compareAtPrice {
        ...MoneyProductItem
      }
      selectedOptions {
        name
        value
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/2022-04/objects/collection
const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
` as const;

const COLLECTION_HANDLE_BY_HANDLE_QUERY = `#graphql
  query CollectionHandleByHandle(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      handle
    }
  }
` as const;

const COLLECTION_HANDLE_FALLBACK_QUERY = `#graphql
  query CollectionHandleFallback(
    $query: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collections(first: 1, query: $query) {
      nodes {
        handle
        title
      }
    }
  }
` as const;
