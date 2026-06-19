import {Link, useLoaderData} from 'react-router';
import {ChevronRight} from 'lucide-react';
import type {Route} from './+types/pages.$handle';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {getStaticPage} from '~/lib/static-pages';
import type {StaticPageData} from '~/lib/static-pages';
import {StaticPage} from '~/components/zehn/StaticPage';

export const meta: Route.MetaFunction = ({data}) => {
  if (!data) return [{title: 'Seite | ZEHN'}];

  // Static page meta
  if ('staticPage' in data && data.staticPage) {
    const sp = data.staticPage as StaticPageData;
    return [
      {title: `${sp.seoTitle} | ZEHN`},
      {name: 'description', content: sp.seoDescription},
      {property: 'og:type', content: 'website'},
      {property: 'og:title', content: `${sp.seoTitle} | ZEHN`},
      {property: 'og:description', content: sp.seoDescription},
      {property: 'og:site_name', content: 'ZEHN'},
      {property: 'og:locale', content: 'de_DE'},
      {name: 'twitter:card', content: 'summary'},
    ];
  }

  // CMS page meta
  const page = (data as {page: {title: string; seo?: {title?: string; description?: string}}}).page;
  if (!page) return [{title: 'Seite | ZEHN'}];
  return [
    {title: `${page.seo?.title || page.title} | ZEHN`},
    {
      name: 'description',
      content: page.seo?.description || `${page.title} – ZEHN.`,
    },
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: `${page.title} | ZEHN`},
    {
      property: 'og:description',
      content: page.seo?.description || `${page.title} – ZEHN.`,
    },
    {property: 'og:site_name', content: 'ZEHN'},
    {property: 'og:locale', content: 'de_DE'},
    {name: 'twitter:card', content: 'summary'},
  ];
};

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold.
 * Tries Shopify CMS first, then falls back to static placeholder content.
 */
async function loadCriticalData({
  context,
  request,
  params,
}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  // Check if we have a static page definition for this handle.
  // Static pages with custom implementations bypass CMS entirely.
  // Other static pages try CMS first, then fall back to static.
  const staticPage = getStaticPage(params.handle);

  const CUSTOM_STATIC_HANDLES = [
    'contact',
    'track-order',
    'zehn-club',
    'impressum',
    'terms',
    'privacy',
    'cookies',
    'faq',
    'widerruf',
  ];
  if (staticPage && CUSTOM_STATIC_HANDLES.includes(staticPage.handle)) {
    return {page: null, staticPage};
  }

  // Try Shopify CMS first
  let page = null;
  try {
    const result = await context.storefront.query(PAGE_QUERY, {
      variables: {
        handle: params.handle,
      },
    });
    page = result.page;
  } catch (error) {
    // CMS query failed — fall through to static page if available
    console.warn(`[Pages] CMS query failed for "${params.handle}":`, error);
  }

  // If CMS page exists, use it (CMS always takes precedence)
  if (page) {
    redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});
    return {page, staticPage: null};
  }

  // Fall back to static placeholder content
  if (staticPage) {
    return {page: null, staticPage};
  }

  // Neither CMS nor static — 404
  throw new Response('Not Found', {status: 404});
}

/**
 * Load data for rendering content below the fold.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Page() {
  const data = useLoaderData<typeof loader>();

  // Render static placeholder page
  if (data.staticPage) {
    return <StaticPage page={data.staticPage as StaticPageData} />;
  }

  // Render CMS page with ZEHN styling
  const page = data.page as {title: string; body: string};
  return (
    <div className="min-h-screen bg-background">
      {/* Dark Hero */}
      <div className="bg-foreground text-primary-foreground py-16 sm:py-20 lg:pt-24 lg:pb-5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent/5" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-accent/[0.03]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb temporarily hidden
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-body font-sans text-primary-foreground/50 mb-6">
            <Link to="/" className="hover:text-primary-foreground/80 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-foreground/80 truncate max-w-[250px]">{page.title}</span>
          </nav>
            */}
          <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-primary-foreground">
            {page.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        <div
          dangerouslySetInnerHTML={{__html: page.body}}
          className="zehn-prose"
        />

        {/* Back Link */}
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

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
