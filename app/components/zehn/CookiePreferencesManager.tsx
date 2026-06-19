import {useState, useEffect} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {Shield, BarChart3, Megaphone, Check, RotateCcw} from 'lucide-react';
import {
  COOKIE_CONSENT_UPDATED_EVENT,
  DEFAULT_COOKIE_PREFERENCES,
  getStoredConsent,
  getStoredPreferences,
  saveConsent,
  clearConsent,
  type CookiePreferences,
} from './CookieConsent';

// ============================================
// COOKIE PREFERENCES MANAGER
// Shows current preferences on /pages/cookies
// ============================================

export function CookiePreferencesManager() {
  const {customerPrivacy} = useAnalytics();
  const [preferences, setPreferences] = useState<CookiePreferences>(
    DEFAULT_COOKIE_PREFERENCES,
  );
  const [hasConsent, setHasConsent] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (consent) {
      setHasConsent(true);
      setPreferences(getStoredPreferences());
    }
  }, []);

  const handleSave = () => {
    saveConsent('custom', preferences);
    customerPrivacy?.setTrackingConsent(
      {
        analytics: preferences.analytics,
        marketing: preferences.marketing,
        preferences: preferences.analytics || preferences.marketing,
        sale_of_data: preferences.marketing,
      },
      (result) => {
        if (result?.error) {
          console.warn('Unable to update Shopify tracking consent.');
        }
      },
    );
    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, {detail: preferences}),
    );
    setHasConsent(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const deniedPreferences = DEFAULT_COOKIE_PREFERENCES;
    clearConsent();
    setPreferences(deniedPreferences);
    setHasConsent(false);

    window.dispatchEvent(
      new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, {
        detail: deniedPreferences,
      }),
    );

    if (!customerPrivacy) {
      window.location.reload();
      return;
    }

    let reloadStarted = false;
    const reload = () => {
      if (reloadStarted) return;
      reloadStarted = true;
      window.location.reload();
    };

    customerPrivacy.setTrackingConsent(
      {
        analytics: false,
        marketing: false,
        preferences: false,
        sale_of_data: false,
      },
      (result) => {
        if (result?.error) {
          console.warn('Unable to reset Shopify tracking consent.');
        }
        reload();
      },
    );

    window.setTimeout(reload, 1500);
  };

  const COOKIE_CATEGORIES = [
    {
      key: 'essential' as const,
      label: 'Notwendige Cookies',
      description:
        'Diese Cookies sind für die Grundfunktionen der Website erforderlich (z.B. Warenkorb, Login, Sicherheit). Sie können nicht deaktiviert werden.',
      icon: Shield,
      locked: true,
    },
    {
      key: 'analytics' as const,
      label: 'Analyse-Cookies',
      description:
        'Helfen uns zu verstehen, wie Besucher unsere Website nutzen. Alle Daten werden anonymisiert erfasst.',
      icon: BarChart3,
      locked: false,
    },
    {
      key: 'marketing' as const,
      label: 'Marketing-Cookies',
      description:
        'Werden verwendet, um Ihnen relevante Werbung anzuzeigen und die Wirksamkeit unserer Kampagnen zu messen.',
      icon: Megaphone,
      locked: false,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            hasConsent ? 'bg-accent' : 'bg-secondary/50 animate-pulse'
          }`}
        />
        <span className="font-sans text-body text-foreground/70">
          {hasConsent
            ? 'Ihre Cookie-Einstellungen wurden gespeichert'
            : 'Sie haben noch keine Cookie-Einstellungen gewählt'}
        </span>
      </div>

      {/* Cookie Categories */}
      <div className="space-y-4">
        {COOKIE_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = preferences[category.key];

          return (
            <div
              key={category.key}
              className={`flex items-start gap-4 p-5 rounded-2xl border transition-colors ${
                isActive
                  ? 'border-accent/30 bg-accent/5'
                  : 'border-border/15 bg-card'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'bg-foreground/5 text-foreground/40'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-sans text-body-lg font-semibold text-foreground">
                    {category.label}
                  </h4>

                  {/* Toggle Switch */}
                  {category.locked ? (
                    <span className="font-sans text-[12px] font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                      Immer aktiv
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setPreferences((p) => ({
                          ...p,
                          [category.key]: !p[category.key],
                        }))
                      }
                      className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
                        isActive ? 'bg-accent' : 'bg-foreground/20'
                      }`}
                      aria-label={`${category.label} ${isActive ? 'deaktivieren' : 'aktivieren'}`}
                    >
                      <span
                        className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow-sm transition-transform ${
                          isActive
                            ? 'translate-x-5.5 left-auto right-0.5'
                            : 'left-0.5'
                        }`}
                      />
                    </button>
                  )}
                </div>
                <p className="font-sans text-[13px] text-foreground/60 mt-1 leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-6">
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-accent-foreground font-sans text-body font-semibold hover:opacity-90 transition-opacity"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Gespeichert!
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Einstellungen speichern
            </>
          )}
        </button>

        {hasConsent && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-border/20 text-foreground/70 font-sans text-body font-medium hover:bg-foreground/5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}
