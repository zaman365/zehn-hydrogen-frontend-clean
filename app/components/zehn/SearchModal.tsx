import {useState, useEffect, useRef} from 'react';
import {Search, X} from 'lucide-react';
import {Link, useNavigate} from 'react-router';
// SearchModal renders products via CompactProductCard (already uses ZehnMediaFrame + ZehnShopifyImage)
import {SearchFormPredictive} from '~/components/SearchFormPredictive';
import {SearchResultsPredictive} from '~/components/SearchResultsPredictive';
import {CompactProductCard} from '~/components/CompactProductCard';
import {useScrollLock} from '~/hooks/useScrollLock';
import {ZEHN_SCROLL_EDGE} from '~/lib/zehn-scrollbar-styles';
import {cn} from '~/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = ['shirt', 'jeans', 'short', 'cargo', 'jackets'];

export function SearchModal({isOpen, onClose}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleClear = () => {
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handlePopularSearchClick = (term: string) => {
    // Navigate directly to search results page
    navigate(`/search?q=${encodeURIComponent(term)}`);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity duration-300"
        onClick={onClose}
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Modal - positioned below navbar with same width */}
      <div className="fixed left-1/2 -translate-x-1/2 z-[61] transition-opacity duration-300 w-[95%] md:w-[95%] max-w-[1400px] px-2 md:px-0"
        style={{
          top: 'calc(1rem + 68px + 0.25rem)', // pt-4 (1rem) + navbar height (68px) + small gap (0.25rem)
        }}
      >
        <div 
          className="backdrop-blur-md rounded-lg bg-white/95 border border-white/30 shadow-lg overflow-hidden flex flex-col h-[80vh] md:h-[82vh]"
          style={{
            boxShadow: 'rgba(15, 20, 38, 0.12) 0px 10px 50px',
          }}
        >
          {/* Search Input Container - Centered */}
          <div className="pt-5 pb-4 flex justify-center">
            <div className="w-full md:w-[90%] lg:w-[70%] px-4 md:px-6">
              <SearchFormPredictive className="w-full !block" style={{ width: '100%', maxWidth: '100%' }}>
                {({fetchResults, inputRef: formInputRef, goToSearch}) => {
                  // Sync refs
                  if (formInputRef.current && !inputRef.current) {
                    inputRef.current = formInputRef.current;
                  }

                  return (
                    <div className="flex w-full items-center gap-3 px-4 py-4 border-b-2 border-foreground/10 focus-within:border-foreground/30 transition-all duration-300">
                      <Search className="h-5 w-5 text-foreground/60 flex-shrink-0" />
                      <input
                        ref={(node) => {
                          formInputRef.current = node;
                          inputRef.current = node;
                        }}
                        type="text"
                        placeholder="Wonach suchen Sie?"
                        className="flex-1 w-full min-w-0 bg-transparent text-foreground placeholder:text-foreground/40 outline-none border-none focus:border-none focus:outline-none focus:ring-0 shadow-none font-sans [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                        style={{
                          border: 'none', 
                          outline: 'none', 
                          boxShadow: 'none', 
                          WebkitAppearance: 'none', 
                          borderRadius: '0', 
                          margin: '0', 
                          padding: '0',
                          fontSize: '16px',
                          lineHeight: '24px',
                        }}
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          fetchResults(e);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            goToSearch();
                            onClose();
                          }
                        }}
                      />
                      <button
                        onClick={handleClear}
                        className="text-xs tracking-[0.2em] uppercase text-foreground/60 hover:text-foreground transition-all duration-300 flex-shrink-0 font-sans"
                        aria-label="Suche löschen"
                      >
                        Löschen
                      </button>
                    </div>
                  );
                }}
              </SearchFormPredictive>
            </div>
          </div>

          {/* Search Results */}
          <div className={cn('flex-1 overflow-y-auto', ZEHN_SCROLL_EDGE)}>
            <SearchResultsPredictive>
              {({items, total, closeSearch, term}) => {
                const hasResults = total > 0;
                const showPopularSearches = !searchQuery || searchQuery.trim().length === 0;

                return (
                  <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 pb-6">
                  {showPopularSearches ? (
                    /* Popular Searches Only */
                    <div>
                      <h3 className="text-xs tracking-[0.2em] uppercase font-medium text-foreground/50 mb-4 font-sans">
                        Beliebte Suchbegriffe
                      </h3>
                      {/* Mobile: Horizontal scroll, Desktop: Vertical list */}
                      <div className="flex md:flex-col items-start gap-2 md:gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                        {POPULAR_SEARCHES.map((searchTerm) => (
                          <button
                            key={searchTerm}
                            onClick={() => handlePopularSearchClick(searchTerm)}
                            className="py-2 px-4 md:px-0 text-sm text-foreground/70 hover:text-foreground hover:underline transition-all duration-300 font-sans capitalize whitespace-nowrap md:whitespace-normal flex-shrink-0 md:flex-shrink"
                          >
                            {searchTerm}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : hasResults ? (
                    /* Popular Searches + Product Results Side by Side */
                    <div className="flex flex-col md:grid md:grid-cols-[200px_1fr] gap-6">
                      {/* Left: Popular Searches */}
                      <div>
                        <h3 className="text-xs tracking-[0.2em] uppercase font-medium text-foreground/50 mb-4 font-sans">
                          Beliebte Suchbegriffe
                        </h3>
                        {/* Mobile: Horizontal scroll, Desktop: Vertical list */}
                        <div className="flex md:flex-col items-start gap-2 md:gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                          {POPULAR_SEARCHES.map((searchTerm) => (
                            <button
                              key={searchTerm}
                              onClick={() => handlePopularSearchClick(searchTerm)}
                              className="py-1.5 px-3 md:px-0 text-sm text-foreground/70 hover:text-foreground hover:underline transition-all duration-300 font-sans capitalize whitespace-nowrap md:whitespace-normal flex-shrink-0 md:flex-shrink"
                            >
                              {searchTerm}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Right: Product Results */}
                      <div>
                        {items.products && items.products.length > 0 && (
                          <div>
                            <h3 className="text-xs tracking-[0.2em] uppercase font-medium text-foreground/50 mb-3 font-sans">
                              Produkte ({items.products.length})
                            </h3>
                            {/* Mobile: 2 cols, Tablet: 3 cols, Desktop: 4 cols */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {items.products.map((product) => {
                                return (
                                  <div
                                    key={product.id}
                                    onClick={() => {
                                      closeSearch();
                                      onClose();
                                    }}
                                  >
                                    <CompactProductCard
                                      product={product as any}
                                      loading="lazy"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : searchQuery && searchQuery.trim().length > 0 ? (
                    /* No Results */
                    <div className="text-center py-16">
                      <p className="text-base text-foreground/70 mb-2 font-sans">
                        Keine Ergebnisse gefunden für "{searchQuery}"
                      </p>
                      <p className="text-sm text-foreground/40 font-sans">
                        Versuchen Sie es mit anderen Suchbegriffen
                      </p>
                    </div>
                  ) : null}
                </div>
              );
            }}
          </SearchResultsPredictive>
          </div>
        </div>
      </div>
    </>
  );
}
