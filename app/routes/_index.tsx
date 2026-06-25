import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
import {getCachePolicy, CACHE_SHORT} from '~/lib/storefront-cache-policy';
import {Hero} from '~/components/zehn/Hero';
import {TrustBadges} from '~/components/zehn/TrustBadges';
// import {CategoryTiles} from '~/components/zehn/CategoryTiles';
import {ProductGrid} from '~/components/zehn/ProductGrid';
import {FeaturedBento} from '~/components/zehn/FeaturedBento';
import {Testimonials} from '~/components/zehn/Testimonials';
import {ContactBar} from '~/components/zehn/ContactBar';
import {PRODUCT_GRID_ITEM_FRAGMENT} from '~/lib/queries';

const uniqueProducts = (products: any[]) => {
  const productMap = new Map<string, any>();

  products.forEach((product) => {
    const key = product?.id || product?.handle;
    if (key && !productMap.has(key)) {
      productMap.set(key, product);
    }
  });

  return Array.from(productMap.values());
};

const productHasAnyKeyword = (product: any, keywords: string[]) => {
  const searchableValues = [
    product?.productType,
    product?.title,
    product?.handle,
    ...(product?.tags || []),
  ]
    .filter(Boolean)
    .map((value: string) => value.toLowerCase());

  return searchableValues.some((value) =>
    keywords.some((keyword) => value.includes(keyword)),
  );
};

const isSummerProduct = (product: any) =>
  productHasAnyKeyword(product, [
    'sommer',
    'summer',
    'short',
    'kurze',
    'bermuda',
    't-shirt',
    'tshirt',
    'tee',
    'polo',
    'poloshirt',
  ]);

const isLongPantsProduct = (product: any) =>
  productHasAnyKeyword(product, [
    'langehose',
    'lange-hose',
    'long pant',
    'long-pant',
    'hose',
    'hosen',
    'pants',
    'cargo',
    'chino',
    'jeans',
    'denim',
  ]) &&
  !productHasAnyKeyword(product, [
    'short',
    'shorts',
    'kurze',
    'kurzehose',
    'bermuda',
  ]);

const isTransitionJacketProduct = (product: any) =>
  productHasAnyKeyword(product, [
    'übergang',
    'uebergang',
    'transition',
    'spring',
    'herbst',
    'autumn',
  ]) &&
  productHasAnyKeyword(product, ['jacke', 'jacken', 'jacket', 'coat']);

const isUpperBodyProduct = (product: any) =>
  productHasAnyKeyword(product, [
    't-shirt',
    'tshirt',
    'tee',
    'poloshirt',
    'polo',
  ]);

const isShortsProduct = (product: any) =>
  productHasAnyKeyword(product, [
    'short',
    'shorts',
    'bermuda',
    'kurze',
    'kurzehose',
    'cargo-short',
    'chino-short',
  ]);

const isJeansProduct = (product: any) =>
  productHasAnyKeyword(product, ['jeans', 'jean', 'denim']);

const isJacketProduct = (product: any) =>
  productHasAnyKeyword(product, [
    'jacke',
    'jacken',
    'jacket',
    'jackets',
    'puffer',
    'steppjacke',
    'winterjacke',
    'bomberjacke',
    'padded',
  ]);

