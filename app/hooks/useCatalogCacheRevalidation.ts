/**
 * Catalog cache revalidation hook — Phase 7D / 7.1F.
 *
 * On visibility/focus/pageshow + 60s poll while tab visible, fetches /api/cache-version
 * and triggers useRevalidator() when the server version is newer than the client version.
 * Closes merchant-edit lag for users who stay on a catalog tab without switching away.
 */
import {useCallback, useEffect, useRef} from 'react';
import {useLocation, useRevalidator} from 'react-router';
import {isCatalogCacheVersionStale} from '~/lib/catalog-cache-version';
import {clearClientLoaderCache} from '~/lib/client-loader-cache';

const VERSION_STORAGE_KEY = 'zehn-catalog-cache-version';
/** Poll interval while tab is visible on catalog routes — SSE alternative (Hydrogen-native). */
const CATALOG_VERSION_POLL_MS = 60_000;
const CATALOG_PATH_PREFIXES = ['/', '/products/', '/collections/'];

function isCatalogRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  return CATALOG_PATH_PREFIXES.some(
    (prefix) => prefix !== '/' && pathname.startsWith(prefix),
  );
}

function readStoredVersion(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = sessionStorage.getItem(VERSION_STORAGE_KEY);
    const parsed = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

function writeStoredVersion(version: number): void {
  try {
    sessionStorage.setItem(VERSION_STORAGE_KEY, String(version));
  } catch {
    /* sessionStorage unavailable — skip */
  }
}

async function fetchServerCatalogVersion(): Promise<number> {
  try {
    const response = await fetch('/api/cache-version', {
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (!response.ok) return 0;
    const payload = (await response.json()) as {version?: number};
    return typeof payload.version === 'number' ? payload.version : 0;
  } catch {
    return 0;
  }
}

export function useCatalogCacheRevalidation(): void {
  const {pathname} = useLocation();
  const revalidator = useRevalidator();
  const clientVersionRef = useRef(readStoredVersion());
  const checkingRef = useRef(false);

  const checkAndRevalidate = useCallback(async () => {
    if (!isCatalogRoute(pathname)) return;
    if (checkingRef.current) return;
    checkingRef.current = true;

    try {
      const serverVersion = await fetchServerCatalogVersion();
      if (
        isCatalogCacheVersionStale(clientVersionRef.current, serverVersion)
      ) {
        clearClientLoaderCache();
        clientVersionRef.current = serverVersion;
        writeStoredVersion(serverVersion);
        if (revalidator.state === 'idle') {
          void revalidator.revalidate();
        }
      } else if (serverVersion > 0) {
        clientVersionRef.current = Math.max(
          clientVersionRef.current,
          serverVersion,
        );
        writeStoredVersion(clientVersionRef.current);
      }
    } finally {
      checkingRef.current = false;
    }
  }, [pathname, revalidator]);

  useEffect(() => {
    if (!isCatalogRoute(pathname)) return;

    void checkAndRevalidate();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        void checkAndRevalidate();
      }
    };

    const onPageShow = () => {
      void checkAndRevalidate();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pageshow', onPageShow);

    let pollId: ReturnType<typeof setInterval> | undefined;
    const startPoll = () => {
      if (pollId) return;
      pollId = setInterval(() => {
        if (document.visibilityState === 'visible') {
          void checkAndRevalidate();
        }
      }, CATALOG_VERSION_POLL_MS);
    };
    const stopPoll = () => {
      if (pollId) {
        clearInterval(pollId);
        pollId = undefined;
      }
    };

    if (document.visibilityState === 'visible') {
      startPoll();
    }

    const onVisibilityPoll = () => {
      if (document.visibilityState === 'visible') {
        startPoll();
      } else {
        stopPoll();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityPoll);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibilityPoll);
      stopPoll();
    };
  }, [pathname, checkAndRevalidate]);
}
