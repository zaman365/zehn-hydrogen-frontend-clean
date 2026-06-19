import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  fireDirectInitiateCheckout,
  fireInitiateCheckout,
  fireMetaAddToCart,
  fireMetaViewContent,
  getMetaPixelNoScriptUrl,
} from './MetaPixelEvents';
import {DEFAULT_COOKIE_PREFERENCES, saveConsent} from './CookieConsent';

function createLocalStorage() {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('Meta Pixel event helpers', () => {
  const fbq = vi.fn();

  beforeEach(() => {
    fbq.mockReset();
    vi.stubGlobal('window', {fbq});
    vi.stubGlobal('localStorage', createLocalStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does not track without marketing consent', () => {
    saveConsent('essential', DEFAULT_COOKIE_PREFERENCES);

    fireMetaViewContent({contentId: 'variant-1'});
    fireMetaAddToCart({contentId: 'variant-1'});
    fireDirectInitiateCheckout({contentId: 'variant-1'});

    expect(fbq).not.toHaveBeenCalled();
  });

  it('tracks product events with marketing-only consent', () => {
    saveConsent('custom', {
      essential: true,
      analytics: false,
      marketing: true,
    });

    const product = {
      contentId: 'variant-1',
      contentName: 'Test product',
      currency: 'EUR',
      quantity: 1,
      value: 59.9,
    };

    fireMetaViewContent(product);
    fireMetaAddToCart(product);
    fireDirectInitiateCheckout(product);

    expect(fbq).toHaveBeenNthCalledWith(1, 'track', 'ViewContent', {
      content_ids: ['variant-1'],
      content_name: 'Test product',
      content_type: 'product',
      currency: 'EUR',
      value: 59.9,
      num_items: 1,
    });
    expect(fbq).toHaveBeenNthCalledWith(2, 'track', 'AddToCart', {
      content_ids: ['variant-1'],
      content_name: 'Test product',
      content_type: 'product',
      currency: 'EUR',
      value: 59.9,
      num_items: 1,
    });
    expect(fbq).toHaveBeenNthCalledWith(3, 'track', 'InitiateCheckout', {
      content_ids: ['variant-1'],
      content_name: 'Test product',
      content_type: 'product',
      currency: 'EUR',
      value: 59.9,
      num_items: 1,
    });
  });

  it('tracks checkout from the cart contents', () => {
    saveConsent('all', {
      essential: true,
      analytics: true,
      marketing: true,
    });

    fireInitiateCheckout({
      totalQuantity: 2,
      lines: {
        nodes: [
          {merchandise: {id: 'variant-1'}},
          {merchandise: {id: 'variant-2'}},
        ],
      },
      cost: {
        totalAmount: {
          amount: '109.80',
          currencyCode: 'EUR',
        },
      },
    });

    expect(fbq).toHaveBeenCalledWith('track', 'InitiateCheckout', {
      content_ids: ['variant-1', 'variant-2'],
      currency: 'EUR',
      num_items: 2,
      value: 109.8,
    });
  });

  it('builds the noscript PageView fallback URL', () => {
    expect(getMetaPixelNoScriptUrl('2171671320264095')).toBe(
      'https://www.facebook.com/tr?id=2171671320264095&ev=PageView&noscript=1',
    );
  });
});
