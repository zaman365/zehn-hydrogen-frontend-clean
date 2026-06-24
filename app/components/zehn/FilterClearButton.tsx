/**
 * Clear-all-filters control — matches CustomSelect h-[40px] or compact h-8 chip row (REQ-0008 / BL-0013).
 * Clears filters immediately on click; ripple is visual-only (pointerdown).
 */
import {RotateCcw} from 'lucide-react';
import {RippleButton} from '~/components/zehn/RippleButton';
import {HEADER_NAV_COLOR} from '~/lib/header-nav-styles';
import {PRODUCT_FILTER_CLEAR_CHIP} from '~/lib/product-filter-ui';
import {cn} from '~/lib/utils';

const FILTER_CLEAR_HOST_DEFAULT =
  'h-[40px] px-4 rounded-3xl boty-shadow inline-flex items-center gap-2 text-sm font-sans ' +
  'bg-card text-foreground border border-border/50 transition-colors duration-[400ms] ease-out ' +
  'hover:bg-foreground/[0.06] active:bg-accent/10';

type FilterClearButtonProps = {
  onClick: () => void;
  /** default = facet row / mobile; compact = desktop active-chip row (h-8). */
  size?: 'default' | 'compact';
  className?: string;
};

export function FilterClearButton({
  onClick,
  size = 'default',
  className,
}: FilterClearButtonProps) {
  const hostClass =
    size === 'compact' ? PRODUCT_FILTER_CLEAR_CHIP : FILTER_CLEAR_HOST_DEFAULT;

  return (
    <RippleButton
      type="button"
      onClick={onClick}
      className={cn(hostClass, HEADER_NAV_COLOR, className)}
      aria-label="Filter zurücksetzen"
    >
      <RotateCcw className="w-4 h-4 shrink-0 text-foreground/50" aria-hidden />
      <span className="hidden xl:inline">Filter zurücksetzen</span>
      <span className="xl:hidden">Zurücksetzen</span>
    </RippleButton>
  );
}
