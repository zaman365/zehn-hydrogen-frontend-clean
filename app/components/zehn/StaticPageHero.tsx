import {Link} from 'react-router';
import {ChevronRight,
  Scale,
  Shield,
  Cookie,
  Building2,
  History,
  Leaf,
  Sparkles,
  Ruler,
  Crown,
  Package,
  MessageCircle,
  Truck,
  CreditCard,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface StaticPageHeroProps {
  title: string;
  subtitle: string;
  category: 'legal' | 'about' | 'service';
  heroStyle: 'dark' | 'light' | 'gradient' | 'minimal' | 'split';
  icon?: string;
  wide?: boolean;
}

// ============================================
// ICON MAP
// ============================================

const ICON_MAP: Record<string, React.ComponentType<{className?: string}>> = {
  Scale,
  Shield,
  Cookie,
  Building2,
  History,
  Leaf,
  Sparkles,
  Ruler,
  Crown,
  Package,
  MessageCircle,
  Truck,
  CreditCard,
  RefreshCw,
  HelpCircle,
};

// ============================================
// CATEGORY META
// ============================================

const CATEGORY_META: Record<
  StaticPageHeroProps['category'],
  {label: string; breadcrumb: string; accentClass: string; accentClassLight: string}
> = {
  legal: {
    label: 'Rechtliches',
    breadcrumb: 'Rechtliches',
    accentClass: 'bg-secondary/20 text-secondary',
    accentClassLight: 'bg-foreground/10 text-foreground/70',
  },
  about: {
    label: 'Über ZEHN',
    breadcrumb: 'Über ZEHN',
    accentClass: 'bg-accent/10 text-accent',
    accentClassLight: 'bg-accent/10 text-accent',
  },
  service: {
    label: 'Kundenservice',
    breadcrumb: 'Kundenservice',
    accentClass: 'bg-accent/10 text-accent',
    accentClassLight: 'bg-accent/10 text-accent',
  },
};

// ============================================
// BREADCRUMB
// ============================================

function Breadcrumb({
  category,
  pageTitle,
  variant,
}: {
  category: StaticPageHeroProps['category'];
  pageTitle: string;
  variant: 'light-text' | 'dark-text';
}) {
  const meta = CATEGORY_META[category];
  const baseColor =
    variant === 'light-text'
      ? 'text-primary-foreground/50'
      : 'text-foreground/50';
  const hoverColor =
    variant === 'light-text'
      ? 'hover:text-primary-foreground/80'
      : 'hover:text-foreground/80';
  const activeColor =
    variant === 'light-text'
      ? 'text-primary-foreground/80'
      : 'text-foreground/80';

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-body font-sans ${baseColor} mb-6`}
    >
      <Link to="/" className={`${hoverColor} transition-colors`}>
        Home
      </Link>
      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{meta.breadcrumb}</span>
      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
      <span className={`${activeColor} truncate max-w-[200px]`}>
        {pageTitle}
      </span>
    </nav>
  );
}

// ============================================
// HERO VARIANTS
// ============================================

function HeroDark({title, subtitle, category, icon}: StaticPageHeroProps) {
  const meta = CATEGORY_META[category];
  const IconComponent = icon ? ICON_MAP[icon] : null;

  return (
    <div className="bg-foreground text-primary-foreground py-16 sm:py-20 lg:pt-24 lg:pb-6 relative overflow-hidden">
      {/* Decorative accent circles */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent/5" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-accent/[0.03]" />
      </div>

      {/* Background icon watermark */}
      {IconComponent && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none" aria-hidden="true">
          <IconComponent className="w-32 h-32 text-primary-foreground opacity-[0.05]" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Breadcrumb category={category} pageTitle={title} variant="light-text" />

        {category !== 'about' && (
          <span
            className={`inline-block px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider mb-4 ${meta.accentClass}`}
          >
            {meta.label}
          </span>
        )}

        <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-primary-foreground mb-3">
          {title}
        </h1>
        <p className="font-sans text-subheadline sm:text-subheadline-sm text-primary-foreground/70 max-w-2xl">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function HeroLight({title, subtitle, category, icon}: StaticPageHeroProps) {
  const meta = CATEGORY_META[category];
  const IconComponent = icon ? ICON_MAP[icon] : null;

  return (
    <div className="bg-zehn-platinum text-foreground py-16 sm:py-20 lg:pt-24 lg:pb-6 border-b border-border/15 relative overflow-hidden">
      {/* Icon watermark on the right */}
      {IconComponent && (
        <div className="absolute right-8 sm:right-16 top-1/2 -translate-y-1/2 pointer-events-none select-none" aria-hidden="true">
          <IconComponent className="w-40 h-40 sm:w-56 sm:h-56 text-foreground opacity-[0.04]" />
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Breadcrumb category={category} pageTitle={title} variant="dark-text" />

        <div className="flex items-center gap-2 mb-4">
          {IconComponent && (
            <IconComponent className="w-4 h-4 text-accent" aria-hidden="true" />
          )}
          {category !== 'about' && (
            <span
              className={`inline-block px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider ${meta.accentClassLight}`}
            >
              {meta.label}
            </span>
          )}
        </div>

        <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-foreground mb-3">
          {title}
        </h1>
        <p className="font-sans text-subheadline sm:text-subheadline-sm text-foreground/70 max-w-2xl">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function HeroGradient({
  title,
  subtitle,
  category,
  icon,
  wide = false,
}: StaticPageHeroProps) {
  const meta = CATEGORY_META[category];
  const IconComponent = icon ? ICON_MAP[icon] : null;

  return (
    <div className="bg-gradient-to-br from-[#0F1426] to-[#1a2240] text-primary-foreground py-16 sm:py-20 lg:pt-24 lg:pb-6 relative overflow-hidden">
      {/* Accent-colored decorative stripe on the left */}
      <div
        className="absolute left-0 top-0 w-1 sm:w-1.5 h-full bg-accent"
        aria-hidden="true"
      />

      {/* Background icon watermark */}
      {IconComponent && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none" aria-hidden="true">
          <IconComponent className="w-32 h-32 text-primary-foreground opacity-[0.05]" />
        </div>
      )}

      <div
        className={`mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ${
          wide ? 'max-w-7xl' : 'max-w-4xl'
        }`}
      >
        <Breadcrumb category={category} pageTitle={title} variant="light-text" />

        {category !== 'about' && (
          <span
            className={`inline-block px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider mb-4 ${meta.accentClass}`}
          >
            {meta.label}
          </span>
        )}

        <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-primary-foreground mb-3">
          {title}
        </h1>
        <p className="font-sans text-subheadline sm:text-subheadline-sm text-primary-foreground/70 max-w-2xl">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function HeroMinimal({title, subtitle, category, icon}: StaticPageHeroProps) {
  const meta = CATEGORY_META[category];
  const IconComponent = icon ? ICON_MAP[icon] : null;

  return (
    <div className="bg-background text-foreground py-10 sm:py-12 lg:py-14 border-t-2 border-accent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb category={category} pageTitle={title} variant="dark-text" />

        <div className="flex items-center gap-2 mb-4">
          {IconComponent && (
            <IconComponent className="w-4 h-4 text-accent" aria-hidden="true" />
          )}
          {category !== 'about' && (
            <span
              className={`inline-block px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider ${meta.accentClassLight}`}
            >
              {meta.label}
            </span>
          )}
        </div>

        <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-foreground mb-2">
          {title}
        </h1>
        <p className="font-sans text-body-lg text-foreground/60 max-w-2xl">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function HeroSplit({title, subtitle, category, icon}: StaticPageHeroProps) {
  const meta = CATEGORY_META[category];
  const IconComponent = icon ? ICON_MAP[icon] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] min-h-[280px] sm:min-h-[320px]">
      {/* Left side — text content */}
      <div className="bg-foreground text-primary-foreground py-16 sm:py-20 lg:pt-24 lg:pb-6 relative overflow-hidden">
        {IconComponent && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none lg:hidden" aria-hidden="true">
            <IconComponent className="w-32 h-32 text-primary-foreground opacity-[0.05]" />
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumb category={category} pageTitle={title} variant="light-text" />

          {category !== 'about' && (
            <span
              className={`inline-block px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider mb-4 ${meta.accentClass}`}
            >
              {meta.label}
            </span>
          )}

          <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-primary-foreground mb-3">
            {title}
          </h1>
          <p className="font-sans text-subheadline sm:text-subheadline-sm text-primary-foreground/70 max-w-xl">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right side — decorative geometric panel */}
      <div
        className="hidden lg:flex items-center justify-center w-80 bg-[#161d35] relative overflow-hidden"
        aria-hidden="true"
      >
        {/* Geometric shapes */}
        <div className="absolute top-8 right-8 w-20 h-20 border-2 border-accent/20 rounded-lg rotate-12" />
        <div className="absolute bottom-12 left-8 w-16 h-16 bg-accent/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-accent/15 rotate-45" />
        <div className="absolute bottom-8 right-12 w-12 h-12 bg-accent/[0.07] rounded-lg -rotate-6" />
        <div className="absolute top-16 left-12 w-8 h-8 bg-accent/10 rounded" />

        {IconComponent && (
          <IconComponent className="w-16 h-16 text-accent/20 relative z-10" />
        )}
      </div>
    </div>
  );
}

// ============================================
// MAIN EXPORT
// ============================================

export function StaticPageHero(props: StaticPageHeroProps) {
  switch (props.heroStyle) {
    case 'dark':
      return <HeroDark {...props} />;
    case 'light':
      return <HeroLight {...props} />;
    case 'gradient':
      return <HeroGradient {...props} />;
    case 'minimal':
      return <HeroMinimal {...props} />;
    case 'split':
      return <HeroSplit {...props} />;
    default: {
      // Exhaustive check — ensures all heroStyle variants are handled
      const _exhaustive: never = props.heroStyle;
      return _exhaustive;
    }
  }
}
