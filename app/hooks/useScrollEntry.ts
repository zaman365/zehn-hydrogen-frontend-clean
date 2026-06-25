/**
 * useScrollEntry — one-shot IntersectionObserver for scroll-triggered card entry animation.
 *
 * Fires once per mount: sets `entered` to true when the element crosses the viewport threshold.
 * Never reverts — cards stay visible once animated in (no exit animation on scroll-back).
 *
 * Pass `skip=true` for above-fold cards (priority/LCP) that should start visible immediately.
 *
 * @example
 * const {ref, entered} = useScrollEntry<HTMLDivElement>(isAboveFold);
 * <div
 *   ref={ref}
 *   className={cn(
 *     'transition-[opacity,transform] duration-500 ease-out',
 *     entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3',
 *   )}
 *   style={{transitionDelay: entered ? '0ms' : `${(index % 4) * 60}ms`}}
 * />
 */
import {useEffect, useRef, useState} from 'react';

export function useScrollEntry<T extends Element = HTMLElement>(skip = false) {
  const ref = useRef<T>(null);
  // Above-fold (skip=true): start entered so SSR + hydration render as opacity-100.
  const [entered, setEntered] = useState(skip);

  useEffect(() => {
    if (skip) return;

    const el = ref.current;
    if (!el) return;

    // Already in viewport on mount (e.g. scroll position restored after back-nav).
    const {top, bottom} = el.getBoundingClientRect();
    if (top < window.innerHeight && bottom > 0) {
      setEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      // Trigger slightly before card fully enters — feels more natural.
      {threshold: 0.05, rootMargin: '0px 0px -20px 0px'},
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [skip]);

  return {ref, entered};
}
