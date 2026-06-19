import {useState, useEffect, useCallback} from 'react';
import {Link} from 'react-router';
import {useAnalytics} from '@shopify/hydrogen';
import {Cookie, X, Settings, Check, Shield} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type ConsentLevel = 'all' | 'essential' | 'custom';

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
}

export const COOKIE_STORAGE_KEY = 'zehn-cookie-consent';
export const COOKIE_CONSENT_UPDATED_EVENT = 'zehn:cookie-consent-updated';
export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
};

const CONSENT_LEVELS = new Set<ConsentLevel>(['all', 'essential', 'custom']);

function isCookiePreferences(value: unknown): value is CookiePreferences {
  if (!value || typeof value !== 'object') return false;

  const preferences = value as Partial<CookiePreferences>;
  return (
    preferences.essential === true &&
    typeof preferences.analytics === 'boolean' &&
    typeof preferences.marketing === 'boolean'
  );
}

export function getStoredConsent(): ConsentLevel | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as {
        level?: unknown;
        preferences?: unknown;
      };
      if (
        typeof parsed.level === 'string' &&
        CONSENT_LEVELS.has(parsed.level as ConsentLevel) &&
        isCookiePreferences(parsed.preferences)
      ) {
        return parsed.level as ConsentLevel;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function getStoredPreferences(): CookiePreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_COOKIE_PREFERENCES;
  }
  try {
    const stored = localStorage.getItem(COOKIE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as {preferences?: unknown};
      if (isCookiePreferences(parsed.preferences)) {
        return parsed.preferences;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_COOKIE_PREFERENCES;
}

export function saveConsent(
  level: ConsentLevel,
  preferences: CookiePreferences,
) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      COOKIE_STORAGE_KEY,
      JSON.stringify({level, preferences, timestamp: Date.now()}),
    );
  } catch {
    // ignore
  }
}

