import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {ZehnStaticImage} from '~/components/zehn'

type CategorySlide = {
  title: string
  image: string
  link: string
}

type CategoryCarouselProps = {
  title: string
  categories: CategorySlide[]
}

export function CategoryCarousel({ title, categories }: CategoryCarouselProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 400
      const newIndex = direction === 'left'
        ? Math.max(0, currentIndex - 1)
        : Math.min(categories.length - 1, currentIndex + 1)

      setCurrentIndex(newIndex)
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section ref={sectionRef} className="w-full py-12 sm:py-16 bg-zehn-platinum">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className={`font-sans text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground uppercase tracking-tight ${isVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={isVisible ? { animationDelay: '0.1s', animationFillMode: 'forwards' } : {}}>
            {title}
          </h2>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-sm bg-card border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-sm bg-card border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next"
              disabled={currentIndex === categories.length - 1}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className={`relative ${isVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={isVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
          >
            {categories.map((category) => (
              <Link
                key={category.title}
                to={category.link}
                className="group flex-shrink-0 w-[320px] sm:w-[380px] snap-start"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-card">
                  {/* ZehnStaticImage: skeleton+fade; container enforces 4:5 aspect via Tailwind */}
                  <ZehnStaticImage
                    src={category.image}
                    alt={category.title}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Title */}
                  <div className="absolute inset-0 flex items-end p-6">
                    <h3 className="font-sans text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
                      {category.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
