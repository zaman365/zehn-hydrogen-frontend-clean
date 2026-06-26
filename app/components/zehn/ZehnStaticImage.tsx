/**
 * ZehnStaticImage — native <img> wrapper for /public/ and marketing assets (Phase 2).
 *
 * Same skeleton/fade contract as ZehnShopifyImage but for images NOT served via Shopify CDN:
 *  - Hero backgrounds loaded from /public/ (e.g. /BANNER Slider 1.jpg)
 *  - Static marketing assets (SVGs, badges, editorial photos)
 *
 * Skeleton behaviour mirrors ZehnShopifyImage:
 *  - Non-LCP: animate-pulse until onLoad; fade-in 200 ms.
 *  - LCP (isLCP=true): no skeleton; opacity-100 immediately.
 *  - Carousel (carousel=true): eager load all hero slides; no lazy opacity gate on hidden slides.
 *
 * Cached-image detection: useIsomorphicLayoutEffect checks img.complete on mount so
 * browser-cached hero/marketing images skip the skeleton without an SSR mismatch.
 *
 * @example
 * // Static marketing image with skeleton
 * <ZehnMediaFrame aspect="slider">
 *   <ZehnStaticImage src="/editorial-shot.jpg" alt="Campaign" />
 * </ZehnMediaFrame>
 *
 * // LCP hero slide (no skeleton)
 * <ZehnStaticImage src={slide.src} alt={slide.alt} isLCP />
 */
import {useRef, useState} from 'react';
import {useIsomorphicLayoutEffect} from '~/hooks/useIsomorphicLayoutEffect';

import {
  isImageCached,
  markImageCached,
  markImageCachedFromElement,
  normalizeImageCacheKey,
} from '~/lib/zehn-image-cache';
import {cn} from '~/lib/utils';
import {
  ZEHN_MEDIA_SKELETON,
  ZEHN_MEDIA_SKELETON_FADE,
  ZEHN_MEDIA_SKELETON_STATIC,
  ZEHN_MEDIA_FADE_IN,
} from '~/lib/zehn-media-styles';

export type ZehnStaticImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt'
> & {
  /** Image source path — required (no alt-less decorative images in ZEHN UI). */
  src: string;
  /** Alt text — required for accessibility. Pass empty string only for decorative. */
  alt: string;
  /**
   * Mark true only for the LCP image (above-fold hero).
   * Enables loading="eager" + fetchPriority="high" and disables skeleton.
   */
  isLCP?: boolean;
  /**
   * Hero carousel slide — eager loading, no skeleton, always visible once painted.
   * Use with isLCP only on the first slide (fetchpriority high).
   */
  carousel?: boolean;
  /**
   * When false, skeleton uses static fill (no animate-pulse).
   * Use under semi-transparent overlays (hero behind frosted nav).
   */
  skeletonPulse?: boolean;
  /** Optional skeleton surface override (e.g. hero --hero-fold-bg). */
  skeletonClassName?: string;
};

export function ZehnStaticImage({
  src,
  alt,
  isLCP = false,
  carousel = false,
  skeletonPulse = true,
  skeletonClassName,
  className,
  onLoad,
  ...props
}: ZehnStaticImageProps) {
  const cacheKey = normalizeImageCacheKey(src);
  const [loaded, setLoaded] = useState(
    () => Boolean(cacheKey && isImageCached(cacheKey)),
  );
  const imgRef = useRef<HTMLImageElement>(null);

  useIsomorphicLayoutEffect(() => {
    markImageCachedFromElement(imgRef.current);
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [cacheKey]);

  const handleLoad: React.ReactEventHandler<HTMLImageElement> = (e) => {
    markImageCached(e.currentTarget.currentSrc || e.currentTarget.src || src);
    setLoaded(true);
    onLoad?.(e);
  };

  const eagerLoad = isLCP || carousel;
  const showImmediately = isLCP || carousel;

  const skeletonBase = skeletonPulse
    ? ZEHN_MEDIA_SKELETON
    : ZEHN_MEDIA_SKELETON_STATIC;

  return (
    <>
      {/* Pulse skeleton — omitted for LCP/carousel images */}
      {!showImmediately && (
        <div
          aria-hidden="true"
          className={cn(
            skeletonBase,
            skeletonClassName,
            ZEHN_MEDIA_SKELETON_FADE,
            loaded ? 'opacity-0' : 'opacity-100',
          )}
        />
      )}

      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eagerLoad ? 'eager' : 'lazy'}
        /* fetchpriority lowercase — React 18 runtime warns on camelCase fetchPriority (Prompt G) */
        {...(isLCP ? {fetchpriority: 'high' as const} : {})}
        {...props}
        onLoad={handleLoad}
        className={cn(
          'absolute inset-0 w-full h-full object-cover object-center',
          ZEHN_MEDIA_FADE_IN,
          showImmediately ? 'opacity-100' : loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
      />
    </>
  );
}
