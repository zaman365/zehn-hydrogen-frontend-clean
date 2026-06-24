/**
 * ZehnStaticImage — native <img> wrapper for /public/ and marketing assets (Phase 2).
 *
 * Same skeleton/fade contract as ZehnShopifyImage but for images NOT served via Shopify CDN:
 *  - Hero backgrounds loaded from /public/ (e.g. /BANNER Slider 1.jpg)
 *  - Static marketing assets (SVGs, badges, editorial photos)
 *
 * Skeleton behaviour mirrors ZehnShopifyImage:
 *  - Non-LCP: animate-pulse until onLoad; fade-in 700 ms.
 *  - LCP (isLCP=true): no skeleton; opacity-100 immediately.
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
import {useState} from 'react';
import {cn} from '~/lib/utils';
import {
  ZEHN_MEDIA_SKELETON,
  ZEHN_MEDIA_SKELETON_FADE,
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
};

export function ZehnStaticImage({
  src,
  alt,
  isLCP = false,
  className,
  onLoad,
  ...props
}: ZehnStaticImageProps) {
  const [loaded, setLoaded] = useState(false);

  const handleLoad: React.ReactEventHandler<HTMLImageElement> = (e) => {
    setLoaded(true);
    onLoad?.(e);
  };

  return (
    <>
      {/* Pulse skeleton — omitted for LCP images (no flash), fades out on load for others */}
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

      <img
        src={src}
        alt={alt}
        loading={isLCP ? 'eager' : 'lazy'}
        fetchPriority={isLCP ? 'high' : 'auto'}
        {...props}
        onLoad={handleLoad}
        className={cn(
          'absolute inset-0 w-full h-full object-cover object-center',
          ZEHN_MEDIA_FADE_IN,
          isLCP ? 'opacity-100' : loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
      />
    </>
  );
}
