import {
  redirect,
  useLoaderData,
  Link,
  useSearchParams,
  useRouteError,
  isRouteErrorResponse,
  useLocation,
} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {useState, useMemo, useEffect} from 'react';
import {SlidersHorizontal, ChevronDown, ShoppingBag} from 'lucide-react';
import {CustomSelect} from '~/components/CustomSelect';
import {DesktopProductFilterRow} from '~/components/zehn/DesktopProductFilterRow';
import {MobileProductFilterDrawer} from '~/components/zehn/MobileProductFilterDrawer';
import {FILTER_BAR_SHELL} from '~/lib/product-filter-ui';
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
import {
  getAvailableFilteredProductValues,
  productMatchesSelectedFilters,
} from '~/lib/product-filters';
import {productMatchesCategory} from '~/lib/category-match';

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

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  // alle-* handles (e.g. alle-shorts) show all products filtered by that category
  if (handle in ALLE_PARENT_MAP) {
    const {products} = await storefront.query(CATALOG_QUERY, {
      variables: {first: 250},
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
      // Add other queries here, so that they are loaded in parallel
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
    });

    const matchedHandle = result.collection?.handle;
    if (matchedHandle) {
      return matchedHandle;
    }
  }

  for (const term of searchTerms) {
    const result = await storefront.query(COLLECTION_HANDLE_FALLBACK_QUERY, {
      variables: {query: term},
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
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Curated collections (sale, bestseller, neuheiten) filter within themselves.
  // Category collections (shorts, hosen, etc.) navigate between category pages.
  const allCategoryHandles = useMemo(() => {
    const handles = new Set(Object.keys(MAIN_CATEGORY_MAP));
    Object.values(MAIN_CATEGORY_MAP)
      .flat()
      .forEach((h) => handles.add(h));
    return handles;
  }, []);
  const isCuratedCollection = !allCategoryHandles.has(collection.handle);

  // Resolve alle-* handles to their parent category for page-type detection
  const effectiveHandle =
    resolveAlleCategory(collection.handle) ?? collection.handle;
  const isMainCategoryPage = isMainCategory(effectiveHandle);
  const isSubCategoryPage =
    !isMainCategoryPage && allCategoryHandles.has(effectiveHandle);
  const isCuratedPage = !isMainCategoryPage && !isSubCategoryPage;

  // Root slug for 3-level URLs — derived from URL, not Shopify handle, for consistency
  const {pathname} = useLocation();
  const rootSlug = getCollectionRootSlug(
    pathname,
    getCollectionRootSlug(collection.handle),
  );

  // Derive active category state from the current collection handle (used by category collections)
  const activeMainCat = isMainCategory(collection.handle)
    ? collection.handle
    : (Object.entries(MAIN_CATEGORY_MAP).find(([, subs]) =>
        subs.includes(collection.handle),
      )?.[0] ?? '');
  const activeSubCat = isMainCategory(collection.handle)
    ? ''
    : collection.handle;

  // Category filter for curated collections; pre-seeded for alle-* routes
  const [selectedCategory, setSelectedCategory] = useState<string>(
    () => resolveAlleCategory(collection.handle) ?? '',
  );

  // Sync selectedCategory from ?category= URL param
  useEffect(() => {
    if (!isCuratedCollection) return;
    const cat = (searchParams.get('category') || '').toLowerCase().trim();
    if (!cat) return;
    const resolvedCat = resolveAlleCategory(cat);
    if (
      resolvedCat
        ? allCategoryHandles.has(resolvedCat)
        : allCategoryHandles.has(cat)
    ) {
      setSelectedCategory(cat);
    }
  }, [searchParams, isCuratedCollection, allCategoryHandles]);

  // Sync selectedCategory when navigating between alle-* routes without unmounting
  useEffect(() => {
    const resolved = resolveAlleCategory(collection.handle);
    if (resolved !== null) setSelectedCategory(resolved);
  }, [collection.handle]);

  const [sortBy, setSortBy] = useState<string>('default');

  // Filter states
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');

  // Shuffle products based on collection handle for variety
  const shuffledProducts = useMemo(() => {
    return shuffleWithSeed(
      (collection.products.nodes as any[]).filter(Boolean),
      collection.handle,
    );
  }, [collection.products.nodes, collection.handle]);

  // Define main categories with their subcategories (hardcoded)
  const mainCategories = useMemo(() => {
    const categoryMap = new Map<string, Set<string>>();
    for (const [main, subs] of Object.entries(MAIN_CATEGORY_MAP)) {
      categoryMap.set(main, new Set(subs));
    }
    return categoryMap;
  }, []);

  const categoryFilteredProducts = useMemo(() => {
    const effectiveCategory =
      resolveAlleCategory(selectedCategory) || selectedCategory;
    if (!effectiveCategory) return shuffledProducts;

    return shuffledProducts.filter((product: any) =>
      productMatchesCategory(product, effectiveCategory),
    );
  }, [shuffledProducts, selectedCategory]);

  const availableSizes = useMemo(
    () =>
      getAvailableFilteredProductValues(
        categoryFilteredProducts as any[],
        'size',
        {
          color: selectedColor,
          priceRange: selectedPriceRange,
        },
      ),
    [categoryFilteredProducts, selectedColor, selectedPriceRange],
  );

  const availableColors = useMemo(
    () =>
      getAvailableFilteredProductValues(
        categoryFilteredProducts as any[],
        'color',
        {
          size: selectedSize,
          priceRange: selectedPriceRange,
        },
      ),
    [categoryFilteredProducts, selectedSize, selectedPriceRange],
  );

  const filteredProducts = useMemo(() => {
    return categoryFilteredProducts.filter((product: any) =>
      productMatchesSelectedFilters(product, {
        size: selectedSize,
        color: selectedColor,
        priceRange: selectedPriceRange,
      }),
    );
  }, [
    categoryFilteredProducts,
    selectedSize,
    selectedColor,
    selectedPriceRange,
  ]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return products.sort(
          (a: any, b: any) =>
            parseFloat(a.priceRange?.minVariantPrice?.amount || '0') -
            parseFloat(b.priceRange?.minVariantPrice?.amount || '0'),
        );
      case 'price-desc':
        return products.sort(
          (a: any, b: any) =>
            parseFloat(b.priceRange?.minVariantPrice?.amount || '0') -
            parseFloat(a.priceRange?.minVariantPrice?.amount || '0'),
        );
      case 'newest':
        return products.reverse();
      default:
        return products;
    }
  }, [filteredProducts, sortBy]);

  return (
    <div className="pt-3 sm:pt-6 lg:pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Header - ZEHN Style */}
        <div className="text-center mb-6">
          <h1
            className="font-display text-h1 sm:text-h1-sm lg:text-h1-lg tracking-[0.3em] uppercase text-foreground animate-blur-in opacity-0"
            style={{animationDelay: '0.1s', animationFillMode: 'forwards'}}
          >
            {selectedCategory
              ? getCategoryLabel(selectedCategory)
              : collection.handle === 'bestseller'
                ? 'BESTSELLER'
                : collection.handle === 'sale'
                  ? 'SALE'
                  : collection.handle === 'new-arrival' ||
                      collection.handle === 'neuheiten'
                    ? 'NEUHEITEN'
                    : collection.title.toUpperCase()}
          </h1>
        </div>

        {/* Category Navigation */}
        <div className="mb-6 space-y-3">
          {isCuratedPage ? (
            <>
              {/* Row 1: All main categories — only on curated/top-level pages */}
              <div className="flex flex-wrap justify-center gap-2">
                {Array.from(mainCategories.keys()).map((category) => {
                  const btnClass = `px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300`;
                  if (isCuratedCollection) {
                    const isSelectedMain = mainCategories.has(selectedCategory);
                    const isActive =
                      selectedCategory === category ||
                      (!isSelectedMain &&
                        mainCategories.get(category)?.has(selectedCategory));
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          setSelectedCategory((prev) =>
                            prev === category ? '' : category,
                          )
                        }
                        className={`${btnClass} ${isActive ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'bg-card text-foreground hover:bg-card/80 shadow-md hover:scale-105'}`}
                      >
                        {getCategoryLabel(category)}
                      </button>
                    );
                  }
                  const isActive = activeMainCat === category;
                  return (
                    <Link
                      key={category}
                      to={getCategoryUrl(category)}
                      prefetch="intent"
                      className={`${btnClass} ${isActive ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'bg-card text-foreground hover:bg-card/80 shadow-md hover:scale-105'}`}
                    >
                      {getCategoryLabel(category)}
                    </Link>
                  );
                })}
              </div>

              {/* Row 2: Subcategories of the selected main category */}
              <div className="flex flex-wrap justify-center gap-1.5 min-h-[2rem]">
                {(() => {
                  const activeCat = isCuratedCollection
                    ? selectedCategory
                    : activeMainCat;
                  if (!activeCat) return null;
                  const subcategories = mainCategories.get(activeCat);
                  if (!subcategories || subcategories.size === 0) return null;
                  return Array.from(subcategories).map((subcategory) => {
                    const subClass = `px-2 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300`;
                    if (isCuratedCollection) {
                      const isActive = selectedCategory === subcategory;
                      return (
                        <Link
                          key={subcategory}
                          to={`/collections/${rootSlug}/alle-${activeCat}/${subcategory}`}
                          prefetch="intent"
                          className={`${subClass} ${isActive ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-card/50 text-foreground/70 hover:bg-card/70 hover:text-foreground shadow-sm hover:scale-105'}`}
                        >
                          {getCategoryLabel(subcategory)}
                        </Link>
                      );
                    }
                    const isActive = activeSubCat === subcategory;
                    return (
                      <Link
                        key={subcategory}
                        to={getCategoryUrl(subcategory)}
                        prefetch="intent"
                        className={`${subClass} ${isActive ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-card/50 text-foreground/70 hover:bg-card/70 hover:text-foreground shadow-sm hover:scale-105'}`}
                      >
                        {getCategoryLabel(subcategory)}
                      </Link>
                    );
                  });
                })()}
              </div>
            </>
          ) : isMainCategoryPage ? (
            /* Only show subcategories of this main category */
            (() => {
              const subcategories = Array.from(
                mainCategories.get(effectiveHandle) ?? [],
              );
              if (subcategories.length === 0) return null;
              return (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {subcategories.map((subcategory) => {
                    const subClass = `px-2 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300`;
                    const isActive = isCuratedCollection
                      ? selectedCategory === subcategory
                      : activeSubCat === subcategory;
                    return (
                      <Link
                        key={subcategory}
                        to={`/collections/shop-all/alle-${effectiveHandle}/${subcategory}`}
                        prefetch="intent"
                        className={`${subClass} ${isActive ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-card/50 text-foreground/70 hover:bg-card/70 hover:text-foreground shadow-sm hover:scale-105'}`}
                      >
                        {getCategoryLabel(subcategory)}
                      </Link>
                    );
                  })}
                </div>
              );
            })()
          ) : isSubCategoryPage ? (
            /* Show sub-subcategories if any exist */
            (() => {
              const subcategories = Array.from(
                mainCategories.get(effectiveHandle) ?? [],
              );
              if (subcategories.length === 0) return null;
              const parentCat =
                Object.entries(MAIN_CATEGORY_MAP).find(([, subs]) =>
                  subs.includes(effectiveHandle),
                )?.[0] ?? '';
              return (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {subcategories.map((subcategory) => (
                    <Link
                      key={subcategory}
                      to={`/collections/alle-${parentCat}/${subcategory}`}
                      prefetch="intent"
                      className="px-2 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 bg-card/50 text-foreground/70 hover:bg-card/70 hover:text-foreground shadow-sm hover:scale-105"
                    >
                      {getCategoryLabel(subcategory)}
                    </Link>
                  ))}
                </div>
              );
            })()
          ) : null}
        </div>

        {/* Filter Bar */}
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

            {/* Desktop Filters */}
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

          {/* Product Count + Sort - separate line */}
          <div className="flex items-center justify-between pt-2 pb-2">
            <span className="font-body text-xs text-muted">
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

        {/* Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedProducts.map((product: any, index: number) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
            />
          ))}
        </div>

        {/* Empty State - Coming Soon */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 mx-auto bg-muted/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted" />
              </div>
              <div className="space-y-3">
                <h3 className="font-sans text-h3 text-foreground">
                  Coming Soon
                </h3>
                <p className="font-sans text-body text-muted">
                  {`Wir arbeiten daran, Ihnen tolle ${getCategoryLabel(collection.handle)} Produkte anzubieten. Bleiben Sie dran!`}
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
    productType
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
        ...MoneyProductItem
      }
      maxVariantPrice {
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
