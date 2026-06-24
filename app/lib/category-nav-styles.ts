/**
 * Category nav section — chip + header class names (REQ-0007 / REQ-0008).
 * Typography: Space Grotesk (font-sans) — matches navbar labels + AC-1.
 * Glow values: @see app/styles/category-nav-glow.css (sole source of truth).
 */
import {ZEHN_HOMEPAGE_STACK_GAP} from '~/lib/homepage-section-styles';

/** Section + header shell class names (presentation in app.css). */
export const CATEGORY_NAV_SECTION = 'category-nav-section';
/** Homepage — zero bottom margin; STACK_GAP + parent layout own rhythm (BL-0017). */
export const CATEGORY_NAV_SECTION_HOME = 'category-nav-section--home';
/** Shared vertical rhythm — nav rows + filter block (ART-0043 / ART-0048). */
export const CATEGORY_NAV_STACK_GAP = ZEHN_HOMEPAGE_STACK_GAP;
export const CATEGORY_NAV_HEADER = 'category-nav-header';
/** Ambient orange splash pseudo — pairs with title/subtitle text-shadow. */
export const CATEGORY_NAV_HEADER_SPOTLIGHT = 'category-nav-header-spotlight';
export const CATEGORY_NAV_TITLE = 'category-nav-title';
export const CATEGORY_NAV_SUBTITLE = 'category-nav-subtitle';
/** Text-shadow spotlight layers on title/subtitle glyphs. */
export const CATEGORY_NAV_TITLE_SPOTLIGHT = 'category-nav-title-spotlight';
export const CATEGORY_NAV_SUBTITLE_SPOTLIGHT = 'category-nav-subtitle-spotlight';
/** Band shell base — overflow clip; no shell py (BL-0015 / BL-0017). */
export const CATEGORY_NAV_BAND_SHELL_BASE =
  'homepage-category-nav-shell overflow-x-clip';

/** Homepage band — same shell as catalog; rhythm via STACK_GAP + GRID_TOP (BL-0017). */
export const CATEGORY_NAV_HOMEPAGE_SHELL = CATEGORY_NAV_BAND_SHELL_BASE;

/** Homepage idle band (no chip selected) — pairs with trust strip pt above hero fold. */
export const CATEGORY_NAV_HOMEPAGE_IDLE_PY = 'py-4' as const;

/** Collection/catalog band — parent layout owns vertical rhythm; no extra shell py. */
export const CATEGORY_NAV_CATALOG_SHELL = CATEGORY_NAV_BAND_SHELL_BASE;
export const CATEGORY_NAV_TITLE_HOME = 'category-nav-title--home';
export const CATEGORY_NAV_CHIPS = 'category-nav-chips';
export const CATEGORY_NAV_CHIPS_SUB =
  'category-nav-chips category-nav-chips--sub';

/** Title — Space Grotesk 700, uppercase tracking (collection pages). */
export const CATEGORY_NAV_TITLE_TYPO =
  'font-sans font-bold uppercase tracking-[0.22em]';

/** Homepage title — sentence-case friendly copy. */
export const CATEGORY_NAV_TITLE_TYPO_HOME =
  'font-sans font-bold normal-case tracking-wide';

/** Subtitle — Space Grotesk 500, idle nav color parity. */
export const CATEGORY_NAV_SUBTITLE_TYPO =
  'font-sans font-medium text-foreground/70';

/** Ripple clip boundary — matches HEADER_NAV_TEXT_HOST pattern. */
export const CATEGORY_NAV_CHIP_HOST = 'relative overflow-hidden';

/** Inactive main chip — glass pill base. */
export const CATEGORY_NAV_CHIP_MAIN =
  'category-nav-chip category-nav-chip--main';

/** Active main chip — glass white→Signal gradient + inset glow (category-nav-glow.css). */
export const CATEGORY_NAV_CHIP_MAIN_ACTIVE =
  'category-nav-chip category-nav-chip--main category-nav-chip--active';

/** Inactive sub chip. */
export const CATEGORY_NAV_CHIP_SUB =
  'category-nav-chip category-nav-chip--sub';

/** Active sub chip — glass gradient + inset glow (lighter base than main). */
export const CATEGORY_NAV_CHIP_SUB_ACTIVE =
  'category-nav-chip category-nav-chip--sub category-nav-chip--active';

/** Nav-parity hover on inactive chips — Signal accent + soft disc. */
export const CATEGORY_NAV_CHIP_HOVER =
  'transition-colors duration-[400ms] ease-out hover:text-accent hover:bg-foreground/[0.06] active:bg-accent/10';

export type CategoryNavVariant = 'default' | 'homepage';
