import type {ReactNode} from 'react';
import {Link} from 'react-router';
import {
  ChevronDown,
} from 'lucide-react';
import {CookiePreferencesManager} from './CookiePreferencesManager';
import type {StaticPageData} from '~/lib/static-pages';

const LEGAL_PAGES = [
  {handle: 'impressum', label: 'Impressum'},
  {handle: 'terms', label: 'AGB'},
  {handle: 'privacy', label: 'Datenschutz'},
  {handle: 'cookies', label: 'Cookies'},
  {handle: 'faq', label: 'FAQ'},
  {handle: 'widerruf', label: 'Widerruf'},
];

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

function chapterNumber(index: number) {
  return String(index + 1).padStart(2, '0');
}

function chapterId(index: number) {
  return `kapitel-${chapterNumber(index)}`;
}

function cleanHeading(heading: string) {
  return heading.replace(/^\d+\.\s*/, '');
}

function renderLinkedText(text: string): ReactNode[] {
  return text.split(URL_PATTERN).map((part) => {
    if (!part.startsWith('http')) return part;

    return (
      <a key={part} href={part} target="_blank" rel="noreferrer">
        {part}
      </a>
    );
  });
}

function LegalBody({body, isFaq}: {body: string; isFaq: boolean}) {
  return (
    <div className="legal-copy">
      {body.split('\n\n').map((paragraph) => {
        const lines = paragraph.split('\n').filter(Boolean);

        if (isFaq && lines.length > 1) {
          const [question, ...answer] = lines;
          return (
            <details className="legal-faq-item" key={paragraph}>
              <summary>
                <span>{question}</span>
                <ChevronDown aria-hidden="true" />
              </summary>
              <p>{renderLinkedText(answer.join(' '))}</p>
            </details>
          );
        }

        return (
          <p key={paragraph} className="legal-paragraph">
            {renderLinkedText(paragraph)}
          </p>
        );
      })}
    </div>
  );
}

function LegalSidebar({activeHandle}: {activeHandle: string}) {
  return (
    <div className="legal-sidebar" role="complementary">
      <div className="legal-sidebar-inner">
        <p className="legal-sidebar-title">Rechtliches</p>
        <nav className="legal-sidebar-navigation" aria-label="Rechtliches">
          {LEGAL_PAGES.map(({handle, label}) => {
            const isActive = handle === activeHandle;

            return (
              <Link
                key={handle}
                to={`/pages/${handle}`}
                className={`legal-sidebar-link${
                  isActive ? ' legal-sidebar-link-active' : ''
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function StaticPageLegal({page}: {page: StaticPageData}) {
  const isCookiePage = page.handle === 'cookies';
  const isFaqPage = page.handle === 'faq';
  const heroTitle =
    page.handle === 'terms' ? 'AGB' : page.handle === 'faq' ? 'FAQ' : page.title;

  return (
    <div className="legal-page">
      <header className="legal-hero">
        <div className="legal-shell">
          <p className="legal-eyebrow">ZEHN / Rechtliches</p>
          <h1>{heroTitle}</h1>
          <p className="legal-subtitle">{page.subtitle}</p>
        </div>
      </header>

      <main className="legal-main">
        <div className="legal-layout">
          <LegalSidebar activeHandle={page.handle} />

          <div className="legal-document">
            <div className="legal-document-heading">
              <h2>{page.title}</h2>
            </div>

            <div className="legal-accordion">
              {page.sections.map((section, index) => (
                <details
                  className="legal-chapter"
                  id={chapterId(index)}
                  key={section.heading}
                >
                  <summary className="legal-chapter-summary">
                    <span className="legal-chapter-title">
                      {cleanHeading(section.heading)}
                    </span>
                    <ChevronDown
                      className="legal-chapter-chevron"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="legal-chapter-content">
                    <LegalBody body={section.body} isFaq={isFaqPage} />
                  </div>
                </details>
              ))}

              {isCookiePage && (
                <details className="legal-chapter legal-cookie-settings">
                  <summary className="legal-chapter-summary">
                    <span className="legal-chapter-title">
                      Ihre aktuellen Cookie-Einstellungen
                    </span>
                    <ChevronDown
                      className="legal-chapter-chevron"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="legal-chapter-content">
                    <CookiePreferencesManager />
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
