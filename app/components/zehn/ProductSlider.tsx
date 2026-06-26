import { useRef } from "react"
import { Link } from "react-router"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {ZehnMediaFrame, ZehnShopifyImage} from '~/components/zehn';
import {resolveLinkPrefetch} from '~/lib/link-prefetch';

type Product = {
  id: string
  handle: string
  title: string
  featuredImage?: {
    url: string
    altText?: string | null
  } | null
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  compareAtPriceRange?: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  } | null
}

type ProductSliderProps = {
  title: string
  description?: string
  products: Product[]
  viewAllLink?: string
}

export function ProductSlider({
  title,
  description,
  products,
  viewAllLink
}: ProductSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 320
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const formatPrice = (amount: string, currencyCode: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currencyCode,
    }).format(parseFloat(amount))
  }

  // Filter out products without valid price data
  const validProducts = products.filter(p => p?.priceRange?.minVariantPrice?.amount)

  if (validProducts.length === 0) {
    return null
  }

  return (
    <section className="w-full py-12 sm:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground uppercase tracking-tight mb-2">
              {title}
            </h2>
            {description && (
              <p className="font-sans text-sm sm:text-base text-muted">
                {description}
              </p>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-sm bg-card border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-sm bg-card border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="relative px-6 md:px-0">
          {/* Mobile Navigation - Floating Buttons */}
          <div className="flex md:hidden items-center gap-2 absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10">
            <button
              type="button"
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
          <div className="flex md:hidden items-center gap-2 absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10">
            <button
              type="button"
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4 px-2 md:px-0"
          >
            {validProducts.map((product) => {
              const price = parseFloat(product.priceRange.minVariantPrice.amount)
              const compareAtPrice = product.compareAtPriceRange?.minVariantPrice
                ? parseFloat(product.compareAtPriceRange.minVariantPrice.amount)
                : null
              const hasDiscount = compareAtPrice && compareAtPrice > price

              return (
                <Link
                  key={product.id}
                  to={`/products/${product.handle}`}
                  prefetch={resolveLinkPrefetch('product')}
                  className="group flex-shrink-0 w-[280px] snap-start"
                >
                  <ZehnMediaFrame aspect="sliderCard" className="mb-3 bg-card">
                    {product.featuredImage ? (
                      <ZehnShopifyImage
                        data={product.featuredImage}
                        alt={product.featuredImage.altText || product.title}
                        sizes="280px"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 bg-muted/20 flex items-center justify-center">
                        <span className="text-muted text-sm">No image</span>
                      </div>
                    )}

                    {/* Sale Badge — z-10 ensures it renders above skeleton and image */}
                    {hasDiscount && (
                      <div className="absolute top-3 left-3 z-10 bg-accent text-accent-foreground px-3 py-1 text-xs font-bold uppercase">
                        Sale
                      </div>
                    )}
                  </ZehnMediaFrame>

                  {/* Info */}
                  <div className="space-y-1">
                    <h3 className="font-sans text-sm font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2 uppercase">
                      {product.title}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-base font-bold text-foreground">
                        {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
                      </span>
                      {hasDiscount && compareAtPrice && (
                        <span className="font-sans text-sm text-muted line-through">
                          {formatPrice(compareAtPrice.toString(), product.priceRange.minVariantPrice.currencyCode)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* View All Link */}
        {viewAllLink && (
          <div className="text-center mt-8">
            <Link
              to={viewAllLink}
              className="inline-flex items-center justify-center bg-foreground text-background px-8 py-3 rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Discover Now
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
