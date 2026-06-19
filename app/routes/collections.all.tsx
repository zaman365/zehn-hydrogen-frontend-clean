import type {Route} from './+types/collections.all';
import {useLoaderData, useSearchParams, Link} from 'react-router';

import {getPaginationVariables} from '@shopify/hydrogen';
import {
  MAIN_CATEGORY_MAP,
  getCategoryLabel,
  resolveAlleCategory,
} from '~/lib/category-map';
import {ProductItem} from '~/components/ProductItem';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {useState, useEffect, useRef, useMemo} from 'react';
import type {Dispatch, SetStateAction} from 'react';
import {X, SlidersHorizontal, ChevronDown, ShoppingBag} from 'lucide-react';
import {CustomSelect} from '~/components/CustomSelect';
import {
  getAvailableFilteredProductValues,
  productMatchesSelectedFilters,
} from '~/lib/product-filters';
import {productMatchesCategory} from '~/lib/category-match';

type Category = string;

type FilterableProduct = CollectionItemFragment;

type FilterStateProps = {
  selectedCategory: Category;
  setSelectedCategory: Dispatch<SetStateAction<Category>>;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
};

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Alle Produkte | ZEHN'},
    {
      name: 'description',
      content:
        'Entdecken Sie alle ZEHN Produkte – Premium Herrenmode für den modernen Mann.',
    },
    {tagName: 'link', rel: 'canonical', href: '/collections/all'},
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: 'Alle Produkte | ZEHN'},
    {
      property: 'og:description',
      content:
        'Entdecken Sie alle ZEHN Produkte – Premium Herrenmode für den modernen Mann.',
    },
    {property: 'og:url', content: '/collections/all'},
    {property: 'og:site_name', content: 'ZEHN'},
    {property: 'og:locale', content: 'de_DE'},
    {name: 'twitter:card', content: 'summary'},
    {name: 'twitter:title', content: 'Alle Produkte | ZEHN'},
    {
      name: 'twitter:description',
      content:
        'Entdecken Sie alle ZEHN Produkte – Premium Herrenmode für den modernen Mann.',
    },
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
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 250,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
    }),
  ]);
  return {products};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

// Category labels and order are sourced from `app/lib/category-map.ts`.

