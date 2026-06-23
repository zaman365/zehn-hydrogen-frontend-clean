/**
 * Hero slider — homepage fold banner.
 *
 * Both desktop and mobile use the same offset geometry (see homepage-hero.css):
 *
 *  fold_h  = native_image_h + img_top
 *  img_top = headerStack − offset   (offset hides blank studio behind header)
 *  img_h   = fold_h − img_top       = native_image_h  → exact aspect ratio
 *
 * Desktop (≥1024px):
 *  Banner 5:2 (3000×1200). fold_h = 100vw/2.5 + 81px.
 *  Container always 2.5:1 → cover scales to height → full model, no zoom.
 *
 * Mobile (<1024px):
 *  Banner 4:5 (1080×1350). fold_h = 100vw×1.25 + 63px.
 *  Container always 4:5 → cover scales to height → full portrait model.
 *
 * object-position: center 0% (top-align) on both:
 *  At the exact aspect ratio there is no overflow → Y has no effect.
 *  Safety for rare max-height-capped viewports where scale-to-width occurs.
 *
 * Text overlay:
 *  Stagger entrance via CSS hero-reveal keyframes; re-triggered on each slide
 *  change via key={activeSlide} on the overlay wrapper (React unmount/remount).
 *  Subtitle cycles through brand phrases using useTextCycle — smooth CSS crossfade (client-only).
 */
import {useEffect, useState} from 'react';
import {Sparkles} from 'lucide-react';
import {CtaShineButton} from '~/components/zehn/CtaShineButton';
import {HERO_SUBTITLE_PHRASES} from '~/lib/hero-content';
import {
  HERO_SUBTITLE_DESKTOP,
  HERO_SUBTITLE_MOBILE,
  HERO_TEXT_LINE,
  HERO_TEXT_STACK_DESKTOP,
  HERO_TEXT_STACK_MOBILE,
  HERO_TITLE_DESKTOP,
  HERO_TITLE_MOBILE,
} from '~/lib/hero-typography';
import {useTextCycle} from '~/lib/hero-text-shuffle';

type HeroSlide = {
  id: string;
  /** Desktop wide banner (3000×1200) */
  src: string;
  /** Mobile portrait banner (1080×1350) */
  mobileSrc: string;
  fallbackSrc: string;
  alt: string;
  /** Horizontal centering for desktop cover. Vertical Y has no effect (no vertical overflow). */
  objectPositionDesktop?: string;
  /** Vertical framing for mobile portrait crop. */
  objectPositionMobile?: string;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'banner-slider-1',
    src: '/BANNER Slider 1.jpg',
    mobileSrc: '/BANNER Slider 1 - Mobile.jpg',
    fallbackSrc: '/hero.png',
    alt: 'ZEHN premium fashion hero banner 1',
    objectPositionDesktop: 'center 0%',
  },
  {
    id: 'banner-slider-2',
    src: '/BANNER Slider 2.jpg',
    mobileSrc: '/BANNER Slider 2 - Mobile.jpg',
    fallbackSrc: '/hero.png',
    alt: 'ZEHN premium fashion hero banner 2',
    objectPositionDesktop: 'center 0%',
  },
  {
    id: 'banner-slider-3',
    src: '/BANNER Slider 3.jpg',
    mobileSrc: '/BANNER Slider 3 - Mobile.jpg',
    fallbackSrc: '/hero.png',
    alt: 'ZEHN premium fashion hero banner 3',
    objectPositionDesktop: 'center 0%',
  },
];

const SLIDE_DURATION_MS = 10000;
/** Both mobile and desktop: top-align so head is never cropped on capped viewports */
const HERO_OBJECT_POSITION_MOBILE = 'center 0%';
const HERO_OBJECT_POSITION_DESKTOP = 'center 0%';

/**
 * HeroTextOverlay — stagger-animated title + scramble subtitle + glass CTA.
 * Wrapped with key={activeSlide} in parent → remounts on each slide → re-triggers CSS animations.
 */
