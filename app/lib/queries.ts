export const PRODUCT_GRID_ITEM_FRAGMENT = `#graphql
  fragment ProductGridItem on Product {
    id
    handle
    title
    description
    productType
    tags
    featuredImage {
      id
      url
      altText
      width
      height
    }
    media(first: 50) {
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
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          id
          availableForSale
          image {
            url
            altText
            width
            height
          }
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
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
    variants(first: 50) {
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
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
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
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
    }
  }
` as const;

export const PRODUCT_GRID_QUERY = `#graphql
  ${PRODUCT_GRID_ITEM_FRAGMENT}
  query ProductGridQuery(
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    jeans: products(first: 20, sortKey: CREATED_AT, reverse: true, query: "tag:jeans OR product_type:jeans OR tag:denim OR product_type:denim") {
      nodes {
        ...ProductGridItem
      }
    }
    cargo: products(first: 20, sortKey: CREATED_AT, reverse: true, query: "tag:cargo OR product_type:cargo OR tag:pant OR product_type:pant") {
      nodes {
        ...ProductGridItem
      }
    }
    chino: products(first: 20, sortKey: CREATED_AT, reverse: true, query: "tag:chino OR product_type:chino") {
      nodes {
        ...ProductGridItem
      }
    }
    shorts: products(first: 20, sortKey: CREATED_AT, reverse: true, query: "tag:shorts OR product_type:shorts") {
      nodes {
        ...ProductGridItem
      }
    }
    tshirt: products(first: 20, sortKey: CREATED_AT, reverse: true, query: "tag:t-shirt OR product_type:t-shirt OR tag:tshirt OR product_type:tshirt") {
      nodes {
        ...ProductGridItem
      }
    }
    polo: products(first: 20, sortKey: CREATED_AT, reverse: true, query: "tag:polo OR product_type:polo OR tag:shirt OR product_type:shirt") {
      nodes {
        ...ProductGridItem
      }
    }
    jacket: products(first: 20, sortKey: CREATED_AT, reverse: true, query: "tag:jacket OR product_type:jacket") {
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
    cargoCollection: collection(handle: "cargo") {
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
    chinoCollection: collection(handle: "chino") {
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
    jacketCollection: collection(handle: "jacket") {
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

export const NAVBAR_COLLECTIONS_QUERY = `#graphql
  query NavbarCollections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    bestseller: collection(handle: "bestseller") {
      handle
      title
    }
    sale: collection(handle: "sale") {
      handle
      title
    }
    shopAll: collection(handle: "all") {
      handle
      title
    }
    neuheiten: collection(handle: "new-arrival") {
      handle
      title
    }
  }
` as const;

export type NavbarCollectionItem = {
  handle: string;
  title: string;
};

export type NavbarCollectionsQuery = {
  bestseller?: NavbarCollectionItem | null;
  sale?: NavbarCollectionItem | null;
  shopAll?: NavbarCollectionItem | null;
  neuheiten?: NavbarCollectionItem | null;
};

export type NavbarLink = {
  title: string;
  url: string;
};

export const transformNavbarCollections = (
  data: NavbarCollectionsQuery | null | undefined,
  fallbackItems: NavbarLink[],
): NavbarLink[] => {
  if (!data) return fallbackItems;

  const resolveItem = (
    item: NavbarCollectionItem | null | undefined,
    fallback: NavbarLink,
    urlOverride?: string,
  ): NavbarLink =>
    item?.handle
      ? {
          title: item.title,
          url: urlOverride ?? `/collections/${item.handle}`,
        }
      : fallback;

  return [
    resolveItem(data.bestseller, fallbackItems[0]),
    resolveItem(data.sale, fallbackItems[1]),
    resolveItem(data.shopAll, fallbackItems[2]),
    resolveItem(data.neuheiten, fallbackItems[3], '/collections/neuheiten'),
  ];
};