export default function Collection() {
  const {products} = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('');

  // Get all products as array
  const allProducts: FilterableProduct[] = products.nodes ?? [];

  // Define main categories with their subcategories (hardcoded)
  const mainCategories = useMemo(() => {
    const categoryMap = new Map<string, Set<string>>();
    for (const [main, subs] of Object.entries(MAIN_CATEGORY_MAP)) {
      categoryMap.set(main, new Set(subs));
    }
    return categoryMap;
  }, []);

  // Set default selected category to empty (show all products)
  const [selectedCategory, setSelectedCategory] = useState<Category>('');

  // Initialize from URL query param when coming from homepage category chips
  useEffect(() => {
    const requestedCategory = (searchParams.get('category') || '')
      .toLowerCase()
      .trim();
    if (!requestedCategory) return;

    const validCategories = new Set<string>();
    for (const [mainCategory, subCategories] of mainCategories.entries()) {
      validCategories.add(mainCategory);
      validCategories.add(`alle-${mainCategory}`);
      for (const subCategory of subCategories) {
        validCategories.add(subCategory);
      }
    }

    if (validCategories.has(requestedCategory)) {
      setSelectedCategory(requestedCategory);
    }
  }, [searchParams, mainCategories]);

  const filterState: FilterStateProps = {
    selectedCategory,
    setSelectedCategory,
    showFilters,
    setShowFilters,
  };

  const categoryFilteredProducts = useMemo(() => {
    const effectiveCategory =
      resolveAlleCategory(selectedCategory) || selectedCategory;
    if (!effectiveCategory) return allProducts;

    return allProducts.filter((product) =>
      productMatchesCategory(product, effectiveCategory),
    );
  }, [allProducts, selectedCategory]);

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
    return categoryFilteredProducts.filter((product) =>
      productMatchesSelectedFilters(product as any, {
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

  // Sort state
  const [sortBy, setSortBy] = useState<string>('default');

  // Sort products
  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return products.sort(
          (a, b) =>
            parseFloat(a.priceRange?.minVariantPrice?.amount || '0') -
            parseFloat(b.priceRange?.minVariantPrice?.amount || '0'),
        );
      case 'price-desc':
        return products.sort(
          (a, b) =>
            parseFloat(b.priceRange?.minVariantPrice?.amount || '0') -
            parseFloat(a.priceRange?.minVariantPrice?.amount || '0'),
        );
      case 'newest':
        return products.reverse();
      default:
        return products;
    }
  }, [filteredProducts, sortBy]);

  // Intersection observer for grid visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {threshold: 0.1},
    );

    if (gridRef.current) {
      observer.observe(gridRef.current);
    }

    return () => {
      if (gridRef.current) {
        observer.unobserve(gridRef.current);
      }
    };
  }, []);

  // Reset animation when category changes
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  return (
    <div className="pt-3 sm:pt-6 lg:pt-12 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero Header */}
        <div className="text-center mb-6">
          <h1 className="font-sans text-h1 sm:text-h1-sm lg:text-h1-lg tracking-[0.3em] uppercase text-foreground">
            {resolveAlleCategory(selectedCategory)
              ? getCategoryLabel(selectedCategory)
              : 'SHOP ALL'}
          </h1>
        </div>

        {/* Category Navigation */}
        <div className="mb-6 space-y-3">
          {/* Row 1: Main Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from(mainCategories.keys()).map((category) => {
              // Check if this main category or any of its subcategories is selected.
              // If the currently selected category is itself a main category,
              // don't treat it as a subcategory of another main category.
              const isSelectedMain = mainCategories.has(selectedCategory);
              const isActive =
                selectedCategory === category ||
                (!isSelectedMain &&
                  mainCategories.get(category)?.has(selectedCategory));

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'bg-card text-foreground hover:bg-card/80 shadow-md hover:scale-105'
                  }`}
                >
                  {category.toUpperCase()}
                </button>
              );
            })}
          </div>

          {/* Row 2: Subcategories - Show based on selected main category */}
          <div className="flex flex-wrap justify-center gap-1.5 min-h-[2rem]">
            {(() => {
              // Find which main category the selected category belongs to.
              // If the selected category is itself a main category, prefer it.
              let parentCategory = selectedCategory;

              if (!mainCategories.has(selectedCategory)) {
                // If selected isn't a main category, find its parent main category.
                for (const [mainCat, subCats] of mainCategories.entries()) {
                  if (subCats.has(selectedCategory)) {
                    parentCategory = mainCat;
                    break;
                  }
                }
              }

              // Show subcategories of the parent category
              const subcategories = mainCategories.get(parentCategory);

              return (
                subcategories &&
                Array.from(subcategories).length > 0 && (
                  <>
                    {Array.from(subcategories).map((subcategory) => (
                      <Link
                        key={subcategory}
                        to={`/collections/shop-all/alle-${parentCategory}/${subcategory}`}
                        prefetch="intent"
                        className={`px-2 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                          selectedCategory === subcategory
                            ? 'bg-primary text-primary-foreground shadow-md scale-105'
                            : 'bg-card/50 text-foreground/70 hover:bg-card/70 hover:text-foreground shadow-sm hover:scale-105'
                        }`}
                      >
                        {getCategoryLabel(subcategory)}
                      </Link>
                    ))}
                  </>
                )
              );
            })()}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <button
              type="button"
              onClick={() =>
                filterState.setShowFilters(!filterState.showFilters)
              }
              className="lg:hidden inline-flex items-center gap-2 text-sm text-foreground"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-4">
              <span className="text-sm text-foreground/60">Filter:</span>

              {/* Price Filter */}
              <CustomSelect
                value={selectedPriceRange}
                onChange={setSelectedPriceRange}
                options={[
                  {value: '0-50', label: '€0 - €50'},
                  {value: '50-100', label: '€50 - €100'},
                  {value: '100-150', label: '€100 - €150'},
                  {value: '150+', label: '€150+'},
                ]}
                placeholder="Preis"
                className="w-auto min-w-[140px]"
              />

              {/* Size Filter */}
              {availableSizes.length > 0 && (
                <CustomSelect
                  value={selectedSize}
                  onChange={setSelectedSize}
                  options={availableSizes.map((size) => ({
                    value: size,
                    label: size,
                  }))}
                  placeholder="Größe"
                  className="w-auto min-w-[120px]"
                />
              )}

              {/* Color Filter */}
              {availableColors.length > 0 && (
                <CustomSelect
                  value={selectedColor}
                  onChange={setSelectedColor}
                  options={availableColors.map((color) => ({
                    value: color,
                    label: color,
                  }))}
                  placeholder="Farbe"
                  className="w-auto min-w-[140px]"
                />
              )}

              {/* Clear Filters Button */}
              {(selectedSize || selectedColor || selectedPriceRange) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSize('');
                    setSelectedColor('');
                    setSelectedPriceRange('');
                  }}
                  className="px-4 py-2 rounded-full text-xs bg-card text-foreground border border-border/50 hover:bg-card/80 transition-colors"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>
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

        {/* Mobile Filter Drawer */}
        {filterState.showFilters && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-sans text-h2 text-foreground">Filter</h2>
                <button
                  type="button"
                  onClick={() => filterState.setShowFilters(false)}
                  className="p-2 text-foreground/70 hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <CustomSelect
                  value={selectedPriceRange}
                  onChange={setSelectedPriceRange}
                  options={[
                    {value: '0-50', label: '€0 - €50'},
                    {value: '50-100', label: '€50 - €100'},
                    {value: '100-150', label: '€100 - €150'},
                    {value: '150+', label: '€150+'},
                  ]}
                  placeholder="Preis"
                  className="w-full"
                />

                {availableSizes.length > 0 && (
                  <CustomSelect
                    value={selectedSize}
                    onChange={setSelectedSize}
                    options={availableSizes.map((size) => ({
                      value: size,
                      label: size,
                    }))}
                    placeholder="Größe"
                    className="w-full"
                  />
                )}

                {availableColors.length > 0 && (
                  <CustomSelect
                    value={selectedColor}
                    onChange={setSelectedColor}
                    options={availableColors.map((color) => ({
                      value: color,
                      label: color,
                    }))}
                    placeholder="Farbe"
                    className="w-full"
                  />
                )}

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSize('');
                      setSelectedColor('');
                      setSelectedPriceRange('');
                    }}
                    className="w-full px-4 py-3 rounded-3xl text-sm bg-card text-foreground border border-border/50 hover:bg-card/80 transition-colors"
                  >
                    Filter zurücksetzen
                  </button>
                  <button
                    type="button"
                    onClick={() => filterState.setShowFilters(false)}
                    className="w-full px-4 py-3 rounded-3xl text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div ref={gridRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedProducts.map((product, index) => (
            <ProductItem
              key={product.id}
              product={product}
              loading={index < 8 ? 'eager' : undefined}
              index={index}
              isVisible={isVisible}
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
                  {selectedCategory
                    ? `Wir arbeiten daran, Ihnen tolle ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Produkte anzubieten. Bleiben Sie dran!`
                    : 'Keine Produkte in dieser Kategorie gefunden.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
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
        ...MoneyCollectionItem
      }
      maxVariantPrice {
        ...MoneyCollectionItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyCollectionItem
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
            ...MoneyCollectionItem
          }
          compareAtPrice {
            ...MoneyCollectionItem
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
          ...MoneyCollectionItem
        }
        compareAtPrice {
          ...MoneyCollectionItem
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
        ...MoneyCollectionItem
      }
      compareAtPrice {
        ...MoneyCollectionItem
      }
      selectedOptions {
        name
        value
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/product
export const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
