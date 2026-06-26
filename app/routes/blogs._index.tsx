import {
  Link,
  useLoaderData,
  data as routeData,
} from 'react-router';
import type {Route} from './+types/blogs._index';
import {getCachePolicy, CACHE_LONG} from '~/lib/storefront-cache-policy';
import {getOxygenPageCacheHeaders} from '~/lib/oxygen-page-cache';
import {staticShouldRevalidate} from '~/lib/route-revalidation';
import {resolveLinkPrefetch} from '~/lib/link-prefetch';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import type {BlogsQuery} from 'storefrontapi.generated';
import {ChevronRight} from 'lucide-react';

type BlogNode = BlogsQuery['blogs']['nodes'][0];

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Blog | ZEHN'},
    {
      name: 'description',
      content: 'ZEHN Blog – Entdecken Sie Neuigkeiten, Stil-Tipps und mehr.',
    },
    {property: 'og:type', content: 'blog'},
    {property: 'og:title', content: 'Blog | ZEHN'},
    {property: 'og:site_name', content: 'ZEHN'},
    {property: 'og:locale', content: 'de_DE'},
    {name: 'twitter:card', content: 'summary'},
  ];
};

export const shouldRevalidate = staticShouldRevalidate;

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return routeData(
    {...deferredData, ...criticalData},
    {headers: getOxygenPageCacheHeaders('static')},
  );
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 10,
  });

  const [{blogs}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {
        ...paginationVariables,
      },
      cache: getCachePolicy(context.storefront, CACHE_LONG),
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {blogs};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Blogs() {
  const {blogs} = useLoaderData<typeof loader>();

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
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-body font-body text-primary-foreground/50 mb-6">
            <Link to="/" className="hover:text-primary-foreground/80 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-foreground/80">Blog</span>
          </nav>
            */}
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-body font-semibold uppercase tracking-wider mb-4 bg-accent/10 text-accent">
            ZEHN Blog
          </span>
          <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-primary-foreground mb-3">
            Blog
          </h1>
          <p className="font-body text-subheadline sm:text-subheadline-sm text-primary-foreground/70 max-w-2xl">
            Einblicke, Stil-Tipps und Neuigkeiten aus der Welt von ZEHN
          </p>
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <PaginatedResourceSection<BlogNode> connection={blogs}>
            {({node: blog}) => (
              <Link
                key={blog.handle}
                prefetch={resolveLinkPrefetch('cta')}
                to={`/blogs/${blog.handle}`}
                className="group block rounded-2xl bg-card border border-border/10 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  <h2 className="font-sans text-h3 sm:text-h3-sm text-foreground group-hover:text-accent transition-colors">
                    {blog.title}
                  </h2>
                  {blog.seo?.description && (
                    <p className="font-body text-body text-foreground/60 mt-2 line-clamp-2">
                      {blog.seo.description}
                    </p>
                  )}
                </div>
              </Link>
            )}
          </PaginatedResourceSection>
        </div>
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog
const BLOGS_QUERY = `#graphql
  query Blogs(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    blogs(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        title
        handle
        seo {
          title
          description
        }
      }
    }
  }
` as const;
