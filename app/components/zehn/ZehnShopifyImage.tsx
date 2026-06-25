/**
 * ZehnShopifyImage — Hydrogen <Image> wrapper with pulse skeleton + fade-in (Phase 2).
 *
 * Loading tiers:
 *  - default (lazy): pulse skeleton + opacity-0 until onLoad, then 200ms fade-in.
 *  - priority: eager load, pulse skeleton until onLoad, opacity-100 immediately
 *    (progressive CDN paint; no white flash from opacity gate).
 *  - isLCP: eager + fetchpriority high, no skeleton, opacity-100 (one per page).
 *
 * Cached-image detection: useIsomorphicLayoutEffect checks img.complete on mount so
 * browser-cached images skip the skeleton entirely without an SSR/hydration mismatch.
 *
 * `sizes` is required — omitting it wastes bandwidth and hurts LCP.
 */
import {Image} from '@shopify/hydrogen';
import {useLayoutEffect, useEffect, useRef, useState} from 'react';
import {cn} from '~/lib/utils';
import {
  ZEHN_MEDIA_SKELETON,
  ZEHN_MEDIA_SKELETON_FADE,
  ZEHN_MEDIA_FADE_IN,
} from '~/lib/zehn-media-styles';

/**
 * useLayoutEffect on client (runs before paint → no skeleton flash for cached images),
 * useEffect on server (no-op → eliminates SSR "useLayoutEffect does nothing" warning).
 */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Props derived from Hydrogen Image component (HydrogenImageProps not re-exported from @shopify/hydrogen). */
type HydrogenImageBaseProps = React.ComponentPropsWithoutRef<typeof Image>;

// Survives SPA navigation — cleared only on hard reload. Prevents navigation-back flash.
const _loadedUrls = new Set<string>();

export type ZehnShopifyImageProps = Omit<HydrogenImageBaseProps, 'sizes'> & {
  /** Required: responsive sizes string for Shopify CDN srcSet generation. */
  sizes: string;
  /**
   * LCP candidate — eager + fetchpriority high, no skeleton.
   * Pass only for the single above-fold hero or first grid card (index 0).
   */
  isLCP?: boolean;
  /**
   * Above-fold product card — eager load, skeleton until paint, no opacity gate.
   * Use for horizontal sliders and first grid rows (not every eager card).
   */
  priority?: boolean;
  /** Extra classes for the <img> element (position, object-fit, etc.). */
  className?: string;
};

export function ZehnShopifyImage({
  sizes,
  isLCP = false,
  priority = false,
  className,
  onLoad,
  data,
  ...props
}: ZehnShopifyImageProps) {
  // Derive before useState so the lazy initialiser can check the module-level cache.
  const imageUrl =
    data && typeof data === 'object' && 'url' in data
      ? String((data as {url?: string}).url ?? '')
      : '';

  // Lazy init: already loaded in a previous render (navigation-back) → skip skeleton instantly.
  const [loaded, setLoaded] = useState(() => Boolean(imageUrl && _loadedUrls.has(imageUrl)));
  const frameRef = useRef<HTMLSpanElement>(null);

  const eagerLoad = isLCP || priority;
  const showImmediately = isLCP || priority;

  // Check img.complete before browser paints — cached images skip skeleton with no flicker.
  useIsomorphicLayoutEffect(() => {
    const img = frameRef.current?.querySelector('img');
    if (img?.complete && img.naturalWidth > 0) {
      if (imageUrl) _loadedUrls.add(imageUrl);
      setLoaded(true);
    }
  }, [imageUrl]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (imageUrl) _loadedUrls.add(imageUrl);
    setLoaded(true);
    onLoad?.(e);
  };

  return (
    <span ref={frameRef} className="contents">
      {/* Pulse skeleton — omitted for LCP; fades out when image loads for priority/lazy */}
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
