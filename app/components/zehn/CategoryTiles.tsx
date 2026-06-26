/* BL-0006: no entrance animation — tiles paint instantly */
import { Link } from "react-router"
import {ZehnStaticImage} from '~/components/zehn'
import {resolveLinkPrefetch} from '~/lib/link-prefetch'

type CategoryTileProps = {
  title: string
  subtitle?: string
  image: string
  fallbackImage?: string
  link: string
}

export function CategoryTiles({ tiles }: { tiles: CategoryTileProps[] }) {
  return (
    <section className="w-full py-3 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto gap-4 sm:gap-6 scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4">
          {tiles.map((tile, index) => (
            <Link
              key={tile.title}
              to={tile.link}
              prefetch={resolveLinkPrefetch('collection')}
              className="group relative aspect-square lg:aspect-auto lg:h-[450px] overflow-hidden rounded-lg flex-shrink-0 w-[280px] sm:w-[calc(40%-12px)] snap-start"
            >
              {/* ZehnStaticImage: skeleton+fade inside Link's overflow-hidden container;
                  Link itself is the responsive frame (aspect-square / fixed h-[450px] on lg).
                  onError replaces src with fallbackImage if the primary load fails. */}
              <ZehnStaticImage
                src={tile.image}
                alt={tile.title}
                onError={(event) => {
                  if (tile.fallbackImage && event.currentTarget.src !== tile.fallbackImage) {
                    event.currentTarget.src = tile.fallbackImage
                  }
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                {tile.subtitle && (
                  <p className="font-sans text-[10px] sm:text-xs text-white/80 uppercase tracking-wider mb-2 font-medium">
                    {tile.subtitle}
                  </p>
                )}
                <h3 className="font-sans text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 uppercase tracking-tight">
                  {tile.title}
                </h3>
                <div className="inline-flex items-center justify-center bg-foreground text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wider hover:text-accent transition-colors w-fit">
                  JETZT KAUFEN
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
