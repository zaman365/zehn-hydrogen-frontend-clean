/**
 * ZehnShopifyImage — Hydrogen <Image> wrapper with pulse skeleton + fade-in (Phase 2).
 *
 * Loading tiers:
 *  - default (lazy): pulse skeleton + opacity-0 until onLoad, then 200ms fade-in.
 *  - priority: eager load, pulse skeleton until onLoad, opacity-100 immediately
 *  - skipSkeleton: eager, no pulse (horizontal sliders, PDP thumbnails)
 *  - isLCP: eager + fetchpriority high, no skeleton, opacity-100 (one per page)
 *
 * Phase 7: zehn-image-cache module Set keyed by img.currentSrc — skips skeleton on SPA revisit.
 */
import {Image} from '@shopify/hydrogen';
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
  ZEHN_MEDIA_FADE_IN,
} from '~/lib/zehn-media-styles';

/** Props derived from Hydrogen Image component (HydrogenImageProps not re-exported from @shopify/hydrogen). */
type HydrogenImageBaseProps = React.ComponentPropsWithoutRef<typeof Image>;

export type ZehnShopifyImageProps = Omit<HydrogenImageBaseProps, 'sizes'> & {
  /** Required: responsive sizes string for Shopify CDN srcSet generation. */
  sizes: string;
  /** LCP candidate — eager + fetchpriority high, no skeleton. */
  isLCP?: boolean;
  /** Above-fold product card — eager load, skeleton until paint, no opacity gate. */
  priority?: boolean;
  /** Skip pulse skeleton — fixed aspect frame holds layout (sliders, thumbnails). */
  skipSkeleton?: boolean;
  /** Extra classes for the <img> element (position, object-fit, etc.). */
  className?: string;
};

export function ZehnShopifyImage({
  sizes,
  isLCP = false,
  priority = false,
  skipSkeleton = false,
  className,
  onLoad,
  data,
  ...props
}: ZehnShopifyImageProps) {
  const imageUrl =
    data && typeof data === 'object' && 'url' in data
      ? String((data as {url?: string}).url ?? '')
      : '';

  const cacheKey = normalizeImageCacheKey(imageUrl);

  const [loaded, setLoaded] = useState(
    () => Boolean(cacheKey && isImageCached(cacheKey)),
  );
  const frameRef = useRef<HTMLSpanElement>(null);

  const eagerLoad = isLCP || priority;
  const showImmediately = isLCP || priority;
  const hideSkeleton = isLCP || skipSkeleton;

  useIsomorphicLayoutEffect(() => {
    const img = frameRef.current?.querySelector('img') ?? null;
    markImageCachedFromElement(img);
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [cacheKey]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    markImageCached(img.currentSrc || img.src || imageUrl);
    setLoaded(true);
    onLoad?.(e);
  };

  return (
    <span ref={frameRef} className="contents">
      {!hideSkeleton && (
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
        data={data}
        loading={eagerLoad ? 'eager' : 'lazy'}
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
    </span>
  );
}
