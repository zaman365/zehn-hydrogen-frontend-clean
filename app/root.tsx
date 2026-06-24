import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  type ShouldRevalidateFunction,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import type {Route} from './+types/root';
// eslint-disable-next-line import/no-unresolved
import favicon from '/favicon-32x32.png';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import {NAVBAR_COLLECTIONS_QUERY} from '~/lib/queries';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import {PageLayout} from './components/PageLayout';
import {
  getMetaPixelNoScriptUrl,
  MetaPixelEvents,
} from '~/components/zehn/MetaPixelEvents';

export type RootLoader = typeof loader;

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  formMethod,
  currentUrl,
  nextUrl,
}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'dns-prefetch',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    /* Preload body weight — first text painted (nav links, product names, labels).
       crossOrigin required for CORS-compliant font fetch; matches @font-face CORS. */
    {
      rel: 'preload',
      href: '/fonts/space-grotesk/space-grotesk-variable.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
    /* Preload bold weight — hero headings, section titles, category nav titles.
       Separate file because latin-ext (umlauts) is in a different WOFF2 subset. */
    {
      rel: 'preload',
      href: '/fonts/inter/inter-variable.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
    {rel: 'icon', type: 'image/png', href: favicon},
  ];
}

export async function loader(args: Route.LoaderArgs) {
  const {storefront, env} = args.context;

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {
    ...deferredData,
    ...criticalData,
    metaPixelId: env.PUBLIC_META_PIXEL_ID || null,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [header, navbarCollections] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    storefront
      .query(NAVBAR_COLLECTIONS_QUERY, {
        cache: storefront.CacheLong(),
      })
      .catch((error: Error) => {
        console.error('ERROR fetching navbar collections:', error);
        return null;
      }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header, navbarCollections};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: Route.LoaderArgs) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error: Error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

export function Layout({children}: {children?: React.ReactNode}) {
  const nonce = useNonce();
  const data = useRouteLoaderData<RootLoader>('root');
  const metaPixelId = data?.metaPixelId;

  return (
    <html lang="de" translate="no">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#0F1426" />
        <meta name="application-name" content="ZEHN" translate="no" />
        <meta name="google" content="notranslate" />
        {/* Minimal critical CSS to prevent FOUC - only essential for animations */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical animation utilities */
              .opacity-0 { opacity: 0; }
              .transition-all { transition-property: all; }
              .duration-600 { transition-duration: 600ms; }
              .ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
              .scale-95 { transform: scale(0.95); }
              .scale-100 { transform: scale(1); }
              .-translate-y-2 { transform: translateY(-0.5rem); }
            `,
          }}
        />
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        {metaPixelId ? (
          <noscript>
            <img
              height="1"
              width="1"
              style={{display: 'none'}}
              alt=""
              src={getMetaPixelNoScriptUrl(metaPixelId)}
            />
          </noscript>
        ) : null}
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'ZEHN',
                url: 'https://zehn-oa.myshopify.com',
                logo: 'https://zehn-oa.myshopify.com/ZEHN_main_logo.png',
                sameAs: [
                  'https://instagram.com/zehn',
                  'https://facebook.com/zehn',
                  'https://linkedin.com/company/zehn',
                  'https://youtube.com/@zehn',
                  'https://pinterest.com/zehn',
                ],
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'customer service',
                  availableLanguage: ['German', 'English'],
                },
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'ZEHN',
                url: 'https://zehn-oa.myshopify.com',
                potentialAction: {
                  '@type': 'SearchAction',
                  target:
                    'https://zehn-oa.myshopify.com/search?q={search_term_string}',
                  'query-input': 'required name=search_term_string',
                },
              },
            ]),
          }}
        />
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <MetaPixelEvents pixelId={data.metaPixelId} />
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1 className="font-sans">Oops</h1>
      <h2 className="font-sans">{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}
