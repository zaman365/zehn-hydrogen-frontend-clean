import {useEffect} from 'react';
import {acquireScrollLock} from '~/lib/scroll-lock';

/** Lock body scroll while overlay is open — ref-counted, gutter-stable. */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    return acquireScrollLock();
  }, [active]);
}
