import {useLoaderData} from 'react-router';
import type {Route} from './+types/_index';
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

  const data = await storefront.query(HOMEPAGE_QUERY);
  const fallbackHosenCollection = data.hosenCollections?.nodes?.find((collection: any) => {
    const handle = collection?.handle?.toLowerCase();
    const title = collection?.title?.toLowerCase();
    return handle === 'hosen' || title === 'hosen';
  });
  const fallbackShortsCollection = data.shortsCollections?.nodes?.find((collection: any) => {
    const handle = collection?.handle?.toLowerCase();
    const title = collection?.title?.toLowerCase();
    return handle === 'shorts' || title === 'shorts';
  });
  const fallbackTopsCollection = data.topsCollections?.nodes?.find((collection: any) => {
    const handle = collection?.handle?.toLowerCase();
    const title = collection?.title?.toLowerCase();
    return handle === 'tops' || title === 'tops';
  });
  const fallbackJeansCollection = data.jeansCollections?.nodes?.find((collection: any) => {
    const handle = collection?.handle?.toLowerCase();
    const title = collection?.title?.toLowerCase();
    return handle === 'jeans' || title === 'jeans';
  });
  const fallbackJackenCollection = data.jackenCollections?.nodes?.find((collection: any) => {
    const handle = collection?.handle?.toLowerCase();
    const title = collection?.title?.toLowerCase();
    return handle === 'jacken' || title === 'jacken';
  });

  const allProducts = data.products?.nodes || [];
  const shortsProducts =
    data.shortsCollection?.products?.nodes ||
    fallbackShortsCollection?.products?.nodes ||
    data.shortsProducts?.nodes ||
    [];
  const hosenProducts =
    data.hosenCollection?.products?.nodes ||
    fallbackHosenCollection?.products?.nodes ||
    data.hosenProducts?.nodes ||
    [];
  const topsProducts =
    data.topsCollection?.products?.nodes ||
    fallbackTopsCollection?.products?.nodes ||
    data.topsProducts?.nodes ||
    [];
  const jeansProducts =
    data.jeansCollection?.products?.nodes ||
    fallbackJeansCollection?.products?.nodes ||
    data.jeansProducts?.nodes ||
    [];
  const jackenProducts =
    data.jackenCollection?.products?.nodes ||
    fallbackJackenCollection?.products?.nodes ||
    data.jackenProducts?.nodes ||
    [];

  return {
    allProducts,
    bestsellerProducts: data.bestsellerCollection?.products?.nodes || [],
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
            ...(data.summerProducts?.nodes || []),
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
            ...(data.longPantsProducts?.nodes || []),
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
            ...(data.transitionJacketsProducts?.nodes || []),
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
    summerProducts: products(
      first: 50
      sortKey: CREATED_AT
      reverse: true
      query: "tag:sommer OR tag:summer OR tag:shorts OR tag:short OR tag:bermuda OR tag:t-shirt OR tag:tshirt OR tag:polo OR tag:poloshirt OR product_type:shorts OR product_type:t-shirt OR product_type:tshirt OR product_type:polo OR product_type:poloshirt"
    ) {
      nodes {
        ...ProductGridItem
      }
    }
    longPantsProducts: products(
      first: 50
      sortKey: CREATED_AT
      reverse: true
      query: "tag:langehose OR tag:lange-hose OR tag:hose OR tag:hosen OR tag:pants OR tag:cargo OR tag:cargohose OR tag:chino OR tag:chinohose OR tag:jeans OR tag:denim OR product_type:hose OR product_type:hosen OR product_type:pants OR product_type:cargo OR product_type:chino OR product_type:jeans OR product_type:denim"
    ) {
      nodes {
        ...ProductGridItem
      }
    }
    transitionJacketsProducts: products(
      first: 50
      sortKey: CREATED_AT
      reverse: true
      query: "tag:übergangsjacke OR tag:übergangsjacken OR tag:uebergangsjacke OR tag:uebergangsjacken OR tag:transition OR tag:herbst OR tag:autumn OR product_type:übergangsjacke OR product_type:uebergangsjacke"
    ) {
      nodes {
        ...ProductGridItem
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
    shortsCollection: collection(handle: "shorts") {
      id
      handle
      title
      products(first: 50) {
        nodes {
          ...ProductGridItem
        }
      }
    }
    shortsCollections: collections(first: 10, query: "title:shorts OR handle:shorts") {
      nodes {
        id
        handle
        title
        products(first: 50) {
          nodes {
            ...ProductGridItem
          }
        }
      }
    }
    shortsProducts: products(
      first: 50
      sortKey: CREATED_AT
      reverse: true
      query: "tag:shorts OR tag:short OR tag:bermuda OR tag:kurze OR tag:kurzehose OR product_type:shorts OR product_type:short OR product_type:bermuda OR product_type:kurze OR product_type:kurzehose"
    ) {
      nodes {
        ...ProductGridItem
      }
    }
    hosenCollection: collection(handle: "hosen") {
      id
      handle
      title
      products(first: 50) {
        nodes {
          ...ProductGridItem
        }
      }
    }
    hosenProducts: products(
      first: 50
      sortKey: CREATED_AT
      reverse: true
      query: "tag:hose OR tag:hosen OR tag:pants OR tag:cargo OR tag:cargos OR tag:cargohose OR tag:chino OR tag:chinos OR tag:chinohose OR tag:jogging OR tag:jeans OR tag:jean OR tag:denim OR product_type:hose OR product_type:hosen OR product_type:pants OR product_type:cargo OR product_type:chino OR product_type:jogging OR product_type:jeans OR product_type:denim"
    ) {
      nodes {
        ...ProductGridItem
      }
    }
    hosenCollections: collections(first: 10, query: "title:hosen OR handle:hosen") {
      nodes {
        id
        handle
        title
        products(first: 50) {
          nodes {
            ...ProductGridItem
          }
        }
      }
    }
    topsCollection: collection(handle: "tops") {
      id
      handle
      title
      products(first: 50) {
        nodes {
          ...ProductGridItem
        }
      }
    }
    topsCollections: collections(first: 10, query: "title:tops OR handle:tops") {
      nodes {
        id
        handle
        title
        products(first: 50) {
          nodes {
            ...ProductGridItem
          }
        }
      }
    }
    topsProducts: products(
      first: 50
      sortKey: CREATED_AT
      reverse: true
      query: "tag:top OR tag:tops OR tag:shirt OR tag:shirts OR tag:t-shirt OR tag:tshirt OR tag:polo OR tag:poloshirt OR product_type:top OR product_type:tops OR product_type:shirt OR product_type:t-shirt OR product_type:polo OR product_type:poloshirt"
    ) {
      nodes {
        ...ProductGridItem
      }
    }
    jeansCollection: collection(handle: "jeans") {
      id
      handle
      title
      products(first: 50) {
        nodes {
          ...ProductGridItem
        }
      }
    }
    jeansCollections: collections(first: 10, query: "title:jeans OR handle:jeans") {
      nodes {
        id
        handle
        title
        products(first: 50) {
          nodes {
            ...ProductGridItem
          }
        }
      }
    }
    jeansProducts: products(
      first: 50
      sortKey: CREATED_AT
      reverse: true
      query: "tag:jeans OR tag:jean OR tag:denim OR product_type:jeans OR product_type:jean OR product_type:denim"
    ) {
      nodes {
        ...ProductGridItem
      }
    }
    jackenCollection: collection(handle: "jacken") {
      id
      handle
      title
      products(first: 50) {
        nodes {
          ...ProductGridItem
        }
      }
    }
    jackenCollections: collections(first: 10, query: "title:jacken OR handle:jacken") {
      nodes {
        id
        handle
        title
        products(first: 50) {
          nodes {
            ...ProductGridItem
          }
        }
      }
    }
    jackenProducts: products(
      first: 50
      sortKey: CREATED_AT
      reverse: true
      query: "tag:jacke OR tag:jacken OR tag:jacket OR tag:jackets OR tag:winterjacke OR tag:winterjacken OR tag:übergangsjacke OR tag:uebergangsjacke OR tag:puffer OR product_type:jacke OR product_type:jacken OR product_type:jacket OR product_type:winterjacke OR product_type:übergangsjacke OR product_type:puffer"
    ) {
      nodes {
        ...ProductGridItem
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
  }
` as const;
