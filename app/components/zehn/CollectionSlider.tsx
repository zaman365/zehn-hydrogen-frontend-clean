import { useEffect, useRef, useState } from "react"
import { Link } from "react-router"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"

type CollectionSlide = {
  title: string
  subtitle: string
  description: string
  image: string
  link: string
}

type CollectionSliderProps = {
  collections: CollectionSlide[]
}

export function CollectionSlider({ collections }: CollectionSliderProps) {
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
      const slideWidth = sliderRef.current.offsetWidth
      const newIndex = direction === 'left'
        ? Math.max(0, currentIndex - 1)
        : Math.min(collections.length - 1, currentIndex + 1)

      setCurrentIndex(newIndex)
      sliderRef.current.scrollTo({
        left: slideWidth * newIndex,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section ref={sectionRef} className="w-full py-16 sm:py-20 lg:py-24 bg-zehn-platinum relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-20 w-96 h-96 bg-zehn-indigo rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className={`font-sans text-xs sm:text-sm tracking-[0.3em] uppercase text-muted mb-3 sm:mb-4 block ${isVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={isVisible ? { animationDelay: '0.1s', animationFillMode: 'forwards' } : {}}>
            Explore Collections
          </span>
          <h2 className={`font-sans text-3xl sm:text-4xl lg:text-5xl text-foreground mb-4 tracking-tight-4 ${isVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={isVisible ? { animationDelay: '0.3s', animationFillMode: 'forwards' } : {}}>
            Curated for You
          </h2>
        </div>

        {/* Slider Container */}
        <div className={`relative ${isVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={isVisible ? { animationDelay: '0.5s', animationFillMode: 'forwards' } : {}}>
          {/* Slider */}
          <div
            ref={sliderRef}
            className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {collections.map((collection, index) => (
              <div
                key={collection.title}
                className="flex-shrink-0 w-full snap-start"
              >
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Image Side */}
                  <div className={`relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{
                        filter: 'contrast(1.05) saturate(1.1) brightness(0.95)',
                      }}
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zehn-indigo/40 via-transparent to-transparent" />
                  </div>

                  {/* Content Side */}
                  <div className={`${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="space-y-6">
                      {/* Subtitle */}
                      <span className="inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-xs sm:text-sm font-sans font-medium tracking-wide uppercase text-accent">
                        {collection.subtitle}
                      </span>

                      {/* Title */}
                      <h3 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight-4">
                        {collection.title}
                      </h3>

                      {/* Description */}
                      <p className="font-sans text-base sm:text-lg text-muted leading-relaxed max-w-xl">
                        {collection.description}
                      </p>

                      {/* CTA */}
                      <Link
                        to={collection.link}
                        className="group inline-flex items-center justify-center gap-3 bg-foreground text-background px-8 py-4 rounded-full font-sans font-medium text-sm sm:text-base tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-foreground/30 shadow-lg"
                      >
                        <span>Explore Collection</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={currentIndex === 0}
              className="w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center hover:bg-foreground hover:text-background transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:text-foreground shadow-sm"
              aria-label="Previous collection"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {collections.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(index)
                    if (sliderRef.current) {
                      const slideWidth = sliderRef.current.offsetWidth
                      sliderRef.current.scrollTo({
                        left: slideWidth * index,
                        behavior: 'smooth'
                      })
                    }
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'w-8 h-2 bg-accent'
                      : 'w-2 h-2 bg-muted/40 hover:bg-muted'
                  }`}
                  aria-label={`Go to collection ${index + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={currentIndex === collections.length - 1}
              className="w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center hover:bg-foreground hover:text-background transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:text-foreground shadow-sm"
              aria-label="Next collection"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
