import { Link } from "react-router"
import { X } from "lucide-react"
import { useState } from "react"

type PromoBannerProps = {
  text: string
  ctaText?: string
  ctaLink?: string
  variant?: 'info' | 'success' | 'warning' | 'sale'
  dismissible?: boolean
  onDismiss?: () => void
}

const variantStyles = {
  info: {
    bg: '#0F1426',
    text: '#F4F4F5',
    cta: '#FF5F1F'
  },
  success: {
    bg: '#10b981',
    text: '#ffffff',
    cta: '#ffffff'
  },
  warning: {
    bg: '#f59e0b',
    text: '#ffffff',
    cta: '#ffffff'
  },
  sale: {
    bg: '#FF5F1F',
    text: '#F4F4F5',
    cta: '#0F1426'
  }
}

export function PromoBanner({
  text,
  ctaText,
  ctaLink,
  variant = 'info',
  dismissible = true,
  onDismiss
}: PromoBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  const styles = variantStyles[variant]

  return (
    <div
      className="w-full py-3 px-4 relative"
      style={{ backgroundColor: styles.bg }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-center">
        {/* Text */}
        <p
          className="font-sans text-sm sm:text-base font-medium"
          style={{ color: styles.text, fontFamily: "'Inter', sans-serif" }}
        >
          {text}
        </p>

        {/* CTA Link */}
        {ctaText && ctaLink && (
          <Link
            to={ctaLink}
            className="font-sans text-sm sm:text-base font-bold underline hover:no-underline transition-all whitespace-nowrap"
            style={{ color: styles.cta, fontFamily: "'Inter', sans-serif" }}
          >
            {ctaText}
          </Link>
        )}

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
            aria-label="Close banner"
          >
            <X className="w-5 h-5" style={{ color: styles.text }} />
          </button>
        )}
      </div>
    </div>
  )
}
