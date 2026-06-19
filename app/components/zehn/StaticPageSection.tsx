import {useState} from 'react';
import {Link} from 'react-router';
import {ChevronRight, ChevronDown} from 'lucide-react';
import type {StaticPageSection} from '~/lib/static-pages';

// ============================================
// TYPES
// ============================================

interface StaticPageSectionsProps {
  sections: StaticPageSection[];
  sectionStyle:
    | 'cards'
    | 'alternating'
    | 'flat'
    | 'steps'
    | 'numbered-clauses'
    | 'timeline'
    | 'accordion';
  category: 'legal' | 'about' | 'service';
  stackCards?: boolean;
  wide?: boolean;
}

// ============================================
// BACK LINK
// ============================================

function BackToHomeLink() {
  return (
    <div className="mt-12 pt-8 border-t border-border/15">
      <Link
        to="/"
        className="inline-flex items-center gap-2 font-sans text-body-lg text-accent hover:text-accent/80 transition-colors group"
      >
        <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
        Zurück zur Startseite
      </Link>
    </div>
  );
}

// ============================================
// FORMAT BODY HELPER
// ============================================

function formatBody(body: string): React.ReactNode[] {
  const paragraphs = body.split('\n\n');

  return paragraphs.map((paragraph, pIdx) => {
    // Check if paragraph contains bullet points
    if (paragraph.includes('• ')) {
      const items = paragraph.split('\n').filter(Boolean);
      return (
        <ul key={pIdx} className="space-y-2 my-3">
          {items.map((item, iIdx) => {
            const isBullet = item.startsWith('• ');
            const text = isBullet ? item.slice(2) : item;
            return isBullet ? (
              <li
                key={iIdx}
                className="flex items-start gap-2 font-sans text-body-lg text-foreground/80"
              >
                <span className="text-accent mt-1.5 flex-shrink-0" aria-hidden="true">
                  •
                </span>
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
}

// ============================================
// SECTION VARIANTS
// ============================================

/* 1. FLAT — Simple sequential sections with dividers */
function SectionsFlat({sections}: {sections: StaticPageSection[]}) {
  return (
    <div>
      {sections.map((section, idx) => (
        <section
          key={section.heading}
          className={`${idx === 0 ? 'pt-6 pb-8' : 'py-8'} ${idx > 0 ? 'border-t border-border/15' : ''}`}
        >
          <h2 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-foreground mb-4">
            {section.heading}
          </h2>
          <div className="space-y-4 max-w-3xl">{formatBody(section.body)}</div>
        </section>
      ))}
    </div>
  );
}

/* 2. NUMBERED CLAUSES — Legal document style with § numbers */
function SectionsNumberedClauses({sections}: {sections: StaticPageSection[]}) {
  return (
    <div className="space-y-0">
      {sections.map((section, idx) => (
        <section
          key={section.heading}
          className={`${idx === 0 ? 'pt-6 pb-8' : 'py-8'} ${idx > 0 ? 'border-t border-border/15' : ''}`}
        >
          <div className="flex gap-6 sm:gap-8">
            {/* Large accent-colored section number */}
            <div className="flex-shrink-0 pt-1">
              <span className="font-sans text-h2 sm:text-h2-sm text-accent/30">
                §{idx + 1}
              </span>
            </div>
            {/* Section content */}
            <div className="flex-1 min-w-0">
              <h2 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-foreground mb-4">
                {section.heading}
              </h2>
              <div className="space-y-4 max-w-3xl pl-0 sm:pl-2">
                {formatBody(section.body)}
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

/* 3. ALTERNATING — Alternating white / light gray backgrounds */
function SectionsAlternating({sections}: {sections: StaticPageSection[]}) {
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      {sections.map((section, idx) => (
        <section
          key={section.heading}
          className={`${idx === 0 ? 'pt-6' : 'pt-0'} pb-10 sm:pb-12 px-4 sm:px-6 lg:px-8 ${
            idx % 2 === 1 ? 'bg-foreground/[0.02]' : 'bg-background'
          }`}
        >
          <div className="max-w-3xl">
            <h2 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-foreground mb-4">
              {section.heading}
            </h2>
            <div className="space-y-4">{formatBody(section.body)}</div>
          </div>
        </section>
      ))}
    </div>
  );
}

/* 4. CARDS — Grid of cards */
function SectionsCards({
  sections,
  stacked = false,
}: {
  sections: StaticPageSection[];
  stacked?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:gap-6 pt-6 ${
        stacked ? '' : 'md:grid-cols-2'
      }`}
    >
      {sections.map((section) => (
        <article
          key={section.heading}
          className="rounded-xl bg-card shadow-sm border border-border/10 p-6 sm:p-8"
        >
          <h2 className="font-sans text-h3 sm:text-h3-sm text-foreground mb-4">
            {section.heading}
          </h2>
          <div className="space-y-4">{formatBody(section.body)}</div>
        </article>
      ))}
    </div>
  );
}

/* 5. STEPS — Numbered step indicator with vertical line */
function SectionsSteps({sections}: {sections: StaticPageSection[]}) {
  return (
    <div className="relative">
      {sections.map((section, idx) => {
        const isLast = idx === sections.length - 1;
        return (
          <section key={section.heading} className="relative flex gap-6 sm:gap-8 pb-10 sm:pb-12">
            {/* Step indicator column */}
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Numbered circle */}
              <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-sans text-body font-semibold flex-shrink-0">
                {idx + 1}
              </div>
              {/* Connecting dashed line */}
              {!isLast && (
                <div className="w-px flex-1 border-l-2 border-dashed border-accent/30 mt-3" aria-hidden="true" />
              )}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0 pt-1.5">
              <h2 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-foreground mb-4">
                {section.heading}
              </h2>
              <div className="space-y-4 max-w-3xl">{formatBody(section.body)}</div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* 6. TIMELINE — Vertical timeline with dot connectors */
function SectionsTimeline({sections}: {sections: StaticPageSection[]}) {
  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div
        className="absolute left-[15px] sm:left-[19px] top-2 bottom-2 w-px bg-border/30"
        aria-hidden="true"
      />

      {sections.map((section, idx) => (
        <section key={section.heading} className={`relative flex gap-6 sm:gap-8 pb-10 sm:pb-12 ${idx === 0 ? 'pt-6' : ''}`}>
          {/* Timeline dot */}
          <div className="flex-shrink-0 relative z-10">
            <div className="w-[30px] h-[30px] sm:w-[38px] sm:h-[38px] rounded-full border-2 border-accent bg-background flex items-center justify-center">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-accent" />
            </div>
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            {/* Era / label */}
            <span className="font-sans text-[11px] font-semibold text-accent uppercase tracking-wider mb-2 block">
              Kapitel {idx + 1}
            </span>
            <h2 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-foreground mb-4">
              {section.heading}
            </h2>
            <div className="space-y-4 max-w-3xl">{formatBody(section.body)}</div>
          </div>
        </section>
      ))}
    </div>
  );
}

/* 7. ACCORDION — Collapsible sections */
function SectionsAccordion({sections}: {sections: StaticPageSection[]}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function handleToggle(idx: number) {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  }

  return (
    <div className="divide-y divide-border/15">
      {sections.map((section, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={section.heading}>
            <button
              type="button"
              className="w-full flex items-center justify-between gap-4 py-5 sm:py-6 text-left group"
              onClick={() => handleToggle(idx)}
              aria-expanded={isOpen}
              aria-controls={`accordion-panel-${idx}`}
            >
              <h2 className="font-sans text-h3 sm:text-h3-sm text-foreground group-hover:text-accent transition-colors">
                {section.heading}
              </h2>
              <ChevronDown
                className={`w-5 h-5 text-foreground/50 flex-shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>
            <div
              id={`accordion-panel-${idx}`}
              role="region"
              aria-labelledby={`accordion-heading-${idx}`}
              className="footer-accordion-content overflow-hidden"
              style={{
                maxHeight: isOpen ? '2000px' : '0px',
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="pb-6 sm:pb-8 space-y-4 max-w-3xl">
                {formatBody(section.body)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// MAIN EXPORT
// ============================================

export function StaticPageSections({
  sections,
  sectionStyle,
  category: _category,
  stackCards = false,
  wide = false,
}: StaticPageSectionsProps) {
  function renderSections() {
    switch (sectionStyle) {
      case 'flat':
        return <SectionsFlat sections={sections} />;
      case 'numbered-clauses':
        return <SectionsNumberedClauses sections={sections} />;
      case 'alternating':
        return <SectionsAlternating sections={sections} />;
      case 'cards':
        return <SectionsCards sections={sections} stacked={stackCards} />;
      case 'steps':
        return <SectionsSteps sections={sections} />;
      case 'timeline':
        return <SectionsTimeline sections={sections} />;
      case 'accordion':
        return <SectionsAccordion sections={sections} />;
      default: {
        const _exhaustive: never = sectionStyle;
        return _exhaustive;
      }
    }
  }

  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 sm:pb-16 ${
        wide ? 'max-w-7xl' : 'max-w-4xl'
      }`}
    >
      {renderSections()}
      <BackToHomeLink />
    </div>
  );
}
