import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  COOKIE_STORAGE_KEY,
  DEFAULT_COOKIE_PREFERENCES,
  clearConsent,
  getStoredConsent,
  getStoredPreferences,
  saveConsent,
} from './CookieConsent';

function createLocalStorage() {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('cookie consent storage', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', createLocalStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('stores and retrieves valid consent preferences', () => {
    const preferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };

    saveConsent('all', preferences);

    expect(getStoredConsent()).toBe('all');
    expect(getStoredPreferences()).toEqual(preferences);
  });

  it('rejects malformed stored consent', () => {
    localStorage.setItem(
      COOKIE_STORAGE_KEY,
      JSON.stringify({
        level: 'all',
        preferences: {analytics: true, marketing: true},
      }),
    );

    expect(getStoredConsent()).toBeNull();
    expect(getStoredPreferences()).toEqual(DEFAULT_COOKIE_PREFERENCES);
  });

  it('clears stored consent', () => {
    saveConsent('essential', DEFAULT_COOKIE_PREFERENCES);
    clearConsent();

    expect(getStoredConsent()).toBeNull();
    expect(getStoredPreferences()).toEqual(DEFAULT_COOKIE_PREFERENCES);
  });
});
