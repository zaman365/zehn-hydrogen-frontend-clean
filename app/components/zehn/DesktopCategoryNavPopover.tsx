/**
 * Per-item desktop catalog hover popover — Radix collision positioning (BL-0018).
 */
import type {ReactNode} from 'react';
import {
  NavPopoverContent,
  Popover,
  PopoverAnchor,
} from '~/components/ui/popover';
import {ZEHN_SURFACE_GLOW_BLEED} from '~/lib/zehn-surface-styles';
import {menuPhaseToStagger, type NavMenuPhase} from '~/lib/nav-menu-phase';
import {CategoryMenuPanel} from './CategoryMenuPanel';
import {ZehnGlassPanel} from './ZehnGlassPanel';

export type DesktopCategoryNavPopoverProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemUrl: string;
  panelKey: string;
  initialOpenSection?: string | null;
  staggerPhase: ReturnType<typeof menuPhaseToStagger>;
  categoryMenuPhase: NavMenuPhase;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onNavigate: () => void;
  onMotionEnd?: () => void;
  children: ReactNode;
};

export function DesktopCategoryNavPopover({
  open,
  onOpenChange,
  itemUrl,
  panelKey,
  initialOpenSection = null,
  staggerPhase,
  categoryMenuPhase,
  onPointerEnter,
  onPointerLeave,
  onNavigate,
  onMotionEnd,
  children,
}: DesktopCategoryNavPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={false}>
      <PopoverAnchor asChild>{children}</PopoverAnchor>
      {open ? (
        <NavPopoverContent
          id="zehn-desktop-category-menu"
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          aria-hidden={categoryMenuPhase === 'closing'}
          {...({
            inert: categoryMenuPhase === 'closing' ? true : undefined,
          } as object)}
        >
          <div className={ZEHN_SURFACE_GLOW_BLEED}>
            <ZehnGlassPanel
              scrollable
              className="w-max max-w-full"
              motion={categoryMenuPhase === 'closing' ? 'exit' : 'enter'}
              onMotionEnd={onMotionEnd}
            >
              <CategoryMenuPanel
                key={panelKey}
                onNavigate={onNavigate}
                rootSourceUrl={itemUrl}
                idPrefix="desktop-category-section"
                className="flex w-max max-w-full flex-col gap-1"
                staggerPhase={staggerPhase}
                initialOpenSection={initialOpenSection}
              />
            </ZehnGlassPanel>
          </div>
        </NavPopoverContent>
      ) : null}
    </Popover>
  );
}
