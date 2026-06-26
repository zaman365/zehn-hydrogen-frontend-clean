import {redirect} from 'react-router';
import {ALLE_PARENT_MAP, MAIN_CATEGORY_MAP, resolveAlleCategory} from '~/lib/category-map';

/** Known root slugs that map to curated Shopify collections. */
const KNOWN_ROOTS = new Set(['shop-all', 'neuheiten', 'bestseller', 'sale']);

/**
 * Two-segment collection paths — both redirect to /collections/all with ?category= chip param:
 *  • /collections/{root}/{alle-parent} — e.g. /collections/neuheiten/alle-jacken
 *    → /collections/all?category={main}
 *  • /collections/{alle-parent}/{sub}  — e.g. /collections/alle-hosen/cargohosen
 *    → /collections/all?category={sub}
 *
 * Always targets /collections/all (full catalog) so curated roots (neuheiten/bestseller/sale)
 * never show an empty sub-category set. Eliminates duplicate Shopify query on leaf nav.
 */
export async function loader({
  params,
}: {
  params: Record<string, string | undefined>;
}) {
  const {parent, sub} = params;

  if (!parent || !sub) {
    throw redirect('/collections');
  }

  // /collections/{root}/{alle-parent} → chip pre-selected on same root
  // Curated roots (sale/neuheiten/bestseller) keep their product set; shop-all goes to /collections/all.
  if (KNOWN_ROOTS.has(parent) && sub in ALLE_PARENT_MAP) {
    // resolveAlleCategory maps 'alle-jacken' → 'jacken'; pass the main category as chip
    const categoryParam = resolveAlleCategory(sub) ?? sub;
    const targetBase =
      parent === 'shop-all' ? '/collections/all' : `/collections/${parent}`;
    throw redirect(`${targetBase}?category=${categoryParam}`);
  }

  if (!(parent in ALLE_PARENT_MAP)) {
    throw redirect('/collections');
  }

  const parentCat = ALLE_PARENT_MAP[parent];
  const validSubs = MAIN_CATEGORY_MAP[parentCat] ?? [];
  if (!validSubs.includes(sub)) {
    throw redirect(`/collections/${parent}`);
  }

  // /collections/{alle-parent}/{sub} → full catalog + chip pre-selected
  throw redirect(`/collections/all?category=${sub}`);
}

export {default} from '~/routes/collections.$handle';
