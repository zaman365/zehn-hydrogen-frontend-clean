/**
 * RippleButton — client-side click ripple per RIPPLE_BUTTON_EFFECT.md.
 * Ripple is created only on pointerdown (no SSR/hydration mismatch).
 * Supports button, React Router Link, and external anchor hosts.
 */
import {
  forwardRef,
  useCallback,
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type PointerEvent,
  type PointerEventHandler,
  type ReactNode,
  type Ref,
} from 'react';
import {Link, type LinkProps} from 'react-router';
import {cn} from '~/lib/utils';

const RIPPLE_CLASS = 'zehn-ripple';
const RIPPLE_SIZE_PX = 48;

type RippleHostProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onPointerDown?: PointerEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
};

type RippleButtonProps = RippleHostProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onPointerDown' | 'onClick'> & {
    as?: 'button';
  };

type RippleLinkProps = RippleHostProps &
  Omit<LinkProps, 'onPointerDown' | 'onClick'> & {
    as: 'link';
  };

type RippleAnchorProps = RippleHostProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'onPointerDown' | 'onClick'> & {
    as: 'anchor';
    href: string;
  };

export type RippleButtonComponentProps =
  | RippleButtonProps
  | RippleLinkProps
  | RippleAnchorProps;

function useRippleHandler(
  hostRef: React.RefObject<HTMLElement | null>,
  onPointerDown?: PointerEventHandler<HTMLElement>,
) {
  return useCallback(
    (event: PointerEvent<HTMLElement>) => {
      onPointerDown?.(event);

      const host = hostRef.current;
      if (!host || event.button !== 0) return;

      const rect = host.getBoundingClientRect();
      const size = RIPPLE_SIZE_PX;
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = RIPPLE_CLASS;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      ripple.addEventListener('animationend', () => ripple.remove(), {
        once: true,
      });
      host.appendChild(ripple);
    },
    [hostRef, onPointerDown],
  );
}

export const RippleButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  RippleButtonComponentProps
>(function RippleButton(props, forwardedRef) {
  const internalRef = useRef<HTMLElement | null>(null);
  const handlePointerDown = useRippleHandler(internalRef, props.onPointerDown);

  const setRef = (node: HTMLButtonElement | HTMLAnchorElement | null) => {
    internalRef.current = node;
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  const hostClassName = cn(
    'relative overflow-hidden',
    props.className,
    props.disabled && 'pointer-events-none opacity-50',
  );

  if (props.as === 'link') {
    const {as: _as, className: _c, onPointerDown: _p, ...linkProps} = props;
    return (
      <Link
        ref={setRef as Ref<HTMLAnchorElement>}
        className={hostClassName}
        onPointerDown={handlePointerDown}
        {...linkProps}
      />
    );
  }

  if (props.as === 'anchor') {
    const {as: _as, className: _c, onPointerDown: _p, children, ...anchorProps} = props;
    return (
      <a
        ref={setRef as Ref<HTMLAnchorElement>}
        className={hostClassName}
        onPointerDown={handlePointerDown}
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  const {as: _as, className: _c, onPointerDown: _p, ...buttonProps} = props;
  return (
    <button
      ref={setRef as Ref<HTMLButtonElement>}
      type={buttonProps.type ?? 'button'}
      className={hostClassName}
      onPointerDown={handlePointerDown}
      disabled={buttonProps.disabled}
      {...buttonProps}
    />
  );
});

RippleButton.displayName = 'RippleButton';
