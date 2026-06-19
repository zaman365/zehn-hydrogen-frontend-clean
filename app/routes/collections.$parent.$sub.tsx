import {redirect} from 'react-router';
import {
  getCategoryLabel,
  ALLE_PARENT_MAP,
  MAIN_CATEGORY_MAP,
} from '~/lib/category-map';
import {CATALOG_QUERY} from '~/routes/collections.all';

const ROOT_HANDLE_MAP: Record<string, string | null> = {
  'shop-all': null,
  neuheiten: 'new-arrival',
  bestseller: 'bestseller',
  sale: 'sale',
};

export async function loader({
  params,
  context,
  request,
}: {
  params: Record<string, string | undefined>;
  context: any;
  request: Request;
}) {
  const {parent, sub} = params;

  if (!parent || !sub) {
    throw redirect('/collections');
  }

  if (parent in ROOT_HANDLE_MAP && sub in ALLE_PARENT_MAP) {
    const {products} = await context.storefront.query(CATALOG_QUERY, {
      variables: {first: 250},
    });

    const categoryLabel = getCategoryLabel(sub);
    return {
      collection: {
        id: `virtual-${parent}-${sub}`,
        handle: sub,
        title: categoryLabel,
        description: '',
        seo: {title: categoryLabel, description: ''},
        image: null,
        products: {nodes: products?.nodes ?? []},
      },
    };
  }

  if (!(parent in ALLE_PARENT_MAP)) {
    throw redirect('/collections');
  }

  const parentCat = ALLE_PARENT_MAP[parent];
  const validSubs = MAIN_CATEGORY_MAP[parentCat] ?? [];
  if (!validSubs.includes(sub)) {
    throw redirect(`/collections/${parent}`);
  }

  const url = new URL(request.url);
  throw redirect(`/collections/shop-all/${parent}/${sub}${url.search}`);
}

export {default} from '~/routes/collections.$handle';
