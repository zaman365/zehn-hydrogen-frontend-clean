import {useState} from 'react';
import {Link} from 'react-router';
import {
  ChevronRight,
  Package,
  ExternalLink,
  Mail,
  User,
  Clock,
} from 'lucide-react';

// ============================================
// CONSTANTS
// ============================================

const DHL_TRACKING_BASE_URL =
  'https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html';

const DELIVERY_TIMES = [
  {region: 'Deutschland', duration: '2–4 Werktage'},
  {region: 'Österreich & Schweiz', duration: '3–5 Werktage'},
  {region: 'EU', duration: '4–7 Werktage'},
  {region: 'International', duration: '7–14 Werktage'},
] as const;

// ============================================
// SUB-COMPONENTS
// ============================================

function Breadcrumb() {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 font-sans text-body text-primary-foreground/50 mb-6"
    >
      <Link
        to="/"
        className="hover:text-primary-foreground/80 transition-colors"
      >
        Home
      </Link>
      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Kundenservice</span>
      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
      <span className="text-primary-foreground/80">Bestellung verfolgen</span>
    </nav>
  );
}

function TrackingHero() {
  return (
    <div className="bg-foreground text-primary-foreground py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        aria-hidden="true"
      >
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent/5" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-accent/[0.03]" />
      </div>

      {/* Background icon watermark */}
      <div
        className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none"
        aria-hidden="true"
      >
        <Package className="w-32 h-32 text-primary-foreground opacity-[0.05]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Breadcrumb />

        {/* Category badge */}
        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider mb-4 bg-accent/10 text-accent">
          Kundenservice
        </span>

        <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-primary-foreground mb-3">
          Bestellung verfolgen
        </h1>
        <p className="font-sans text-subheadline sm:text-subheadline-sm text-primary-foreground/70 max-w-2xl">
          Verfolgen Sie den Status Ihrer Lieferung
        </p>
      </div>
    </div>
  );
}

function TrackingForm({
  trackingNumber,
  onTrackingNumberChange,
  onSubmit,
}: {
  trackingNumber: string;
  onTrackingNumberChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const inputId = 'tracking-number-input';
  const isDisabled = trackingNumber.trim().length === 0;

  return (
    <div className="bg-card rounded-2xl border border-border/10 p-6 sm:p-8 shadow-sm">
      {/* DHL Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Package className="w-5 h-5 text-accent" aria-hidden="true" />
        </div>
        <div>
          <p className="font-sans font-semibold text-body-lg text-foreground">
            DHL Sendungsverfolgung
          </p>
          <p className="font-sans text-body text-foreground/50">
            Paket in Echtzeit verfolgen
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor={inputId}
            className="block font-sans text-body font-medium text-foreground/80 mb-2"
          >
            Sendungsnummer
          </label>
          <input
            id={inputId}
            type="text"
            value={trackingNumber}
            onChange={(e) => onTrackingNumberChange(e.target.value)}
            placeholder="z.B. 00340434161094015902"
            autoComplete="off"
            className="w-full px-4 py-3 rounded-xl border border-border/20 bg-background font-sans text-body text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
            data-testid="tracking-number-input"
          />
        </div>

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl font-sans font-medium text-body-lg transition-all duration-300 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          data-testid="tracking-submit-button"
        >
          Bei DHL verfolgen
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

function InfoCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
      {/* Card 1: Where to find tracking number */}
      <div className="bg-card rounded-2xl border border-border/10 p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-4.5 h-4.5 text-accent" aria-hidden="true" />
          </div>
          <h2 className="font-sans font-semibold text-body-lg text-foreground">
            Wo finde ich meine Sendungsnummer?
          </h2>
        </div>
        <p className="font-sans text-body-lg text-foreground/70 leading-relaxed">
          Sie finden Ihre Sendungsnummer in der Versandbestätigungs-E-Mail, die
          Sie nach dem Versand Ihrer Bestellung erhalten haben. Die Nummer
          beginnt in der Regel mit 00340 oder JJD.
        </p>
      </div>

      {/* Card 2: Track via customer account */}
      <div className="bg-card rounded-2xl border border-border/10 p-5 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4.5 h-4.5 text-accent" aria-hidden="true" />
          </div>
          <h2 className="font-sans font-semibold text-body-lg text-foreground">
            Bestellung im Kundenkonto verfolgen
          </h2>
        </div>
        <p className="font-sans text-body-lg text-foreground/70 leading-relaxed mb-3">
          Loggen Sie sich in Ihr ZEHN-Konto ein, um den Status aller Ihrer
          Bestellungen einzusehen.
        </p>
        <Link
          to="/account"
          className="inline-flex items-center gap-1 font-sans text-body-lg text-accent hover:text-accent/80 transition-colors font-medium"
        >
          Zum Kundenkonto
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

function DeliveryTimes() {
  return (
    <div className="mt-12 pt-8 border-t border-border/15">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Clock className="w-4.5 h-4.5 text-accent" aria-hidden="true" />
        </div>
        <h2 className="font-sans font-semibold text-body-lg text-foreground">
          Lieferzeiten
        </h2>
      </div>
      <ul className="space-y-2">
        {DELIVERY_TIMES.map((item) => (
          <li
            key={item.region}
            className="flex items-baseline justify-between gap-4 font-sans text-body-lg text-foreground/80 max-w-sm"
          >
            <span>{item.region}</span>
            <span className="text-foreground/60 font-medium tabular-nums">
              {item.duration}
            </span>
          </li>
        ))}
      </ul>
      <p className="font-sans text-body text-foreground/50 mt-4">
        Bitte beachten Sie, dass es während Sale-Aktionen und Feiertagen zu
        verlängerten Lieferzeiten kommen kann.
      </p>
    </div>
  );
}

function BackNavigation() {
  return (
    <div className="mt-12 pt-8 border-t border-border/15">
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-sans text-body-lg text-accent hover:text-accent/80 transition-colors group"
      >
        <ChevronRight
          className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform"
          aria-hidden="true"
        />
        Zurück zur Startseite
      </Link>
    </div>
  );
}

// ============================================
// MAIN EXPORT
// ============================================

export function TrackOrderPage() {
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = trackingNumber.trim();
    if (!trimmed) return;
    window.open(
      `${DHL_TRACKING_BASE_URL}?piececode=${encodeURIComponent(trimmed)}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dark Hero */}
      <TrackingHero />

      {/* Content Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Tracking Form Card */}
          <TrackingForm
            trackingNumber={trackingNumber}
            onTrackingNumberChange={setTrackingNumber}
            onSubmit={handleSubmit}
          />

          {/* Info Cards */}
          <InfoCards />

          {/* Delivery Times */}
          <DeliveryTimes />

          {/* Back Link */}
          <BackNavigation />
        </div>
      </div>
    </div>
  );
}
