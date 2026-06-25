import {
  redirect,
  useLoaderData,
  Link,
} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  Image,
} from '@shopify/hydrogen';
import {ZehnShopifyImage} from '~/components/zehn';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {getCachePolicy, CACHE_SHORT} from '~/lib/storefront-cache-policy';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useState, useEffect, useMemo, useRef} from 'react';
import {
  ChevronDown,
  ChevronUp,
  Shirt,
  Truck,
  RefreshCw,
  Award,
  Star,
  Check,
  Minus,
  Plus,
  ChevronRight,
  ChevronLeft,
  Heart,
  X,
} from 'lucide-react';
import {useWishlist} from '~/components/zehn/wishlist-context';
import {useScrollLock} from '~/hooks/useScrollLock';
import {ProductItem} from '~/components/ProductItem';
import {
  fireDirectInitiateCheckout,
  MetaProductView,
} from '~/components/zehn/MetaPixelEvents';
import {
  getAllProductImages,
  getProductImagesForColor,
  isColorOptionName,
} from '~/lib/product-media';

export const meta: Route.MetaFunction = ({data}) => {
  const product = data?.product;
  if (!product) return [{title: 'Produkt | ZEHN'}];

  const selectedVariant = product.selectedOrFirstAvailableVariant;
  const image =
    selectedVariant?.image ||
    product.featuredImage ||
    product.media?.nodes?.[0]?.image;
  const description =
    product.seo?.description ||
    product.description ||
    `${product.title} – Premium Herrenmode von ZEHN.`;
  const title = `${product.seo?.title || product.title} | ZEHN`;
  const url = `/products/${product.handle}`;

  return [
    {title},
    {name: 'description', content: description},
    {tagName: 'link', rel: 'canonical', href: url},
    // Open Graph
    {property: 'og:type', content: 'product'},
    {property: 'og:title', content: product.title},
    {property: 'og:description', content: description},
    {property: 'og:url', content: url},
    {property: 'og:site_name', content: 'ZEHN'},
    {property: 'og:locale', content: 'de_DE'},
    ...(image
      ? [
          {property: 'og:image', content: image.url},
          {property: 'og:image:width', content: String(image.width || '')},
          {property: 'og:image:height', content: String(image.height || '')},
          {property: 'og:image:alt', content: image.altText || product.title},
        ]
      : []),
    ...(selectedVariant?.price
      ? [
          {
            property: 'product:price:amount',
            content: selectedVariant.price.amount,
          },
          {
            property: 'product:price:currency',
            content: selectedVariant.price.currencyCode,
          },
        ]
      : []),
    // Twitter Card
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: product.title},
    {name: 'twitter:description', content: description},
    ...(image ? [{name: 'twitter:image', content: image.url}] : []),
  ];
};

const isSizeOptionName = (name?: string) => {
  const optionName = name?.toLowerCase?.().trim?.() || '';
  return optionName === 'size' || optionName === 'größe' || optionName === 'groesse';
};

const getSizeSortValue = (sizeName?: string) => {
  const normalized = sizeName?.toUpperCase().replace(/\s+/g, '') || '';
  const alphaOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', 'XXXL', '3XL', '4XL', '5XL'];
  const alphaIndex = alphaOrder.indexOf(normalized);

  if (alphaIndex >= 0) {
    return alphaIndex;
  }

  const waist = normalized.match(/(\d+)W/);
  const length = normalized.match(/(\d+)L/);
  const numeric = normalized.match(/^(\d+)$/);

  if (waist) {
    return 100 + Number(waist[1]) * 100 + (length ? Number(length[1]) : 0);
  }

  if (numeric) {
    return 100 + Number(numeric[1]) * 100;
  }

  return Number.MAX_SAFE_INTEGER;
};

const getSortedOptionValues = (option: any) => {
  if (!isSizeOptionName(option.name)) return option.optionValues;

  return [...option.optionValues].sort((left: any, right: any) => {
    const leftSortValue = getSizeSortValue(left.name);
    const rightSortValue = getSizeSortValue(right.name);

    if (leftSortValue !== rightSortValue) {
      return leftSortValue - rightSortValue;
    }

    return String(left.name).localeCompare(String(right.name), 'de', {
      numeric: true,
      sensitivity: 'base',
    });
  });
};

export async function loader(args: Route.LoaderArgs) {
  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);
  
  // Also await deferred data for now (we can optimize later)
  const deferredData = await loadDeferredData(args);

  return {...criticalData, ...deferredData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  context,
  params,
  request,
}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
      cache: getCachePolicy(storefront, CACHE_SHORT),
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
async function loadDeferredData({context}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.
  
  const {storefront} = context;
  
  // Get recommended products (random products for now)
  const {products} = await storefront.query(RECOMMENDED_PRODUCTS_QUERY, {
    variables: {first: 8},
    cache: getCachePolicy(storefront, CACHE_SHORT),
  });

  return {
    recommendedProducts: products,
  };
}

const benefits = [
  { icon: Shirt, label: "Größenratgeber" },
  { icon: Truck, label: "Kostenloser Versand" },
  { icon: RefreshCw, label: "Einfache Rückgabe" },
  { icon: Award, label: "Premium-Qualität" }
];

type AccordionSection = "description" | "sizeFit" | "care" | "shipping";

function getProductSummaryHtml(descriptionHtml?: string | null) {
  if (!descriptionHtml) return '';

  const listMatch = descriptionHtml.match(/<(ul|ol)\b[^>]*>[\s\S]*?<\/\1>/i);
  return listMatch?.[0] || '';
}

