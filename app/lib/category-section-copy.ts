/**
 * Category nav section branding copy — German, per page context (REQ-0007).
 */
import {
  getCategoryLabel,
  isMainCategory,
  MAIN_CATEGORY_MAP,
} from '~/lib/category-map';

export type CategorySectionContext =
  | 'homepage'
  | 'bestseller'
  | 'neuheiten'
  | 'sale'
  | 'shop-all'
  | 'category';

export type CategorySectionCopy = {
  title: string;
  subtitle: string;
};

const STATIC_COPY: Record<
  Exclude<CategorySectionContext, 'category'>,
  CategorySectionCopy
> = {
  homepage: {
    title: 'Finde, was du brauchst',
    subtitle: 'Wähle eine Kategorie und entdecke deine Essentials',
  },
  bestseller: {
    title: 'BESTSELLER',
    subtitle: 'Beliebte Styles — von Kunden gefeiert',
  },
  neuheiten: {
    title: 'NEUHEITEN',
    subtitle: 'Frische Looks — jetzt entdecken',
  },
  sale: {
    title: 'SALE',
    subtitle: 'Starke Preise — limitierte Auswahl',
  },
  'shop-all': {
    title: 'ALLE PRODUKTE',
    subtitle: 'Die komplette ZEHN Kollektion',
  },
};

/** Generic short hint — mobile sub-row (ART-0042). */
const SUB_ROW_HINT_MOBILE = 'Variante wählen';

/** Sub-row "all in parent category" chip label (ART-0043). */
export const SUB_ROW_ALLE_LABEL = 'ALLE';

/** Main-row Alle — resets to full page catalog (collection routes only). */
export const MAIN_ROW_ALLE_LABEL = 'ALLE';

/** Header marketing subtitle when a main/sub chip is active. */
const MAIN_CATEGORY_SUBTITLES: Record<string, string> = {
  shorts: 'Leicht, vielseitig — für jeden Sommertag',
  hosen: 'Perfekte Passform — von Cargo bis Chino',
  jeans: 'Zeitlose Denim-Looks — robust & stilvoll',
  jacken: 'Layering mit Charakter — Übergang bis Winter',
  tops: 'Shirts & Polos — clean & hochwertig',
};

/** Action-oriented sub-row desktop hint — distinct from header marketing copy. */
const SUB_ROW_HINT_DESKTOP_BY_MAIN: Record<string, string> = {
  shorts: 'Cargo, Chino & mehr',
  hosen: 'Cargo, Chino, Jeans — wählen',
  jeans: 'Slim, Regular & Loose',
  jacken: 'Übergang, Winter & mehr',
  tops: 'T-Shirts, Polos & mehr',
};

export type CategorySubRowHint = {
  mobile: string;
  desktop: string;
};

/** Sub-row hint — mobile action line + short desktop variant picker (not header marketing). */
export function getCategorySubRowHint(mainSlug: string): CategorySubRowHint {
  return {
    mobile: SUB_ROW_HINT_MOBILE,
    desktop:
      SUB_ROW_HINT_DESKTOP_BY_MAIN[mainSlug] ??
      'Variante auswählen',
  };
}

/** Collection page contexts that support main-row Alle + split subtitles. */
export type CollectionPageContext = Exclude<
  CategorySectionContext,
  'homepage' | 'category'
>;

/**
 * Header copy for collection catalog band — page branding when no main chip;
 * category marketing when a main/sub filter is active.
 */
export function getCollectionBandCopy(
  pageContext: CollectionPageContext,
  activeMainCategory: string,
  selectedCategory: string,
): CategorySectionCopy {
  if (!activeMainCategory) {
    return STATIC_COPY[pageContext];
  }

  const slug = selectedCategory || activeMainCategory;
  return getCategorySectionCopy('category', slug);
}

export function getCategorySectionCopy(
  context: CategorySectionContext,
  slug?: string,
): CategorySectionCopy {
  if (context !== 'category') {
    return STATIC_COPY[context];
  }

  const resolved = slug ?? '';
  const label = getCategoryLabel(resolved);
  let mainSlug = resolved;
  if (!isMainCategory(resolved)) {
    for (const [main, subs] of Object.entries(MAIN_CATEGORY_MAP)) {
      if (subs.includes(resolved)) {
        mainSlug = main;
        break;
      }
    }
  }

  return {
    title: label,
    subtitle:
      MAIN_CATEGORY_SUBTITLES[mainSlug] ?? 'Entdecke unsere kuratierte Auswahl',
  };
}

/** Map Shopify collection handle → section context. */
export function resolveCategorySectionContext(
  handle: string,
  options: {
    isCuratedCollection: boolean;
    isMainCategoryPage: boolean;
    isSubCategoryPage: boolean;
  },
): CategorySectionContext {
  if (handle === 'bestseller') return 'bestseller';
  if (handle === 'sale') return 'sale';
  if (handle === 'neuheiten' || handle === 'new-arrival') return 'neuheiten';

  if (options.isMainCategoryPage || options.isSubCategoryPage) {
    return 'category';
  }

  if (options.isCuratedCollection) {
    if (handle === 'bestseller') return 'bestseller';
    if (handle === 'sale') return 'sale';
    if (handle === 'neuheiten' || handle === 'new-arrival') return 'neuheiten';
    return 'shop-all';
  }

  return 'category';
}
