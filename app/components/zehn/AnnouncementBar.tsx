import {useState, useEffect} from 'react';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {
  ANNOUNCEMENT_ICON,
  ANNOUNCEMENT_LABEL_ROW,
  ANNOUNCEMENT_SLIDES,
} from '~/lib/announcement-bar-content';
import {cn} from '~/lib/utils';

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENT_SLIDES.length);
      setIsTransitioning(false);
    }, 500);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(
        (prev) =>
          (prev - 1 + ANNOUNCEMENT_SLIDES.length) % ANNOUNCEMENT_SLIDES.length,
      );
      setIsTransitioning(false);
    }, 500);
  };

  const currentAnnouncement = ANNOUNCEMENT_SLIDES[currentIndex];
  const SlideIcon = currentAnnouncement.icon;

  return (
    <div
      data-announcement-bar
      /* Always visible — no entrance animation to prevent flash on hard refresh (BL-0006) */
      className={`fixed top-0 left-0 right-0 z-[60] h-[26px] sm:h-[29px] text-white ${currentAnnouncement.bgColor}`}
    >
      <div className="w-full h-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-center overflow-hidden relative max-w-[1400px] mx-auto">
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Previous announcement"
            type="button"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2} aria-hidden />
          </button>

          <div
            className={cn(
              ANNOUNCEMENT_LABEL_ROW,
              'transition-all duration-500',
              isTransitioning
                ? 'opacity-0 -translate-x-8'
                : 'opacity-100 translate-x-0',
            )}
            aria-live="polite"
          >
            <SlideIcon className={ANNOUNCEMENT_ICON} aria-hidden />
            <span className="text-[11px] sm:text-xs font-medium tracking-wide">
              {currentAnnouncement.text}
            </span>
          </div>

          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Next announcement"
            type="button"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
