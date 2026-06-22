/**
 * Clear-all-filters control — matches CustomSelect h-[40px] + nav ripple (REQ-0008).
 * Clears filters immediately on click; ripple is visual-only (pointerdown).
 */
import {RotateCcw} from 'lucide-react';
import {RippleButton} from '~/components/zehn/RippleButton';
import {HEADER_NAV_COLOR} from '~/lib/header-nav-styles';
import {cn} from '~/lib/utils';

const FILTER_CLEAR_HOST =
  'h-[40px] px-4 rounded-3xl boty-shadow inline-flex items-center gap-2 text-sm font-sans ' +
  'bg-card text-foreground border border-border/50 transition-colors duration-[400ms] ease-out ' +
  'hover:bg-foreground/[0.06] active:bg-accent/10';

type FilterClearButtonProps = {
  onClick: () => void;
  className?: string;
};

export function FilterClearButton({onClick, className}: FilterClearButtonProps) {
  return (
    <RippleButton
      type="button"
      onClick={onClick}
      className={cn(FILTER_CLEAR_HOST, HEADER_NAV_COLOR, className)}
      aria-label="Filter zurücksetzen"
    >
      <RotateCcw className="w-4 h-4 shrink-0 text-foreground/50" aria-hidden />
      <span className="hidden xl:inline">Filter zurücksetzen</span>
      <span className="xl:hidden">Zurücksetzen</span>
    </RippleButton>
  );
}
