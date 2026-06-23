/**
 * Homepage sub-category block — content-width divider, responsive hint, main-style chips (ART-0042).
 * Optional Alle chip — all products in parent main category (ART-0043).
 */
import {CategoryNavChip} from '~/components/zehn/CategoryNavChip';
import {getCategoryLabel} from '~/lib/category-map';
import {SUB_ROW_ALLE_LABEL} from '~/lib/category-section-copy';
import {
  CATEGORY_NAV_SUB_BOTTOM_DIVIDER,
  CATEGORY_NAV_SUB_CHIPS,
  CATEGORY_NAV_SUB_DIVIDER,
  CATEGORY_NAV_SUB_HINT,
  CATEGORY_NAV_SUB_HINT_DESKTOP,
  CATEGORY_NAV_SUB_HINT_MOBILE,
  CATEGORY_NAV_SUB_ROW,
} from '~/lib/category-nav-sub-styles';
import type {CategoryNavInteraction} from '~/components/zehn/CategoryNavSection';
import type {CategorySubRowHint} from '~/lib/category-section-copy';
import {cn} from '~/lib/utils';

export type CategoryNavSubRowProps = {
  parentSlug: string;
  subcategories: Iterable<string>;
  selectedCategory: string;
  interaction: CategoryNavInteraction;
  chipVariant?: 'main' | 'sub';
  subRowHint?: CategorySubRowHint;
  /** First chip — reset to all products in parent main category. */
  showAlleChip?: boolean;
  /** Full-width separator below chips — desktop homepage toolbar (ART-0045). */
  showBottomSeparator?: boolean;
  onSelect?: (slug: string) => void;
  getSubHref?: (mainSlug: string, subSlug: string) => string;
  subHighlightActive?: boolean;
};

export function CategoryNavSubRow({
  parentSlug,
  subcategories,
  selectedCategory,
  interaction,
  chipVariant = 'main',
  subRowHint,
  showAlleChip = false,
  showBottomSeparator = false,
  onSelect,
  getSubHref,
  subHighlightActive = true,
}: CategoryNavSubRowProps) {
  const subs = Array.from(subcategories);

  if (subs.length === 0) return null;

  const chipInteraction =
    interaction === 'link' && getSubHref ? 'link' : 'filter';

  const renderChip = (slug: string, label: string, isActive: boolean) => (
    <CategoryNavChip
      key={slug}
      variant={chipVariant}
      active={isActive}
      label={label}
      interaction={chipInteraction}
      href={
        chipInteraction === 'link' && getSubHref
          ? getSubHref(parentSlug, slug)
          : undefined
      }
      onSelect={() => onSelect?.(slug)}
    />
  );

  return (
    <div className={CATEGORY_NAV_SUB_ROW}>
      <hr className={CATEGORY_NAV_SUB_DIVIDER} aria-hidden />
      {subRowHint && (
        <>
          <p className={cn(CATEGORY_NAV_SUB_HINT, CATEGORY_NAV_SUB_HINT_MOBILE)}>
            {subRowHint.mobile}
          </p>
          <p className={cn(CATEGORY_NAV_SUB_HINT, CATEGORY_NAV_SUB_HINT_DESKTOP)}>
            {subRowHint.desktop}
          </p>
        </>
      )}
      <div className={CATEGORY_NAV_SUB_CHIPS} role="group" aria-label="Unterkategorien">
        {showAlleChip &&
          renderChip(
            parentSlug,
            SUB_ROW_ALLE_LABEL,
            subHighlightActive && selectedCategory === parentSlug,
          )}
        {subs.map((subcategory) =>
          renderChip(
            subcategory,
            getCategoryLabel(subcategory),
            subHighlightActive && selectedCategory === subcategory,
          ),
        )}
      </div>
      {showBottomSeparator && (
        <hr className={CATEGORY_NAV_SUB_BOTTOM_DIVIDER} aria-hidden />
      )}
    </div>
  );
}
