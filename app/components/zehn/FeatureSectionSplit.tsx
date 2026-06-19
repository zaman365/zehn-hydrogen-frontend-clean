import { useEffect, useRef, useState } from "react"
import { Shirt, Ruler, Award, Scissors } from "lucide-react"

const features = [
  {
    icon: Award,
    title: "Premium Quality",
    description: "Italian fabrics and precision tailoring"
  },
  {
    icon: Ruler,
    title: "Perfect Fit",
    description: "Modern cuts for the contemporary gentleman"
  },
  {
    icon: Shirt,
    title: "Versatile Design",
    description: "Seamless transition from office to evening"
  },
  {
    icon: Scissors,
    title: "Craftsmanship",
    description: "Attention to detail in every stitch"
  }
]

export function FeatureSectionSplit() {
  const [isVisible, setIsVisible] = useState(false)
  const [isVideoVisible, setIsVideoVisible] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const bentoRef = useRef<HTMLDivElement>(null)
  const videoSectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const videoObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVideoVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (bentoRef.current) {
      observer.observe(bentoRef.current)
    }

    if (videoSectionRef.current) {
      videoObserver.observe(videoSectionRef.current)
    }

    if (headerRef.current) {
      headerObserver.observe(headerRef.current)
    }

    return () => {
      if (bentoRef.current) {
        observer.unobserve(bentoRef.current)
      }
      if (videoSectionRef.current) {
        videoObserver.unobserve(videoSectionRef.current)
      }
      if (headerRef.current) {
        headerObserver.unobserve(headerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bento Grid */}
        <div 
          ref={bentoRef}
          className="grid md:grid-cols-4 mb-12 sm:mb-16 lg:mb-20 md:grid-rows-[300px_300px] gap-4 sm:gap-6"
        >
          {/* Left Large Block - Image/Video with Overlay Card */}
          <div 
            className={`relative rounded-2xl sm:rounded-3xl overflow-hidden h-[500px] md:h-auto md:col-span-2 md:row-span-2 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '0ms', backgroundColor: '#f2f2f2' }}
          >
            {/* Banner Image with Sharp Crisp Styling */}
            <img
              src="/banner1.png"
              alt="Premium ZEHN Fashion"
              className="absolute inset-0 h-full w-full object-contain object-center"
              style={{
                imageRendering: 'crisp-edges',
                WebkitFontSmoothing: 'antialiased',
                filter: 'contrast(1.05) saturate(1.1) brightness(0.95)',
              }}
            />
          </div>

          {/* Top Right - Modern Fit */}
          <div 
            className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-center md:col-span-2 relative overflow-hidden transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '100ms', backgroundColor: '#ffffff' }}
          >
            {/* Banner2 Background Image */}
            <img
              src="/banner2.png"
              alt="Modern Fit Fashion"
              className="absolute inset-0 h-full w-full object-cover opacity-70"
              style={{
                imageRendering: 'crisp-edges',
                filter: 'contrast(1.1) saturate(1.05) brightness(1.05)',
                objectPosition: 'right center',
                transform: 'translateX(10%)',
              }}
            />
            
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl md:text-4xl mb-2 font-sans tracking-tight-4" style={{ color: 'var(--foreground)' }}>
                Modern Fit
              </h3>
              <h3 className="text-xl sm:text-2xl md:text-3xl mb-4 font-sans tracking-tight-2" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                Timeless Style
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)', opacity: 0.9 }}>
                  <Ruler className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                  <span className="font-sans">Precision Tailoring</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)', opacity: 0.9 }}>
                  <Shirt className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                  <span className="font-sans">Contemporary Cuts</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--foreground)', opacity: 0.9 }}>
                  <Award className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
                  <span className="font-sans">Superior Comfort</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right - Sustainable Fashion */}
          <div 
            className={`rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden md:col-span-2 bg-gradient-to-br from-zehn-slate/20 to-zehn-slate/10 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Placeholder for video background - will be replaced */}
            <div className="absolute inset-0 bg-platinum" />
            
            <div className="relative z-10 flex flex-col justify-center h-full text-left items-start">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-3">
                <Scissors className="w-7 h-7 sm:w-8 sm:h-8 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-sans text-sm sm:text-base mb-1 text-zehn-slate uppercase tracking-widest">
                Sustainable
              </h3>
              <h3 className="text-xl sm:text-2xl md:text-3xl mb-2 text-foreground font-sans tracking-tight-4">
                Fashion Forward
              </h3>
              <p className="text-sm text-zehn-slate font-sans max-w-xs">
                Ethically sourced materials and responsible production
              </p>
            </div>
          </div>
        </div>

        <div 
          ref={videoSectionRef}
          className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center py-12 sm:py-16 lg:py-20"
        >
          {/* Video/Image */}
          <div 
            className={`relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl transition-all duration-700 ease-out ${
              isVideoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            {/* Placeholder - will be replaced with actual video/image */}
            <div className="absolute inset-0 bg-gradient-to-br from-zehn-indigo via-zehn-slate/30 to-zehn-indigo/80" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Award className="w-16 h-16 sm:w-20 sm:h-20 text-primary-foreground/20" strokeWidth={1} />
            </div>
          </div>

          {/* Content */}
          <div
            ref={headerRef}
            className={`text-center transition-all duration-700 ease-out ${
              isVideoVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <span className={`text-xs sm:text-sm tracking-[0.3em] uppercase text-accent mb-3 sm:mb-4 block font-sans transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={headerVisible ? { transitionDelay: '0.2s' } : {}}>
              Why ZEHN
            </span>
            <h2 className={`font-sans text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-foreground mb-4 sm:mb-6 tracking-tight-4 transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={headerVisible ? { transitionDelay: '0.4s' } : {}}>
              Elevate your wardrobe.
            </h2>
            <p className={`text-base sm:text-lg text-zehn-slate leading-relaxed mb-8 sm:mb-10 max-w-md mx-auto font-sans transition-all duration-700 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={headerVisible ? { transitionDelay: '0.6s' } : {}}>
              We believe in timeless elegance over fleeting trends. Each piece is designed to be a cornerstone of your style, combining modern sophistication with enduring quality.
            </p>

            {/* Feature Cards */}
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`group p-4 sm:p-5 transition-all duration-700 hover:scale-[1.02] rounded-lg bg-card border border-border/10 hover:border-accent/20 hover:shadow-md ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={headerVisible ? { transitionDelay: `${0.8 + index * 0.1}s` } : {}}
                >
                  <div className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full mb-2 sm:mb-3 group-hover:bg-accent/10 transition-colors bg-zehn-slate/5">
                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-sans font-medium text-foreground mb-1 text-sm sm:text-base tracking-tight-2">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-zehn-slate font-sans leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}