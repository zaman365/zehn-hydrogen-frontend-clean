/**
 * Hero CTA shine button tokens — reuse nav label colors (REQ-0001 / REQ-0003).
 * Icon (Lucide) inherits currentColor via [&_svg]:text-current.
 */
import {HEADER_NAV_COLOR} from '~/lib/header-nav-styles';

/** Nav idle/hover text — foreground/70 → accent; no underline on Link. */
export const CTA_SHINE_BUTTON_TEXT =
  HEADER_NAV_COLOR +
  ' [&_svg]:text-current transition-colors duration-[400ms] ease-out';

/** Glass pill host — shine + glow on one layer (no wrapper div). */
export const CTA_SHINE_BUTTON_BASE =
  'cta-shine-host cta-shine-button zehn-cta-glow font-display inline-flex items-center gap-2.5 uppercase font-semibold';
