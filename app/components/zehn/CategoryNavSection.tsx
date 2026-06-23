/**
 * Shared category nav — header + main/sub chips (REQ-0007 / REQ-0008).
 * Used on homepage ProductGrid and collection routes.
 */
import type {Ref} from 'react';
import {CategoryNavChip} from '~/components/zehn/CategoryNavChip';
import {CategoryNavSubRow} from '~/components/zehn/CategoryNavSubRow';
import {getCategoryLabel} from '~/lib/category-map';
import {
  CATEGORY_NAV_CHIPS,
  CATEGORY_NAV_CHIPS_SUB,
  CATEGORY_NAV_HEADER,
  CATEGORY_NAV_HEADER_SPOTLIGHT,
  CATEGORY_NAV_SECTION,
  CATEGORY_NAV_SECTION_HOME,
  CATEGORY_NAV_STACK_GAP,
  CATEGORY_NAV_SUBTITLE,
  CATEGORY_NAV_SUBTITLE_SPOTLIGHT,
  CATEGORY_NAV_SUBTITLE_TYPO,
  CATEGORY_NAV_TITLE,
  CATEGORY_NAV_TITLE_HOME,
  CATEGORY_NAV_TITLE_SPOTLIGHT,
  CATEGORY_NAV_TITLE_TYPO,
  CATEGORY_NAV_TITLE_TYPO_HOME,
  type CategoryNavVariant,
} from '~/lib/category-nav-styles';
import type {CategorySectionCopy, CategorySubRowHint} from '~/lib/category-section-copy';
import {cn} from '~/lib/utils';

export type CategoryNavInteraction = 'filter' | 'link';

export type CategoryNavSubPresentation = 'chips' | 'subRow';

export type {CategoryNavVariant} from '~/lib/category-nav-styles';

export type CategoryNavSectionProps = {
  copy: CategorySectionCopy;
  /** Homepage: sentence-case title + band spacing via ProductGrid shell */
  variant?: CategoryNavVariant;
  mainCategories: Map<string, Set<string>>;
  activeMainCategory: string;
  selectedCategory: string;
  showMainRow?: boolean;
  mainInteraction: CategoryNavInteraction;
  subInteraction: CategoryNavInteraction;
  /** Curated pages: re-click active main clears selection */
  curatedMainToggle?: boolean;
  onMainSelect?: (slug: string) => void;
  onSubSelect?: (slug: string) => void;
  getMainHref?: (slug: string) => string;
  getSubHref?: (mainSlug: string, subSlug: string) => string;
  /** Which main category's subs to render (defaults to activeMainCategory) */
  subcategoriesFor?: string;
  /** Sub row UI — subRow on homepage (divider + hint), chips on collection pages */
  subPresentation?: CategoryNavSubPresentation;
  /** Chip size in sub row when subPresentation is subRow */
  subChipVariant?: 'main' | 'sub';
  /** Responsive hint below divider (homepage subRow) */
  subRowHint?: CategorySubRowHint;
  /** Sub-row Alle chip — all products in parent main category (homepage). */
  showSubAlleChip?: boolean;
  /** Separator below sub chips — homepage desktop (ART-0045). */
  showSubBottomSeparator?: boolean;
  /** Highlight active sub chip (false for sibling-only rows) */
  subHighlightActive?: boolean;
  className?: string;
  menuRef?: Ref<HTMLDivElement>;
};

function isMainActive(
  category: string,
  selectedCategory: string,
  mainCategories: Map<string, Set<string>>,
  activeMainCategory: string,
  curatedMainToggle: boolean,
): boolean {
  if (curatedMainToggle) {
    const isSelectedMain = mainCategories.has(selectedCategory);
    return (
      selectedCategory === category ||
      (!isSelectedMain &&
        Boolean(mainCategories.get(category)?.has(selectedCategory)))
    );
  }
  return activeMainCategory === category;
}

