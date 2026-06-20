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
 */
import {useEffect, useState} from 'react';
import {Link} from 'react-router';

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
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end pb-10">
            <div className="pointer-events-auto text-center">
              <p className="font-display mb-3 text-[13px] font-black uppercase leading-none tracking-[0.1em] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
                SOMMERKOLLEKTION
              </p>
              <Link
                to="/collections/neuheiten"
                className="font-display inline-block bg-white/90 px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F1426] shadow-md transition-all duration-300 hover:scale-105 hover:bg-white"
              >
                ENTDECKEN
              </Link>
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
          <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-end pb-10">
            <div className="pointer-events-auto text-center">
              <p className="font-display mb-5 text-[39px] font-black uppercase leading-none tracking-[0.18em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] xl:text-[47px]">
                SOMMERKOLLEKTION
              </p>
              <Link
                to="/collections/neuheiten"
                className="font-display inline-block bg-white/90 px-10 py-3 text-sm font-bold uppercase tracking-[0.25em] text-[#0F1426] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white"
              >
                ENTDECKEN
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
