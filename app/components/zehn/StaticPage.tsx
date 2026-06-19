import {Link} from 'react-router';
import {ChevronRight} from 'lucide-react';
import {StaticPageLegal} from './StaticPageLegal';
import {StaticPageAbout} from './StaticPageAbout';
import {StaticPageService} from './StaticPageService';
import {StaticPageContact} from './contact/StaticPageContact';
import {TrackOrderPage} from './TrackOrderPage';
import {ZehnClubPage} from './ZehnClubPage';
import type {StaticPageData} from '~/lib/static-pages';
import {useEffect} from 'react';

// ============================================
// DISPATCHER
// ============================================

export function StaticPage({page}: {page: StaticPageData}) {
  // Handle hash navigation (e.g., #email)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  // Dedicated contact page with interactive features
  if (page.handle === 'contact') {
    return <StaticPageContact />;
  }

  // Dedicated track-order page with DHL tracking form
  if (page.handle === 'track-order') {
    return <TrackOrderPage />;
  }

  // Dedicated ZEHN Club page with registration form
  if (page.handle === 'zehn-club') {
    return <ZehnClubPage />;
  }

  switch (page.category) {
    case 'legal':
      return <StaticPageLegal page={page} />;
    case 'about':
      return <StaticPageAbout page={page} />;
    case 'service':
      return <StaticPageService page={page} />;
    default:
      return <StaticPageFallback page={page} />;
  }
}

// ============================================
// FALLBACK (preserves original layout logic)
// ============================================

const CATEGORY_META: Record<
  StaticPageData['category'],
  {label: string; breadcrumb: string; accentClass: string}
> = {
  legal: {
    label: 'Rechtliches',
    breadcrumb: 'Rechtliches',
    accentClass: 'bg-secondary/20 text-secondary',
  },
  about: {
    label: 'Über ZEHN',
    breadcrumb: 'Über ZEHN',
    accentClass: 'bg-accent/10 text-accent',
  },
  service: {
    label: 'Kundenservice',
    breadcrumb: 'Kundenservice',
    accentClass: 'bg-accent/10 text-accent',
  },
};

function Breadcrumb({
  category,
  pageTitle,
}: {
  category: StaticPageData['category'];
  pageTitle: string;
}) {
  const meta = CATEGORY_META[category];
  return (
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
      <span>{meta.breadcrumb}</span>
      <ChevronRight className="w-3.5 h-3.5" />
      <span className="text-primary-foreground/80 truncate max-w-[200px]">
        {pageTitle}
      </span>
    </nav>
  );
}

function SectionBlock({
  heading,
  body,
  index,
}: {
  heading: string;
  body: string;
  index: number;
}) {
  // Convert newlines to proper paragraphs and handle bullet points
  const formattedBody = body.split('\n\n').map((paragraph, pIdx) => {
    // Check if paragraph contains bullet points
    if (paragraph.includes('• ')) {
      const items = paragraph.split('\n').filter(Boolean);
      return (
        <ul key={pIdx} className="space-y-2 my-3">
          {items.map((item, iIdx) => {
            const text = item.startsWith('• ') ? item.slice(2) : item;
            return item.startsWith('• ') ? (
              <li
                key={iIdx}
                className="flex items-start gap-2 font-sans text-body-lg text-foreground/80"
              >
                <span className="text-accent mt-1.5 flex-shrink-0">•</span>
                <span>{text}</span>
              </li>
            ) : (
              <p
                key={iIdx}
                className="font-sans text-body-lg text-foreground/80"
              >
                {item}
              </p>
            );
          })}
        </ul>
      );
    }

    // Handle single-line breaks within a paragraph (e.g., address blocks)
    if (paragraph.includes('\n')) {
      return (
        <p
          key={pIdx}
          className="font-sans text-body-lg text-foreground/80 whitespace-pre-line"
        >
          {paragraph}
        </p>
      );
    }

    return (
      <p key={pIdx} className="font-sans text-body-lg text-foreground/80">
        {paragraph}
      </p>
    );
  });

  return (
    <section
      className={`py-8 ${index > 0 ? 'border-t border-border/15' : ''}`}
    >
      <h2 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-foreground mb-4">
        {heading}
      </h2>
      <div className="space-y-4 max-w-3xl">{formattedBody}</div>
    </section>
  );
}

function StaticPageFallback({page}: {page: StaticPageData}) {
  const categoryMeta = CATEGORY_META[page.category];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="bg-foreground text-primary-foreground py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent/5" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-accent/3" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumb category={page.category} pageTitle={page.title} />

          {/* Category badge */}
          <span
            className={`inline-block px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider mb-4 ${categoryMeta.accentClass}`}
          >
            {categoryMeta.label}
          </span>

          <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-primary-foreground mb-3">
            {page.title}
          </h1>
          <p className="font-sans text-subheadline sm:text-subheadline-sm text-primary-foreground/70 max-w-2xl">
            {page.subtitle}
          </p>
        </div>
      </div>

      {/* Content Body */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {page.sections.map((section, idx) => (
          <SectionBlock
            key={section.heading}
            heading={section.heading}
            body={section.body}
            index={idx}
          />
        ))}

        {/* Back navigation */}
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
