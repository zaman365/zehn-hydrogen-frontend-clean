import {redirect} from 'react-router';
import {ALLE_PARENT_MAP, MAIN_CATEGORY_MAP} from '~/lib/category-map';

/** Known root slugs for this route — must match segment 1 of URL. */
const KNOWN_ROOTS = new Set(['shop-all', 'neuheiten', 'bestseller', 'sale']);

/**
 * Three-segment leaf route — validates params then redirects to /collections/all?category={sub}.
 * Always uses the full catalog so curated roots (neuheiten/bestseller/sale) never show
 * an empty sub-category set. Eliminates the duplicate Shopify query (was 954 ms).
 */
export async function loader({
  params,
}: {
  params: Record<string, string | undefined>;
}) {
  const {root, parent, sub} = params;

  if (
    !root ||
    !parent ||
    !sub ||
    !KNOWN_ROOTS.has(root) ||
    !(parent in ALLE_PARENT_MAP)
  ) {
    throw redirect('/collections');
  }

  const parentCat = ALLE_PARENT_MAP[parent];
  const validSubs = MAIN_CATEGORY_MAP[parentCat] ?? [];
  if (!validSubs.includes(sub)) {
    throw redirect(`/collections/${root}/${parent}`);
  }

  // For curated roots (sale/neuheiten/bestseller) stay on the curated collection so the
  // product set reflects that root (e.g. only Sale items).  shop-all redirects to /collections/all
  // (which maps to shop-all internally) so the full catalog chip filter works there too.
  const targetBase =
    root === 'shop-all' ? '/collections/all' : `/collections/${root}`;
  throw redirect(`${targetBase}?category=${sub}`);
}

export {default} from '~/routes/collections.$handle';
