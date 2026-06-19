import {StaticPageHero} from './StaticPageHero';
import {StaticPageSections} from './StaticPageSection';
import type {StaticPageData} from '~/lib/static-pages';

export function StaticPageService({page}: {page: StaticPageData}) {
  const heroStyle = page.layout?.heroStyle ?? 'dark';
  const sectionStyle = page.layout?.sectionStyle ?? 'flat';
  const icon = page.layout?.icon;

  return (
    <div className="min-h-screen bg-background">
      <StaticPageHero
        title={page.title}
        subtitle={page.subtitle}
        category="service"
        heroStyle={heroStyle}
        icon={icon}
      />
      <StaticPageSections
        sections={page.sections}
        sectionStyle={sectionStyle}
        category="service"
      />
    </div>
  );
}