export function clearConsent() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(COOKIE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

// ============================================
// MAIN EXPORT
// ============================================

export function CookieConsent() {
  const {customerPrivacy} = useAnalytics();
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(
    DEFAULT_COOKIE_PREFERENCES,
  );

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      // Small delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }

    const storedPreferences = getStoredPreferences();
    setPreferences(storedPreferences);
    customerPrivacy?.setTrackingConsent(
      {
        analytics: storedPreferences.analytics,
        marketing: storedPreferences.marketing,
        preferences: storedPreferences.analytics || storedPreferences.marketing,
        sale_of_data: storedPreferences.marketing,
      },
      (result) => {
        if (result?.error) {
          console.warn('Unable to restore Shopify tracking consent.');
        }
      },
    );
  }, [customerPrivacy]);

  const persistConsent = useCallback(
    (level: ConsentLevel, prefs: CookiePreferences) => {
      saveConsent(level, prefs);

      customerPrivacy?.setTrackingConsent(
        {
          analytics: prefs.analytics,
          marketing: prefs.marketing,
          preferences: prefs.analytics || prefs.marketing,
          sale_of_data: prefs.marketing,
        },
        (result) => {
          if (result?.error) {
            console.warn('Unable to update Shopify tracking consent.');
          }
        },
      );

      window.dispatchEvent(
        new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, {detail: prefs}),
      );
    },
    [customerPrivacy],
  );

  const handleAcceptAll = useCallback(() => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    persistConsent('all', prefs);
    setVisible(false);
  }, [persistConsent]);

  const handleEssentialOnly = useCallback(() => {
    const prefs: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    persistConsent('essential', prefs);
    setVisible(false);
  }, [persistConsent]);

  const handleSaveCustom = useCallback(() => {
    persistConsent('custom', preferences);
    setVisible(false);
  }, [persistConsent, preferences]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] animate-slide-up">
      <div className="bg-foreground/95 backdrop-blur-sm border-t border-primary-foreground/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          {/* Main Banner Row */}
          {!showSettings ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {/* Icon + Text */}
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <Cookie className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                <p className="font-sans text-xs sm:text-[13px] text-primary-foreground/80 leading-snug">
                  Wir verwenden Cookies, um Ihnen das beste Erlebnis zu bieten.{' '}
                  <Link
                    to="/pages/cookies"
                    className="text-accent hover:underline"
                  >
                    Mehr erfahren
                  </Link>
                </p>
              </div>

              {/* 3 Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent text-accent-foreground font-sans text-xs sm:text-[13px] font-semibold hover:opacity-90 transition-opacity"
                >
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Akzeptieren</span>
                  <span className="xs:hidden">Alle</span>
                </button>
                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary-foreground/20 text-primary-foreground font-sans text-xs sm:text-[13px] font-medium hover:bg-primary-foreground/10 transition-colors"
                >
                  <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Nur notwendige</span>
                  <span className="xs:hidden">Nötig</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary-foreground/20 text-primary-foreground font-sans text-xs sm:text-[13px] font-medium hover:bg-primary-foreground/10 transition-colors"
                >
                  <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden xs:inline">Einstellungen</span>
                  <span className="xs:hidden">Mehr</span>
                </button>
              </div>
            </div>
          ) : (
            /* Settings Panel */
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-sans text-xs sm:text-sm font-semibold text-primary-foreground">
                  Cookie-Einstellungen
                </h4>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full hover:bg-primary-foreground/10 flex items-center justify-center transition-colors"
                  aria-label="Schließen"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground/60" />
                </button>
              </div>

              {/* Cookie Categories */}
              <div className="flex flex-col gap-2 sm:gap-2.5">
                {/* Essential - always on */}
                <label className="flex items-center gap-2 sm:gap-2.5 flex-1 px-2.5 sm:px-3 py-2 rounded-lg bg-primary-foreground/5">
                  <input
                    type="checkbox"
                    aria-label="Notwendige Cookies"
                    checked
                    disabled
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-accent rounded flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-sans text-xs sm:text-[13px] font-medium text-primary-foreground block">
                      Notwendig
                    </span>
                    <p className="font-sans text-[10px] sm:text-[11px] text-primary-foreground/50">
                      Immer aktiv
                    </p>
                  </div>
                </label>

                {/* Analytics */}
                <label className="flex items-center gap-2 sm:gap-2.5 flex-1 px-2.5 sm:px-3 py-2 rounded-lg bg-primary-foreground/5 cursor-pointer">
                  <input
                    type="checkbox"
                    aria-label="Analyse-Cookies"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences((p) => ({
                        ...p,
                        analytics: e.target.checked,
                      }))
                    }
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-accent rounded flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-sans text-xs sm:text-[13px] font-medium text-primary-foreground block">
                      Analyse
                    </span>
                    <p className="font-sans text-[10px] sm:text-[11px] text-primary-foreground/50">
                      Nutzungsstatistiken
                    </p>
                  </div>
                </label>

                {/* Marketing */}
                <label className="flex items-center gap-2 sm:gap-2.5 flex-1 px-2.5 sm:px-3 py-2 rounded-lg bg-primary-foreground/5 cursor-pointer">
                  <input
                    type="checkbox"
                    aria-label="Marketing-Cookies"
                    checked={preferences.marketing}
                    onChange={(e) =>
                      setPreferences((p) => ({
                        ...p,
                        marketing: e.target.checked,
                      }))
                    }
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-accent rounded flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-sans text-xs sm:text-[13px] font-medium text-primary-foreground block">
                      Marketing
                    </span>
                    <p className="font-sans text-[10px] sm:text-[11px] text-primary-foreground/50">
                      Personalisierte Werbung
                    </p>
                  </div>
                </label>
              </div>

              {/* Save button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-accent text-accent-foreground font-sans text-xs sm:text-[13px] font-semibold hover:opacity-90 transition-opacity"
                >
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Auswahl speichern
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
