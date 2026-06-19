import {useRef} from 'react';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {ProductItem} from '~/components/ProductItem';

export type HomepageProductSliderSection = {
  id: string;
  title: string;
  products: any[];
};

type HomepageProductSlidersProps = {
  sections: HomepageProductSliderSection[];
};

const uniqueProducts = (products: any[]) => {
  const seen = new Set<string>();

  return products.filter((product) => {
    const key = product?.id || product?.handle;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

function HomepageProductSlider({
  section,
}: {
  section: HomepageProductSliderSection;
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const products = uniqueProducts(section.products).filter(
    (product) => product?.priceRange?.minVariantPrice?.amount,
  );

  if (products.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    sliderRef.current?.scrollBy({
      left: direction === 'left' ? -340 : 340,
      behavior: 'smooth',
    });
  };

  return (
    <section className="border-t border-border/20 pt-5 sm:pt-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-sans text-xl sm:text-2xl font-bold text-foreground">
          {section.title}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-md transition-colors hover:bg-foreground hover:text-background"
            aria-label={`${section.title} vorherige Produkte`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-md transition-colors hover:bg-foreground hover:text-background"
            aria-label={`${section.title} nächste Produkte`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth scrollbar-hide pb-3"
      >
        {products.map((product, index) => (
          <div
            key={`${section.id}-${product.id || product.handle}`}
            className="w-[240px] flex-shrink-0 snap-start sm:w-[280px]"
          >
            <ProductItem
              product={product as any}
              loading={index < 3 ? 'eager' : 'lazy'}
              index={index}
              isVisible
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function HomepageProductSliders({
  sections,
}: HomepageProductSlidersProps) {
  const visibleSections = sections.filter(
    (section) => uniqueProducts(section.products).length > 0,
  );

  if (visibleSections.length === 0) return null;

  return (
    <div className="mb-5 space-y-8 sm:mb-7 sm:space-y-10">
      {visibleSections.map((section) => (
        <HomepageProductSlider key={section.id} section={section} />
      ))}
    </div>
  );
}
