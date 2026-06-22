/**
 * Glass CTA with ripple-on-click + auto shine sweep.
 *
 * Visual: single-layer frosted pill; text/icon colors match nav (HEADER_NAV_COLOR).
 * Signal-orange ripple on click; CSS shine on host (.cta-shine-host).
 * Spec: Docs/project-idea/RIPPLE_BUTTON_EFFECT.md — shine is CSS-only (no hydration risk).
 *
 * Navigation: prefetch="intent" preloads route data on hover → near-instant transition.
 */
import type {ReactNode} from 'react';
import type {LinkProps} from 'react-router';
import {RippleButton} from '~/components/zehn/RippleButton';
import {
  CTA_SHINE_BUTTON_BASE,
  CTA_SHINE_BUTTON_TEXT,
} from '~/lib/zehn-cta-styles';
import {cn} from '~/lib/utils';

export type CtaShineButtonProps = {
  to: string;
  children: ReactNode;
  /** Typography, sizing, and spacing on the link. */
  className?: string;
  prefetch?: LinkProps['prefetch'];
};

export function CtaShineButton({
  to,
  children,
  className,
  prefetch = 'intent',
}: CtaShineButtonProps) {
  return (
    <RippleButton
      as="link"
      to={to}
      prefetch={prefetch}
      className={cn(CTA_SHINE_BUTTON_BASE, CTA_SHINE_BUTTON_TEXT, className)}
    >
      {children}
    </RippleButton>
  );
}
