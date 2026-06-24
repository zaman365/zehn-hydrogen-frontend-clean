
import { useEffect, useRef, useState } from "react"
import { Shirt, Award, TrendingUp } from "lucide-react"
import {ZehnStaticImage} from '~/components/zehn'

export function CTABanner() {
  const [isVisible, setIsVisible] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (bannerRef.current) {
      observer.observe(bannerRef.current)
    }

    return () => {
      if (bannerRef.current) {
        observer.unobserve(bannerRef.current)
      }
    }
  }, [])

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={bannerRef}
          className={`rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden min-h-[320px] sm:min-h-[400px] lg:min-h-[450px] transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* ZehnStaticImage: skeleton+fade inside the banner's relative overflow-hidden container */}
          <ZehnStaticImage
            src="/images/bf965cf4-e728-4e72-ab1b-16b1cd8f1822.png"
            alt="Premium quality"
          />
          
          {/* Gradient overlay for better text readability on mobile */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/50 to-transparent sm:from-primary/60 sm:via-primary/40" />
          
          <div className="relative z-10 text-left max-w-2xl">
            <p className="font-sans text-xs sm:text-sm tracking-[0.3em] uppercase text-primary-foreground/70 mb-3 sm:mb-4">Crafted for confidence</p>
            <h3 className="font-sans text-h2 sm:text-h2-sm lg:text-h2-lg text-primary-foreground mb-2 sm:mb-4 tracking-tight-4">
              Build Your Perfect
            </h3>
            <h3 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-primary-foreground/70 mb-6 sm:mb-8 tracking-tight-2">
              Wardrobe
            </h3>
            
            <div className="flex flex-col items-start gap-3 sm:gap-4 font-sans">
              <div className="flex items-center gap-3 text-primary-foreground/90">
                <Award className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-body lg:text-body-lg">Premium Fabrics & Construction</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/90">
                <Shirt className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-body lg:text-body-lg">Versatile Modern Styles</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/90">
                <TrendingUp className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-body lg:text-body-lg">Timeless Designs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