function HeroTextOverlay({to, isMobile}: {to: string; isMobile: boolean}) {
  const {displayed: subtitle, fading} = useTextCycle(
    HERO_SUBTITLE_PHRASES,
    4500,
  );

  if (isMobile) {
    return (
      <div className="hero-text-overlay hero-text-overlay--mobile">
        {/* Title: stagger step 1 — scales down on narrow viewports; wraps if needed */}
        <p
          className={`hero-reveal hero-title-glow ${HERO_TITLE_MOBILE} ${HERO_TEXT_LINE} mb-1.5`}
        >
          SOMMERKOLLEKTION
        </p>
        {/*
         * Subtitle: stagger step 2.
         * subtitle is null until client mounts (prevents SSR/hydration mismatch).
         * fading class triggers CSS ease-out; removal triggers ease-in via transition.
         */}
        {subtitle !== null && (
          <p
            className={`hero-reveal hero-reveal-delay-1 ${HERO_SUBTITLE_MOBILE} ${HERO_TEXT_LINE} mb-3${fading ? ' hero-subtitle-fading' : ''}`}
          >
            {subtitle}
          </p>
        )}
        {/* CTA: stagger step 3 */}
        <div className="hero-reveal hero-reveal-delay-2">
          <CtaShineButton
            to={to}
            className="px-5 py-2 text-[9px] tracking-[0.22em]"
          >
            <Sparkles size={12} aria-hidden="true" className="shrink-0" />
            ENTDECKEN
          </CtaShineButton>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-text-overlay hero-text-overlay--desktop">
      {/* Title: fluid size — wraps on narrow desktop/tablet widths */}
      <p
        className={`hero-reveal hero-title-glow ${HERO_TITLE_DESKTOP} ${HERO_TEXT_LINE} mb-3`}
      >
        SOMMERKOLLEKTION
      </p>
      {/* Subtitle: stagger step 2 — client-only, null guard prevents hydration mismatch */}
      {subtitle !== null && (
        <p
          className={`hero-reveal hero-reveal-delay-1 ${HERO_SUBTITLE_DESKTOP} ${HERO_TEXT_LINE} mb-6${fading ? ' hero-subtitle-fading' : ''}`}
        >
          {subtitle}
        </p>
      )}
      {/* CTA: stagger step 3 */}
      <div className="hero-reveal hero-reveal-delay-2">
        <CtaShineButton
          to={to}
          className="px-10 py-3.5 text-[13px] tracking-[0.28em]"
        >
          <Sparkles size={17} aria-hidden="true" className="shrink-0" />
          ENTDECKEN
        </CtaShineButton>
      </div>
    </div>
  );
}

function HeroSliderImage({
  className,
  height,
  objectPosition,
  priority,
  slide,
  useMobile = false,
  width,
}: {
  className: string;
  height: number;
  objectPosition: string;
  priority: boolean;
  slide: HeroSlide;
  useMobile?: boolean;
  width: number;
}) {
  const src = useMobile ? slide.mobileSrc : slide.src;

  return (
    <img
      src={src}
      alt={slide.alt}
      translate="no"
      className={className}
      style={{objectPosition}}
      loading={priority ? 'eager' : 'lazy'}
      width={width}
      height={height}
      fetchPriority={priority ? 'high' : 'auto'}
      onError={(event) => {
        if (event.currentTarget.dataset.fallbackApplied === 'true') return;
        event.currentTarget.dataset.fallbackApplied = 'true';
        event.currentTarget.src = slide.fallbackSrc;
      }}
    />
  );
}

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  const handleBannerClick = () => {
    window.dispatchEvent(new CustomEvent('zehn:hero-banner-click'));
  };

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setActiveSlide((currentSlide) => (currentSlide + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION_MS);

    return () => window.clearInterval(slideTimer);
  }, []);

  return (
    <section data-homepage-hero>
      {/* Mobile viewport: portrait banners (1080×1350) */}
      <div className="hero-viewport hero-viewport--mobile w-full">
        <div className="hero-stage">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              data-hero-slide={slide.id}
              className={`absolute inset-0 transition-[opacity,transform] duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                activeSlide === index
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-[1.025]'
              }`}
            >
              <HeroSliderImage
                slide={slide}
                useMobile
                objectPosition={
                  slide.objectPositionMobile ?? HERO_OBJECT_POSITION_MOBILE
                }
                className="hero-slide-img hero-slide-img--mobile"
                priority={index === 0}
                width={1080}
                height={1350}
              />
            </div>
          ))}
          <button
            type="button"
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={handleBannerClick}
            aria-label="Zur Produktauswahl"
          />
          {/*
           * key={activeSlide} → React unmounts/remounts this subtree on each slide change
           * → CSS hero-reveal animations re-trigger automatically. No JS animation lib needed.
           */}
          <div className={HERO_TEXT_STACK_MOBILE}>
            <div key={`mobile-text-${activeSlide}`}>
              <HeroTextOverlay to="/collections/neuheiten" isMobile />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop viewport: wide banners (3000×1200) */}
      <div className="hero-viewport hero-viewport--desktop w-full">
        <div className="hero-stage">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              data-hero-slide={slide.id}
              className={`absolute inset-0 transition-[opacity,transform] duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                activeSlide === index
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-[1.025]'
              }`}
            >
              <HeroSliderImage
                slide={slide}
                objectPosition={
                  slide.objectPositionDesktop ?? HERO_OBJECT_POSITION_DESKTOP
                }
                className="hero-slide-img hero-slide-img--desktop"
                priority={index === 0}
                width={3000}
                height={1200}
              />
            </div>
          ))}
          <button
            type="button"
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={handleBannerClick}
            aria-label="Zur Produktauswahl"
          />
          <div className={HERO_TEXT_STACK_DESKTOP}>
            <div key={`desktop-text-${activeSlide}`}>
              <HeroTextOverlay to="/collections/neuheiten" isMobile={false} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
