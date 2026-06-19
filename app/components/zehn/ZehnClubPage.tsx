import {useState} from 'react';
import {Link} from 'react-router';
import {
  ChevronRight,
  Crown,
  Star,
  Gem,
  UserPlus,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const CLUB_TIERS = [
  {
    name: 'Member',
    subtitle: 'Ab der 1. Bestellung',
    icon: Star,
    benefits: [
      '10% Willkommensrabatt',
      'Early Access zu neuen Drops',
      'Kostenloser Standardversand',
      'Exklusive Member-Newsletter',
    ],
  },
  {
    name: 'Insider',
    subtitle: 'Ab 3 Bestellungen',
    icon: Crown,
    benefits: [
      'Alle Member-Vorteile',
      'Exklusive Insider-Rabatte',
      'Geburtstagsüberraschung',
      'Behind-the-Scenes-Einblicke',
    ],
  },
  {
    name: 'Icon',
    subtitle: 'Ab 10 Bestellungen',
    icon: Gem,
    benefits: [
      'Alle Insider-Vorteile',
      'VIP-Events & Pop-up-Stores',
      'Persönliche Styling-Beratung',
      'Limitierte Editionen',
    ],
  },
] as const;

export function ZehnClubPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({...prev, [field]: value}));
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/club-register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
      });
      const result = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Ein Fehler ist aufgetreten.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dark Hero */}
      <div className="bg-foreground text-primary-foreground py-16 sm:py-20 lg:pt-24 lg:pb-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent/5" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-accent/[0.03]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-body font-sans text-primary-foreground/50 mb-6"
          >
            <Link
              to="/"
              className="hover:text-primary-foreground/80 transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-foreground/80">ZEHN Club</span>
          </nav>

          {/* Title Section with Logo */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider mb-4 bg-accent/10 text-accent">
                Exklusiv
              </span>
              <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-primary-foreground mb-3">
                ZEHN Club
              </h1>
              <p className="font-sans text-subheadline sm:text-subheadline-sm text-primary-foreground/70 max-w-2xl">
                Kostenlose Mitgliedschaft. Exklusive Vorteile. Wachsende
                Belohnungen.
              </p>
            </div>

            {/* White ZEHN Club Logo */}
            <div className="hidden sm:block ml-6">
              <img
                src="/Circle_Zehn_White.png"
                alt="ZEHN Club"
                className="h-24 sm:h-32 lg:h-40 w-auto rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Club Tiers */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="font-sans text-h3 sm:text-h3-sm text-foreground text-center mb-10">
          Drei Stufen. Unzählige Vorteile.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {CLUB_TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className="bg-card rounded-2xl border border-border/10 p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-sans text-h3 text-foreground mb-1">
                  {tier.name}
                </h3>
                <p className="font-sans text-[13px] text-foreground/50 mb-4">
                  {tier.subtitle}
                </p>
                <ul className="space-y-2">
                  {tier.benefits.map((benefit) => (
                    <li
                      key={benefit}
                      className="flex items-start gap-2 font-sans text-body text-foreground/80"
                    >
                      <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-foreground py-12 sm:py-16">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-7 h-7 text-accent" />
            </div>
            <h2 className="font-sans text-h3 sm:text-h3-sm text-primary-foreground mb-2">
              Jetzt Mitglied werden
            </h2>
            <p className="font-sans text-body text-primary-foreground/60">
              Kostenlos registrieren und ab der ersten Bestellung profitieren.
            </p>
          </div>

          <div
            className={`bg-card/10 rounded-2xl p-8 text-center ${status === 'success' ? '' : 'hidden'}`}
            data-testid="club-register-success"
          >
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-accent" />
            </div>
            <h3 className="font-sans text-body-lg font-semibold text-primary-foreground mb-2">
              Willkommen im ZEHN Club!
            </h3>
            <p className="font-sans text-body text-primary-foreground/60 mb-6">
              Ihr Konto wurde erfolgreich erstellt. Sie können sich jetzt
              anmelden und Ihre Vorteile genießen.
            </p>
            <Link
              to="/account/login"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl font-sans font-medium text-body transition-all duration-300 hover:opacity-90"
            >
              Jetzt anmelden
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <form
              onSubmit={handleSubmit}
              className={`space-y-4 ${status === 'success' ? 'hidden' : ''}`}
              data-testid="club-register-form"
            >
              {status === 'error' && errorMessage && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertCircle className="w-4 h-4 text-accent flex-shrink-0" />
                  <p className="font-sans text-[13px] text-accent">
                    {errorMessage}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="club-firstName"
                    className="font-sans text-[13px] font-medium text-primary-foreground/80 mb-1.5 block"
                  >
                    Vorname
                  </label>
                  <input
                    id="club-firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="Max"
                    autoComplete="given-name"
                    className="w-full px-4 py-3 rounded-xl bg-card/10 border border-border/20 font-sans text-[16px] text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="club-lastName"
                    className="font-sans text-[13px] font-medium text-primary-foreground/80 mb-1.5 block"
                  >
                    Nachname
                  </label>
                  <input
                    id="club-lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Mustermann"
                    autoComplete="family-name"
                    className="w-full px-4 py-3 rounded-xl bg-card/10 border border-border/20 font-sans text-[16px] text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="club-email"
                  className="font-sans text-[13px] font-medium text-primary-foreground/80 mb-1.5 block"
                >
                  E-Mail *
                </label>
                <input
                  id="club-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="ihre@email.de"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl bg-card/10 border border-border/20 font-sans text-[16px] text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="club-password"
                  className="font-sans text-[13px] font-medium text-primary-foreground/80 mb-1.5 block"
                >
                  Passwort *
                </label>
                <input
                  id="club-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Mindestens 5 Zeichen"
                  required
                  minLength={5}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl bg-card/10 border border-border/20 font-sans text-[16px] text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={
                  status === 'submitting' ||
                  !formData.email ||
                  !formData.password
                }
                data-testid="club-register-submit"
                className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-3.5 rounded-xl font-sans font-medium text-body-lg transition-all duration-300 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Wird registriert...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Kostenlos Mitglied werden
                  </>
                )}
              </button>

              <p className="font-sans text-[12px] text-primary-foreground/40 text-center">
                Mit der Registrierung stimmen Sie unseren{' '}
                <Link
                  to="/pages/terms"
                  className="text-accent hover:underline"
                >
                  AGB
                </Link>{' '}
                und der{' '}
                <Link
                  to="/pages/privacy"
                  className="text-accent hover:underline"
                >
                  Datenschutzerklärung
                </Link>{' '}
                zu.
              </p>

              <p className="font-sans text-[13px] text-primary-foreground/50 text-center">
                Bereits Mitglied?{' '}
                <Link
                  to="/account/login"
                  className="text-accent hover:underline"
                >
                  Jetzt anmelden
                </Link>
              </p>
            </form>
        </div>
      </div>

      {/* Blog Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-card rounded-2xl border border-border/10 p-6 sm:p-8 text-center">
          <h2 className="font-sans text-h3 sm:text-h3-sm text-foreground mb-3">
            ZEHN Blog &amp; Exklusive Inhalte
          </h2>
          <p className="font-sans text-body-lg text-foreground/70 mb-6 max-w-xl mx-auto">
            Entdecken Sie exklusive Einblicke, Styling-Tipps und Neuigkeiten
            aus der Welt von ZEHN.
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl font-sans font-medium text-body transition-all duration-300 hover:opacity-90"
          >
            Zum Blog
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Back Link */}
        <div className="mt-12 pt-8 border-t border-border/15">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-sans text-body-lg text-accent hover:text-accent/80 transition-colors group"
          >
            <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
