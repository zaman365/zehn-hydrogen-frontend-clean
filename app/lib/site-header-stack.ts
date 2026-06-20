/**
 * Frozen header stack — keep in sync with AnnouncementBar, Header, PageLayout.
 * PageLayout main padding and hero fold negative margin must match these values.
 *
 * Breakdown (mobile / desktop):
 *   Announcement bar:  26px / 29px
 *   Floating gap:       3px /  3px   ← Header top-[29px]/top-[32px]
 *   Navbar card:       73px / 74px
 *   Total:            102px / 106px
 */
export const SITE_HEADER_STACK = {
  mobile: 102,
  desktop: 106,
} as const;

/** Banner asset aspect ratios (desktop 3000×1200, mobile 1080×1350). */
export const HERO_BANNER_ASPECT = {
  mobile: '4 / 5',
  desktop: '5 / 2',
} as const;

export const HERO_FOLD_MAX_HEIGHT = {
  mobile: '90dvh',
  desktop: '95dvh',
} as const;

export const SITE_HEADER_STACK_CSS_VARS = {
  mobile: '--site-header-stack-mobile',
  desktop: '--site-header-stack-desktop',
} as const;
