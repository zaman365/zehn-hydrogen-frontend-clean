/**
 * Ref-counted document scroll lock for overlays (cart, search, modals).
 * Sets `data-zehn-scroll-lock` on html — pairs with lock-only `scrollbar-gutter: stable`
 * in app.css so idle pages have no reserved gutter strip.
 */
const SCROLL_LOCK_ATTR = 'data-zehn-scroll-lock';

let lockCount = 0;

function applyScrollLockState(): void {
  if (typeof document === 'undefined') return;
  if (lockCount > 0) {
    document.documentElement.setAttribute(SCROLL_LOCK_ATTR, 'true');
  } else {
    document.documentElement.removeAttribute(SCROLL_LOCK_ATTR);
  }
}

/** Acquire scroll lock; call returned release when overlay unmounts. */
export function acquireScrollLock(): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }
  lockCount += 1;
  applyScrollLockState();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    applyScrollLockState();
  };
}

/** Test-only reset — do not use in production components. */
export function resetScrollLockForTests(): void {
  lockCount = 0;
  applyScrollLockState();
}

/** Test-only read lock depth. */
export function getScrollLockCountForTests(): number {
  return lockCount;
}
