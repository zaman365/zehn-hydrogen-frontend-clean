
import { useEffect, useState, useRef } from "react"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"

// ZEHN Design System Spacing Tokens
const SPACING = {
  section: 'py-3',
  header: 'mb-8 sm:mb-10',
  cardGap: 'gap-6 lg:gap-8',
  cardPadding: 'p-6 sm:p-8',
} as const

interface Testimonial {
  id: number
  name: string
  role: string
  rating: number
  text: string
  image: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Stefan M.",
    role: "Verifizierter Kunde",
    rating: 5,
    text: "Die Cargohose von ZEHN ist einfach perfekt! Hochwertige Verarbeitung, bequemer Sitz und die vielen Taschen sind super praktisch. Trage sie fast täglich.",
    image: "/product-placeholder.svg"
  },
  {
    id: 2,
    name: "Julia K.",
    role: "Verifizierter Kunde",
    rating: 5,
    text: "Endlich ein Poloshirt, das wirklich passt! Der Stoff fühlt sich premium an und die Passform ist makellos. Habe mir direkt drei weitere bestellt.",
    image: "/product-placeholder.svg"
  },
  {
    id: 3,
    name: "Michael R.",
    role: "Verifizierter Kunde",
    rating: 5,
    text: "Die Chinohose sitzt wie angegossen. Perfekt für Business und Freizeit. Qualität und Verarbeitung sind erstklassig – jeden Euro wert!",
    image: "/product-placeholder.svg"
  },
  {
    id: 4,
    name: "Anna W.",
    role: "Verifizierter Kunde",
    rating: 5,
    text: "Beste Jacke, die ich je hatte! Hält warm, sieht stylisch aus und die Qualität ist unübertroffen. ZEHN überzeugt auf ganzer Linie.",
    image: "/product-placeholder.svg"
  },
  {
    id: 5,
    name: "Thomas B.",
    role: "Verifizierter Kunde",
    rating: 5,
    text: "Die T-Shirts von ZEHN sind ein Traum! Weicher Stoff, perfekte Passform und auch nach vielen Wäschen noch wie neu. Absolute Kaufempfehlung!",
    image: "/product-placeholder.svg"
  },
  {
    id: 6,
    name: "Lisa H.",
    role: "Verifizierter Kunde",
    rating: 5,
    text: "Shorts mit perfekter Länge und tollem Schnitt. Ideal für den Sommer, bequem und stylisch zugleich. ZEHN enttäuscht nie!",
    image: "/product-placeholder.svg"
  }
]

