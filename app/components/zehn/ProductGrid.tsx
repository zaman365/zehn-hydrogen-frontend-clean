import {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import {Link} from 'react-router';
import {ProductItem} from '~/components/ProductItem';
import {CustomSelect} from '~/components/CustomSelect';
import {
  HomepageProductSliders,
  type HomepageProductSliderSection,
} from '~/components/zehn/HomepageProductSliders';
import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  MAIN_CATEGORY_MAP,
  getCategoryLabel,
  getCategoryUrl,
} from '~/lib/category-map';
import {productMatchesCategory} from '~/lib/category-match';

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

const getCollectionPath = (category: string): string => {
  return category ? getCategoryUrl(category) : '/collections/all';
};

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
  const [headerVisible, setHeaderVisible] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const menuRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const scrollToSelectionAndProducts = useCallback(() => {
    if (!menuRef.current) return;

    // Always land at the same absolute viewport position (no incremental drift)
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

  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();

    categoryProducts.forEach((product: any) => {
      product.options?.forEach((option: any) => {
        const optionName = option.name?.toLowerCase();
        if (optionName === 'size' || optionName === 'größe') {
          option.optionValues?.forEach((value: any) => {
            if (value.name && value.name !== 'Default Title') {
              sizeSet.add(value.name);
            }
          });
        }
      });
    });

    return Array.from(sizeSet).sort();
  }, [categoryProducts]);

  const availableColors = useMemo(() => {
    const colorSet = new Set<string>();

    categoryProducts.forEach((product: any) => {
      product.options?.forEach((option: any) => {
        const optionName = option.name?.toLowerCase();
        if (
          optionName === 'color' ||
          optionName === 'farbe' ||
          optionName === 'colour'
        ) {
          option.optionValues?.forEach((value: any) => {
            if (value.name && value.name !== 'Default Title') {
              colorSet.add(value.name);
            }
          });
        }
      });
    });

    return Array.from(colorSet).sort();
  }, [categoryProducts]);

  const displayProducts = useMemo(() => {
    let filtered = [...categoryProducts];

    if (selectedSize) {
      filtered = filtered.filter((product: any) => {
        return product.options?.some((option: any) => {
          const optionName = option.name?.toLowerCase();
          if (optionName === 'size' || optionName === 'größe') {
            return option.optionValues?.some(
              (value: any) => value.name === selectedSize,
            );
          }
          return false;
        });
      });
    }

    if (selectedColor) {
      filtered = filtered.filter((product: any) => {
        return product.options?.some((option: any) => {
          const optionName = option.name?.toLowerCase();
          if (
            optionName === 'color' ||
            optionName === 'farbe' ||
            optionName === 'colour'
          ) {
            return option.optionValues?.some(
              (value: any) => value.name === selectedColor,
            );
          }
          return false;
        });
      });
    }

    if (selectedPriceRange) {
      filtered = filtered.filter((product: any) => {
        const price = parseFloat(
          product.priceRange?.minVariantPrice?.amount || '0',
        );
        switch (selectedPriceRange) {
          case '0-50':
            return price >= 0 && price <= 50;
          case '50-100':
            return price > 50 && price <= 100;
          case '100-150':
            return price > 100 && price <= 150;
          case '150+':
            return price > 150;
          default:
            return true;
        }
      });
    }

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

  const handleCategoryChange = (category: Category) => {
    if (category !== selectedCategory) {
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedCategory(category);
        setTimeout(() => {
          setIsTransitioning(false);
          scrollToSelectionAndProducts();
        }, 50);
      }, 300);
    }
  };

  const handleSubcategoryChange = (subcategory: Category) => {
    if (subcategory !== selectedCategory) {
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedCategory(subcategory);
        setTimeout(() => {
          setIsTransitioning(false);
          scrollToSelectionAndProducts();
        }, 50);
      }, 300);
    }
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

  // Get subcategories to display based on active main category
  const currentSubcategories = mainCategories.get(activeMainCategory);
  const viewAllHref = getCollectionPath(selectedCategory);

  useEffect(() => {
    const gridObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {threshold: 0.1},
    );

    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true);
        }
      },
      {threshold: 0.1},
    );

    const gridElement = gridRef.current;
    const headerElement = headerRef.current;

    if (gridElement) {
      gridObserver.observe(gridElement);
    }

    if (headerElement) {
      headerObserver.observe(headerElement);
    }

    return () => {
      if (gridElement) {
        gridObserver.unobserve(gridElement);
      }
      if (headerElement) {
        headerObserver.unobserve(headerElement);
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

  return (
    <section className="w-full py-0.5 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header hidden per homepage request */}
        {/*
        <div ref={headerRef} className="text-center mb-6 sm:mb-8">
          <h2 className={`font-sans text-h2 sm:text-h2-sm lg:text-h2-lg text-foreground mb-3 sm:mb-4 text-balance flex items-center justify-center gap-3 ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
            <img src="/ZEHN_Wordmark.png" alt="ZEHN" className="h-5 sm:h-6 lg:h-7 w-auto" style={{ border: 'none', outline: 'none', boxShadow: 'none', borderRadius: '0' }} />
            <span>Auswahl</span>
          </h2>
        </div>
        */}

        {/* Row 1: Main Categories - same design as shop all collection page */}
        <div ref={menuRef} className="mb-4 sm:mb-6 space-y-3">
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from(mainCategories.keys()).map((category) => {
              const isActive = activeMainCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  className={`px-3 sm:px-4 py-1 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 ${
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

          {/* Row 2: Subcategories - same design as shop all collection page */}
          <div className="flex flex-wrap justify-center gap-1 min-h-[1.5rem]">
            {currentSubcategories &&
              Array.from(currentSubcategories).length > 0 && (
                <>
                  {Array.from(currentSubcategories).map((subcategory) => (
                    <button
                      key={subcategory}
                      type="button"
                      onClick={() => handleSubcategoryChange(subcategory)}
                      className={`px-2 sm:px-3 py-[3px] rounded-full text-xs font-medium transition-all duration-300 ${
                        selectedCategory === subcategory
                          ? 'bg-primary text-primary-foreground shadow-md scale-105'
                          : 'bg-card/50 text-foreground/70 hover:bg-card/70 hover:text-foreground shadow-sm hover:scale-105'
                      }`}
                    >
                      {getCategoryLabel(subcategory)}
                    </button>
                  ))}
                </>
              )}
          </div>
        </div>

        {showControls && (
          <div className="mb-4 sm:mb-6 space-y-3">
            <div className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden inline-flex items-center gap-2 text-sm text-foreground"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filter
                </button>

                <div className="hidden lg:flex items-center gap-4">
                  <span className="text-sm text-foreground/60">Filter:</span>

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
            </div>

            <div className="flex items-center justify-between pt-2 pb-2">
              <span className="font-body text-xs text-muted">
                {displayProducts.length}{' '}
                {displayProducts.length === 1 ? 'Produkt' : 'Produkte'}
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

            {showFilters && (
              <div className="lg:hidden fixed inset-0 z-50 bg-background">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-sans text-h2 text-foreground">
                      Filter
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="p-2 text-foreground/70 hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
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
                      />
                    )}

                    <CustomSelect
                      value={sortBy}
                      onChange={setSortBy}
                      options={[
                        {value: 'default', label: 'Empfohlen'},
                        {value: 'price-asc', label: 'Preis: Niedrig → Hoch'},
                        {value: 'price-desc', label: 'Preis: Hoch → Niedrig'},
                        {value: 'newest', label: 'Neueste'},
                      ]}
                      placeholder="Sortieren"
                    />

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
                        onClick={() => setShowFilters(false)}
                        className="w-full px-4 py-3 rounded-3xl text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
              <div>
                <div
                  ref={gridRef}
                  className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 scrollbar-hide snap-x snap-mandatory scroll-smooth pb-2 sm:pb-0 sm:overflow-visible px-1"
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

        {/*
        <div className="text-center mt-8 sm:mt-12">
          <Link
            to={viewAllHref}
            className="inline-flex items-center justify-center gap-2 bg-transparent border border-foreground/30 text-foreground px-6 sm:px-8 py-3 sm:py-4 rounded-full text-xs tracking-[0.3em] uppercase font-sans transition-all duration-300 hover:bg-foreground/5 min-h-[44px]"
          >
            Alle ansehen
          </Link>
        </div>
        */}
      </div>
    </section>
  );
}
