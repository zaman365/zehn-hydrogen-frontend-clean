import {StaticPageHero} from './StaticPageHero';
import {StaticPageSections} from './StaticPageSection';
import type {StaticPageData} from '~/lib/static-pages';

export function StaticPageAbout({page}: {page: StaticPageData}) {
  const heroStyle = page.layout?.heroStyle ?? 'dark';
  const sectionStyle = page.layout?.sectionStyle ?? 'flat';
  const icon = page.layout?.icon;

  return (
    <div className="min-h-screen bg-background">
      <StaticPageHero
        title={page.title}
        subtitle={page.subtitle}
        category="about"
        heroStyle={heroStyle}
        icon={icon}
        wide={page.handle === 'affiliate'}
      />
      <StaticPageSections
        sections={page.sections}
        sectionStyle={sectionStyle}
        category="about"
        stackCards={page.handle === 'affiliate'}
        wide={page.handle === 'affiliate'}
      />
    </div>
  );
}
