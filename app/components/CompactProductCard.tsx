import {Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {ZehnMediaFrame, ZehnShopifyImage} from '~/components/zehn';
import {useRef, useState} from 'react';
import {cn} from '~/lib/utils';
import {useScrollEntry} from '~/hooks/useScrollEntry';
import {Heart} from 'lucide-react';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
  PredictiveProductFragment,
} from 'storefrontapi.generated';
import type {Maybe, ProductOptionValueSwatch} from '@shopify/hydrogen/storefront-api-types';
import {useVariantUrl} from '~/lib/variants';
import {useWishlist} from '~/components/zehn/wishlist-context';
import {resolveLinkPrefetch} from '~/lib/link-prefetch';
import {
  getProductImagesForColor,
  isColorOptionName,
} from '~/lib/product-media';

export function CompactProductCard({
  product,
  loading,
  priority,
  isLCP,
  index = 0,
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment
    | PredictiveProductFragment;
  loading?: 'eager' | 'lazy';
  priority?: boolean;
  isLCP?: boolean;
  index?: number;
}) {
  const variantUrl = useVariantUrl(product.handle);
  const {toggleItem, isInWishlist} = useWishlist();
  const lastTouchWishlistToggleRef = useRef(0);
  
  // Handle different product types - PredictiveProductFragment vs regular products
  const isPredictiveProduct = 'selectedOrFirstAvailableVariant' in product;
  
  let defaultImage;
  let price;
  let compareAtPrice;
  
  if (isPredictiveProduct) {
    // PredictiveProductFragment structure - safe cast since we checked for selectedOrFirstAvailableVariant
    const predictiveProduct = product as any;
    const variant = predictiveProduct.selectedOrFirstAvailableVariant;
    defaultImage = variant?.image;
    price = variant?.price;
    compareAtPrice = null; // Predictive products don't have compare at price
  } else {
    // Regular product structure
    defaultImage = (product as any).featuredImage;
    price = (product as any).priceRange?.minVariantPrice;
    compareAtPrice = (product as any).compareAtPriceRange?.minVariantPrice;
  }

  const priceNum = parseFloat(price?.amount ?? '0');
  const compareAtNum = parseFloat(compareAtPrice?.amount ?? '0');
  const isOnSale = Boolean(compareAtPrice && compareAtNum > 0 && compareAtNum > priceNum);

  // State for hover image switching
  const [hoveredImage, setHoveredImage] = useState<any>(null);
  const displayImage = hoveredImage || defaultImage;

  // Get color swatches from options (if available)
  const colorOption = (product as any).options?.find((option: any) =>
    isColorOptionName(option?.name),
  );
  const colorSwatches = colorOption?.optionValues?.slice(0, 4) || [];

  const inWishlist = isInWishlist(product.handle);

  const isEager = loading === 'eager';
  const imagePriority = priority ?? isEager;
  const imageIsLCP = isLCP ?? (isEager && index === 0);

  const {ref: entryRef, entered} = useScrollEntry<HTMLAnchorElement>(imagePriority || imageIsLCP);

  const toggleWishlistItem = () => {
    toggleItem({
      id: product.id,
      handle: product.handle,
      title: product.title,
      imageUrl: defaultImage?.url,
      imageAlt: defaultImage?.altText || undefined,
      price: price?.amount,
      currencyCode: price?.currencyCode,
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

  return (
    <Link
      ref={entryRef}
      to={variantUrl}
      prefetch={resolveLinkPrefetch('product')}
      className={cn(
        'group block transition-transform duration-500 ease-out',
        entered ? 'translate-y-0' : 'translate-y-3',
      )}
      style={{transitionDelay: entered ? '0ms' : `${(index % 4) * 60}ms`}}
    >
      <div className="bg-white rounded-lg overflow-hidden border border-black/10 hover:border-black/20 transition-colors">
        {/* Image frame — ZehnMediaFrame enforces 1:1; ZehnShopifyImage handles skeleton + fade */}
        <ZehnMediaFrame aspect="square">
          {displayImage && (
            <ZehnShopifyImage
              key={displayImage.url}
              data={displayImage}
              alt={displayImage.altText || product.title}
              aspectRatio="1/1"
              sizes="200px"
              priority={imagePriority}
              isLCP={imageIsLCP}
            />
          )}
          {/* Wishlist Heart */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            onPointerDown={handleWishlistPointerDown}
            className="absolute top-2 right-2 w-8 h-8 rounded-full overflow-hidden bg-white/80 backdrop-blur-sm flex items-center justify-center lg:hover:bg-white transition-colors z-10"
            aria-label={inWishlist ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                inWishlist
                  ? 'fill-red-500 text-red-500'
                  : 'text-black/40 lg:hover:text-red-500'
              }`}
            />
          </button>
        </ZehnMediaFrame>

        {/* Info */}
        <div className="p-2">
          <h3 className="font-sans text-xs font-medium text-black mb-1 line-clamp-1">
            {product.title}
          </h3>
          <div className="flex items-center gap-1.5 mb-1.5">
            {price && (
              <span className={`text-xs font-medium ${isOnSale ? 'text-accent' : 'text-black'}`}>
                <Money data={price} />
              </span>
            )}
            {isOnSale && (
              <span className="text-[10px] text-foreground/55 line-through decoration-foreground/40">
                <Money data={compareAtPrice} />
              </span>
            )}
          </div>
          
          {/* Color Swatches */}
          {colorSwatches.length > 0 && (
            <div className="flex items-center gap-1">
              {colorSwatches.map((colorValue: any) => (
                <ColorSwatch
                  key={colorValue.name}
                  swatch={colorValue.swatch}
                  name={colorValue.name}
                  variantImage={colorValue.firstSelectableVariant?.image}
                  onMouseEnter={() => {
                    const imagesForColor = getProductImagesForColor({
                      product: product as any,
                      colorValue: colorValue.name,
                    });

                    setHoveredImage(
                      imagesForColor[0] ||
                        colorValue.firstSelectableVariant?.image ||
                        null,
                    );
                  }}
                  onMouseLeave={() => {
                    setHoveredImage(null);
                  }}
                />
              ))}
              {colorOption && colorOption.optionValues && colorOption.optionValues.length > 4 && (
                <span className="text-[10px] text-black/50 ml-0.5">
                  +{colorOption.optionValues.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function ColorSwatch({
  swatch,
  name,
  variantImage,
  onMouseEnter,
  onMouseLeave,
}: {
  swatch?: Maybe<ProductOptionValueSwatch>;
  name: string;
  variantImage?: { url: string; altText?: string | null } | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const swatchImage = swatch?.image?.previewImage?.url;
  const color = swatch?.color;
  const displayImage = swatchImage || variantImage?.url;

  if (!displayImage && !color) {
    // Fallback: render a small circle with the color name initial
    return (
      <div
        className="w-[30px] h-[30px] rounded-full border-2 border-black/10 bg-gray-200 flex items-center justify-center cursor-pointer hover:border-foreground hover:scale-110 hover:shadow-md transition-all duration-200 relative group/swatch"
        title={name}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <span className="text-[10px] font-medium text-black/60">{name[0]}</span>
        {/* Hover tooltip */}
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/swatch:opacity-100 transition-opacity pointer-events-none z-10">
          {name}
        </span>
      </div>
    );
  }

  return (
    <div
      className="w-[30px] h-[30px] rounded-full border-2 border-black/10 overflow-hidden cursor-pointer hover:border-foreground hover:scale-110 hover:shadow-md transition-all duration-200 relative group/swatch"
      style={{
        backgroundColor: color || 'transparent',
      }}
      title={name}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {!!displayImage && (
        <img 
          src={displayImage} 
          alt={variantImage?.altText || name} 
          className="w-full h-full object-cover"
        />
      )}
      {/* Hover tooltip */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover/swatch:opacity-100 transition-opacity pointer-events-none z-10">
        {name}
      </span>
    </div>
  );
}
