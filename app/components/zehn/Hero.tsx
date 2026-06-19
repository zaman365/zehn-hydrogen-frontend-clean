import {useEffect, useState} from 'react';
import {Link} from 'react-router';

const HERO_SLIDES = [
  {
    id: 'banner-slider-1',
    src: '/BANNER Slider 1.jpg',
    mobileSrc: '/BANNER Slider 1 - Mobile.jpg',
    fallbackSrc: '/hero.png',
    alt: 'ZEHN premium fashion hero banner 1',
  },
  {
    id: 'banner-slider-2',
    src: '/BANNER Slider 2.jpg',
    mobileSrc: '/BANNER Slider 2 - Mobile.jpg',
    fallbackSrc: '/hero.png',
    alt: 'ZEHN premium fashion hero banner 2',
  },
  {
    id: 'banner-slider-3',
    src: '/BANNER Slider 3.jpg',
    mobileSrc: '/BANNER Slider 3 - Mobile.jpg',
    fallbackSrc: '/hero.png',
    alt: 'ZEHN premium fashion hero banner 3',
  },
];
const SLIDE_DURATION_MS = 10000;

function HeroSliderImage({
  className,
  height,
  priority,
  slide,
  useMobile = false,
  width,
}: {
  className: string;
  height: number;
  priority: boolean;
  slide: (typeof HERO_SLIDES)[number];
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
    <section
      data-homepage-hero
      className="-mt-[102px] sm:-mt-[106px] w-full relative overflow-hidden pb-0 lg:h-auto lg:flex lg:items-center"
    >

      {/* Main Content */}
      <div className="relative z-10 w-full pt-0">

        {/* Mobile Layout: Image Only */}
        <div className="lg:hidden flex flex-col items-center text-center">
          {/* Image Only */}
          <div className="relative w-full">
            <div className="relative w-full aspect-[4/5] max-h-[calc(85vh+102px)] overflow-hidden bg-background">
              {HERO_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-[opacity,transform] duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                    activeSlide === index
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-[1.025]'
                  }`}
                >
                  <HeroSliderImage
                    slide={slide}
                    useMobile
                    className="h-full w-full object-cover"
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
              {/* Text Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-10 pointer-events-none">
                <div className="text-center pointer-events-auto">
                  <p className="font-display text-white font-black text-[13px] tracking-[0.1em] uppercase leading-none mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
                    SOMMERKOLLEKTION
                  </p>
                  <Link
                    to="/collections/neuheiten"
                    className="font-display inline-block px-5 py-1.5 bg-white/90 hover:bg-white text-[#0F1426] text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:scale-105 shadow-md"
                  >
                    ENTDECKEN
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout: Image Only */}
        <div className="hidden lg:flex lg:justify-center lg:items-center">
          {/* Hero Image - Centered */}
          <div className="relative w-full">
            <div className="relative w-full h-[calc(58vh+106px)] xl:h-[calc(62vh+106px)] 2xl:h-[calc(66vh+106px)] overflow-hidden">
              {/* Main hero image */}
              {HERO_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-[opacity,transform] duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                    activeSlide === index
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-[1.025]'
                  }`}
                >
                  <HeroSliderImage
                    slide={slide}
                    className="h-full w-full object-cover"
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
              {/* Text Overlay */}
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-10 pointer-events-none">
                <div className="text-center pointer-events-auto">
                  <p className="font-display text-white font-black text-[39px] xl:text-[47px] tracking-[0.18em] uppercase leading-none mb-5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
                    SOMMERKOLLEKTION
                  </p>
                  <Link
                    to="/collections/neuheiten"
                    className="font-display inline-block px-10 py-3 bg-white/90 hover:bg-white text-[#0F1426] text-sm font-bold tracking-[0.25em] uppercase transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    ENTDECKEN
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-2 w-full bg-background" aria-hidden="true" />
      </div>
    </section>
  )
}
