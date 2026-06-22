import {useEffect, useState} from 'react';

/**
 * Keep overlay mounted through CSS exit animation before unmount.
 * REQ-0008: cart drawer slide-out matches slide-in.
 */
export function useOverlayCloseAnimation(isOpen: boolean, durationMs = 300) {
  const [mounted, setMounted] = useState(isOpen);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const timer = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [isOpen, mounted, durationMs]);

  return {mounted, closing};
}