export function CategoryNavSection({
  copy,
  mainCategories,
  activeMainCategory,
  selectedCategory,
  showMainRow = true,
  mainInteraction,
  subInteraction,
  curatedMainToggle = false,
  onMainSelect,
  onSubSelect,
  getMainHref,
  getSubHref,
  subcategoriesFor,
  subPresentation = 'chips',
  subChipVariant = 'sub',
  subRowHint,
  showSubAlleChip = false,
  showSubBottomSeparator = false,
  subHighlightActive = true,
  variant = 'default',
  className,
  menuRef,
}: CategoryNavSectionProps) {
  const isHomepage = variant === 'homepage';
  const titleTypo = isHomepage
    ? CATEGORY_NAV_TITLE_TYPO_HOME
    : CATEGORY_NAV_TITLE_TYPO;
  const subParent = subcategoriesFor ?? activeMainCategory;
  const subcategories = subParent
    ? mainCategories.get(subParent)
    : undefined;

  const renderMainChip = (category: string) => {
    const isActive = isMainActive(
      category,
      selectedCategory,
      mainCategories,
      activeMainCategory,
      curatedMainToggle,
    );
    const label = getCategoryLabel(category);
    const interaction =
      mainInteraction === 'link' && getMainHref ? 'link' : 'filter';

    return (
      <CategoryNavChip
        key={category}
        variant="main"
        active={isActive}
        label={label}
        interaction={interaction}
        href={getMainHref?.(category)}
        onSelect={() => onMainSelect?.(category)}
      />
    );
  };

  const renderSubChip = (subcategory: string) => {
    const isActive =
      subHighlightActive && selectedCategory === subcategory;
    const label = getCategoryLabel(subcategory);
    const mainForHref = subParent || activeMainCategory;
    const interaction =
      subInteraction === 'link' && getSubHref ? 'link' : 'filter';

    return (
      <CategoryNavChip
        key={subcategory}
        variant="sub"
        active={isActive}
        label={label}
        interaction={interaction}
        href={getSubHref?.(mainForHref, subcategory)}
        onSelect={() => onSubSelect?.(subcategory)}
      />
    );
  };

  return (
    <div
      ref={menuRef}
      className={cn(
        CATEGORY_NAV_SECTION,
        isHomepage ? CATEGORY_NAV_SECTION_HOME : null,
        CATEGORY_NAV_STACK_GAP,
        className,
      )}
    >
      <header
        className={cn(CATEGORY_NAV_HEADER, CATEGORY_NAV_HEADER_SPOTLIGHT)}
      >
        <h2
          className={cn(
            CATEGORY_NAV_TITLE,
            titleTypo,
            isHomepage && CATEGORY_NAV_TITLE_HOME,
            CATEGORY_NAV_TITLE_SPOTLIGHT,
          )}
        >
          {copy.title}
        </h2>
        <p
          className={cn(
            CATEGORY_NAV_SUBTITLE,
            CATEGORY_NAV_SUBTITLE_TYPO,
            CATEGORY_NAV_SUBTITLE_SPOTLIGHT,
          )}
        >
          {copy.subtitle}
        </p>
      </header>

      {showMainRow && (
        <div className={CATEGORY_NAV_CHIPS}>
          {Array.from(mainCategories.keys()).map(renderMainChip)}
        </div>
      )}

      {subcategories && subcategories.size > 0 && subPresentation === 'subRow' && (
        <CategoryNavSubRow
          parentSlug={subParent || activeMainCategory}
          subcategories={subcategories}
          selectedCategory={selectedCategory}
          interaction={subInteraction}
          chipVariant={subChipVariant}
          subRowHint={subRowHint}
          showAlleChip={showSubAlleChip}
          showBottomSeparator={showSubBottomSeparator}
          onSelect={onSubSelect}
          getSubHref={getSubHref}
          subHighlightActive={subHighlightActive}
        />
      )}

      {subcategories && subcategories.size > 0 && subPresentation === 'chips' && (
        <div className={CATEGORY_NAV_CHIPS_SUB}>
          {Array.from(subcategories).map(renderSubChip)}
        </div>
      )}
    </div>
  );
}
