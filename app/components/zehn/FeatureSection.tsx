
import { useEffect, useRef, useState } from "react"
import { Shirt, Ruler, Zap, Award } from "lucide-react"

const features = [
  {
    icon: Award,
    title: "Premium Quality",
    description: "We source only the finest fabrics for lasting comfort and style"
  },
  {
    icon: Ruler,
    title: "Perfect Fit",
    description: "Tailored cuts designed for the modern silhouette"
  },
  {
    icon: Shirt,
    title: "Versatile Wardrobe",
    description: "Pieces that transition effortlessly from work to weekend"
  },
  {
    icon: Zap,
    title: "Timeless Style",
    description: "Modern classics that never go out of fashion"
  }
]

export function FeatureSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

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

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-background">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
        <div 
          ref={sectionRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12"
        >
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`text-center transition-all duration-700 ease-out ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent/15 mb-4 sm:mb-6">
                <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-accent" strokeWidth={1.5} />
              </div>
              <h3 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-foreground mb-2 sm:mb-3 tracking-tight-2">{feature.title}</h3>
              <p className="text-body lg:text-body-lg text-zehn-slate leading-relaxed font-sans">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
