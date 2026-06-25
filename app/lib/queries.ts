export const PRODUCT_GRID_ITEM_FRAGMENT = `#graphql
  fragment ProductGridItem on Product {
    id
    handle
    title
    productType
    tags
    featuredImage {
      id
      url
      altText
      width
      height
    }
    media(first: 8) {
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
    variants(first: 15) {
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
