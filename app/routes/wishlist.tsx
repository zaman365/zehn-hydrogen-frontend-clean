import {Link} from 'react-router';
import {Heart, Trash2, ShoppingBag} from 'lucide-react';
import {useWishlist} from '~/components/zehn/wishlist-context';

export default function WishlistPage() {
  const {items, removeItem, clearAll} = useWishlist();

  return (
    <div className="bg-background min-h-screen pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <div>
            <h1 className="font-sans text-h2 sm:text-h2-sm lg:text-h2-lg text-foreground">
              Wunschliste
            </h1>
            <p className="font-body text-body text-foreground/60 mt-1">
              {items.length === 0
                ? 'Ihre Wunschliste ist leer'
                : `${items.length} ${items.length === 1 ? 'Artikel' : 'Artikel'}`}
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/15 text-foreground/60 font-body text-body hover:border-accent/50 hover:text-accent transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Alle entfernen
            </button>
          )}
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-foreground/20" />
            </div>
            <h2 className="font-sans text-body-lg font-semibold text-foreground mb-2">
              Noch keine Artikel gespeichert
            </h2>
            <p className="font-body text-body text-foreground/60 mb-8 max-w-md">
              Klicken Sie auf das Herz-Symbol bei einem Produkt, um es Ihrer
              Wunschliste hinzuzufügen.
            </p>
            <Link
              to="/collections/all"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-accent-foreground font-body text-body font-semibold hover:opacity-90 transition-opacity"
            >
              <ShoppingBag className="w-4 h-4" />
              Produkte entdecken
            </Link>
          </div>
        )}

        {/* Product Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((item) => (
              <div
                key={item.handle}
                className="bg-card rounded-2xl overflow-hidden border border-border/10 hover:border-border/20 transition-colors group"
              >
                {/* Image */}
                <Link to={`/products/${item.handle}`} className="block">
                  <div className="relative aspect-square bg-background overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.imageAlt || item.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-foreground/20" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3">
                  <Link to={`/products/${item.handle}`}>
                    <h3 className="font-sans text-body font-medium text-foreground mb-1 line-clamp-1 hover:underline">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between">
                    {item.price && (
                      <span className="font-body text-body font-medium text-foreground">
                        {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: item.currencyCode || 'EUR',
                        }).format(parseFloat(item.price))}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeItem(item.handle)}
                      className="p-1.5 rounded-full text-foreground/40 hover:text-accent hover:bg-accent/10 transition-colors"
                      aria-label="Von Wunschliste entfernen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
