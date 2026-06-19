import { Link } from "react-router"
import { ArrowRight } from "lucide-react"

type CollectionBannerProps = {
  title: string
  subtitle?: string
  description: string
  ctaText: string
  ctaLink: string
  image: string
  imageAlt?: string
  variant?: 'light' | 'dark'
  reverse?: boolean
}

export function CollectionBanner({
  title,
  subtitle,
  description,
  ctaText,
  ctaLink,
  image,
  imageAlt = "Collection Image",
  variant = 'light',
  reverse = false
}: CollectionBannerProps) {
  const isDark = variant === 'dark'
  const bgColor = isDark ? '#0F1426' : '#F4F4F5'
  const textColor = isDark ? '#F4F4F5' : '#0F1426'
  const subtitleColor = isDark ? '#8E97A4' : '#8E97A4'

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>

          {/* Left Side - Text Content */}
          <div className={`w-full space-y-6 ${reverse ? 'lg:order-2' : ''}`}>
            {/* Subtitle */}
            {subtitle && (
              <p
                className="text-xs sm:text-sm uppercase tracking-wider font-medium"
                style={{
                  color: '#FF5F1F',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {subtitle}
              </p>
            )}

            {/* Title */}
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight"
              style={{
                fontFamily: "'Archivo Black', sans-serif",
                color: textColor,
                letterSpacing: '-0.04em'
              }}
            >
              {title}
            </h2>

            {/* Description */}
            <p
              className="text-base sm:text-lg leading-relaxed max-w-xl"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: subtitleColor
              }}
            >
              {description}
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                to={ctaLink}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-bold text-base tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
                style={{
                  backgroundColor: '#FF5F1F',
                  color: '#F4F4F5',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative">{ctaText}</span>
                <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>

          {/* Right Side - Product Image */}
          <div className={`relative ${reverse ? 'lg:order-1' : ''}`}>
            <div className="relative aspect-[4/3] lg:aspect-square overflow-hidden rounded-2xl group">
              <img
                src={image}
                alt={imageAlt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
