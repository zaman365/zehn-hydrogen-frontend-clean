/**
 * ZehnShopifyImage — Hydrogen <Image> wrapper with pulse skeleton + fade-in (Phase 2).
 *
 * Skeleton behaviour:
 *  - Non-LCP: animate-pulse shown until onLoad fires; image fades in over 700 ms.
 *  - LCP (isLCP=true): no skeleton; image renders at full opacity immediately.
 *    Pass isLCP only for the first visible image on the page (hero, first product row).
 *
 * `sizes` is required (not optional) — omitting it produces an uncropped full-res image
 * on every viewport, which wastes bandwidth and hurts LCP.
 *
 * @example
 * // Non-LCP product card image
 * <ZehnShopifyImage data={product.featuredImage} sizes="(min-width:1024px) 33vw, 50vw" />
 *
 * // LCP hero image (no skeleton, eager, high fetchPriority)
 * <ZehnShopifyImage data={hero.image} sizes="100vw" isLCP />
 */
import {Image} from '@shopify/hydrogen';
import {useState} from 'react';
import {cn} from '~/lib/utils';
import {
  ZEHN_MEDIA_SKELETON,
  ZEHN_MEDIA_SKELETON_FADE,
  ZEHN_MEDIA_FADE_IN,
} from '~/lib/zehn-media-styles';

/** Props derived from Hydrogen Image component (HydrogenImageProps not re-exported from @shopify/hydrogen). */
type HydrogenImageBaseProps = React.ComponentPropsWithoutRef<typeof Image>;

export type ZehnShopifyImageProps = Omit<HydrogenImageBaseProps, 'sizes'> & {
  /** Required: responsive sizes string for Shopify CDN srcSet generation. */
  sizes: string;
  /**
   * Mark true only for the LCP image (above-fold hero or first product card).
   * Enables loading="eager" + fetchpriority="high" and disables skeleton.
   */
  isLCP?: boolean;
  /** Extra classes for the <img> element (position, object-fit, etc.). */
  className?: string;
};

export function ZehnShopifyImage({
  sizes,
  isLCP = false,
  className,
  onLoad,
  ...props
}: ZehnShopifyImageProps) {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true);
    onLoad?.(e);
  };

  return (
    <>
      {/* Pulse skeleton — hidden immediately for LCP images, fades out on load for others */}
      {!isLCP && (
        <div
          aria-hidden="true"
          className={cn(
            ZEHN_MEDIA_SKELETON,
            ZEHN_MEDIA_SKELETON_FADE,
            loaded ? 'opacity-0' : 'opacity-100',
          )}
        />
      )}

      <Image
        sizes={sizes}
        loading={isLCP ? 'eager' : 'lazy'}
        {...(isLCP ? {fetchpriority: 'high' as const} : {})}
        {...props}
        onLoad={handleLoad}
        className={cn(
          'absolute inset-0 w-full h-full object-cover object-center',
          ZEHN_MEDIA_FADE_IN,
          /* LCP: always visible; non-LCP: fades in after load */
          isLCP ? 'opacity-100' : loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
      />
    </>
  );
}
