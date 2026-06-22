/**
 * Glass panel with safe glow layering — surface + box-shadow on outer shell,
 * scroll overflow on inner child only (REQ-0008 dropdown clip + exit motion).
 */
import {
  forwardRef,
  useEffect,
  useState,
  type ReactNode,
  type TransitionEvent,
} from 'react';
import {usePrefersReducedMotion} from '~/hooks/usePrefersReducedMotion';
import {
  ZEHN_DROPDOWN_PANEL_ENTER,
  ZEHN_DROPDOWN_PANEL_ENTER_FROM,
  ZEHN_DROPDOWN_PANEL_EXIT,
  ZEHN_DROPDOWN_PANEL_MOTION_BASE,
  ZEHN_DROPDOWN_SCROLL,
  ZEHN_DROPDOWN_SURFACE,
  ZEHN_SURFACE_GLOW,
} from '~/lib/zehn-surface-styles';
import {cn} from '~/lib/utils';

export type ZehnGlassPanelMotion = 'enter' | 'exit';

export type ZehnGlassPanelProps = {
  surface?: string;
  glow?: boolean;
  scrollable?: boolean;
  scrollClassName?: string;
  className?: string;
  /** enter: fade/slide in; exit: fade/lift out (never collapse positioner height). */
  motion?: ZehnGlassPanelMotion;
  onMotionEnd?: () => void;
  children: ReactNode;
};

export const ZehnGlassPanel = forwardRef<HTMLDivElement, ZehnGlassPanelProps>(
  function ZehnGlassPanel(
    {
      surface = ZEHN_DROPDOWN_SURFACE,
      glow = true,
      scrollable = false,
      scrollClassName = ZEHN_DROPDOWN_SCROLL,
      className,
      motion = 'enter',
      onMotionEnd,
      children,
    },
    ref,
  ) {
    const reducedMotion = usePrefersReducedMotion();
    const [enterActive, setEnterActive] = useState(
      motion === 'exit' || reducedMotion,
    );

    useEffect(() => {
      if (motion !== 'enter' || reducedMotion) {
        setEnterActive(true);
        return;
      }
      setEnterActive(false);
      const id = requestAnimationFrame(() => setEnterActive(true));
      return () => cancelAnimationFrame(id);
    }, [motion, reducedMotion]);

    const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
      if (
        event.propertyName === 'opacity' &&
        motion === 'exit' &&
        event.target === event.currentTarget
      ) {
        onMotionEnd?.();
      }
    };

    const motionClasses =
      motion === 'exit'
        ? ZEHN_DROPDOWN_PANEL_EXIT
        : enterActive
          ? ZEHN_DROPDOWN_PANEL_ENTER
          : ZEHN_DROPDOWN_PANEL_ENTER_FROM;

    return (
      <div
        ref={scrollable ? undefined : ref}
        onTransitionEnd={handleTransitionEnd}
        className={cn(
          'w-max max-w-full overflow-visible',
          ZEHN_DROPDOWN_PANEL_MOTION_BASE,
          motionClasses,
          surface,
          glow && ZEHN_SURFACE_GLOW,
          !scrollable && 'p-8',
          !scrollable && className,
        )}
      >
        {scrollable ? (
          <div ref={ref} className={cn('p-8', scrollClassName, className)}>
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    );
  },
);