function getProductDetailsHtml(descriptionHtml?: string | null) {
  if (!descriptionHtml) return '';

  const withoutSummary = descriptionHtml.replace(
    /<(ul|ol)\b[^>]*>[\s\S]*?<\/\1>/i,
    '',
  );

  return withoutSummary
    .replace(/Produktdetails ansehen/gi, '')
    .replace(/<(p|div|span|h[1-6])\b[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/\1>/gi, '')
    .replace(/^(?:\s|&nbsp;|<br\s*\/?>)+/i, '')
    .trim();
}

export default function Product() {
  const {product, recommendedProducts} = useLoaderData<typeof loader>();
  const [openAccordion, setOpenAccordion] = useState<AccordionSection | null>("description");
  const [isAdded, setIsAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLDivElement>(null);
  const thumbnailRailRef = useRef<HTMLDivElement>(null);
  const [mainImageHeight, setMainImageHeight] = useState<number | null>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const metaProduct = useMemo(
    () => ({
      contentId: selectedVariant.id,
      contentName: product.title,
      currency: selectedVariant.price.currencyCode,
      value: Number(selectedVariant.price.amount),
      quantity: 1,
    }),
    [
      product.title,
      selectedVariant.id,
      selectedVariant.price.amount,
      selectedVariant.price.currencyCode,
    ],
  );

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, description, vendor} = product;
  const summaryHtml = useMemo(
    () => getProductSummaryHtml(descriptionHtml),
    [descriptionHtml],
  );
  const detailsHtml = useMemo(
    () => getProductDetailsHtml(descriptionHtml),
    [descriptionHtml],
  );

  const productImages = useMemo(
    () => getAllProductImages(product, selectedVariant),
    [product, selectedVariant],
  );

  // Get selected color option
  const colorOption = selectedVariant?.selectedOptions?.find(
    (opt: any) => isColorOptionName(opt.name),
  );

  const displayImages = useMemo(
    () =>
      colorOption?.value
        ? getProductImagesForColor({
            product,
            colorValue: colorOption.value,
            selectedVariant,
          })
        : productImages,
    [colorOption?.value, product, productImages, selectedVariant],
  );

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [colorOption?.value]);

  useEffect(() => {
    if (currentImageIndex >= displayImages.length) {
      setCurrentImageIndex(0);
    }
  }, [currentImageIndex, displayImages.length]);

  useEffect(() => {
    const mainImage = mainImageRef.current;
    if (!mainImage) return;

    const updateMainImageHeight = () => {
      setMainImageHeight(mainImage.getBoundingClientRect().height);
    };

    updateMainImageHeight();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateMainImageHeight);
      return () => window.removeEventListener('resize', updateMainImageHeight);
    }

    const observer = new ResizeObserver(updateMainImageHeight);
    observer.observe(mainImage);

    return () => observer.disconnect();
  }, [displayImages.length]);

  useEffect(() => {
    const rail = thumbnailRailRef.current;
    if (!rail) return;

    const activeThumbnail = rail.querySelector<HTMLButtonElement>(
      `[data-thumbnail-index="${currentImageIndex}"]`,
    );

    activeThumbnail?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [currentImageIndex]);

  // Auto slide carousel - 10 seconds interval
  useEffect(() => {
    if (displayImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [displayImages.length]);

  const toggleAccordion = (section: AccordionSection) => {
    setOpenAccordion(openAccordion === section ? null : section);
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left'
        ? sliderRef.current.scrollLeft - scrollAmount
        : sliderRef.current.scrollLeft + scrollAmount;
      
      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const scrollThumbnailRail = (direction: 'up' | 'down') => {
    const rail = thumbnailRailRef.current;
    if (!rail) return;

    const firstThumbnail = rail.querySelector<HTMLButtonElement>('button');
    const scrollAmount = firstThumbnail
      ? firstThumbnail.offsetHeight + 12
      : 132;

    rail.scrollBy({
      top: direction === 'up' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (displayImages.length <= 1) return;

    const delta = touchStartX.current - touchEndX.current;

    if (delta > 50) {
      // Swiped left → next image
      setCurrentImageIndex((prev) =>
        prev === displayImages.length - 1 ? 0 : prev + 1
      );
    } else if (delta < -50) {
      // Swiped right → previous image
      setCurrentImageIndex((prev) =>
        prev === 0 ? displayImages.length - 1 : prev - 1
      );
    }
  };


  // Get metafields or use defaults
  const materials = product.materials?.value || "Premium-Stoffzusammensetzung: 98% Baumwolle, 2% Elastan. Atmungsaktives, weiches Material mit hervorragender Haltbarkeit. Ethisch beschafft und mit Liebe zum Detail produziert.";
  const features = product.features?.value || "Moderne, maßgeschneiderte Passform mit raffinierten Details. Verstärkte Nähte für langlebige Haltbarkeit. Funktionale Taschen mit sauberen Abschlüssen. Für vielseitiges Styling und ganztägigen Komfort.";
  const care = product.care?.value || "Maschinenwäsche kalt mit ähnlichen Farben. Im Trockner bei niedriger Temperatur oder an der Luft trocknen. Bei Bedarf kühl bügeln. Nicht bleichen. Pflegeetikett beachten.";
  const shipping = product.shipping?.value || "Kostenloser Standardversand ab 75€. Expressversand an der Kasse verfügbar. Standardlieferung: 5-7 Werktage. Bestellungen werden innerhalb von 1-2 Werktagen versandt. Rückgabe innerhalb von 30 Tagen mit Originaletiketten.";

  const accordionItems: { key: AccordionSection; title: string; content: string }[] = [
    { key: "description", title: "Materialien", content: materials },
    { key: "sizeFit", title: "Eigenschaften", content: features },
    { key: "care", title: "Pflegehinweise", content: care },
    { key: "shipping", title: "Versand & Rückgabe", content: shipping }
  ];

  const priceNum = parseFloat(selectedVariant?.price?.amount ?? '0');
  const compareAtNum = parseFloat(selectedVariant?.compareAtPrice?.amount ?? '0');
  const isOnSale = Boolean(
    selectedVariant?.compareAtPrice && compareAtNum > 0 && compareAtNum > priceNum,
  );

  return (
    <div className="bg-background">
      <main className="pt-[20px] sm:pt-28 pb-10 sm:pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Breadcrumb Navigation - Temporarily hidden
          <nav className="mb-4 sm:mb-8">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link 
                  to="/" 
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  Startseite
                </Link>
              </li>
              <ChevronRight className="w-4 h-4 text-foreground/40 -mt-2" />
              <li>
                <Link 
                  to="/collections/all" 
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                   Produkte
                </Link>
              </li>
              <ChevronRight className="w-4 h-4 text-foreground/40 -mt-2" />
              <li className="text-foreground font-medium">{title}</li>
            </ol>
          </nav>
            */}

          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12">
            {/* Product Image Gallery */}
            <div className="lg:sticky lg:top-28">
              {/* Mobile: Image Slider with Dots */}
              <div className="lg:hidden">
                <div
                  className="relative rounded-3xl overflow-hidden bg-card boty-shadow mb-4"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {displayImages.map((image, index) => (
                    image ? (
                      <img
                        key={image.url || index}
                        src={image.url}
                        alt={image.altText || product.title}
                        /* First image: LCP candidate — eager + high priority for fastest paint.
                           Images 1-2: eager so swipe is instant. Rest: lazy (off-screen). */
                        loading={index < 3 ? 'eager' : 'lazy'}
                        {...(index === 0 ? {fetchpriority: 'high' as const} : {})}
                        className={`w-full aspect-[2/3] object-cover ${index === currentImageIndex ? 'block' : 'hidden'}`}
                      />
                    ) : null
                  ))}

                  {/* Wishlist Icon - Top Right */}
                  <WishlistIconOverlay product={product} selectedVariant={selectedVariant} />
                </div>
                
                {/* Dot Indicators */}
                {displayImages.length > 1 && (
                  <div className="flex justify-center gap-2">
                    {displayImages.map((image, index) => (
                      <button
                        key={image?.url || image?.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? 'bg-primary w-6'
                            : 'bg-foreground/20 w-2'
                        }`}
                        aria-label={`Bild ${index + 1} anzeigen`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop: Thumbnails + Main Image */}
              <div className="hidden lg:flex gap-4 items-start">
                {/* Thumbnail Gallery - Left Side */}
                {displayImages.length > 1 && (
                  <div
                    className="flex w-20 flex-shrink-0 flex-col overflow-hidden"
                    style={{
                      height: mainImageHeight ? `${mainImageHeight}px` : '72vh',
                    }}
                  >
                    {displayImages.length > 4 && (
                      <button
                        type="button"
                        onClick={() => scrollThumbnailRail('up')}
                        className="mb-1 flex h-5 w-10 flex-shrink-0 items-center justify-center self-center rounded-full bg-background/95 text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-card"
                        aria-label="Vorherige Bilder anzeigen"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <div
                      ref={thumbnailRailRef}
                      className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto scroll-smooth scrollbar-hide px-0.5 py-0.5"
                    >
                      {displayImages.map((image, index) => (
                        <button
                          key={image?.id || index}
                          type="button"
                          data-thumbnail-index={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative aspect-[2/3] w-full flex-shrink-0 overflow-hidden rounded-xl bg-card transition-all duration-300 ${
                            currentImageIndex === index
                              ? 'ring-2 ring-primary shadow-md'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          {image && (
                            <img
                              /* 160px = 2× retina of 80px rail width; Shopify CDN resizes via &width= */
                              src={`${image.url}${image.url.includes('?') ? '&' : '?'}width=160`}
                              alt={image.altText || product.title}
                              /* First 4 thumbnails visible in rail — eager load for instant switching. */
                              loading={index < 4 ? 'eager' : 'lazy'}
                              className="w-full h-full object-cover"
                              width={160}
                              height={213}
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    {displayImages.length > 4 && (
                      <button
                        type="button"
                        onClick={() => scrollThumbnailRail('down')}
                        className="mt-1 flex h-5 w-10 flex-shrink-0 items-center justify-center self-center rounded-full bg-background/95 text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-card"
                        aria-label="Weitere Bilder anzeigen"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Main Image - Right Side */}
                <div ref={mainImageRef} className="relative rounded-3xl overflow-hidden bg-card boty-shadow flex-1 aspect-[2/3]">
                  {displayImages.map((image, index) => (
                    <div
                      key={image?.id || index}
                      className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      {image && (
                        <ZehnShopifyImage
                          data={image}
                          alt={image.altText || title}
                          sizes="(min-width: 1024px) 50vw, 100vw"
                          isLCP={index === 0}
                          priority={index > 0 && index < 3}
                        />
                      )}
                    </div>
                  ))}
                  
                  {/* Wishlist Icon - Top Right */}
                  <WishlistIconOverlay product={product} selectedVariant={selectedVariant} />
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Header */}
              <div className="mb-8">
                <span className="text-sm tracking-[0.3em] uppercase text-primary mb-2 block">
                  {vendor || 'ZEHN Essentials'}
                </span>
                <h1 className="font-sans text-h2 text-foreground mb-4 leading-tight">
                  {title}
                </h1>
                
                {/* Description */}
                {descriptionHtml && (
                  <>
                    {summaryHtml && (
                      <div
                        className="font-body text-body text-foreground/80 mb-4 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-3 [&_li]:font-medium [&_strong]:font-semibold [&_strong]:text-foreground"
                        dangerouslySetInnerHTML={{__html: summaryHtml}}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setIsDescriptionOpen(true)}
                      className="font-body text-body font-semibold text-primary hover:text-primary/70 transition-colors mb-6 flex items-center gap-1 group"
                    >
                      Produktdetails ansehen
                      <ChevronRight className="w-4 h-4 text-accent transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </>
                )}
                
                {/* Price */}
                <div className="flex items-center gap-3 mb-2">
                  <span className={`font-body text-h2 font-semibold ${isOnSale ? 'text-accent' : 'text-foreground'}`}>
                    ${parseFloat(selectedVariant?.price.amount || '0').toFixed(2)}
                  </span>
                  {isOnSale && (
                    <span className="font-body text-body-lg text-foreground/55 line-through decoration-foreground/40">
                      ${compareAtNum.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Variant Selector */}
              {productOptions.length > 0 && (
                <div className="mb-6 space-y-4">
                  {productOptions.map((option) => {
                    // Hide "Title" option if it only has "Default Title"
                    if (option.name === 'Title' && option.optionValues.length === 1 && option.optionValues[0].name === 'Default Title') {
                      return null;
                    }
                    
                    return (
                    <div key={option.name}>
                      <label className="font-body text-body font-medium text-foreground mb-3 block">
                        {option.name}
                      </label>
                      <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                        {getSortedOptionValues(option).map((value: any) => {
                          const isSelected = value.selected;
                          const isAvailable = value.available;
                          const isDifferentProduct = value.isDifferentProduct;

                          if (isDifferentProduct) {
                            return (
                              <Link
                                key={value.name}
                                to={`/products/${value.handle}?${value.variantUriQuery}`}
                                preventScrollReset
                                replace
                                className={`px-4 sm:px-6 py-3 rounded-full text-sm transition-all duration-300 shadow-md text-center ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground'
                                    : isAvailable
                                    ? 'bg-card text-foreground hover:bg-card/80'
                                    : 'bg-card/50 text-foreground/30 cursor-not-allowed'
                                }`}
                                aria-disabled={!isAvailable}
                              >
                                {value.name}
                              </Link>
                            );
                          }

                          return (
                            <Link
                              key={value.name}
                              to={`?${value.variantUriQuery}`}
                              preventScrollReset
                              replace
                              className={`px-4 sm:px-6 py-3 rounded-full text-sm transition-all duration-300 shadow-md text-center ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : isAvailable
                                  ? 'bg-card text-foreground hover:bg-card/80'
                                  : 'bg-card/50 text-foreground/30 cursor-not-allowed'
                              }`}
                              aria-disabled={!isAvailable}
                            >
                              {value.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}


              {/* Buttons Container */}
              <div className="w-full mb-10">
                {/* Buy Now + Add to Cart - Side by Side */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Buy Now Button - 50% width */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedVariant?.availableForSale) return;
                      fireDirectInitiateCheckout(metaProduct);
                      
                      // Extract numeric ID from gid://shopify/ProductVariant/123456
                      const numericId = selectedVariant?.id?.split('/').pop();
                      
                      // Create checkout with the selected variant
                      const checkoutUrl = numericId 
                        ? `/cart/${numericId}:1`
                        : '#';
                      
                      window.location.href = checkoutUrl;
                    }}
                    disabled={!selectedVariant?.availableForSale}
                    className={`w-full inline-flex items-center justify-center gap-2 border-2 px-8 py-4 rounded-full text-sm tracking-wide transition-all duration-300 shadow-md ${
                      !selectedVariant?.availableForSale
                        ? 'bg-foreground/20 border-foreground/20 text-foreground/40 cursor-not-allowed'
                        : 'bg-white border-foreground/20 text-foreground hover:bg-foreground/5'
                    }`}
                  >
                    {selectedVariant?.availableForSale ? 'Jetzt kaufen' : 'Ausverkauft'}
                  </button>

                  {/* Add to Cart - 50% width */}
                  <AddToCartButton
                    disabled={!selectedVariant?.availableForSale}
                    metaProduct={metaProduct}
                    lines={
                      selectedVariant
                        ? [
                            {
                              merchandiseId: selectedVariant.id,
                              quantity: 1,
                              // selectedVariant required for useOptimisticCart immediate feedback
                              selectedVariant,
                            },
                          ]
                        : []
                    }
                    onClick={() => {
                      setIsAdded(true);
                      setTimeout(() => setIsAdded(false), 2000);
                    }}
                    className="w-full block"
                  >
                    <span className={`w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm tracking-wide transition-all duration-300 shadow-lg ${
                      !selectedVariant?.availableForSale
                        ? 'bg-foreground/20 text-foreground/40 cursor-not-allowed'
                        : isAdded
                        ? 'bg-green-600 text-white'
                        : 'bg-accent text-foreground hover:bg-accent/90'
                    }`}>
                      {!selectedVariant?.availableForSale ? (
                        'Ausverkauft'
                      ) : isAdded ? (
                        'Hinzugefügt'
                      ) : (
                        'In den Warenkorb'
                      )}
                    </span>
                  </AddToCartButton>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {benefits.map((benefit) => (
                  <button
                    key={benefit.label}
                    type="button"
                    onClick={() => {
                      if (benefit.label === "Größenratgeber") {
                        setIsSizeGuideOpen(true);
                      }
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg bg-card/50 transition-all ${
                      benefit.label === "Größenratgeber"
                        ? "cursor-pointer hover:bg-card/70 hover:shadow-md"
                        : "cursor-default"
                    }`}
                  >
                    <benefit.icon className="w-5 h-5 text-primary" />
                    <span className="text-xs text-foreground/60 text-center">{benefit.label}</span>
                  </button>
                ))}
              </div>

              {/* Accordion */}
              <div className="border-t border-border/50">
                {accordionItems.map((item) => (
                  <div key={item.key} className="border-b border-border/50">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.key)}
                      className="w-full flex items-center justify-between py-5 text-left"
                    >
                      <span className="font-body text-body font-medium text-foreground">{item.title}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-foreground/60 transition-transform duration-300 ${
                          openAccordion === item.key ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        openAccordion === item.key ? 'max-h-96 pb-5' : 'max-h-0'
                      }`}
                    >
                      <p className="font-body text-body text-foreground/70 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          <div className="mt-10 pt-10 sm:mt-16 sm:pt-16 lg:mt-20 lg:pt-20 border-t border-border/50">
            <h2 className="font-sans text-h2 sm:text-h2-sm lg:text-h2-lg text-foreground mb-8 text-center">
              Das könnte Ihnen auch gefallen
            </h2>
            
            {/* Products Slider */}
            <div className="relative">
              {/* Navigation Arrows */}
              {recommendedProducts?.nodes?.length > 3 && (
                <>
                  <button
                    type="button"
                    onClick={() => scrollSlider('left')}
                    className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-card rounded-full shadow-lg hover:bg-card/80 transition-colors"
                    aria-label="Nach links scrollen"
                  >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollSlider('right')}
                    className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center bg-card rounded-full shadow-lg hover:bg-card/80 transition-colors"
                    aria-label="Nach rechts scrollen"
                  >
                    <ChevronRight className="w-6 h-6 text-foreground" />
                  </button>
                </>
              )}
              
              <div ref={sliderRef} className="overflow-x-auto scrollbar-hide -mx-6 px-6">
                <div className="flex gap-2 sm:gap-3 pb-4">
                  {recommendedProducts?.nodes?.length > 0 ? recommendedProducts.nodes
                    .filter((recommendedProduct: any) => recommendedProduct.id !== product.id)
                    .map((recommendedProduct: any, index: number) => (
                    <div key={recommendedProduct.id} className="flex-shrink-0 w-64 sm:w-72">
                      <ProductItem
                        product={recommendedProduct}
                        loading="lazy"
                        index={index}
                      />
                    </div>
                  )) : (
                    <div className="text-center py-8 w-full">
                      <p className="text-muted">Keine empfohlenen Produkte verfügbar</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Scroll Hint */}
              <div className="text-center mt-6">
                <p className="text-sm text-muted">← Scrollen für mehr →</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SEO: Product + Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.title,
            description: product.description,
            image: displayImages.map((img: any) => img?.url).filter(Boolean),
            sku: selectedVariant?.sku || '',
            brand: {
              '@type': 'Brand',
              name: product.vendor || 'ZEHN',
            },
            offers: {
              '@type': 'Offer',
              url: `/products/${product.handle}`,
              priceCurrency: selectedVariant?.price?.currencyCode || 'EUR',
              price: selectedVariant?.price?.amount || '0',
              availability: selectedVariant?.availableForSale
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
              seller: {
                '@type': 'Organization',
                name: 'ZEHN',
              },
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Startseite',
                item: '/',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Produkte',
                item: '/collections/all',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: product.title,
              },
            ],
          }),
        }}
      />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
      <MetaProductView product={metaProduct} />

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} product={product} selectedVariant={selectedVariant} />

      {/* Product Description Modal */}
      <ProductDescriptionModal
        isOpen={isDescriptionOpen}
        onClose={() => setIsDescriptionOpen(false)}
        product={product}
        productOptions={productOptions}
        selectedVariant={selectedVariant}
        detailsHtml={detailsHtml}
        images={displayImages}
        isAdded={isAdded}
        setIsAdded={setIsAdded}
      />
    </div>
  );
}

function WishlistIconOverlay({product, selectedVariant}: {product: any; selectedVariant: any}) {
  const {toggleItem, isInWishlist} = useWishlist();
  const inWishlist = isInWishlist(product.handle);

  const handleToggle = () => {
    const image = selectedVariant?.image || product.featuredImage;
    const price = selectedVariant?.price || product.priceRange?.minVariantPrice;
    toggleItem({
      id: product.id,
      handle: product.handle,
      title: product.title,
      imageUrl: image?.url,
      imageAlt: image?.altText || undefined,
      price: price?.amount,
      currencyCode: price?.currencyCode,
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center transition-all duration-300 hover:scale-110"
      aria-label={inWishlist ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}
    >
      <Heart
        className={`w-6 h-6 transition-all duration-300 ${
          inWishlist ? 'fill-red-500 text-red-500' : 'text-foreground/70 hover:text-foreground'
        }`}
      />
    </button>
  );
}

function SizeGuideModal({isOpen, onClose, product, selectedVariant}: {isOpen: boolean; onClose: () => void; product: any; selectedVariant: any}) {
  const [unit, setUnit] = useState<'cm' | 'inch'>('cm');

  useScrollLock(isOpen);

  // Get product options dynamically
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  // Find size option
  const sizeOption = productOptions.find((opt: any) =>
    opt.name.toLowerCase() === 'size' ||
    opt.name.toLowerCase() === 'größe' ||
    opt.name.toLowerCase() === 'waist'
  );

  // Get size values from product
  const productSizes = sizeOption?.optionValues?.map((v: any) => v.name) || [];

  // Determine if it's a pant size (has waist sizing like 28W, 30W, etc.) or regular size (S, M, L, XL)
  const isPantsSize = productSizes.some((s: string) => s.includes('W') || s.includes('/'));

  // Generate dynamic size data based on product sizes
  const getDynamicSizeData = () => {
    if (productSizes.length === 0) return null;

    if (isPantsSize) {
      // Pants sizing (e.g., 28W/30L, 30W/32L)
      return productSizes.map((size: string) => {
        // Parse size like "28W / 30L" or "28W"
        const match = size.match(/(\d+)W/i);
        const waistSize = match ? parseInt(match[1]) : parseInt(size);

        // Convert to cm/inch values
        if (unit === 'cm') {
          const waistCm = (waistSize * 2.54).toFixed(0);
          const hipCm = ((waistSize + 6) * 2.54).toFixed(0);
          const inseamCm = size.includes('/') ?
            (parseInt(size.split('/')[1]) * 2.54).toFixed(0) :
            '76-81';
          return { size, waist: `${Number(waistCm) - 3}-${waistCm}`, hip: `${Number(hipCm) - 3}-${hipCm}`, inseam: inseamCm };
        } else {
          const waistInch = waistSize;
          const hipInch = waistSize + 6;
          const inseamInch = size.includes('/') ? size.split('/')[1] : '30-32';
          return { size, waist: `${waistInch - 2}-${waistInch}`, hip: `${hipInch - 2}-${hipInch}`, inseam: inseamInch };
        }
      });
    } else {
      // Regular tops sizing (XS, S, M, L, XL, XXL)
      const sizeMap: Record<string, {chest: string, waist: string, sleeve: string}> = unit === 'cm' ? {
        'XS': { chest: '86-91', waist: '71-76', sleeve: '81-84' },
        'S': { chest: '91-96', waist: '76-81', sleeve: '84-87' },
        'M': { chest: '96-101', waist: '81-86', sleeve: '87-90' },
        'L': { chest: '101-106', waist: '86-91', sleeve: '90-93' },
        'XL': { chest: '106-111', waist: '91-96', sleeve: '93-96' },
        'XXL': { chest: '111-117', waist: '96-102', sleeve: '96-99' },
      } : {
        'XS': { chest: '34-36', waist: '28-30', sleeve: '32-33' },
        'S': { chest: '36-38', waist: '30-32', sleeve: '33-34' },
        'M': { chest: '38-40', waist: '32-34', sleeve: '34-35' },
        'L': { chest: '40-42', waist: '34-36', sleeve: '35-37' },
        'XL': { chest: '42-44', waist: '36-38', sleeve: '37-38' },
        'XXL': { chest: '44-46', waist: '38-40', sleeve: '38-39' },
      };

      return productSizes.map((size: string) => ({
        size,
        ...(sizeMap[size] || { chest: '-', waist: '-', sleeve: '-' })
      }));
    }
  };

  const dynamicSizeData: any[] | null = getDynamicSizeData();
  const fallbackTopSizeData =
    unit === 'cm'
      ? [
          {size: 'XS', chest: '86-91', waist: '71-76', sleeve: '81-84'},
          {size: 'S', chest: '91-96', waist: '76-81', sleeve: '84-87'},
          {size: 'M', chest: '96-101', waist: '81-86', sleeve: '87-90'},
          {size: 'L', chest: '101-106', waist: '86-91', sleeve: '90-93'},
          {size: 'XL', chest: '106-111', waist: '91-96', sleeve: '93-96'},
          {size: 'XXL', chest: '111-117', waist: '96-102', sleeve: '96-99'},
        ]
      : [
          {size: 'XS', chest: '34-36', waist: '28-30', sleeve: '32-33'},
          {size: 'S', chest: '36-38', waist: '30-32', sleeve: '33-34'},
          {size: 'M', chest: '38-40', waist: '32-34', sleeve: '34-35'},
          {size: 'L', chest: '40-42', waist: '34-36', sleeve: '35-37'},
          {size: 'XL', chest: '42-44', waist: '36-38', sleeve: '37-38'},
          {size: 'XXL', chest: '44-46', waist: '38-40', sleeve: '38-39'},
        ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
        aria-label="Größenratgeber schließen"
      />
      <div
        className="relative z-10 bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-background border-b border-border/50 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="font-sans text-h3 text-foreground">Größenratgeber</h2>
          <div className="flex items-center gap-4">
            {/* Unit Toggle */}
            <div className="flex items-center bg-card rounded-full p-1">
              <button
                type="button"
                onClick={() => setUnit('cm')}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  unit === 'cm'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                cm
              </button>
              <button
                type="button"
                onClick={() => setUnit('inch')}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  unit === 'inch'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/60 hover:text-foreground'
                }`}
              >
                inch
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-card/50 transition-colors"
              aria-label="Schließen"
            >
              <X className="w-6 h-6 text-foreground/60" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-8">
          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="font-sans text-h4 text-foreground">So messen Sie richtig</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">1. Brustumfang</h4>
                <p className="text-sm text-foreground/70">Messen Sie horizontal um die breiteste Stelle Ihrer Brust.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">2. Taillenumfang</h4>
                <p className="text-sm text-foreground/70">Messen Sie um die schmalste Stelle Ihrer Taille.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">3. Hüftumfang</h4>
                <p className="text-sm text-foreground/70">Messen Sie um die breiteste Stelle Ihrer Hüfte.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">4. Innenbeinlänge</h4>
                <p className="text-sm text-foreground/70">Messen Sie vom Schritt bis zum Knöchel.</p>
              </div>
            </div>
          </div>

          {/* Size Chart - Dynamic based on product type */}
          {dynamicSizeData ? (
            <div className="space-y-4">
              <h3 className="font-sans text-h4 text-foreground">
                {isPantsSize ? 'Größentabelle Hosen & Jeans' : 'Größentabelle Oberteile'}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-card">
                      <th className="border border-border/50 px-4 py-3 text-left font-medium text-foreground">Größe</th>
                      {isPantsSize ? (
                        <>
                          <th className="border border-border/50 px-4 py-3 text-left font-medium text-foreground">Taillenumfang ({unit})</th>
                          <th className="border border-border/50 px-4 py-3 text-left font-medium text-foreground">Hüftumfang ({unit})</th>
                          <th className="border border-border/50 px-4 py-3 text-left font-medium text-foreground">Innenbeinlänge ({unit})</th>
                        </>
                      ) : (
                        <>
                          <th className="border border-border/50 px-4 py-3 text-left font-medium text-foreground">Brustumfang ({unit})</th>
                          <th className="border border-border/50 px-4 py-3 text-left font-medium text-foreground">Taillenumfang ({unit})</th>
                          <th className="border border-border/50 px-4 py-3 text-left font-medium text-foreground">Ärmellänge ({unit})</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {dynamicSizeData?.map((row: any, idx: number) => (
                      <tr key={row.size} className={idx % 2 === 1 ? 'bg-card/30' : ''}>
                        <td className="border border-border/50 px-4 py-3 text-foreground/70">{row.size}</td>
                        {isPantsSize ? (
                          <>
                            <td className="border border-border/50 px-4 py-3 text-foreground/70">{row.waist}</td>
                            <td className="border border-border/50 px-4 py-3 text-foreground/70">{row.hip}</td>
                            <td className="border border-border/50 px-4 py-3 text-foreground/70">{row.inseam}</td>
                          </>
                        ) : (
                          <>
                            <td className="border border-border/50 px-4 py-3 text-foreground/70">{row.chest}</td>
                            <td className="border border-border/50 px-4 py-3 text-foreground/70">{row.waist}</td>
                            <td className="border border-border/50 px-4 py-3 text-foreground/70">{row.sleeve}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
          <div className="space-y-4">
            <h3 className="font-sans text-h4 text-foreground">Oberteile (Hemden, T-Shirts, Pullover)</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-card">
                    <th className="border border-border/50 px-4 py-3 text-left font-medium text-foreground">Größe</th>
                    <th className="border border-border/50 px-4 py-3 text-left font-medium text-foreground">Brustumfang ({unit})</th>
                    <th className="border border-border/50 px-4 py-3 text-left font-medium text-foreground">Taillenumfang ({unit})</th>
                    <th className="border border-border/50 px-4 py-3 text-left font-medium text-foreground">Ärmellänge ({unit})</th>
                  </tr>
                </thead>
                <tbody>
                  {fallbackTopSizeData.map((row: any, idx: number) => (
                    <tr key={row.size} className={idx % 2 === 1 ? 'bg-card/30' : ''}>
                      <td className="border border-border/50 px-4 py-3 text-foreground/70">{row.size}</td>
                      <td className="border border-border/50 px-4 py-3 text-foreground/70">{row.chest}</td>
                      <td className="border border-border/50 px-4 py-3 text-foreground/70">{row.waist}</td>
                      <td className="border border-border/50 px-4 py-3 text-foreground/70">{row.sleeve}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* Tips */}
          <div className="bg-card/30 rounded-lg p-6 space-y-3">
            <h3 className="font-sans text-h4 text-foreground">Tipps für die perfekte Passform</h3>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>• Messen Sie am besten über Ihrer Unterwäsche für genaue Ergebnisse</li>
              <li>• Verwenden Sie ein flexibles Maßband und ziehen Sie es nicht zu fest</li>
              <li>• Bei Zwischengrößen empfehlen wir die größere Größe für mehr Komfort</li>
              <li>• Unsere Kleidung ist für eine moderne, leicht taillierte Passform konzipiert</li>
              <li>• Bei Fragen zur Größe kontaktieren Sie gerne unseren Kundenservice</li>
            </ul>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

function ProductDescriptionModal({
  isOpen,
  onClose,
  product,
  productOptions,
  selectedVariant,
  detailsHtml,
  images,
  isAdded,
  setIsAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  productOptions: any[];
  selectedVariant: any;
  detailsHtml: string;
  images: any[];
  isAdded: boolean;
  setIsAdded: (value: boolean) => void;
}) {
  const modalImageSliderRef = useRef<HTMLDivElement>(null);

  useScrollLock(isOpen);

  if (!isOpen) return null;

  const scrollModalImages = (direction: 'left' | 'right') => {
    const slider = modalImageSliderRef.current;
    if (!slider) return;

    slider.scrollBy({
      left: direction === 'left' ? -slider.clientWidth : slider.clientWidth,
      behavior: 'smooth',
    });
  };

  const handleBuyNow = () => {
    if (!selectedVariant?.availableForSale) return;
    fireDirectInitiateCheckout({
      contentId: selectedVariant.id,
      contentName: product.title,
      currency: selectedVariant.price.currencyCode,
      value: Number(selectedVariant.price.amount),
      quantity: 1,
    });

    const numericId = selectedVariant?.id?.split('/').pop();
    window.location.href = numericId ? `/cart/${numericId}:1` : '#';
  };

  const renderModalOptionValue = (option: any, value: any) => {
    const isSelected = value.selected;
    const isAvailable = value.available;
    const isDifferentProduct = value.isDifferentProduct;
    const optionName = option.name?.toLowerCase?.().trim?.();
    const isColor = optionName === 'color' || optionName === 'colour' || optionName === 'farbe';
    const swatchImage = value.swatch?.image?.previewImage?.url;
    const variantImage = value.firstSelectableVariant?.image?.url;
    const swatchColor = value.swatch?.color;
    const linkTo = isDifferentProduct
      ? `/products/${value.handle}?${value.variantUriQuery}`
      : `?${value.variantUriQuery}`;

    const content = isColor ? (
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full">
        {swatchImage || variantImage ? (
          <img
            src={swatchImage || variantImage}
            alt={value.name}
            className="h-11 w-11 rounded-full object-cover"
            loading="lazy"
          />
        ) : swatchColor ? (
          <span
            className="h-11 w-11 rounded-full"
            style={{backgroundColor: swatchColor}}
          />
        ) : (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-xs font-medium">
            {value.name.charAt(0).toUpperCase()}
          </span>
        )}
        {isSelected && (
          <Check className="absolute h-7 w-7 text-white drop-shadow-md" strokeWidth={3} />
        )}
      </span>
    ) : (
      value.name
    );

    return (
      <Link
        key={value.name}
        to={linkTo}
        preventScrollReset
        replace
        aria-disabled={!isAvailable}
        className={
          isColor
            ? `rounded-full border-2 transition-all ${
                isSelected
                  ? 'border-foreground shadow-md'
                  : 'border-border/70 hover:border-foreground/40'
              } ${!isAvailable ? 'opacity-30 pointer-events-none' : ''}`
            : `min-w-[6.5rem] rounded-full border px-5 py-3 text-center text-sm transition-all ${
                isSelected
                  ? 'border-foreground bg-foreground text-primary-foreground'
                  : 'border-border/70 bg-white text-foreground hover:border-foreground/40'
              } ${!isAvailable ? 'opacity-30 pointer-events-none line-through' : ''}`
        }
      >
        {content}
      </Link>
    );
  };

  const getOptionRank = (option: any) => {
    const name = option.name?.toLowerCase?.().trim?.() || '';
    if (name === 'color' || name === 'colour' || name === 'farbe') return 0;
    if (name === 'size' || name === 'größe' || name === 'groesse') return 1;
    return 2;
  };

  const modalProductOptions = productOptions
    .filter((option: any) => {
      return !(
        (option.name === 'Title' &&
          option.optionValues.length === 1 &&
          option.optionValues[0].name === 'Default Title') ||
        option.optionValues.length <= 1
      );
    })
    .sort((a: any, b: any) => getOptionRank(a) - getOptionRank(b));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
    >
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
        aria-label="Produktdetails schließen"
      />
      <div
        className="relative z-10 bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-6xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 flex-shrink-0">
          <h2 className="font-sans text-h3 text-foreground">{product.title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-card/50 transition-colors"
            aria-label="Schließen"
          >
            <X className="w-6 h-6 text-foreground/60" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-8">
          {/* Details shown after the summary trigger on the product page */}
          {detailsHtml && (
            <div
              className="font-body text-body text-foreground/70 leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:mb-2 [&_strong]:font-semibold [&_strong]:text-foreground [&_h2]:font-sans [&_h2]:text-foreground [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_p]:mb-3"
              dangerouslySetInnerHTML={{__html: detailsHtml}}
            />
          )}

          {/* Image slider */}
          {images.length > 0 && (
            <div className="relative">
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => scrollModalImages('left')}
                    className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
                    aria-label="Vorherige Produktfotos"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollModalImages('right')}
                    className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
                    aria-label="Weitere Produktfotos"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              <div
                ref={modalImageSliderRef}
                className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
              >
                {images.map((image: any, index: number) => (
                  <div
                    key={image.url || index}
                    className="snap-start flex-[0_0_82%] sm:flex-[0_0_48%] lg:flex-[0_0_32%] overflow-hidden rounded-2xl bg-card aspect-[4/5]"
                  >
                    <img
                      src={image.url}
                      alt={image.altText || product.title}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6 border-t border-border/50 pt-6">
            {modalProductOptions.length > 0 && (
              <div className="mx-auto w-full max-w-3xl space-y-5">
                {modalProductOptions.map((option: any) => (
                  <fieldset key={option.name}>
                    <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">
                      {option.name}
                      {option.optionValues.find((value: any) => value.selected)?.name && (
                        <span className="ml-2 normal-case tracking-normal text-foreground">
                          — {option.optionValues.find((value: any) => value.selected)?.name}
                        </span>
                      )}
                    </legend>
                    <div className="flex flex-wrap gap-3">
                      {getSortedOptionValues(option).map((value: any) =>
                        renderModalOptionValue(option, value),
                      )}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!selectedVariant?.availableForSale}
                className={`min-w-[13rem] rounded-full border-2 px-10 py-4 text-sm tracking-wide shadow-md transition-all sm:min-w-[15rem] ${
                  !selectedVariant?.availableForSale
                    ? 'bg-foreground/20 border-foreground/20 text-foreground/40 cursor-not-allowed'
                    : 'bg-white border-foreground/20 text-foreground hover:bg-foreground/5'
                }`}
              >
                {selectedVariant?.availableForSale ? 'Jetzt kaufen' : 'Ausverkauft'}
              </button>

              <AddToCartButton
                disabled={!selectedVariant?.availableForSale}
                metaProduct={{
                  contentId: selectedVariant.id,
                  contentName: product.title,
                  currency: selectedVariant.price.currencyCode,
                  value: Number(selectedVariant.price.amount),
                  quantity: 1,
                }}
                lines={
                  selectedVariant
                    ? [
                        {
                          merchandiseId: selectedVariant.id,
                          quantity: 1,
                          selectedVariant,
                        },
                      ]
                    : []
                }
                onClick={() => {
                  setIsAdded(true);
                  setTimeout(() => setIsAdded(false), 2000);
                }}
                className="block"
                wrapperClassName="w-auto"
              >
                <span className={`flex min-w-[13rem] items-center justify-center gap-2 px-10 py-4 rounded-full text-sm tracking-wide transition-all duration-300 shadow-lg sm:min-w-[15rem] ${
                  !selectedVariant?.availableForSale
                    ? 'bg-foreground/20 text-foreground/40 cursor-not-allowed'
                    : isAdded
                    ? 'bg-green-600 text-white'
                    : 'bg-accent text-foreground hover:bg-accent/90'
                }`}>
                  {!selectedVariant?.availableForSale
                    ? 'Ausverkauft'
                    : isAdded
                    ? 'Hinzugefügt'
                    : 'In den Warenkorb'}
                </span>
              </AddToCartButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WishlistButton({product, selectedVariant}: {product: any; selectedVariant: any}) {
  const {toggleItem, isInWishlist} = useWishlist();
  const inWishlist = isInWishlist(product.handle);

  const handleToggle = () => {
    const image = selectedVariant?.image || product.featuredImage;
    const price = selectedVariant?.price || product.priceRange?.minVariantPrice;
    toggleItem({
      id: product.id,
      handle: product.handle,
      title: product.title,
      imageUrl: image?.url,
      imageAlt: image?.altText || undefined,
      price: price?.amount,
      currencyCode: price?.currencyCode,
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-4 rounded-full text-xs sm:text-sm tracking-wide transition-all duration-300 shadow-md whitespace-nowrap ${
        inWishlist
          ? 'bg-red-500 text-white hover:bg-red-600'
          : 'bg-white border-2 border-foreground/20 text-foreground hover:border-foreground/30 hover:bg-foreground/5'
      }`}
    >
      <Heart
        className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${inWishlist ? 'fill-white' : ''}`}
      />
      <span className="truncate">{inWishlist ? 'Wunschliste' : 'Zur Wunschliste'}</span>
    </button>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    featuredImage {
      id
      url
      altText
      width
      height
    }
    materials: metafield(namespace: "custom", key: "materials") {
      value
    }
    features: metafield(namespace: "custom", key: "features") {
      value
    }
    care: metafield(namespace: "custom", key: "care") {
      value
    }
    shipping: metafield(namespace: "custom", key: "shipping") {
      value
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
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
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
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    variants(first: 50) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  fragment RecommendedProduct on Product {
    id
    handle
    title
    description
    featuredImage {
      id
      url
      altText
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
            id
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
          id
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
  }

  query RecommendedProducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
  ) @inContext(country: $country, language: $language) {
    products(first: $first, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;
