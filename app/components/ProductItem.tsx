import {Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {useState, useEffect, useMemo, useRef} from 'react';
import {ZehnMediaFrame, ZehnShopifyImage} from '~/components/zehn';
import {ShoppingBag, Heart, ChevronLeft, ChevronRight} from 'lucide-react';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';
import {useWishlist} from '~/components/zehn/wishlist-context';
import {QuickAddModal} from '~/components/QuickAddModal';
import {
  getAllProductImages,
  getProductImagesForColor,
  isColorOptionName,
} from '~/lib/product-media';

export function ProductItem({
  product,
  loading,
  index = 0,
  isVisible = true,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
  index?: number;
  isVisible?: boolean;
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const [activeColorName, setActiveColorName] = useState<string | null>(null);
  const [activeColorImageIndex, setActiveColorImageIndex] = useState(0);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const {toggleItem, isInWishlist} = useWishlist();
  const inWishlist = isInWishlist(product.handle);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const lastTouchWishlistToggleRef = useRef(0);

  // Detect touch device on mount
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const toggleWishlistItem = () => {
    toggleItem({
      id: product.id,
      handle: product.handle,
      title: product.title,
      imageUrl: image?.url,
      imageAlt: image?.altText || undefined,
      price: product.priceRange?.minVariantPrice?.amount,
      currencyCode: product.priceRange?.minVariantPrice?.currencyCode,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (Date.now() - lastTouchWishlistToggleRef.current < 750) {
      return;
    }

    toggleWishlistItem();
  };

  const handleWishlistPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;

    e.preventDefault();
    e.stopPropagation();
    lastTouchWishlistToggleRef.current = Date.now();
    toggleWishlistItem();
  };

  // Determine badge based on product tags
  const badge = (product as any).tags?.find((tag: string) => 
    ['Bestseller', 'New', 'Sale'].includes(tag)
  );

  // Extract color swatches
  const colorOption = (product as any).options?.find((option: any) =>
    isColorOptionName(option?.name),
  );
  const colorSwatches = colorOption?.optionValues?.slice(0, 4) || [];

  const allProductImages = useMemo(
    () => getAllProductImages(product as any),
    [product],
  );

  const currentImageSet = useMemo(
    () =>
      activeColorName
        ? getProductImagesForColor({
            product: product as any,
            colorValue: activeColorName,
          })
        : allProductImages,
    [activeColorName, allProductImages, product],
  );

  const currentDisplayImage =
    currentImageSet[activeColorImageIndex] ||
    image ||
    null;

  useEffect(() => {
    if (activeColorImageIndex >= currentImageSet.length) {
      setActiveColorImageIndex(0);
    }
  }, [activeColorImageIndex, currentImageSet.length]);

  // Above-the-fold images (eager) should show instantly without animation delay
  const isEager = loading === 'eager';

  const showColorCarouselControls = isCardHovered && currentImageSet.length > 1;

  const showPreviousColorImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImageSet.length <= 1) return;
    setActiveColorImageIndex((prev) =>
      prev === 0 ? currentImageSet.length - 1 : prev - 1,
    );
  };

  const showNextColorImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentImageSet.length <= 1) return;
    setActiveColorImageIndex((prev) => (prev + 1) % currentImageSet.length);
  };

  const activateColor = (colorName: string) => {
    setActiveColorName(colorName);
    setActiveColorImageIndex(0);
  };

  return (
    <>
    <Link
      to={variantUrl}
      prefetch="intent"
      className={`group block transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{transitionDelay: isEager ? '0ms' : `${index * 60}ms`, textDecoration: 'none'}}
    >
      <div
        className="bg-card rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02]"
        onMouseEnter={() => {
          if (!isTouchDevice) {
            setIsCardHovered(true);
          }
        }}
        onMouseLeave={() => {
          if (!isTouchDevice) {
            setIsCardHovered(false);
          }
        }}
      >
        {/* Image frame — ZehnMediaFrame enforces 7:10 portrait ratio; ZehnShopifyImage handles skeleton + fade */}
        <ZehnMediaFrame aspect="product">
          {currentDisplayImage && (
            <ZehnShopifyImage
              data={currentDisplayImage}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              isLCP={isEager}
            />
          )}

          {showColorCarouselControls && (
            <>
              <button
                type="button"
                onClick={showPreviousColorImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                aria-label="Vorheriges Bild"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button
                type="button"
                onClick={showNextColorImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                aria-label="Nächstes Bild"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </>
          )}
          
          {/* Badge */}
          {badge && (
            <span
              className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide ${
                badge === 'Sale'
                  ? 'bg-destructive/10 text-destructive'
                  : badge === 'New'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-accent text-accent-foreground'
              }`}
            >
              {badge}
            </span>
          )}
          
          {/* Wishlist Heart */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            onPointerDown={handleWishlistPointerDown}
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center lg:hover:bg-white transition-colors z-10"
            aria-label={inWishlist ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                inWishlist
                  ? 'fill-red-500 text-red-500'
                  : 'text-black/40 lg:hover:text-red-500'
              }`}
            />
          </button>
          {/* Quick add button */}
          <button
            type="button"
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-accent backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg z-10 hover:bg-accent/90"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickAdd(true);
            }}
            aria-label="In den Warenkorb"
          >
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </button>
        </ZehnMediaFrame>

      </div>

      {/* Color Swatches */}
      <div className="px-1 pt-2.5 flex items-center gap-1.5 min-h-[32px]">
        {colorSwatches.length > 0 && (
          <>
            {colorSwatches.filter((colorValue: any) =>
              colorValue.swatch?.color || colorValue.swatch?.image?.previewImage?.url
            ).map((colorValue: any, idx: number) => (
              <button
                key={idx}
                type="button"
                className="w-[22px] h-[22px] rounded-full border-2 border-black/10 overflow-hidden hover:border-foreground hover:scale-110 hover:shadow-md transition-all duration-200 flex-shrink-0 relative group/swatch active:scale-105"
                style={{backgroundColor: colorValue.swatch?.color || 'transparent'}}
                title={colorValue.name}
                onMouseEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!isTouchDevice) activateColor(colorValue.name);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isTouchDevice) {
                    if (activeColorName === colorValue.name) {
                      setActiveColorName(null);
                      setActiveColorImageIndex(0);
                    } else {
                      activateColor(colorValue.name);
                    }
                  }
                }}
                aria-label={`Farbe: ${colorValue.name}`}
              >
                {colorValue.swatch?.image?.previewImage?.url && (
                  <img src={colorValue.swatch.image.previewImage.url} alt={colorValue.name} className="w-full h-full object-cover" />
                )}
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/swatch:opacity-100 transition-opacity pointer-events-none z-10">
                  {colorValue.name}
                </span>
              </button>
            ))}
            {colorOption && colorOption.optionValues && colorOption.optionValues.length > 4 && (
              <span className="text-[11px] font-medium text-muted/70 ml-0.5">
                +{colorOption.optionValues.length - 4}
              </span>
            )}
          </>
        )}
      </div>

      {/* Title + Price below product card */}
      <div className="px-1 pt-2 text-left">
        <h3 className="font-sans text-base font-bold text-foreground leading-tight line-clamp-2 mb-1">{product.title}</h3>

        <div className="flex items-center gap-1.5">
          {(() => {
            const compareAt = (product as any).compareAtPriceRange?.minVariantPrice;
            const price = product.priceRange?.minVariantPrice;
            const compareAtNum = parseFloat(compareAt?.amount ?? '0');
            const priceNum = parseFloat(price?.amount ?? '0');
            const isOnSale = compareAt && compareAtNum > 0 && compareAtNum > priceNum;
            return (
              <>
                {price && (
                  <span className={`font-sans text-sm font-semibold ${isOnSale ? 'text-accent' : 'text-foreground'}`}>
                    <Money data={price} />
                  </span>
                )}
                {isOnSale && (
                  <span className="font-sans text-xs text-foreground/55 line-through decoration-foreground/40">
                    <Money data={compareAt} />
                  </span>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </Link>
    <QuickAddModal
      product={product as any}
      isOpen={showQuickAdd}
      onClose={() => setShowQuickAdd(false)}
    />
  </>
  );
}
