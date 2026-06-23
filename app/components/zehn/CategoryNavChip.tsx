/**
 * Category nav chip — glass pill with navbar-parity ripple + Signal hover (REQ-0008).
 * Filter mode uses button; link mode uses React Router Link + prefetch intent.
 */
import {RippleButton} from '~/components/zehn/RippleButton';
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
};

export function CategoryNavChip({
  variant,
  active,
  label,
  interaction,
  onSelect,
  href,
}: CategoryNavChipProps) {
  const stateClass =
    variant === 'main'
      ? active
        ? CATEGORY_NAV_CHIP_MAIN_ACTIVE
        : CATEGORY_NAV_CHIP_MAIN
      : active
        ? CATEGORY_NAV_CHIP_SUB_ACTIVE
        : CATEGORY_NAV_CHIP_SUB;

  const chipClass = cn(
    CATEGORY_NAV_CHIP_HOST,
    stateClass,
    !active && CATEGORY_NAV_CHIP_HOVER,
  );

  if (interaction === 'link' && href) {
    return (
      <RippleButton
        as="link"
        to={href}
        prefetch="intent"
        className={chipClass}
        aria-current={active ? 'page' : undefined}
      >
        {label}
      </RippleButton>
    );
  }

  return (
    <RippleButton
      type="button"
      className={chipClass}
      onClick={onSelect}
      aria-pressed={active}
    >
      {label}
    </RippleButton>
  );
}
