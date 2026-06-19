import {useEffect, useRef} from 'react';
import {useLocation} from 'react-router';
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  getStoredPreferences,
} from '~/components/zehn/CookieConsent';

declare global {
  interface Window {
    fbq?: MetaPixelQueue;
    _fbq?: MetaPixelQueue;
  }
}

type MetaPixelQueue = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  push?: MetaPixelQueue;
  queue?: unknown[];
  version?: string;
};

type MetaPixelEventsProps = {
  pixelId?: string | null;
};

export type MetaProductEvent = {
  contentId: string;
  contentName?: string;
  currency?: string;
  quantity?: number;
  value?: number;
};

const META_PIXEL_SCRIPT_ID = 'meta-pixel-script';
const META_PIXEL_SCRIPT_SRC = 'https://connect.facebook.net/en_US/fbevents.js';
const pendingEvents: Array<[string, Record<string, unknown>]> = [];

export function getMetaPixelNoScriptUrl(pixelId: string) {
  const params = new URLSearchParams({
    id: pixelId,
    ev: 'PageView',
    noscript: '1',
  });

  return `https://www.facebook.com/tr?${params.toString()}`;
}

function initFbqStub() {
  if (window.fbq) return;

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue?.push(args);
    }
  } as MetaPixelQueue;

  window.fbq = fbq;
  window._fbq = fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];
}

function loadPixelScript() {
  if (
    document.getElementById(META_PIXEL_SCRIPT_ID) ||
    document.querySelector(
      'script[src*="connect.facebook.net"][src*="fbevents.js"]',
    )
  ) {
    return;
  }

  const script = document.createElement('script');
  script.id = META_PIXEL_SCRIPT_ID;
  script.async = true;
  script.src = META_PIXEL_SCRIPT_SRC;
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript.parentNode?.insertBefore(script, firstScript);
}

function hasMarketingConsent(event?: Event) {
  if (event instanceof CustomEvent && event.detail) {
    const detail = event.detail as {
      marketing?: unknown;
      marketingAllowed?: unknown;
    };

    if (typeof detail.marketing === 'boolean') {
      return detail.marketing;
    }

    if (typeof detail.marketingAllowed === 'boolean') {
      return detail.marketingAllowed;
    }
  }

  return typeof window !== 'undefined'
    ? Boolean(getStoredPreferences().marketing)
    : false;
}

function trackMetaEvent(
  eventName: string,
  parameters: Record<string, unknown> = {},
) {
  if (typeof window === 'undefined' || !getStoredPreferences().marketing) {
    return;
  }

  if (!window.fbq) {
    pendingEvents.push([eventName, parameters]);
    return;
  }

  window.fbq('track', eventName, parameters);
}

function flushPendingEvents() {
  if (!window.fbq || !getStoredPreferences().marketing) return;

  pendingEvents.splice(0).forEach(([eventName, parameters]) => {
    window.fbq?.('track', eventName, parameters);
  });
}

function getProductEventParameters(product: MetaProductEvent) {
  return {
    content_ids: [product.contentId],
    content_name: product.contentName,
    content_type: 'product',
    currency: product.currency || 'EUR',
    value: product.value ?? 0,
    ...(product.quantity ? {num_items: product.quantity} : {}),
  };
}

export function fireMetaViewContent(product: MetaProductEvent) {
  trackMetaEvent('ViewContent', getProductEventParameters(product));
}

export function fireMetaAddToCart(product: MetaProductEvent) {
  trackMetaEvent('AddToCart', getProductEventParameters(product));
}

type CartForPixel = {
  totalQuantity?: number | null;
  lines?: {nodes: Array<{merchandise: {id: string}}> | null} | null;
  cost?: {totalAmount?: {amount: string; currencyCode: string} | null} | null;
};

export function fireInitiateCheckout(cart: CartForPixel) {
  trackMetaEvent('InitiateCheckout', {
    content_ids: cart.lines?.nodes?.map((l) => l.merchandise.id) ?? [],
    value: Number(cart.cost?.totalAmount?.amount || 0),
    currency: cart.cost?.totalAmount?.currencyCode || 'EUR',
    num_items: cart.totalQuantity ?? 0,
  });
}

export function fireDirectInitiateCheckout(product: MetaProductEvent) {
  trackMetaEvent('InitiateCheckout', getProductEventParameters(product));
}

export function MetaProductView({product}: {product: MetaProductEvent}) {
  const lastProductKeyRef = useRef<string | null>(null);
  const productKey = `${product.contentId}:${product.value ?? 0}`;

  useEffect(() => {
    function trackCurrentProduct(event?: Event) {
      if (!hasMarketingConsent(event)) {
        lastProductKeyRef.current = null;
        return;
      }

      if (lastProductKeyRef.current === productKey) return;
      lastProductKeyRef.current = productKey;
      fireMetaViewContent(product);
    }

    trackCurrentProduct();
    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, trackCurrentProduct);
    document.addEventListener('visitorConsentCollected', trackCurrentProduct);

    return () => {
      window.removeEventListener(
        COOKIE_CONSENT_UPDATED_EVENT,
        trackCurrentProduct,
      );
      document.removeEventListener(
        'visitorConsentCollected',
        trackCurrentProduct,
      );
    };
  }, [product, productKey]);

  return null;
}

export function MetaPixelEvents({pixelId}: MetaPixelEventsProps) {
  const location = useLocation();
  const initializedRef = useRef(false);
  const trackingAllowedRef = useRef(false);
  const lastPageViewUrlRef = useRef<string | null>(null);

  function trackCurrentPage() {
    const url = window.location.href;
    if (lastPageViewUrlRef.current === url) return;

    trackMetaEvent('PageView');
    lastPageViewUrlRef.current = url;
  }

  function queueCurrentPageWithMetaConsent() {
    const url = window.location.href;
    if (lastPageViewUrlRef.current === url) return;

    window.fbq?.('track', 'PageView');
    lastPageViewUrlRef.current = url;
  }

  useEffect(() => {
    if (!trackingAllowedRef.current) return;
    trackCurrentPage();
  }, [location.pathname]);

  // Install the Meta Pixel base early so it is detectable, while keeping
  // event tracking disabled until marketing consent is granted.
  useEffect(() => {
    if (!pixelId) return;

    if (!initializedRef.current) {
      initFbqStub();
      window.fbq?.('consent', 'revoke');
      loadPixelScript();
      window.fbq?.('init', pixelId);
      queueCurrentPageWithMetaConsent();
      initializedRef.current = true;
    }

    function updatePixelConsent(event?: Event) {
      const marketingAllowed = hasMarketingConsent(event);

      if (!marketingAllowed) {
        trackingAllowedRef.current = false;
        lastPageViewUrlRef.current = null;
        pendingEvents.length = 0;
        window.fbq?.('consent', 'revoke');
        return;
      }

      trackingAllowedRef.current = true;
      window.fbq?.('consent', 'grant');

      // Fire PageView for the current page
      trackCurrentPage();
      flushPendingEvents();
    }

    updatePixelConsent();

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, updatePixelConsent);
    document.addEventListener('visitorConsentCollected', updatePixelConsent);

    return () => {
      window.removeEventListener(
        COOKIE_CONSENT_UPDATED_EVENT,
        updatePixelConsent,
      );
      document.removeEventListener(
        'visitorConsentCollected',
        updatePixelConsent,
      );
    };
  }, [pixelId]);

  return null;
}
