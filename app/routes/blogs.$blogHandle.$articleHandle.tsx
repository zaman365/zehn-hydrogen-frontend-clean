import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle.$articleHandle';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ChevronRight} from 'lucide-react';

export const meta: Route.MetaFunction = ({data}) => {
  const article = data?.article;
  if (!article) return [{title: 'Artikel | ZEHN'}];
  const description =
    article.seo?.description || article.excerpt || `${article.title} – ZEHN Blog.`;
  const image = article.image;
  return [
    {title: `${article.seo?.title || article.title} | ZEHN Blog`},
    {name: 'description', content: description},
    {
      tagName: 'link',
      rel: 'canonical',
      href: `/blogs/${article.blog?.handle || 'journal'}/${article.handle}`,
    },
    {property: 'og:type', content: 'article'},
    {property: 'og:title', content: article.title},
    {property: 'og:description', content: description},
    {property: 'og:site_name', content: 'ZEHN'},
    {property: 'og:locale', content: 'de_DE'},
    ...(image
      ? [
          {property: 'og:image', content: image.url},
          {property: 'og:image:alt', content: image.altText || article.title},
        ]
      : []),
    ...(article.publishedAt
      ? [{property: 'article:published_time', content: article.publishedAt}]
      : []),
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: article.title},
    {name: 'twitter:description', content: description},
    ...(image ? [{name: 'twitter:image', content: image.url}] : []),
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const {blogHandle, articleHandle} = params;

  if (!articleHandle || !blogHandle) {
    throw new Response('Nicht gefunden', {status: 404});
  }

  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {
      variables: {blogHandle, articleHandle},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!blog?.articleByHandle) {
    throw new Response('Nicht gefunden', {status: 404});
  }

  redirectIfHandleIsLocalized(
    request,
    {
      handle: articleHandle,
      data: blog.articleByHandle,
    },
    {
      handle: blogHandle,
      data: blog,
    },
  );

  const article = blog.articleByHandle;

  return {article};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Article() {
  const {article} = useLoaderData<typeof loader>();
  const {title, image, contentHtml, author} = article;

  const publishedDate = new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(article.publishedAt));

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
            <Link to="/blogs" className="hover:text-primary-foreground/80 transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            {article.blog?.handle && (
              <>
                <Link to={`/blogs/${article.blog.handle}`} className="hover:text-primary-foreground/80 transition-colors">
                  {article.blog.handle}
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
            <span className="text-primary-foreground/80 truncate max-w-[200px]">{title}</span>
          </nav>
            */}
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-body font-semibold uppercase tracking-wider mb-4 bg-accent/10 text-accent">
            Artikel
          </span>
          <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-primary-foreground mb-4">
            {title}
          </h1>
          <div className="flex items-center gap-3 font-body text-body text-primary-foreground/60">
            <time dateTime={article.publishedAt}>{publishedDate}</time>
            {author?.name && (
              <>
                <span>·</span>
                <span>{author.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Article Image */}
      {image && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <Image data={image} sizes="(min-width: 1024px) 56rem, 90vw" loading="eager" className="w-full" />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div
          dangerouslySetInnerHTML={{__html: contentHtml}}
          className="zehn-prose"
        />
      </div>

      {/* JSON-LD (preserve existing) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            ...(article.image ? {image: article.image.url} : {}),
            datePublished: article.publishedAt,
            author: {
              '@type': 'Person',
              name: article.author?.name || 'ZEHN',
            },
            publisher: {
              '@type': 'Organization',
              name: 'ZEHN',
              logo: {
                '@type': 'ImageObject',
                url: '/ZEHN_main_logo.png',
              },
            },
            description: article.seo?.description || article.excerpt || '',
          }),
        }}
      />
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/blog#field-blog-articlebyhandle
const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle
        title
        excerpt
        contentHtml
        publishedAt
        author: authorV2 {
          name
        }
        blog {
          handle
        }
        image {
          id
          altText
          url
          width
          height
        }
        seo {
          description
          title
        }
      }
    }
  }
` as const;
