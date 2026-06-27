import type {Route} from './+types/collections.all';
import type {ClientLoaderFunctionArgs} from 'react-router';
import {useLoaderData, useSearchParams, useLocation, useNavigate, data as routeData} from 'react-router';
import {getCachePolicy, CACHE_CATALOG} from '~/lib/storefront-cache-policy';
import {getOxygenPageCacheHeaders} from '~/lib/oxygen-page-cache';
import {catalogShouldRevalidate} from '~/lib/route-revalidation';
import {
  catalogClientLoader,
  catalogClientLoaderHydrate,
} from '~/lib/catalog-client-loader';
import {getCategoryLabel} from '~/lib/category-map';

import {getPaginationVariables} from '@shopify/hydrogen';
import {ProductItem} from '~/components/ProductItem';
import {
  resolveProductImageLoading,
  ZEHN_COLLECTION_GRID_ABOVE_FOLD_LIMIT,
} from '~/lib/zehn-product-image-loading';
import type {CollectionItemFragment} from 'storefrontapi.generated';
import {useCallback} from 'react';
import {useAboveFoldImageWarm} from '~/hooks/useAboveFoldImageWarm';
import {ShoppingBag} from 'lucide-react';
import {ProductCatalogBand} from '~/components/zehn/ProductCatalogBand';
import {ZEHN_HOMEPAGE_GRID_TOP} from '~/lib/homepage-section-styles';
import {useProductCatalogFilters} from '~/hooks/useProductCatalogFilters';
import {ZEHN_SITE_CONTENT_ROW} from '~/lib/site-content-row';
import type {CatalogFreshNavState} from '~/lib/catalog-band-context';

type FilterableProduct = CollectionItemFragment;

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Alle Produkte | ZEHN'},
    {
      name: 'description',
      content:
        'Entdecken Sie alle ZEHN Produkte – Premium Herrenmode für den modernen Mann.',
    },
    {tagName: 'link', rel: 'canonical', href: '/collections/all'},
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: 'Alle Produkte | ZEHN'},
    {
      property: 'og:description',
      content:
        'Entdecken Sie alle ZEHN Produkte – Premium Herrenmode für den modernen Mann.',
    },
    {property: 'og:url', content: '/collections/all'},
    {property: 'og:site_name', content: 'ZEHN'},
    {property: 'og:locale', content: 'de_DE'},
    {name: 'twitter:card', content: 'summary'},
    {name: 'twitter:title', content: 'Alle Produkte | ZEHN'},
    {
      name: 'twitter:description',
      content:
        'Entdecken Sie alle ZEHN Produkte – Premium Herrenmode für den modernen Mann.',
    },
  ];
};

export const shouldRevalidate = catalogShouldRevalidate;

export async function clientLoader(args: ClientLoaderFunctionArgs) {
  return catalogClientLoader<Awaited<ReturnType<typeof loader>>>(args);
}
clientLoader.hydrate = catalogClientLoaderHydrate;

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return routeData(
    {...deferredData, ...criticalData},
    {headers: getOxygenPageCacheHeaders('catalog')},
  );
}

async function loadCriticalData({context, request}: Route.LoaderArgs) {
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 250,
  });

  const [{products}] = await Promise.all([
    storefront.query(CATALOG_QUERY, {
      variables: {...paginationVariables},
      cache: getCachePolicy(storefront, CACHE_CATALOG),
    }),
  ]);
  return {products};
}

function loadDeferredData({context}: Route.LoaderArgs) {
  return {};
}

export default function Collection() {
  const {products} = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const {pathname, state: locationState} = useLocation();
  const navigate = useNavigate();
  const catalogFresh = Boolean(
    (locationState as CatalogFreshNavState | null)?.catalogFresh,
  );
  const allProducts: FilterableProduct[] = products.nodes ?? [];

  const handleCatalogFreshConsumed = useCallback(() => {
    if (!catalogFresh) return;
    void navigate(
      {
        pathname,
        search: searchParams.toString()
          ? `?${searchParams.toString()}`
          : '',
      },
      {replace: true, state: null},
    );
  }, [catalogFresh, navigate, pathname, searchParams]);

  const filterState = useProductCatalogFilters({
    mode: 'collection',
    baseProducts: allProducts,
    alwaysShowFacetToolbar: true,
    curatedMainToggle: true,
    routeSync: {
      pathname,
      collectionHandle: 'shop-all',
      catalogFresh,
      searchCategory: searchParams.get('category') ?? '',
    },
    onCatalogFreshConsumed: handleCatalogFreshConsumed,
  });

  const {selectedCategory, displayProducts, showFacetToolbar} = filterState;

  useAboveFoldImageWarm(products.nodes);

  return (
    <div className="pt-3 sm:pt-6 lg:pt-12 pb-20">
      <div className={ZEHN_SITE_CONTENT_ROW}>
        <ProductCatalogBand
          pageContext="shop-all"
          navVariant="default"
          filterState={filterState}
          showFilterToolbar={showFacetToolbar}
          showMainAlleChip
          curatedMainToggle
        />

        <div className={`${ZEHN_HOMEPAGE_GRID_TOP} grid sm:grid-cols-2 lg:grid-cols-3 gap-3`}>
          {displayProducts.map((product, index) => {
            const imageContext =
              index < ZEHN_COLLECTION_GRID_ABOVE_FOLD_LIMIT
                ? 'gridAboveFold'
                : 'gridBelowFold';
            const imageLoad = resolveProductImageLoading(imageContext, index, {
              aboveFoldLimit: ZEHN_COLLECTION_GRID_ABOVE_FOLD_LIMIT,
            });

            return (
            <ProductItem
              key={product.id}
              product={product as FilterableProduct}
              loading={imageLoad.loading}
              priority={imageLoad.priority}
              isLCP={imageLoad.isLCP}
              index={index}
            />
            );
          })}
        </div>

        {displayProducts.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 mx-auto bg-muted/20 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-muted" />
              </div>
              <div className="space-y-3">
                <h3 className="font-sans text-h3 text-foreground">
                  {selectedCategory
                    ? `Keine ${getCategoryLabel(selectedCategory)} verfügbar`
                    : 'Coming Soon'}
                </h3>
                <p className="font-sans text-body text-muted">
                  {selectedCategory
                    ? `Derzeit sind keine ${getCategoryLabel(selectedCategory)} Produkte verfügbar.`
                    : 'Wir arbeiten daran, Ihnen tolle Produkte anzubieten. Bleiben Sie dran!'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const COLLECTION_ITEM_FRAGMENT = `#graphql
  fragment MoneyCollectionItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment CollectionItem on Product {
    id
    handle
    title
    tags
    featuredImage {
      id
      altText
      url
      width
      height
    }
    media(first: 20) {
      nodes {
        ... on MediaImage {
          id
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
    priceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyCollectionItem
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          image {
            url
            altText
            width
            height
          }
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    variants(first: 25) {
      nodes {
        id
        availableForSale
        title
        image {
          url
          altText
          width
          height
        }
        price {
          ...MoneyCollectionItem
        }
        compareAtPrice {
          ...MoneyCollectionItem
        }
        selectedOptions {
          name
          value
        }
      }
    }
    selectedOrFirstAvailableVariant {
      id
      availableForSale
      image {
        url
        altText
        width
        height
      }
      price {
        ...MoneyCollectionItem
      }
      compareAtPrice {
        ...MoneyCollectionItem
      }
      selectedOptions {
        name
        value
      }
    }
  }
` as const;

export const CATALOG_QUERY = `#graphql
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...CollectionItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${COLLECTION_ITEM_FRAGMENT}
` as const;
