/**
 * Homepage trust strip — presentation class tokens (REQ-0007 / ART-0040).
 */
import {ZEHN_HOMEPAGE_SECTION_PY} from '~/lib/homepage-section-styles';
import {ZEHN_SITE_CONTENT_ROW} from '~/lib/site-content-row';

export const TRUST_STRIP_SECTION = 'trust-strip-section';
export const TRUST_STRIP_GRID = 'trust-strip-grid';
export const TRUST_STRIP_ITEM = 'trust-strip-item';
export const TRUST_STRIP_ITEM_ROW = 'trust-strip-item__row';
export const TRUST_STRIP_ICON = 'trust-strip-item__icon';
export const TRUST_STRIP_TEXT = 'trust-strip-item__text';
export const TRUST_STRIP_LINE_PRIMARY = 'trust-strip-item__line-primary';
export const TRUST_STRIP_LINE_SECONDARY = 'trust-strip-item__line-secondary';
export const TRUST_STRIP_REVEAL = 'trust-strip-reveal';

/** Section shell — shared homepage band py. */
export const TRUST_STRIP_SECTION_SHELL = `trust-strip-section w-full bg-background overflow-x-clip ${ZEHN_HOMEPAGE_SECTION_PY}`;

/** Navbar-aligned content row (max-w 1400px). */
export const TRUST_STRIP_CONTAINER = ZEHN_SITE_CONTENT_ROW;

/** Mobile 2×2 grid; desktop full-width spread row. */
export const TRUST_STRIP_GRID_LAYOUT =
  'trust-strip-grid grid w-full grid-cols-2 gap-x-4 gap-y-4 justify-items-center ' +
  'lg:flex lg:flex-nowrap lg:items-center lg:justify-between lg:gap-x-12 xl:gap-x-16 lg:gap-y-0';