const sortProductsByNameSequence = (
  products: any[],
  sequence: string[][],
) => {
  const normalizedSequence = sequence.map((names) =>
    names.map((name) => name.toLowerCase()),
  );
  const matchesName = (searchText: string, name: string) => {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${escapedName}([^a-z0-9]|$)`, 'i').test(
      searchText,
    );
  };
  const getSequenceIndex = (searchText: string) => {
    let bestMatch = {
      index: Number.MAX_SAFE_INTEGER,
      nameLength: -1,
    };

    normalizedSequence.forEach((names, index) => {
      names.forEach((name) => {
        if (!matchesName(searchText, name)) return;

        if (
          name.length > bestMatch.nameLength ||
          (name.length === bestMatch.nameLength && index < bestMatch.index)
        ) {
          bestMatch = {index, nameLength: name.length};
        }
      });
    });

    return bestMatch.index;
  };

  return [...products].sort((a, b) => {
    const aTitle = `${a?.title || ''} ${a?.handle || ''}`.toLowerCase();
    const bTitle = `${b?.title || ''} ${b?.handle || ''}`.toLowerCase();
    const normalizedAIndex = getSequenceIndex(aTitle);
    const normalizedBIndex = getSequenceIndex(bTitle);

    if (normalizedAIndex !== normalizedBIndex) {
      return normalizedAIndex - normalizedBIndex;
    }

    return 0;
  });
};

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'ZEHN | Premium Fashion mit Substanz'},
    {name: 'description', content: 'ZEHN – Premium Fashion mit Substanz. Entdecken Sie hochwertige Poloshirts, Cargohosen, Chinohosen und Winterjacken.'},
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: 'ZEHN | Premium Fashion mit Substanz'},
    {property: 'og:description', content: 'Premium Fashion mit Substanz. Qualität, die man fühlt – Stil, den man sieht.'},
    {property: 'og:site_name', content: 'ZEHN'},
    {property: 'og:locale', content: 'de_DE'},
    {name: 'twitter:card', content: 'summary_large_image'},
    {name: 'twitter:title', content: 'ZEHN | Premium Fashion mit Substanz'},
    {name: 'twitter:description', content: 'Premium Fashion mit Substanz. Qualität, die man fühlt – Stil, den man sieht.'},
  ];
};

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;

  // Single GraphQL call — all category arrays derived in JS from allProducts.
  const data = await storefront.query(HOMEPAGE_QUERY, {
    cache: getCachePolicy(storefront, CACHE_SHORT),
  });

  const allProducts = data.products?.nodes || [];
  const bestsellerProducts = data.bestsellerCollection?.products?.nodes || [];

  // Derive category arrays from the single allProducts list — no extra API calls.
  const shortsProducts = allProducts.filter(isShortsProduct);
  const hosenProducts = allProducts.filter(isLongPantsProduct);
  const topsProducts = allProducts.filter(isUpperBodyProduct);
  const jeansProducts = allProducts.filter(isJeansProduct);
  const jackenProducts = allProducts.filter(isJacketProduct);

  return {
    allProducts,
    bestsellerProducts,
    shortsProducts,
    hosenProducts,
    topsProducts,
    jeansProducts,
    jackenProducts,
    homepageSliderSections: [
      {
        id: 'sommerseite',
        title: 'Sommerseite',
        products: sortProductsByNameSequence(
          uniqueProducts([
            ...shortsProducts,
            ...topsProducts,
            ...allProducts.filter(isSummerProduct),
          ]),
          [
            ['Stride'],
            ['Outpost'],
            ['Harbour', 'Harbor'],
            ['Vector'],
            ['Core'],
            ['Forge'],
            ['Traverse'],
          ],
        ),
      },
      {
        id: 'bein-fuer-bein',
        title: 'Bein für Bein',
        products: sortProductsByNameSequence(
          uniqueProducts([
            ...hosenProducts,
            ...jeansProducts,
            ...allProducts.filter(isLongPantsProduct),
          ]).filter(isLongPantsProduct),
          [
            ['Rivet'],
            ['Adaptive'],
            ['Signature'],
            ['Signature Canvas'],
            ['Reinforced'],
            ['Adaptive Canvas'],
          ],
        ),
      },
      {
        id: 'uebergangsjacken',
        title: 'Übergangsjacken',
        products: sortProductsByNameSequence(
          uniqueProducts([
            ...jackenProducts.filter(isTransitionJacketProduct),
            ...allProducts.filter(isTransitionJacketProduct),
          ]).filter(isTransitionJacketProduct),
          [['Falcon'], ['Aero'], ['Drift']],
        ),
      },
      {
        id: 'oberteile',
        title: 'Oberteile',
        products: sortProductsByNameSequence(
          uniqueProducts([
            ...topsProducts,
            ...allProducts.filter(isUpperBodyProduct),
          ]).filter(isUpperBodyProduct),
          [['Core'], ['Vector'], ['Contour'], ['Axis'], ['Forge']],
        ),
      },
    ],
    collections: {
      polo: data.poloCollection,
      bestseller: data.bestsellerCollection,
      neuheiten: data.neuheitenCollection,
      sale: data.saleCollection,
    },
  };
}

export default function Homepage() {
  const {
    allProducts,
    bestsellerProducts,
    shortsProducts,
    hosenProducts,
    topsProducts,
    jeansProducts,
    jackenProducts,
    homepageSliderSections,
    collections,
  } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-background">
      <section data-homepage-hero-fold>
        <Hero />
      </section>
      <TrustBadges />
      <ProductGrid
        allProducts={allProducts}
        bestsellerProducts={bestsellerProducts}
        shortsProducts={shortsProducts}
        hosenProducts={hosenProducts}
        topsProducts={topsProducts}
        jeansProducts={jeansProducts}
        jackenProducts={jackenProducts}
        featuredSections={homepageSliderSections}
      />
      {/* Category tiles hidden for future use.
      <CategoryTiles
        tiles={[
          {
            title: collections.bestseller?.title || "Best Seller",
            subtitle: "Top Picks",
            image: collections.bestseller?.image?.url?.trim() ? collections.bestseller.image.url : "/bento-bestsellers.jpg",
            fallbackImage: "/bento-bestsellers.jpg",
            link: `/collections/${collections.bestseller?.handle || 'bestseller'}`
          },
          {
            title: collections.neuheiten?.title || "NEUHEITEN",
            subtitle: "Fresh Styles",
            image: collections.neuheiten?.image?.url?.trim() ? collections.neuheiten.image.url : "/bento-new-arrivals.jpg",
            fallbackImage: "/bento-new-arrivals.jpg",
            link: '/collections/neuheiten'
          },
          {
            title: collections.sale?.title || "Sale",
            subtitle: "Special Offers",
            image: collections.sale?.image?.url?.trim() ? collections.sale.image.url : "/bento-sale.jpg",
            fallbackImage: "/bento-sale.jpg",
            link: `/collections/${collections.sale?.handle || 'sale'}`
          }
        ]}
      />
      */}
      {/* NEUHEITEN Banner (commented out for future use)
      <section className="w-full pt-4 sm:pt-0 sm:pb-3 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="block sm:hidden relative w-full h-[190px] rounded-2xl overflow-hidden">
            <img
              src="/newarrivalbanner.jpg"
              alt="ZEHN NEUHEITEN Collection"
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 pt-8 pb-3 px-4 bg-gradient-to-t from-black/50 via-black/20 to-transparent">
              <p className="font-body text-xs tracking-[0.3em] uppercase text-white">NEUHEITEN</p>
              <h2 className="font-sans text-lg font-bold text-white">Fresh Styles</h2>
            </div>
          </div>

          <div className="hidden sm:block relative w-full sm:h-[280px] lg:h-[450px] overflow-hidden rounded-2xl">
            <img
              src="/newarrivalbanner.jpg"
              alt="ZEHN NEUHEITEN Collection"
              className="absolute inset-0 w-full h-full object-cover object-center"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center">
              <div className="w-full max-w-md px-8 lg:px-12">
                <div className="space-y-3">
                  <p className="font-body text-sm tracking-[0.3em] uppercase text-accent">
                    NEUHEITEN
                  </p>
                  <h2 className="font-sans sm:text-h2-sm lg:text-h2-lg text-foreground">
                    Fresh Styles
                  </h2>
                  <p className="font-body text-body text-foreground/80 max-w-xs">
                    Entdecken Sie die neuesten Kollektionen
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}
      <FeaturedBento />
      <Testimonials />
      <ContactBar />
    </div>
  );
}

/**
 * Single GraphQL query for the homepage.
 * Products are fetched once; category arrays are derived in JS via filter functions.
 * Collapsed from 20+ redundant sub-queries to reduce response from ~1 MB to ~150-250 KB.
 */
const HOMEPAGE_QUERY = `#graphql
  ${PRODUCT_GRID_ITEM_FRAGMENT}
  query HomepageQuery(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: 50, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...ProductGridItem
      }
    }
    bestsellerCollection: collection(handle: "bestseller") {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
      products(first: 50) {
        nodes {
          ...ProductGridItem
        }
      }
    }
    neuheitenCollection: collection(handle: "new-arrival") {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
    }
    saleCollection: collection(handle: "sale") {
      id
      handle
      title
      description
      image {
        url
        altText
        width
        height
      }
    }
    poloCollection: collection(handle: "polo") {
      id
      handle
      title
      image {
        url
        altText
        width
        height
      }
    }
  }
` as const;
