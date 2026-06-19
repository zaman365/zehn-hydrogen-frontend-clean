import {useState, useEffect} from 'react';
import {X, SlidersHorizontal} from 'lucide-react';

interface FilterCategory {
  label: string;
  value: string;
}

interface CollectionFiltersProps {
  categories: FilterCategory[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

/**
 * Desktop Category Filter Pills
 * 
 * Rounded-full buttons with smooth transitions matching Boty's natural aesthetic
 * Features:
 * - Active state: bg-primary text-primary-foreground
 * - Inactive state: bg-card text-foreground/70 with boty-shadow
 * - Smooth boty-transition on state changes
 * - Min 44px touch target for accessibility
 */
export function CategoryFilterPills({
  categories,
  activeCategory,
  onCategoryChange,
}: CollectionFiltersProps) {
  return (
    <div className="hidden md:flex items-center gap-3 flex-wrap mb-8">
      <div className="flex items-center gap-2 text-foreground/60 mr-2">
        <SlidersHorizontal className="w-4 h-4" />
        <span className="text-sm font-medium">Filter:</span>
      </div>
      
      {categories.map((category) => {
        const isActive = activeCategory === category.value;
        
        return (
          <button
            key={category.value}
            onClick={() => onCategoryChange(category.value)}
            className={`
              px-4 py-2 rounded-full text-sm capitalize min-h-[44px]
              boty-transition
              ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground/70 boty-shadow hover:text-foreground hover:shadow-lg'
              }
            `}
            aria-pressed={isActive}
            aria-label={`Filtern nach ${category.label}`}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Mobile Filter Button
 * 
 * Compact button to trigger the mobile filter drawer
 * Positioned for easy thumb access on mobile devices
 */
export function MobileFilterButton({onClick}: {onClick: () => void}) {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary text-primary-foreground rounded-full boty-shadow flex items-center justify-center boty-transition hover:scale-105 active:scale-95"
      aria-label="Filter öffnen"
    >
      <SlidersHorizontal className="w-5 h-5" />
    </button>
  );
}

/**
 * Mobile Filter Drawer
 * 
 * Full-screen overlay drawer for mobile filter selection
 * Features:
 * - Fixed full-screen overlay with backdrop
 * - Serif title matching Boty aesthetic
 * - Close button in top-right
 * - Full-width category buttons with generous spacing
 * - Smooth slide-in animation
 */
export function MobileFilterDrawer({
  categories,
  activeCategory,
  onCategoryChange,
  isOpen,
  onClose,
}: CollectionFiltersProps & {
  isOpen: boolean;
  onClose: () => void;
}) {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="md:hidden fixed inset-0 z-50 bg-background"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-drawer-title"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-border/50">
        <h2
          id="filter-drawer-title"
          className="font-sans text-2xl text-foreground"
        >
          Filter
        </h2>
        
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-card boty-shadow flex items-center justify-center boty-transition hover:bg-card/80 active:scale-95"
          aria-label="Filter schließen"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Category List */}
      <div className="px-6 py-6 space-y-3 overflow-y-auto max-h-[calc(100vh-100px)]">
        <h3 className="font-sans text-xs uppercase tracking-wider text-foreground/60 mb-4 font-medium">
          Kategorien
        </h3>
        
        {categories.map((category) => {
          const isActive = activeCategory === category.value;
          
          return (
            <button
              key={category.value}
              onClick={() => {
                onCategoryChange(category.value);
                onClose();
              }}
              className={`
                w-full px-6 py-4 rounded-2xl text-left capitalize min-h-[44px]
                boty-transition
                ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-foreground boty-shadow hover:shadow-lg'
                }
              `}
              aria-pressed={isActive}
              aria-label={`Filtern nach ${category.label}`}
            >
              <span className="text-base font-medium">{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Complete Filter System Component
 * 
 * Combines desktop pills and mobile drawer with unified state management
 * Automatically shows appropriate UI based on screen size
 */
export function CollectionFilters({
  categories,
  activeCategory,
  onCategoryChange,
}: CollectionFiltersProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <>
      {/* Desktop Filter Pills */}
      <CategoryFilterPills
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
      />

      {/* Mobile Filter Button */}
      <MobileFilterButton onClick={() => setIsMobileDrawerOpen(true)} />

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />
    </>
  );
}
