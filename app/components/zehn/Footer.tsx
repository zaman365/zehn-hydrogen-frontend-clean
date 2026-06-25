import {Link} from 'react-router';
import {useState} from 'react';
import {
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface FooterLink {
  /** Display label (German) */
  label: string;
  /** Internal path or external URL */
  href: string;
  /** If true, renders as <a> with target="_blank" */
  external?: boolean;
}

interface FooterLinkGroup {
  /** Section heading (German) */
  title: string;
  /** Unique key for accordion state */
  id: string;
  /** Links in this section */
  links: FooterLink[];
}


// ============================================
// DATA CONSTANTS
// ============================================

const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    id: 'legal',
    title: 'Rechtliches',
    links: [
      {label: 'Impressum', href: '/pages/impressum'},
      {label: 'AGB', href: '/pages/terms'},
      {label: 'Datenschutz', href: '/pages/privacy'},
      {label: 'Cookies', href: '/pages/cookies'},
      {label: 'FAQ', href: '/pages/faq'},
      {label: 'Widerruf', href: '/pages/widerruf'},
    ],
  },
  {
    id: 'about',
    title: 'Über ZEHN',
    links: [
      {label: 'Unsere Geschichte', href: '/about-us'},
      {label: 'Nachhaltigkeit', href: '/pages/sustainability'},
      {label: 'Blog', href: '/blogs'},
      {label: 'ZEHN Club', href: '/pages/zehn-club'},
      {label: 'Affiliate Program', href: '/pages/affiliate'},
      {label: 'Produkt Test', href: '/pages/produkt-test'},
    ],
  },
  {
    id: 'service',
    title: 'Kundenservice',
    links: [
      {label: 'Bestellung verfolgen', href: '/pages/track-order'},
      {label: 'Kontakt', href: '/pages/contact'},
      {label: 'Lieferung & Rückgabe', href: '/pages/shipping'},
      {label: 'Zahlung & Sicherheit', href: '/pages/payment'},
      {label: 'Stoffpflege', href: '/pages/care'},
      {label: 'Fitguide', href: '/pages/fitguide'},
    ],
  },
];

const SOCIAL_LINKS = [
  {label: 'Facebook', href: 'https://www.facebook.com/zehnauthentic', type: 'lucide' as const, icon: 'Facebook'},
  {label: 'Instagram', href: 'https://www.instagram.com/zehn_authentic/', type: 'lucide' as const, icon: 'Instagram'},
  {label: 'TikTok', href: 'https://www.tiktok.com/@zehn_authentic', type: 'custom' as const, icon: 'TikTok'},
  {label: 'LinkedIn', href: 'https://www.linkedin.com/company/zehnauthentic/', type: 'lucide' as const, icon: 'Linkedin'},
  {label: 'YouTube', href: 'https://www.youtube.com/@ZehnAuthentic', type: 'lucide' as const, icon: 'Youtube'},
  {label: 'Pinterest', href: 'https://de.pinterest.com/zehn_authentic', type: 'custom' as const, icon: 'Pinterest'},
];

const BRAND_HOVER_COLORS: Record<string, string> = {
  Facebook: 'hover:text-[#1877F2]',
  Instagram: 'hover:text-[#E1306C]',
  TikTok: 'hover:text-[#000000]',
  Linkedin: 'hover:text-[#0077B5]',
  Youtube: 'hover:text-[#FF0000]',
  Pinterest: 'hover:text-[#E60023]',
};

// ============================================
// SVG ICON COMPONENTS (fixed versions)
// ============================================

function TikTokIcon({className}: {className?: string}) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.48a8.18 8.18 0 004.76 1.52V7.56a4.84 4.84 0 01-1-.87z" />
    </svg>
  );
}

function PinterestIcon({className}: {className?: string}) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345c-.091.378-.293 1.194-.332 1.361-.053.218-.173.265-.4.159-1.492-.694-2.424-2.875-2.424-4.627 0-3.769 2.737-7.229 7.892-7.229 4.144 0 7.365 2.953 7.365 6.899 0 4.117-2.595 7.431-6.199 7.431-1.211 0-2.348-.63-2.738-1.373 0 0-.599 2.282-.744 2.84-.282 1.084-1.064 2.456-1.549 3.235 1.163.359 2.396.553 3.682.553 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

// ============================================
// LUCIDE ICON MAP
// ============================================

const LUCIDE_ICONS: Record<string, React.ComponentType<{className?: string}>> = {
  Linkedin,
  Facebook,
  Youtube,
  Instagram,
};

// ============================================
// SUB-COMPONENTS
// ============================================

function FooterBrandSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email}),
      });

      const data = await response.json() as {success: boolean};

      if (data.success) {
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="mb-6 sm:mb-0">
      <img
        src="/ZEHN_Wordmark_with_logo.png"
        alt="ZEHN"
        className="h-8 sm:h-10 w-auto mb-3 sm:mb-4 rounded-none"
        style={{borderRadius: 0}}
      />

      {/* Newsletter Signup */}
      <div className="mb-6">
        <h3 className="font-sans text-body tracking-[0.2em] uppercase text-primary-foreground font-medium mb-3">
          Newsletter
        </h3>
        <form onSubmit={(e) => { void handleSubmit(e); }} className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ihre E-Mail-Adresse"
            required
            disabled={status === 'loading' || status === 'success'}
            className="w-full px-4 py-2.5 pr-24 bg-transparent border-0 border-b border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-0 focus:border-b-accent focus:border-b-2 font-sans text-base sm:text-sm disabled:opacity-50"
            aria-label="E-Mail-Adresse für Newsletter"
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            style={{
              color: '#0F1426',
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 px-4 py-1.5 hover:text-accent font-medium focus:outline-none transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-sans text-sm"
            aria-label="Newsletter abonnieren"
          >
            {status === 'loading' ? '...' : status === 'success' ? '✓' : 'Senden'}
          </button>
        </form>
        {status === 'success' && (
          <p className="text-sm text-accent mt-2 font-sans">
            Vielen Dank für Ihre Anmeldung!
          </p>
        )}
        {status === 'error' && (
          <p className="text-sm text-red-400 mt-2 font-sans">
            Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
          </p>
        )}
      </div>

      <div className="flex gap-2 sm:gap-3 flex-wrap">
        {SOCIAL_LINKS.map((social) => {
          const isCustom = social.type === 'custom';
          const LucideIcon = !isCustom ? LUCIDE_ICONS[social.icon] : null;

          return (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-card/10 flex items-center justify-center text-primary-foreground/70 ${BRAND_HOVER_COLORS[social.icon] || 'hover:text-accent'} transition-all duration-300`}
              aria-label={social.label}
            >
              {social.icon === 'TikTok' && (
                <TikTokIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              {social.icon === 'Pinterest' && (
                <PinterestIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              {LucideIcon && (
                <LucideIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function FooterLinkColumn({
  group,
  isOpen,
  onToggle,
}: {
  group: FooterLinkGroup;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const headingId = `footer-heading-${group.id}`;
  const contentId = `footer-content-${group.id}`;

  return (
    <div className="border-b border-border/20 sm:border-b-0">
      {/* Heading — acts as accordion trigger on mobile */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 sm:py-0 sm:mb-4 sm:cursor-default sm:pointer-events-none"
        aria-expanded={isOpen}
        aria-controls={contentId}
        id={headingId}
      >
        <h3 className="font-sans text-body tracking-[0.3em] uppercase text-primary-foreground font-medium">
          {group.title}
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-primary-foreground/60 transition-transform duration-300 sm:hidden ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content — collapsible on mobile, always visible on sm+ */}
      <div
        id={contentId}
        role="region"
        aria-labelledby={headingId}
        className={`footer-accordion-content overflow-hidden ${
          isOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
        } sm:max-h-[500px] sm:opacity-100 sm:overflow-visible sm:pb-0`}
      >
        <ul className="space-y-2 sm:space-y-3">
          {group.links.map((link) => (
            <li key={link.label}>
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-body text-primary-foreground/70 hover:text-accent transition-all duration-300 inline-flex items-center gap-1 py-1"
                  aria-label={`${link.label} (öffnet in neuem Tab)`}
                >
                  {link.label}
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              ) : (
                <Link
                  to={link.href}
                  className="font-sans text-body text-primary-foreground/70 hover:text-accent transition-all duration-300 inline-block py-1"
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


// ============================================
// PAYMENT BRAND SVG ICONS
// ============================================

function TrustedShopsIcon() {
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label="Trusted Shops – 4,78 Hervorragend">
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="18" fill="#FFDC0F" stroke="#333" strokeWidth="1"/>
        <text x="20" y="17" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#333">e</text>
        <text x="20" y="27" textAnchor="middle" fontSize="5" fill="#333">TS</text>
      </svg>
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
        </div>
        <span className="text-[11px] font-bold text-foreground/80">4,78</span>
        <span className="text-[10px] text-foreground/50">Hervorragend</span>
        <span className="text-[9px] text-foreground/40">Käuferschutz</span>
      </div>
    </div>
  );
}

function AmexIcon() {
  return (
    <svg className="h-10 w-auto" viewBox="0 0 60 40" role="img" aria-label="American Express">
      <rect width="60" height="40" rx="4" fill="#016FD0"/>
      <text x="30" y="18" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">AMERICAN</text>
      <text x="30" y="28" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">EXPRESS</text>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg className="h-10 w-auto" viewBox="0 0 60 40" role="img" aria-label="Mastercard">
      <rect width="60" height="40" rx="4" fill="white"/>
      <circle cx="23" cy="20" r="11" fill="#EB001B"/>
      <circle cx="37" cy="20" r="11" fill="#F79E1B"/>
      <path d="M30 12.2a10.96 10.96 0 014 7.8 10.96 10.96 0 01-4 7.8 10.96 10.96 0 01-4-7.8 10.96 10.96 0 014-7.8z" fill="#FF5F00"/>
      <text x="30" y="37" textAnchor="middle" fontSize="5" fill="#333" fontFamily="Arial, sans-serif">mastercard</text>
    </svg>
  );
}

function PayPalIcon() {
  return (
    <svg className="h-10 w-auto" viewBox="0 0 60 40" role="img" aria-label="PayPal">
      <rect width="60" height="40" rx="4" fill="white"/>
      <text x="10" y="26" fontSize="13" fontWeight="bold" fill="#003087" fontFamily="Arial, sans-serif" letterSpacing="-0.5">P</text>
      <text x="20" y="26" fontSize="13" fontWeight="bold" fill="#003087" fontFamily="Arial, sans-serif" letterSpacing="-0.5">Pay</text>
      <text x="39" y="26" fontSize="13" fontWeight="bold" fill="#009CDE" fontFamily="Arial, sans-serif" letterSpacing="-0.5">Pal</text>
    </svg>
  );
}

function VisaIcon() {
  return (
    <svg className="h-10 w-auto" viewBox="0 0 60 40" role="img" aria-label="Visa">
      <rect width="60" height="40" rx="4" fill="white"/>
      <text x="30" y="27" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#1A1F71" fontFamily="Arial, sans-serif" fontStyle="italic">VISA</text>
    </svg>
  );
}

function KlarnaIcon() {
  return (
    <svg className="h-10 w-auto" viewBox="0 0 60 40" role="img" aria-label="Klarna">
      <rect width="60" height="40" rx="4" fill="#FFB3C7"/>
      <text x="30" y="26" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0A0B09" fontFamily="Arial, sans-serif">Klarna.</text>
    </svg>
  );
}

function DarkCardIcon() {
  return (
    <svg className="h-10 w-auto" viewBox="0 0 60 40" role="img" aria-label="Kartenzahlung">
      <rect width="60" height="40" rx="4" fill="#1a1a2e"/>
      <rect x="8" y="12" width="20" height="16" rx="2" fill="none" stroke="#c4a962" strokeWidth="1.5"/>
      <rect x="32" y="12" width="20" height="16" rx="2" fill="none" stroke="#c4a962" strokeWidth="1.5"/>
      <circle cx="42" cy="20" r="4" fill="#c4a962" opacity="0.3"/>
    </svg>
  );
}

// ============================================
// BOTTOM PAYMENT BAR (light background)
// ============================================

function FooterPaymentBar() {
  const paymentIcons = [
    {src: '/visa.svg', alt: 'Visa'},
    {src: '/mastercard.svg', alt: 'Mastercard'},
    {src: '/paypal.svg', alt: 'PayPal'},
    {src: '/klarna.svg', alt: 'Klarna'},
  ];

  return (
    <div className="bg-card w-full">
      <div className="flex items-center justify-center gap-8 sm:gap-12 lg:gap-16 px-6 sm:px-10 lg:px-20 pt-6 sm:pt-10 pb-4">
        {paymentIcons.map((icon) => (
          <img
            key={icon.alt}
            src={icon.src}
            alt={icon.alt}
            className="h-5 sm:h-6 w-auto object-contain"
          />
        ))}
      </div>
      <p className="text-center font-sans text-[12px] sm:text-[13px] text-foreground/40 pb-6 sm:pb-8 pt-2">
        © {new Date().getFullYear()} ZEHN. Alle Rechte vorbehalten.
      </p>
    </div>
  );
}

// ============================================
// MAIN EXPORT
// ============================================

export function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  };

  return (
    <footer>
      {/* Dark Section: Brand + Link Columns */}
      <div className="bg-foreground pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 relative overflow-hidden text-primary-foreground">
        {/* Giant Background Logo - ZEHN Platinum */}
        <div className="absolute inset-0 pointer-events-none select-none z-0 flex justify-center items-end sm:items-center pb-[36px] sm:pb-0">
          <img
            src="/ZEHN_Platinum.svg"
            alt=""
            aria-hidden="true"
            className="h-[210px] sm:h-[250px] md:h-[350px] lg:h-[400px] w-auto opacity-10"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-0 sm:gap-6 lg:gap-10">
            <FooterBrandSection />

            {FOOTER_LINK_GROUPS.map((group) => (
              <FooterLinkColumn
                key={group.id}
                group={group}
                isOpen={openSection === group.id}
                onToggle={() => toggleSection(group.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Light Section: Payment Icons + Legal Links */}
      <FooterPaymentBar />
    </footer>
  );
}
