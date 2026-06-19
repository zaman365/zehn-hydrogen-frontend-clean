
import { useEffect, useRef, useState } from "react"
import { Truck, Shield, RotateCcw, Package } from "lucide-react"

const badges = [
  {
    icon: Truck,
    title: "Kostenloser Versand",
    description: "Ab 75€ Bestellwert"
  },
  {
    icon: RotateCcw,
    title: "Einfache Rückgabe",
    description: "30 Tage Rückgaberecht"
  },
  {
    icon: Package,
    title: "Premium-Qualität",
    description: "Mit Sorgfalt gefertigt"
  },
  {
    icon: Shield,
    title: "Sichere Zahlung",
    description: "SSL-verschlüsselte Kasse"
  }
]

export function TrustBadges() {
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
    <section className="w-full py-16 sm:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          ref={sectionRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {badges.map((badge, index) => (
            <div
              key={badge.title}
              className={`p-4 sm:p-6 lg:p-8 text-center rounded-xl  transition-all duration-700 ease-out ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <badge.icon className="text-accent mb-3 sm:mb-4 mx-auto w-10 h-10 sm:w-12 sm:h-12" strokeWidth={1} />
              <h3 className="font-sans text-h3 sm:text-h3-sm text-foreground mb-1 sm:mb-2 tracking-tight-2">{badge.title}</h3>
              <p className="text-body text-zehn-slate font-sans text-xs sm:text-sm lg:text-base">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
