import {redirect} from 'react-router';
import {
  getCategoryLabel,
  ALLE_PARENT_MAP,
  MAIN_CATEGORY_MAP,
} from '~/lib/category-map';
import {CATALOG_QUERY} from '~/routes/collections.all';
import {getCachePolicy, CACHE_SHORT} from '~/lib/storefront-cache-policy';

// Maps URL root slugs to Shopify collection handles (null = all products)
const ROOT_HANDLE_MAP: Record<string, string | null> = {
  'shop-all': null,
  'neuheiten': 'new-arrival',
  'bestseller': 'bestseller',
  'sale': 'sale',
};

export async function loader({
  params,
  context,
}: {
  params: Record<string, string | undefined>;
  context: any;
}) {
  const {root, parent, sub} = params;

  if (
    !root ||
    !parent ||
    !sub ||
    !(root in ROOT_HANDLE_MAP) ||
    !(parent in ALLE_PARENT_MAP)
  ) {
    throw redirect('/collections');
  }

  const parentCat = ALLE_PARENT_MAP[parent];
  const validSubs = MAIN_CATEGORY_MAP[parentCat] ?? [];
  if (!validSubs.includes(sub)) {
    throw redirect(`/collections/${root}/${parent}`);
  }

  const {products} = await context.storefront.query(CATALOG_QUERY, {
    variables: {first: 250},
    cache: getCachePolicy(context.storefront, CACHE_SHORT),
  });

  const categoryLabel = getCategoryLabel(sub);

  return {
    collection: {
      id: `virtual-${root}-${parent}-${sub}`,
      handle: `alle-${sub}`,
      title: categoryLabel,
      description: '',
      seo: {title: categoryLabel, description: ''},
      image: null,
      products: {nodes: products?.nodes ?? []},
    },
  };
}

export {default} from '~/routes/collections.$handle';
