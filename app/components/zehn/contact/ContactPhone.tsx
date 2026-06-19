import {useState, useEffect} from 'react';
import {Phone, Clock, MapPin, ExternalLink} from 'lucide-react';

// ============================================
// HELPERS
// ============================================

/**
 * Check if the ZEHN customer service is currently open.
 * Business hours: Monday–Friday, 9:00–18:00 CET/CEST.
 */
function getBusinessStatus(): {isOpen: boolean; statusText: string} {
  try {
    const now = new Date();
    // Get current time in Europe/Berlin timezone
    const berlinTime = new Date(
      now.toLocaleString('en-US', {timeZone: 'Europe/Berlin'})
    );
    const day = berlinTime.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const hours = berlinTime.getHours();
    const minutes = berlinTime.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    const isWeekday = day >= 1 && day <= 5;
    const isBusinessHours = currentMinutes >= 540 && currentMinutes < 1080; // 9:00–18:00

    if (isWeekday && isBusinessHours) {
      const closingIn = 1080 - currentMinutes;
      if (closingIn <= 60) {
        return {
          isOpen: true,
          statusText: `Noch ${closingIn} Min. erreichbar`,
        };
      }
      return {isOpen: true, statusText: 'Jetzt erreichbar'};
    }

    // Calculate next opening
    if (isWeekday && currentMinutes < 540) {
      // Today before opening
      return {isOpen: false, statusText: 'Öffnet heute um 9:00 Uhr'};
    }

    if (day === 5 && currentMinutes >= 1080) {
      // Friday after hours
      return {isOpen: false, statusText: 'Öffnet Montag um 9:00 Uhr'};
    }

    if (day === 6) {
      return {isOpen: false, statusText: 'Öffnet Montag um 9:00 Uhr'};
    }

    if (day === 0) {
      return {isOpen: false, statusText: 'Öffnet morgen um 9:00 Uhr'};
    }

    // Weekday after hours
    return {isOpen: false, statusText: 'Öffnet morgen um 9:00 Uhr'};
  } catch {
    // Fallback if timezone API is unavailable
    return {isOpen: false, statusText: 'Mo–Fr, 9:00–18:00 Uhr'};
  }
}

// ============================================
// CONSTANTS
// ============================================

const PHONE_NUMBER = '+49 163 4210324';
const PHONE_HREF = 'tel:+491634210324';

const BUSINESS_HOURS = [
  {day: 'Montag – Freitag', hours: '9:00 – 18:00 Uhr'},
  {day: 'Samstag', hours: 'Geschlossen'},
  {day: 'Sonntag & Feiertage', hours: 'Geschlossen'},
];

// ============================================
// MAIN EXPORT
// ============================================

export function ContactPhone() {
  const [status, setStatus] = useState<{isOpen: boolean; statusText: string}>({
    isOpen: false,
    statusText: 'Mo–Fr, 9:00–18:00 Uhr',
  });

  useEffect(() => {
    setStatus(getBusinessStatus());
    // Update every minute
    const interval = setInterval(() => {
      setStatus(getBusinessStatus());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="phone" className="scroll-mt-24">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
          <Phone className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="font-sans text-h2 sm:text-h2-sm text-foreground">
            Telefon
          </h2>
          <p className="font-sans text-body text-secondary mt-0.5">
            Sprechen Sie direkt mit unserem Team
          </p>
        </div>
      </div>

      <div className="bg-card border border-border/10 rounded-xl p-6 sm:p-8 space-y-6">
        {/* Phone Number & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <a
              href={PHONE_HREF}
              className="font-sans text-h3 sm:text-h3-sm text-foreground hover:text-accent transition-colors inline-flex items-center gap-2 group"
            >
              {PHONE_NUMBER}
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" />
            </a>
            <p className="font-sans text-body text-secondary mt-1">
              Kostenlose Beratung auf Deutsch & Englisch
            </p>
          </div>

          {/* Live Status Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border self-start ${
              status.isOpen
                ? 'bg-accent/10 border-accent/20 text-accent'
                : 'bg-secondary/5 border-border/20 text-secondary'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                status.isOpen ? 'bg-accent animate-pulse' : 'bg-secondary/50'
              }`}
            />
            <span className="font-sans text-body font-medium">
              {status.statusText}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/10" />

        {/* Business Hours */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-secondary" />
            <h3 className="font-sans text-body font-semibold text-foreground uppercase tracking-widest">
              Öffnungszeiten
            </h3>
          </div>

          <div className="space-y-3">
            {BUSINESS_HOURS.map((entry) => (
              <div
                key={entry.day}
                className="flex items-center justify-between font-sans text-body-lg"
              >
                <span className="text-foreground">{entry.day}</span>
                <span
                  className={
                    entry.hours === 'Geschlossen'
                      ? 'text-secondary'
                      : 'text-foreground font-medium'
                  }
                >
                  {entry.hours}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/10" />

        {/* Address */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-secondary" />
            <h3 className="font-sans text-body font-semibold text-foreground uppercase tracking-widest">
              Adresse
            </h3>
          </div>
          <p className="font-sans text-body-lg text-foreground/70 whitespace-pre-line">
            {'ZEHN GmbH\nMusterstraße 10\n10115 Berlin\nDeutschland'}
          </p>
        </div>

        {/* Call CTA */}
        <a
          href={PHONE_HREF}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-foreground text-primary-foreground font-sans text-body-lg font-semibold hover:opacity-90 transition-opacity sm:hidden"
        >
          <Phone className="w-5 h-5" />
          Jetzt anrufen
        </a>
      </div>
    </section>
  );
}