interface TestimonialsProps {
  testimonials?: Testimonial[]
  isLoading?: boolean
  error?: Error | null
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function Testimonials({
  testimonials: propTestimonials = testimonials,
  isLoading = false,
  error = null,
  autoPlay = false,
  autoPlayInterval = 5000
}: TestimonialsProps = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Determine cards per view based on screen size
  const getCardsPerView = () => {
    if (typeof window === 'undefined') return 1
    if (window.innerWidth < 768) return 1
    if (window.innerWidth < 1024) return 2
    return 3
  }

  const [cardsPerView, setCardsPerView] = useState(getCardsPerView())

  useEffect(() => {
    // Set initial value on mount
    setCardsPerView(getCardsPerView())

    const handleResize = () => {
      setCardsPerView(getCardsPerView())
      setCurrentIndex(0) // Reset to first slide on resize
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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

  const totalSlides = Math.ceil(propTestimonials.length / cardsPerView)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))
  }

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, totalSlides])

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || isPaused) return

    const interval = setInterval(() => {
      handleNext()
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, isPaused, currentIndex, autoPlayInterval])

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      handleNext()
    }
    if (isRightSwipe) {
      handlePrevious()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  // Loading state
  if (isLoading) {
    return (
      <section className={`w-full ${SPACING.section} bg-background`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted/20 rounded w-48 mx-auto"></div>
              <div className="h-12 bg-muted/20 rounded w-64 mx-auto"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-muted/20 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Error or empty state
  if (error || !propTestimonials?.length) {
    return (
      <section className={`w-full ${SPACING.section} bg-background`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted">
            {error ? 'Kundenstimmen konnten nicht geladen werden' : 'Keine Kundenstimmen verfügbar'}
          </div>
        </div>
      </section>
    )
  }

  const startIndex = currentIndex * cardsPerView + 1
  const endIndex = Math.min((currentIndex + 1) * cardsPerView, propTestimonials.length)

  return (
    <section className={`w-full ${SPACING.section} bg-background`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={sectionRef}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          {/* Header */}
          <div className={`text-center ${SPACING.header}`}>
            <span className="font-sans text-xs sm:text-sm tracking-[0.3em] uppercase text-muted mb-3 sm:mb-4 block">
              Kundenstimmen
            </span>
            <h2 className="font-sans text-h2 sm:text-h2-sm lg:text-h2-lg text-foreground mb-4 text-balance">
              Was unsere Kunden sagen
            </h2>
          </div>

          {/* ARIA Live Region for screen readers */}
          <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            Zeige Kundenstimmen {startIndex} bis {endIndex} von {propTestimonials.length}
          </div>

          {/* Slider Container */}
          <div className="relative overflow-hidden">
            {/* Slider Track */}
            <div className="overflow-visible pb-4">
              <div
                ref={sliderRef}
                className="flex transition-transform duration-500 ease-out"
                style={{
                  transform: `translateX(-${currentIndex * 100}%)`
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                role="region"
                aria-label="Kundenstimmen-Karussell"
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div
                    key={slideIndex}
                    className={`min-w-full flex ${SPACING.cardGap} px-1`}
                  >
                    {propTestimonials
                      .slice(
                        slideIndex * cardsPerView,
                        slideIndex * cardsPerView + cardsPerView
                      )
                      .map((testimonial) => (
                        <article
                          key={testimonial.id}
                          className={`flex-1 bg-card rounded-2xl ${SPACING.cardPadding} shadow-lg border border-border/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                        >
                          {/* Rating */}
                          <div className="flex gap-1 mb-4" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-accent text-accent" aria-hidden="true" />
                            ))}
                          </div>

                          {/* Testimonial Text - Semantic blockquote */}
                          <blockquote className="font-sans text-body text-foreground mb-6 leading-relaxed">
                            <p>{testimonial.text}</p>
                          </blockquote>

                          {/* Customer Info */}
                          <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                            <div className="w-12 h-12 rounded-full bg-background overflow-hidden flex-shrink-0">
                              <img
                                src={testimonial.image}
                                alt={`${testimonial.name}, ${testimonial.role}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                width={48}
                                height={48}
                              />
                            </div>
                            <div>
                              <h4 className="font-sans text-body font-medium text-foreground">{testimonial.name}</h4>
                              <p className="font-sans text-body text-muted">{testimonial.role}</p>
                            </div>
                          </div>

                          {/* Schema.org markup for SEO */}
                          <script type="application/ld+json" dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                              "@context": "https://schema.org",
                              "@type": "Review",
                              "itemReviewed": {
                                "@type": "Product",
                                "name": "ZEHN Products"
                              },
                              "reviewRating": {
                                "@type": "Rating",
                                "ratingValue": testimonial.rating,
                                "bestRating": "5"
                              },
                              "author": {
                                "@type": "Person",
                                "name": testimonial.name
                              },
                              "reviewBody": testimonial.text
                            })
                          }} />
                        </article>
                      ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Controls - Centered with arrows on sides */}
            <div className="flex items-center justify-center gap-4 mt-4 sm:mt-6">
              {/* Previous Arrow - Hidden on mobile, shown on desktop */}
              <button
                onClick={handlePrevious}
                onKeyDown={(e) => e.key === 'Enter' && handlePrevious()}
                className="hidden md:flex w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-card border border-border/30 shadow-lg items-center justify-center hover:bg-accent hover:border-accent hover:text-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                aria-label="Vorherige Kundenstimmen"
                tabIndex={0}
              >
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>

              {/* Dot Indicators with proper touch targets */}
              <div className="flex gap-2" role="tablist" aria-label="Kundenstimmen-Folien">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  onKeyDown={(e) => e.key === 'Enter' && handleDotClick(index)}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  aria-label={`Gehe zu Folie ${index + 1}`}
                  aria-current={index === currentIndex ? 'true' : 'false'}
                  role="tab"
                  tabIndex={0}
                >
                  <span className={`block rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-accent w-8 h-2'
                      : 'bg-border hover:bg-accent/50 w-2 h-2'
                  }`} />
                </button>
              ))}
              </div>

              {/* Next Arrow - Hidden on mobile, shown on desktop */}
              <button
                onClick={handleNext}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                className="hidden md:flex w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-card border border-border/30 shadow-lg items-center justify-center hover:bg-accent hover:border-accent hover:text-white transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                aria-label="Nächste Kundenstimmen"
                tabIndex={0}
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
