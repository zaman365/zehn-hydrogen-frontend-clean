import {useState, useEffect} from 'react';

const announcements = [
  {
    text: 'Kostenloser Versand & Rücksendung',
    bgColor: 'bg-[#FF6B35]', // Zehn orange
  },
  {
    text: 'Kauf auf Rechnung',
    bgColor: 'bg-[#0F1426]', // Dark blue
  },
  {
    text: 'Neue Kollektion verfügbar | Entdecke jetzt!',
    bgColor: 'bg-[#FF6B35]', // Zehn orange
  },
];

export function AnnouncementBar() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Initial animation
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
      setIsTransitioning(false);
    }, 500);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
      setIsTransitioning(false);
    }, 500);
  };

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] h-[26px] sm:h-[29px] text-white transition-all duration-500 ease-out ${
        hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      } ${currentAnnouncement.bgColor}`}
    >
      <div className="w-full h-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-center overflow-hidden relative max-w-[1400px] mx-auto">
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Previous announcement"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Announcement Text with smooth left-to-right transition */}
          <p
            className={`text-[11px] sm:text-xs font-medium tracking-wide text-center transition-all duration-500 ${
              isTransitioning
                ? 'opacity-0 -translate-x-8'
                : 'opacity-100 translate-x-0'
            }`}
          >
            {currentAnnouncement.text}
          </p>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Next announcement"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
