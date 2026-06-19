import {useState, useEffect, useRef} from 'react';
import type {ReactNode} from 'react';

interface AnimatedProductGridProps {
  children: ReactNode;
  className?: string;
}

/**
 * Animated Product Grid
 * 
 * Provides intersection-observer-based staggered animations for product items
 * 
 * Animation specs:
 * - Initial state: opacity-0 scale-95
 * - Visible state: opacity-100 scale-100
 * - Transition: duration-700 ease-out
 * - Stagger delay: index * 80ms per item
 * 
 * The grid automatically detects when products enter the viewport and
 * triggers the entrance animation with appropriate stagger timing.
 */
export function AnimatedProductGrid({
  children,
  className = 'products-grid',
}: AnimatedProductGridProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const gridRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute('data-product-index') || '0',
              10
            );
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of item is visible
        rootMargin: '50px', // Start animation slightly before item enters viewport
      }
    );

    // Observe all product items
    const grid = gridRef.current;
    if (grid) {
      const items = grid.querySelectorAll('[data-product-index]');
      items.forEach((item) => {
        observerRef.current?.observe(item);
      });
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [children]);

  return (
    <div ref={gridRef} className={className}>
      {children}
    </div>
  );
}

/**
 * Product Grid Item Wrapper
 * 
 * Wrapper component that handles individual item animation state
 * Use this to wrap each product item in the grid
 * 
 * @example
 * <AnimatedProductGrid>
 *   {products.map((product, index) => (
 *     <ProductGridItem key={product.id} index={index}>
 *       <ProductItem product={product} />
 *     </ProductGridItem>
 *   ))}
 * </AnimatedProductGrid>
 */
export function ProductGridItem({
  children,
  index,
  isVisible = true,
}: {
  children: ReactNode;
  index: number;
  isVisible?: boolean;
}) {
  return (
    <div
      data-product-index={index}
      className={`
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
      `}
      style={{
        transitionDelay: `${index * 80}ms`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Simplified Animated Grid for Basic Use Cases
 * 
 * All-in-one component that combines grid and item animation
 * Automatically wraps children with animation wrappers
 * 
 * @example
 * <SimpleAnimatedGrid>
 *   {products.map((product, index) => (
 *     <ProductItem key={product.id} product={product} index={index} />
 *   ))}
 * </SimpleAnimatedGrid>
 */
export function SimpleAnimatedGrid({
  children,
  className = 'products-grid',
}: AnimatedProductGridProps) {
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <AnimatedProductGrid className={className}>
      {childrenArray.map((child, index) => (
        <ProductGridItem key={index} index={index}>
          {child as ReactNode}
        </ProductGridItem>
      ))}
    </AnimatedProductGrid>
  );
}
