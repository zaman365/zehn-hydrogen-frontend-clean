/**
 * Shared wishlist/cart count pill for ZEHN header (REQ-0008).
 * Medium size: 16px circle, 10px tabular number, frosted ring cutout over icon.
 */
import {
  cnHeaderNavCountBadge,
  HEADER_NAV_COUNT_BADGE_OVERFLOW,
  HEADER_NAV_COUNT_BADGE_POSITION,
  HEADER_NAV_COUNT_BADGE_POSITION_MOBILE_ROW,
} from '~/lib/header-nav-styles';
import {useNavCountBadgePulse} from '~/hooks/useNavCountBadgePulse';
import {cn} from '~/lib/utils';

export type HeaderNavCountBadgePosition = 'icon' | 'mobileRow';

const BADGE_POSITION: Record<HeaderNavCountBadgePosition, string> = {
  icon: HEADER_NAV_COUNT_BADGE_POSITION,
  mobileRow: HEADER_NAV_COUNT_BADGE_POSITION_MOBILE_ROW,
};

export type HeaderNavCountBadgeProps = {
  count: number;
  /** Preset anchor — icon host (default) or mobile drawer row. */
  position?: HeaderNavCountBadgePosition;
  /** Position utility classes; overrides `position` preset when set. */
  positionClassName?: string;
  className?: string;
  /** Cap display at this value with "+" suffix. */
  maxDisplay?: number;
};

export function HeaderNavCountBadge({
  count,
  position = 'icon',
  positionClassName,
  className,
  maxDisplay = 9,
}: HeaderNavCountBadgeProps) {
  const pulseClass = useNavCountBadgePulse(count);

  if (count <= 0) return null;

  const isOverflow = count > maxDisplay;
  const label = isOverflow ? `${maxDisplay}+` : String(count);
  const resolvedPosition = positionClassName ?? BADGE_POSITION[position];

  return (
    <span
      className={cn(
        cnHeaderNavCountBadge({position: resolvedPosition}),
        isOverflow && HEADER_NAV_COUNT_BADGE_OVERFLOW,
        pulseClass,
        className,
      )}
      aria-hidden="true"
    >
      {label}
    </span>
  );
}
