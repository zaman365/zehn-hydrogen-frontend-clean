/**
 * Header nav wrappers — unified label/icon styling + ripple for Header.tsx.
 * REQ-0008: consistent hover (Signal accent) and active states across nav controls.
 */
import type {LucideIcon} from 'lucide-react';
import type {ComponentPropsWithoutRef, FocusEvent, MouseEvent, ReactNode} from 'react';
import {Link, type LinkProps} from 'react-router';
import {RippleButton} from '~/components/zehn/RippleButton';
import {
  cnHeaderNavIconHost,
  cnHeaderNavState,
  cnHeaderNavTextHost,
  HEADER_NAV_ICON_SIZE,
  HEADER_NAV_ICON_STROKE,
  HEADER_NAV_MOBILE_ROW,
} from '~/lib/header-nav-styles';
import {cn} from '~/lib/utils';

type HeaderNavLinkBaseProps = {
  active?: boolean;
  className?: string;
  children: ReactNode;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  onFocus?: (event: FocusEvent<HTMLElement>) => void;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

type HeaderNavLinkRouterProps = HeaderNavLinkBaseProps &
  Omit<LinkProps, 'className' | 'children' | 'onClick'> & {
    external?: false;
  };

type HeaderNavLinkExternalProps = HeaderNavLinkBaseProps & {
  external: true;
  href: string;
  target?: string;
  rel?: string;
};

export type HeaderNavLinkProps =
  | HeaderNavLinkRouterProps
  | HeaderNavLinkExternalProps;

/** Desktop nav title — compact text host + ripple (production-tight spacing). */
export function HeaderNavLink(props: HeaderNavLinkProps) {
  const {active = false, className, children, onMouseEnter, onFocus, onClick} =
    props;

  const linkClassName = cnHeaderNavTextHost({active, className});

  if (props.external) {
    const {href, target, rel} = props;
    return (
      <RippleButton
        as="anchor"
        href={href}
        target={target}
        rel={rel}
        className={linkClassName}
        onMouseEnter={onMouseEnter}
        onFocus={onFocus}
        onClick={onClick}
      >
        {children}
      </RippleButton>
    );
  }

  const {to, prefetch, onPointerDown: _onPointerDown, ...rest} = props;
  return (
    <RippleButton
      as="link"
      to={to}
      prefetch={prefetch}
      className={linkClassName}
      onMouseEnter={onMouseEnter}
      onFocus={onFocus}
      onClick={onClick}
      {...rest}
    >
      {children}
    </RippleButton>
  );
}

type HeaderNavIconButtonButtonProps = {
  as?: 'button';
  active?: boolean;
  className?: string;
  children: ReactNode;
  ariaLabel: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  title?: string;
  disabled?: boolean;
  buttonRef?: React.Ref<HTMLButtonElement>;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
};

type HeaderNavIconButtonLinkProps = {
  as: 'link';
  active?: boolean;
  className?: string;
  children: ReactNode;
  ariaLabel: string;
  title?: string;
  to: string;
  prefetch?: LinkProps['prefetch'];
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

export type HeaderNavIconButtonProps =
  | HeaderNavIconButtonButtonProps
  | HeaderNavIconButtonLinkProps;

/** Circular icon host with ripple — burger, search, account, wishlist, cart. */
export function HeaderNavIconButton(props: HeaderNavIconButtonProps) {
  const {active = false, className, children, ariaLabel, title} = props;

  const hostClassName = cnHeaderNavIconHost({
    active,
    className,
  });

  if (props.as === 'link') {
    const {to, prefetch, onClick} = props;
    return (
      <RippleButton
        as="link"
        to={to}
        prefetch={prefetch}
        className={hostClassName}
        aria-label={ariaLabel}
        title={title ?? ariaLabel}
        onClick={onClick}
      >
        {children}
      </RippleButton>
    );
  }

  const {
    ariaExpanded,
    ariaControls,
    disabled,
    buttonRef,
    onClick,
    onMouseEnter,
  } = props;

  return (
    <RippleButton
      as="button"
      ref={buttonRef}
      className={hostClassName}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      title={title ?? ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </RippleButton>
  );
}

type HeaderNavIconProps = {
  icon: LucideIcon;
  active?: boolean;
  className?: string;
  filled?: boolean;
};

/** Lucide icon with nav stroke/size tokens. */
export function HeaderNavIcon({
  icon: Icon,
  active = false,
  className,
  filled = false,
}: HeaderNavIconProps) {
  return (
    <Icon
      className={cn(
        HEADER_NAV_ICON_SIZE,
        filled && active && 'fill-accent text-accent',
        className,
      )}
      strokeWidth={HEADER_NAV_ICON_STROKE}
      aria-hidden
    />
  );
}

type HeaderNavMobileRowProps = ComponentPropsWithoutRef<typeof Link> & {
  active?: boolean;
  children: ReactNode;
};

/** Mobile drawer text row — same tokens as desktop nav links. */
export function HeaderNavMobileRow({
  active = false,
  className,
  children,
  onPointerDown: _onPointerDown,
  ...linkProps
}: HeaderNavMobileRowProps) {
  return (
    <RippleButton
      as="link"
      className={cn(cnHeaderNavState({active}), HEADER_NAV_MOBILE_ROW, className)}
      {...linkProps}
    >
      {children}
    </RippleButton>
  );
}

type HeaderNavMobileActionProps = {
  active?: boolean;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  onClick?: () => void;
};

/** Mobile drawer action row (e.g. cart) — button variant with ripple. */
export function HeaderNavMobileAction({
  active = false,
  className,
  children,
  ariaLabel,
  onClick,
}: HeaderNavMobileActionProps) {
  return (
    <RippleButton
      as="button"
      type="button"
      className={cn(cnHeaderNavState({active}), HEADER_NAV_MOBILE_ROW, className)}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </RippleButton>
  );
}
