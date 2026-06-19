import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

// ============================================
// TYPES
// ============================================

export interface WishlistItem {
  id: string;
  handle: string;
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  price?: string;
  currencyCode?: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  addItem: (item: WishlistItem) => void;
  removeItem: (handle: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (handle: string) => boolean;
  clearAll: () => void;
}

const STORAGE_KEY = 'zehn-wishlist';

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

function getLocalItems(): WishlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as WishlistItem[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalItems(items: WishlistItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

// ============================================
// MERGE HELPER — union by handle, no duplicates
// ============================================

function mergeItems(local: WishlistItem[], server: WishlistItem[]): WishlistItem[] {
  const map = new Map<string, WishlistItem>();
  // Server items first (they may be more up-to-date)
  for (const item of server) {
    map.set(item.handle, item);
  }
  // Local items fill in anything server doesn't have
  for (const item of local) {
    if (!map.has(item.handle)) {
      map.set(item.handle, item);
    }
  }
  return Array.from(map.values());
}

// ============================================
// ANALYTICS HELPER
// ============================================

function trackWishlistEvent(
  action: 'add' | 'remove' | 'clear',
  isLoggedIn: boolean,
  item?: WishlistItem,
) {
  // Fire and forget — don't block UI
  fetch('/api/wishlist-analytics', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      action,
      productHandle: item?.handle,
      productId: item?.id,
      productTitle: item?.title,
      timestamp: Date.now(),
      isLoggedIn,
    }),
  }).catch(() => {
    // Silently fail — analytics should never break UX
  });
}

// ============================================
// SERVER SYNC HELPERS
// ============================================

async function fetchServerWishlist(): Promise<{items: WishlistItem[]; loggedIn: boolean}> {
  try {
    const res = await fetch('/api/wishlist');
    if (!res.ok) return {items: [], loggedIn: false};
    const data = (await res.json()) as {success: boolean; items: WishlistItem[]; loggedIn: boolean};
    return {items: data.items || [], loggedIn: data.loggedIn ?? false};
  } catch {
    return {items: [], loggedIn: false};
  }
}

async function saveServerWishlist(items: WishlistItem[]): Promise<boolean> {
  try {
    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({items}),
    });
    const data = (await res.json()) as {success: boolean};
    return data.success;
  } catch {
    return false;
  }
}

// ============================================
// CONTEXT
// ============================================

const WishlistContext = createContext<WishlistContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

export function WishlistProvider({
  children,
  isLoggedInPromise,
}: {
  children: ReactNode;
  isLoggedInPromise?: Promise<boolean>;
}) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const syncInProgress = useRef(false);

  // 1. Load from localStorage immediately (fast, works for guests)
  // 2. If logged in, fetch from server and merge
  useEffect(() => {
    const localItems = getLocalItems();
    setItems(localItems);
    setLoaded(true);

    // Resolve auth state and sync if logged in
    const resolveAuth = async () => {
      let isAuthenticated = false;

      if (isLoggedInPromise) {
        try {
          isAuthenticated = await isLoggedInPromise;
        } catch {
          isAuthenticated = false;
        }
      }

      setLoggedIn(isAuthenticated);

      if (isAuthenticated && !syncInProgress.current) {
        syncInProgress.current = true;
        try {
          const {items: serverItems} = await fetchServerWishlist();
          const merged = mergeItems(localItems, serverItems);

          setItems(merged);
          saveLocalItems(merged);

          // If there were local-only items, sync them back to server
          if (merged.length !== serverItems.length) {
            await saveServerWishlist(merged);
          }
        } catch {
          // Keep local items on error
        } finally {
          syncInProgress.current = false;
        }
      }
    };

    resolveAuth();
  }, [isLoggedInPromise]);

  // Save to localStorage on change (skip initial load)
  useEffect(() => {
    if (!loaded) return;
    saveLocalItems(items);
  }, [items, loaded]);

  const addItem = useCallback(
    (item: WishlistItem) => {
      setItems((prev) => {
        if (prev.some((i) => i.handle === item.handle)) return prev;
        const next = [...prev, item];

        // Sync to server if logged in
        if (loggedIn) {
          saveServerWishlist(next).catch(() => {});
        }

        // Track analytics
        trackWishlistEvent('add', loggedIn, item);

        return next;
      });
    },
    [loggedIn],
  );

  const removeItem = useCallback(
    (handle: string) => {
      setItems((prev) => {
        const removed = prev.find((i) => i.handle === handle);
        const next = prev.filter((i) => i.handle !== handle);

        if (loggedIn) {
          saveServerWishlist(next).catch(() => {});
        }

        if (removed) {
          trackWishlistEvent('remove', loggedIn, removed);
        }

        return next;
      });
    },
    [loggedIn],
  );

  const toggleItem = useCallback(
    (item: WishlistItem) => {
      setItems((prev) => {
        const exists = prev.some((i) => i.handle === item.handle);
        const next = exists
          ? prev.filter((i) => i.handle !== item.handle)
          : [...prev, item];

        if (loggedIn) {
          saveServerWishlist(next).catch(() => {});
        }

        trackWishlistEvent(exists ? 'remove' : 'add', loggedIn, item);

        return next;
      });
    },
    [loggedIn],
  );

  const isInWishlist = useCallback(
    (handle: string) => items.some((i) => i.handle === handle),
    [items],
  );

  const clearAll = useCallback(() => {
    setItems([]);

    if (loggedIn) {
      saveServerWishlist([]).catch(() => {});
    }

    trackWishlistEvent('clear', loggedIn);
  }, [loggedIn]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
        clearAll,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
