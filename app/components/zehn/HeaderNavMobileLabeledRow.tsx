/**
 * Mobile drawer row — icon + label + inline count badge (gap-2 beside title).
 * Used for Wunschliste / Warenkorb in Header.tsx (REQ-0008).
 */
import type {LucideIcon} from 'lucide-react';
import type {ReactNode} from 'react';
import {type LinkProps} from 'react-router';
import {RippleButton} from '~/components/zehn/RippleButton';
import {HeaderNavCountBadge} from '~/components/zehn/HeaderNavCountBadge';
import {
  cnHeaderNavState,
  HEADER_NAV_MOBILE_LABELED_ROW_INNER,
  HEADER_NAV_MOBILE_LABELED_ROW_LABEL,
  HEADER_NAV_MOBILE_ROW,
} from '~/lib/header-nav-styles';
import {cn} from '~/lib/utils';

type HeaderNavMobileLabeledRowBaseProps = {
  icon: LucideIcon;
  iconClassName?: string;
  label: ReactNode;
  count?: number;
  active?: boolean;
  className?: string;
  strokeWidth?: number;
};

type HeaderNavMobileLabeledRowLinkProps = HeaderNavMobileLabeledRowBaseProps &
  Omit<LinkProps, 'className' | 'children'> & {
    as?: 'link';
  };

type HeaderNavMobileLabeledRowButtonProps = HeaderNavMobileLabeledRowBaseProps & {
  as: 'button';
  ariaLabel?: string;
  onClick?: () => void;
};

export type HeaderNavMobileLabeledRowProps =
  | HeaderNavMobileLabeledRowLinkProps
  | HeaderNavMobileLabeledRowButtonProps;

function LabeledRowContent({
  Icon,
  iconClassName,
  label,
  count,
  strokeWidth,
}: {
  Icon: LucideIcon;
  iconClassName?: string;
  label: ReactNode;
  count: number;
  strokeWidth: number;
}) {
  return (
    <span className={HEADER_NAV_MOBILE_LABELED_ROW_INNER}>
      <Icon
        className={cn('h-4 w-4 shrink-0', iconClassName)}
        strokeWidth={strokeWidth}
        aria-hidden
      />
      <span className={HEADER_NAV_MOBILE_LABELED_ROW_LABEL}>
        <span className="truncate">{label}</span>
        <HeaderNavCountBadge count={count} position="trailing" />
      </span>
    </span>
  );
}

export function HeaderNavMobileLabeledRow(
  props: HeaderNavMobileLabeledRowProps,
) {
  const {
    icon: Icon,
    iconClassName,
    label,
    count = 0,
    active = false,
    className,
    strokeWidth = 2.25,
  } = props;

  const rowClassName = cn(
    cnHeaderNavState({active}),
    HEADER_NAV_MOBILE_ROW,
    className,
  );

  if (props.as === 'button') {
    const {ariaLabel, onClick} = props;
    return (
      <RippleButton
        as="button"
        type="button"
        className={rowClassName}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        <LabeledRowContent
          Icon={Icon}
          iconClassName={iconClassName}
          label={label}
          count={count}
          strokeWidth={strokeWidth}
        />
      </RippleButton>
    );
  }

  const {to, onClick, prefetch, replace, state, preventScrollReset, relative, viewTransition, discover} =
    props;

  return (
    <RippleButton
      as="link"
      to={to}
      prefetch={prefetch}
      replace={replace}
      state={state}
      preventScrollReset={preventScrollReset}
      relative={relative}
      viewTransition={viewTransition}
      discover={discover}
      className={rowClassName}
      onClick={onClick}
    >
      <LabeledRowContent
        Icon={Icon}
        iconClassName={iconClassName}
        label={label}
        count={count}
        strokeWidth={strokeWidth}
      />
    </RippleButton>
  );
}
