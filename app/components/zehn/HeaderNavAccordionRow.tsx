/**
 * Mobile accordion row — label Link navigates; chevron button toggles sub-panel only.
 * REQ-0008: split tap targets so users can reach collection pages without expanding.
 */
import {ChevronDown} from 'lucide-react';
import type {LinkProps} from 'react-router';
import {Link} from 'react-router';
import {
  cnHeaderNavDropdownLink,
  cnHeaderNavIconHost,
  HEADER_NAV_ACCORDION_ROW,
  HEADER_NAV_ICON_SIZE,
  HEADER_NAV_ICON_STROKE,
} from '~/lib/header-nav-styles';
import {cn} from '~/lib/utils';

export type HeaderNavAccordionRowProps = {
  to: string;
  label: string;
  isOpen: boolean;
  isRouteActive?: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  ariaControls: string;
  prefetch?: LinkProps['prefetch'];
};

export function HeaderNavAccordionRow({
  to,
  label,
  isOpen,
  isRouteActive = false,
  onToggle,
  onNavigate,
  ariaControls,
  prefetch = 'intent',
}: HeaderNavAccordionRowProps) {
  const rowActive = isRouteActive || isOpen;

  return (
    <div className={HEADER_NAV_ACCORDION_ROW}>
      <Link
        to={to}
        prefetch={prefetch}
        onClick={onNavigate}
        className={cn(
          cnHeaderNavDropdownLink({active: rowActive}),
          'flex min-h-[44px] flex-1 items-center',
        )}
      >
        {label}
      </Link>
      <button
        type="button"
        onClick={onToggle}
        className={cnHeaderNavIconHost({active: isOpen})}
        aria-expanded={isOpen}
        aria-controls={ariaControls}
        aria-label={`Kategorien für ${label}`}
      >
        <ChevronDown
          className={cn(
            HEADER_NAV_ICON_SIZE,
            'transition-transform duration-300',
            isOpen && 'rotate-180',
          )}
          strokeWidth={HEADER_NAV_ICON_STROKE}
          aria-hidden
        />
      </button>
    </div>
  );
}
