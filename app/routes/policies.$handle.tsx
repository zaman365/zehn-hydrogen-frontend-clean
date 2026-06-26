import {
  Link,
  useLoaderData,
  data as routeData,
} from 'react-router';
import type {Route} from './+types/policies.$handle';
import {getCachePolicy, CACHE_LONG} from '~/lib/storefront-cache-policy';
import {getOxygenPageCacheHeaders} from '~/lib/oxygen-page-cache';
import {staticShouldRevalidate} from '~/lib/route-revalidation';
import {type Shop} from '@shopify/hydrogen/storefront-api-types';
import {ChevronRight} from 'lucide-react';

type SelectedPolicies = keyof Pick<
  Shop,
  'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
>;

export const meta: Route.MetaFunction = ({data}) => {
  const policy = data?.policy;
  if (!policy) return [{title: 'Richtlinie | ZEHN'}];
  return [
    {title: `${policy.title} | ZEHN`},
    {
      name: 'description',
      content: `${policy.title} von ZEHN – Lesen Sie unsere ${policy.title}.`,
    },
  ];
};

export const shouldRevalidate = staticShouldRevalidate;

export async function loader({params, context}: Route.LoaderArgs) {
  if (!params.handle) {
    throw new Response('Kein Handle übergeben', {status: 404});
  }

  const policyName = params.handle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as SelectedPolicies;

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
    cache: getCachePolicy(context.storefront, CACHE_LONG),
  });

  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response('Richtlinie konnte nicht gefunden werden', {status: 404});
  }

  return routeData(
    {policy},
    {headers: getOxygenPageCacheHeaders('static')},
  );
}

export default function Policy() {
  const {policy} = useLoaderData<typeof loader>();

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
            <span>Rechtliches</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-foreground/80 truncate max-w-[200px]">{policy.title}</span>
          </nav>
            */}
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wider mb-4 bg-secondary/20 text-secondary">
            Rechtliches
          </span>
          <h1 className="font-sans text-h3 sm:text-h3-sm lg:text-h3-lg text-primary-foreground">
            {policy.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div
          dangerouslySetInnerHTML={{__html: policy.body}}
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

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
` as const;
