/**
 * Category nav chip — glass pill with navbar-parity ripple + Signal hover (REQ-0008).
 * Filter mode uses button; link mode uses React Router Link + prefetch intent.
 */
import {RippleButton} from '~/components/zehn/RippleButton';
import {resolveLinkPrefetch} from '~/lib/link-prefetch';
import {
  CATEGORY_NAV_CHIP_HOST,
  CATEGORY_NAV_CHIP_HOVER,
  CATEGORY_NAV_CHIP_MAIN,
  CATEGORY_NAV_CHIP_MAIN_ACTIVE,
  CATEGORY_NAV_CHIP_SUB,
  CATEGORY_NAV_CHIP_SUB_ACTIVE,
} from '~/lib/category-nav-styles';
import {cn} from '~/lib/utils';

export type CategoryNavChipProps = {
  variant: 'main' | 'sub';
  active: boolean;
  label: string;
  interaction: 'filter' | 'link';
  onSelect?: () => void;
  href?: string;
  /** True when this category has 0 products in the current route's data. */
  isEmpty?: boolean;
};

export function CategoryNavChip({
  variant,
  active,
  label,
  interaction,
  onSelect,
  href,
  isEmpty = false,
}: CategoryNavChipProps) {
  const stateClass =
    variant === 'main'
      ? active
        ? CATEGORY_NAV_CHIP_MAIN_ACTIVE
        : CATEGORY_NAV_CHIP_MAIN
      : active
        ? CATEGORY_NAV_CHIP_SUB_ACTIVE
        : CATEGORY_NAV_CHIP_SUB;

  const isDisabled = isEmpty && !active;

  const chipClass = cn(
    CATEGORY_NAV_CHIP_HOST,
    stateClass,
    !active && CATEGORY_NAV_CHIP_HOVER,
    isDisabled && 'opacity-40 pointer-events-none',
  );

  const tooltip = isDisabled
    ? `Keine ${label} in dieser Kollektion verfügbar`
    : undefined;

  if (interaction === 'link' && href) {
    return (
      <RippleButton
        as="link"
        to={href}
        prefetch={resolveLinkPrefetch('collection')}
        className={chipClass}
        aria-current={active ? 'page' : undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        onClick={isDisabled ? undefined : onSelect}
        title={tooltip}
      >
        {label}
      </RippleButton>
    );
  }

  return (
    <RippleButton
      type="button"
      className={chipClass}
      onClick={isDisabled ? undefined : onSelect}
      aria-pressed={active}
      aria-disabled={isDisabled || undefined}
      tabIndex={isDisabled ? -1 : undefined}
      title={tooltip}
    >
      {label}
    </RippleButton>
  );
}
