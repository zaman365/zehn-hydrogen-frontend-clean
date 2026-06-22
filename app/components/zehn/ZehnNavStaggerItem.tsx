/**
 * Single nav row wrapper — stagger delay from index + phase (REQ-0008).
 */
import {useEffect, useState, type ReactNode} from 'react';
import {usePrefersReducedMotion} from '~/hooks/usePrefersReducedMotion';
import {
  cnNavStaggerItem,
  getNavStaggerDelayMs,
  type NavStaggerPhase,
} from '~/lib/nav-stagger-motion';
import {cn} from '~/lib/utils';

export type ZehnNavStaggerItemProps = {
  index: number;
  total: number;
  phase: NavStaggerPhase;
  className?: string;
  children: ReactNode;
};

export function ZehnNavStaggerItem({
  index,
  total,
  phase,
  className,
  children,
}: ZehnNavStaggerItemProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [enterReady, setEnterReady] = useState(
    phase !== 'enter' || reducedMotion,
  );

  useEffect(() => {
    if (phase !== 'enter' || reducedMotion) {
      setEnterReady(true);
      return;
    }
    setEnterReady(false);
    const id = requestAnimationFrame(() => setEnterReady(true));
    return () => cancelAnimationFrame(id);
  }, [phase, reducedMotion, index]);

  const delayMs = getNavStaggerDelayMs(
    index,
    total,
    phase,
    reducedMotion,
  );

  const motionClasses = cnNavStaggerItem(
    phase,
    phase !== 'enter' || enterReady,
    reducedMotion,
  );

  return (
    <div
      className={cn(motionClasses, className)}
      style={{
        transitionDelay: reducedMotion ? '0ms' : `${delayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
