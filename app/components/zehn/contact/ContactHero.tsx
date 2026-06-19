import {Link} from 'react-router';
import {
  ChevronRight,
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface QuickJumpCard {
  id: string;
  icon: React.ComponentType<{className?: string}>;
  title: string;
  description: string;
  scrollTarget: string;
}

// ============================================
// DATA
// ============================================

const QUICK_JUMP_CARDS: QuickJumpCard[] = [
  {
    id: 'chat',
    icon: MessageCircle,
    title: 'AI Chat',
    description: 'Sofortige Hilfe rund um die Uhr',
    scrollTarget: '', // Chat is a floating widget, handled specially
  },
  {
    id: 'email',
    icon: Mail,
    title: 'E-Mail',
    description: 'Antwort innerhalb von 24h',
    scrollTarget: '#email',
  },
  {
    id: 'phone',
    icon: Phone,
    title: 'Telefon',
    description: 'Mo–Fr, 9:00–18:00 Uhr',
    scrollTarget: '#phone',
  },
  {
    id: 'faq',
    icon: HelpCircle,
    title: 'FAQ',
    description: 'Schnelle Antworten finden',
    scrollTarget: '#faq',
  },
];

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
      <ChevronRight className="w-3.5 h-3.5" />
      <span>Kundenservice</span>
      <ChevronRight className="w-3.5 h-3.5" />
      <span className="text-primary-foreground/80">Kontakt</span>
    </nav>
  );
}

function QuickJumpCardComponent({
  card,
  onChatOpen,
}: {
  card: QuickJumpCard;
  onChatOpen?: () => void;
}) {
  const Icon = card.icon;

  const handleClick = () => {
    if (card.id === 'chat') {
      // For chat, we trigger the floating chat widget open
      onChatOpen?.();
      return;
    }

    // Smooth scroll to section
    const target = document.querySelector(card.scrollTarget);
    if (target) {
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex flex-col items-center gap-3 p-5 sm:p-6 rounded-xl bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 hover:border-accent/40 transition-all duration-300 text-center"
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-accent/15 flex items-center justify-center group-hover:bg-accent/25 group-hover:scale-110 transition-all duration-300">
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
      </div>
      <div>
        <h3 className="font-sans text-body-lg sm:text-h3 text-primary-foreground font-medium">
          {card.title}
        </h3>
        <p className="font-sans text-[13px] sm:text-body text-primary-foreground/50 mt-0.5">
          {card.description}
        </p>
      </div>
    </button>
  );
}

// ============================================
// MAIN EXPORT
// ============================================

export function ContactHero({onChatOpen}: {onChatOpen?: () => void}) {
  return (
    <div className="bg-foreground text-primary-foreground py-16 sm:py-20 lg:py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent/5" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-accent/3" />
        <div className="absolute right-1/4 top-1/3 w-40 h-40 rounded-full bg-accent/3" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Breadcrumb />

        {/* Category badge */}
        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider mb-4 bg-accent/10 text-accent">
          Kundenservice
        </span>

        <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-primary-foreground mb-3">
          Kundenservice
        </h1>
        <p className="font-sans text-subheadline sm:text-subheadline-sm text-primary-foreground/70 max-w-2xl mb-10 sm:mb-12">
          Wir sind für Sie da — wählen Sie Ihren bevorzugten Kontaktweg
        </p>

        {/* Quick Jump Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {QUICK_JUMP_CARDS.map((card) => (
            <QuickJumpCardComponent
              key={card.id}
              card={card}
              onChatOpen={onChatOpen}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
