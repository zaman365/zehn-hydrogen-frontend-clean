import {useEffect, useRef, useCallback} from 'react';
import {ProductItem} from '~/components/ProductItem';
import {ProductCatalogBand} from '~/components/zehn/ProductCatalogBand';
import {
  HomepageProductSliders,
  type HomepageProductSliderSection,
} from '~/components/zehn/HomepageProductSliders';
import {ShoppingBag, ChevronLeft, ChevronRight} from 'lucide-react';
import {getCategorySectionCopy} from '~/lib/category-section-copy';
import {ZEHN_HOMEPAGE_GRID_TOP} from '~/lib/homepage-section-styles';
import {ZEHN_SITE_CONTENT_ROW} from '~/lib/site-content-row';
import {cn} from '~/lib/utils';
import {useProductCatalogFilters} from '~/hooks/useProductCatalogFilters';
import {
  resolveProductImageLoading,
  ZEHN_HOMEPAGE_CATEGORY_GRID_ABOVE_FOLD_LIMIT,
} from '~/lib/zehn-product-image-loading';

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
  const menuRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const filterState = useProductCatalogFilters({
    mode: 'homepage',
    allProducts,
    bestsellerProducts,
    shortsProducts,
    hosenProducts,
    topsProducts,
    jeansProducts,
    jackenProducts,
    hideFacetsForCategory: (category) => category === 'bestseller',
  });

  const {
    selectedCategory,
    setSelectedCategory,
    displayProducts,
    showFacetToolbar,
    hasSelectedCategory,
  } = filterState;

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

  /* Instant category swap — no animation delay to prevent blank-flash on chip click (BL-0006) */
  const applyCategorySelection = useCallback(
    (category: Category) => {
      if (category === selectedCategory) return;
      setSelectedCategory(category);
      setTimeout(() => scrollToSelectionAndProducts(), 0);
    },
    [scrollToSelectionAndProducts, selectedCategory, setSelectedCategory],
  );

  const handleMainSelect = useCallback(
    (category: Category) => {
      const nextCategory = selectedCategory === category ? '' : category;
      applyCategorySelection(nextCategory);
    },
    [applyCategorySelection, selectedCategory],
  );

  const handleSubSelect = useCallback(
    (subcategory: Category) => {
      applyCategorySelection(subcategory);
    },
    [applyCategorySelection],
  );

  const bandFilterState = {
    ...filterState,
    handleMainSelect,
    handleSubSelect,
  };

  const scrollGrid = (direction: 'left' | 'right') => {
    if (gridRef.current) {
      const scrollAmount = 300;
      gridRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="w-full py-0 bg-background min-w-0 overflow-x-clip">
      <div className={cn(ZEHN_SITE_CONTENT_ROW, 'min-w-0')}>
        <ProductCatalogBand
          menuRef={menuRef}
          navVariant="homepage"
          copy={getCategorySectionCopy('homepage')}
          filterState={bandFilterState}
          showFilterToolbar={showFacetToolbar}
        />

        {hasSelectedCategory && (
          <>
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
                  {displayProducts.map((product, index) => {
                    const imageLoad = resolveProductImageLoading('gridAboveFold', index, {
                      aboveFoldLimit: ZEHN_HOMEPAGE_CATEGORY_GRID_ABOVE_FOLD_LIMIT,
                    });

                    return (
                    <div
                      key={`${selectedCategory}-${product.id}`}
                      className="homepage-product-card flex-shrink-0 w-[280px] sm:w-auto snap-start"
                    >
                      <ProductItem
                        product={product as any}
                        loading={imageLoad.loading}
                        priority={imageLoad.priority}
                        isLCP={imageLoad.isLCP}
                        index={index}
                      />
                    </div>
                    );
                  })}
                </div>

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
