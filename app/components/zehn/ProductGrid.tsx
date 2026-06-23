import {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import {ProductItem} from '~/components/ProductItem';
import {CategoryNavSection} from '~/components/zehn/CategoryNavSection';
import {ProductFilterToolbar} from '~/components/zehn/ProductFilterToolbar';
import {
  HomepageProductSliders,
  type HomepageProductSliderSection,
} from '~/components/zehn/HomepageProductSliders';
import {ShoppingBag, ChevronLeft, ChevronRight} from 'lucide-react';
import {MAIN_CATEGORY_MAP} from '~/lib/category-map';
import {getCategorySectionCopy, getCategorySubRowHint} from '~/lib/category-section-copy';
import {ZEHN_HOMEPAGE_GRID_TOP} from '~/lib/homepage-section-styles';
import {CATEGORY_NAV_HOMEPAGE_SHELL, CATEGORY_NAV_STACK_GAP} from '~/lib/category-nav-styles';
import type {ProductFilterKind} from '~/lib/product-filter-ui';
import {ZEHN_SITE_CONTENT_ROW} from '~/lib/site-content-row';
import {cn} from '~/lib/utils';
import {productMatchesCategory} from '~/lib/category-match';
import {
  getAvailableFilteredProductValues,
  productMatchesSelectedFilters,
} from '~/lib/product-filters';

type Category = string;

type ProductGridProps = {
  allProducts: any[];
  bestsellerProducts?: any[];
  shortsProducts?: any[];
  hosenProducts?: any[];
  topsProducts?: any[];
  jeansProducts?: any[];
  jackenProducts?: any[];
  featuredSections?: HomepageProductSliderSection[];
};

// Source main categories from canonical mapping
const mainCategories = new Map<string, Set<string>>(
  Object.entries(MAIN_CATEGORY_MAP).map(([k, v]) => [k, new Set(v)]),
);

const getParentCategory = (category: string): string => {
  if (mainCategories.has(category)) return category;

  for (const [mainCategory, subcategories] of mainCategories.entries()) {
    if (subcategories.has(category)) return mainCategory;
  }

  return category;
};

const uniqueProducts = (products: any[]): any[] => {
  const productMap = new Map<string, any>();

  products.forEach((product) => {
    const key = product?.id || product?.handle;
    if (key && !productMap.has(key)) {
      productMap.set(key, product);
    }
  });

  return Array.from(productMap.values());
};

export function ProductGrid({
  allProducts,
  bestsellerProducts = [],
  shortsProducts = [],
  hosenProducts = [],
  topsProducts = [],
  jeansProducts = [],
  jackenProducts = [],
  featuredSections = [],
}: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('');
  const [isVisible, setIsVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const menuRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const scrollToSelectionAndProducts = useCallback(() => {
    if (!menuRef.current) return;

    const fixedHeader = document.querySelector(
      'header.fixed',
    ) as HTMLElement | null;
    const fixedMenuTop = fixedHeader
      ? Math.round(fixedHeader.getBoundingClientRect().bottom + 12)
      : window.innerWidth < 1024
        ? 132
        : 108;
    const absoluteMenuY =
      menuRef.current.getBoundingClientRect().top + window.pageYOffset;
    const targetScrollY = Math.max(0, absoluteMenuY - fixedMenuTop);

    window.scrollTo({top: targetScrollY, behavior: 'smooth'});
  }, []);

  useEffect(() => {
    window.addEventListener(
      'zehn:hero-banner-click',
      scrollToSelectionAndProducts,
    );

    return () => {
      window.removeEventListener(
        'zehn:hero-banner-click',
        scrollToSelectionAndProducts,
      );
    };
  }, [scrollToSelectionAndProducts]);

  // Base products by selected category using tag-based matching
  const categoryProducts = useMemo(() => {
    if (selectedCategory === 'bestseller') {
      return bestsellerProducts.length > 0 ? bestsellerProducts : allProducts;
    }

    if (!selectedCategory) return [];

    const parentCategory = getParentCategory(selectedCategory);
    const dedicatedProducts: Record<string, any[]> = {
      shorts: shortsProducts,
      hosen: hosenProducts,
      jeans: jeansProducts,
      jacken: jackenProducts,
      tops: topsProducts,
    };
    const fallbackProducts = allProducts.filter((product) =>
      productMatchesCategory(product, parentCategory),
    );
    const parentProducts = uniqueProducts([
      ...(dedicatedProducts[parentCategory] || []),
      ...fallbackProducts,
    ]);

    if (selectedCategory === parentCategory) {
      return parentProducts;
    }

    return parentProducts.filter((product) =>
      productMatchesCategory(product, selectedCategory),
    );
  }, [
    allProducts,
    bestsellerProducts,
    hosenProducts,
    jeansProducts,
    jackenProducts,
    selectedCategory,
    shortsProducts,
    topsProducts,
  ]);

  const availableSizes = useMemo(
    () =>
      getAvailableFilteredProductValues(categoryProducts, 'size', {
        color: selectedColor,
        priceRange: selectedPriceRange,
      }),
    [categoryProducts, selectedColor, selectedPriceRange],
  );

  const availableColors = useMemo(
    () =>
      getAvailableFilteredProductValues(categoryProducts, 'color', {
        size: selectedSize,
        priceRange: selectedPriceRange,
      }),
    [categoryProducts, selectedSize, selectedPriceRange],
  );

  const displayProducts = useMemo(() => {
    const filtered = categoryProducts.filter((product: any) =>
      productMatchesSelectedFilters(product, {
        size: selectedSize,
        color: selectedColor,
        priceRange: selectedPriceRange,
      }),
    );

    switch (sortBy) {
      case 'price-asc':
        return filtered.sort(
          (a: any, b: any) =>
            parseFloat(a.priceRange?.minVariantPrice?.amount || '0') -
            parseFloat(b.priceRange?.minVariantPrice?.amount || '0'),
        );
      case 'price-desc':
        return filtered.sort(
          (a: any, b: any) =>
            parseFloat(b.priceRange?.minVariantPrice?.amount || '0') -
            parseFloat(a.priceRange?.minVariantPrice?.amount || '0'),
        );
      case 'newest':
        return filtered.reverse();
      default:
        return filtered;
    }
  }, [
    categoryProducts,
    selectedColor,
    selectedPriceRange,
    selectedSize,
    sortBy,
  ]);

  const applyCategorySelection = useCallback(
    (category: Category) => {
      if (category === selectedCategory) return;

      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedCategory(category);
        setTimeout(() => {
          setIsTransitioning(false);
          scrollToSelectionAndProducts();
        }, 50);
      }, 300);
    },
    [selectedCategory, scrollToSelectionAndProducts],
  );

  const handleCategoryChange = (category: Category) => {
    // Re-click active main chip clears selection — back to homepage sliders (ART-0043).
    const nextCategory = selectedCategory === category ? '' : category;
    applyCategorySelection(nextCategory);
  };

  const handleSubcategoryChange = (subcategory: Category) => {
    applyCategorySelection(subcategory);
  };

  const handleRemoveFilterChip = useCallback((kind: ProductFilterKind) => {
    switch (kind) {
      case 'price':
        setSelectedPriceRange('');
        break;
      case 'size':
        setSelectedSize('');
        break;
      case 'color':
        setSelectedColor('');
        break;
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedSize('');
    setSelectedColor('');
    setSelectedPriceRange('');
  }, []);

  const scrollGrid = (direction: 'left' | 'right') => {
    if (gridRef.current) {
      const scrollAmount = 300;
      gridRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Determine which main category is active (either directly selected or parent of selected sub)
  const getActiveMainCategory = (): string => {
    // Check if selectedCategory is a main category
    if (mainCategories.has(selectedCategory)) {
      return selectedCategory;
    }
    // Check if selectedCategory is a subcategory — find its parent
    for (const [mainCat, subCats] of mainCategories.entries()) {
      if (Array.from(subCats).includes(selectedCategory)) {
        return mainCat;
      }
    }
    return '';
  };

  const activeMainCategory = getActiveMainCategory();
  const hasSelectedCategory = Boolean(selectedCategory);
  const showControls = hasSelectedCategory && selectedCategory !== 'bestseller';

  useEffect(() => {
    const gridObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {threshold: 0.1},
    );

    const gridElement = gridRef.current;

    if (gridElement) {
      gridObserver.observe(gridElement);
    }

    return () => {
      if (gridElement) {
        gridObserver.unobserve(gridElement);
      }
    };
  }, []);

  // Reset animation when category changes
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  useEffect(() => {
    if (!showControls) {
      setSelectedSize('');
      setSelectedColor('');
      setSelectedPriceRange('');
      setSortBy('default');
    }
  }, [showControls]);

  const categoryNavSection = (
    <CategoryNavSection
      menuRef={menuRef}
      variant="homepage"
      copy={getCategorySectionCopy('homepage')}
      mainCategories={mainCategories}
      activeMainCategory={activeMainCategory}
      selectedCategory={selectedCategory}
      mainInteraction="filter"
      subInteraction="filter"
      onMainSelect={handleCategoryChange}
      onSubSelect={handleSubcategoryChange}
      subcategoriesFor={activeMainCategory}
      subPresentation="subRow"
      subChipVariant="main"
      subRowHint={
        activeMainCategory
          ? getCategorySubRowHint(activeMainCategory)
          : undefined
      }
      showSubAlleChip
      showSubBottomSeparator
    />
  );

  return (
    <section className="w-full py-0 bg-background min-w-0 overflow-x-clip">
      <div className={cn(ZEHN_SITE_CONTENT_ROW, 'min-w-0')}>
        <div
          className={cn(
            CATEGORY_NAV_HOMEPAGE_SHELL,
          )}
        >
          <div className={CATEGORY_NAV_STACK_GAP}>
            {categoryNavSection}

            {showControls && (
              <ProductFilterToolbar
                selectedPriceRange={selectedPriceRange}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                availableSizes={availableSizes}
                availableColors={availableColors}
                sortBy={sortBy}
                productCount={displayProducts.length}
                onPriceChange={setSelectedPriceRange}
                onSizeChange={setSelectedSize}
                onColorChange={setSelectedColor}
                onSortChange={setSortBy}
                onClear={handleClearFilters}
                onRemoveChip={handleRemoveFilterChip}
              />
            )}
          </div>
        </div>

        {hasSelectedCategory && (
          <>
            {/* Product Grid or Empty State */}
            {displayProducts.length === 0 ? (
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
                      We&apos;re working on bringing you amazing{' '}
                      {selectedCategory} products. Stay tuned!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={ZEHN_HOMEPAGE_GRID_TOP}>
                <div
                  ref={gridRef}
                  className="flex min-w-0 max-w-full overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 scrollbar-hide snap-x snap-mandatory scroll-smooth pb-2 sm:pb-0 sm:overflow-visible"
                >
                  {displayProducts.map((product, index) => (
                    <div
                      key={`${selectedCategory}-${product.id}`}
                      className="homepage-product-card flex-shrink-0 w-[280px] sm:w-auto snap-start"
                    >
                      <ProductItem
                        product={product as any}
                        loading={index < 4 ? 'eager' : 'lazy'}
                        index={index}
                        isVisible={isVisible && !isTransitioning}
                      />
                    </div>
                  ))}
                </div>

                {/* Mobile Navigation - Compact pill design */}
                <div className="flex sm:hidden justify-center items-center mt-6 pb-2">
                  <div className="inline-flex items-center gap-1 bg-card/80 backdrop-blur-sm rounded-full p-1.5 border border-border/50 shadow-md">
                    <button
                      type="button"
                      onClick={() => scrollGrid('left')}
                      className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center hover:bg-foreground hover:text-background transition-all active:scale-95"
                      aria-label="Previous"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="w-px h-6 bg-border/50" />
                    <button
                      type="button"
                      onClick={() => scrollGrid('right')}
                      className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center hover:bg-foreground hover:text-background transition-all active:scale-95"
                      aria-label="Next"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <HomepageProductSliders sections={featuredSections} />
      </div>
    </section>
  );
}
