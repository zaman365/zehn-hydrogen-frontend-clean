import { useState, useRef, useEffect } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '~/lib/utils';
import { FILTER_SELECT_TRIGGER } from '~/lib/product-filter-ui';
import { ZEHN_SCROLL_EDGE, ZEHN_SELECT_LIST_SCROLL } from '~/lib/zehn-scrollbar-styles';

interface Option {
  value: string;
  label: string;
}

export type CustomSelectLayout = 'default' | 'filter';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  /** Optional lead icon — collection filters (Euro, Ruler, Palette). */
  icon?: LucideIcon;
  /** filter = centered 3-col trigger; default = sort/legacy left-align. */
  layout?: CustomSelectLayout;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  icon: LeadIcon,
  layout = 'default',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isFilterLayout = layout === 'filter' && Boolean(LeadIcon);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  return (
    <div
      ref={dropdownRef}
      className={cn('relative', isOpen && 'z-20', className)}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={displayLabel}
        className={cn(
          'w-full appearance-none bg-card text-foreground rounded-3xl boty-shadow',
          'cursor-pointer focus:outline-none focus:ring-2 focus:ring-foreground/20 font-sans',
          'transition-colors duration-200 whitespace-nowrap',
          isFilterLayout
            ? cn(FILTER_SELECT_TRIGGER, 'hover:bg-card/90')
            : cn(
                'h-[40px] text-sm text-left flex items-center pl-5 pr-10',
                'transition-all duration-200 hover:scale-[1.02]',
                LeadIcon && 'pl-4 pr-10 gap-2.5',
              ),
        )}
      >
        {isFilterLayout && LeadIcon ? (
          <>
            <LeadIcon
              className="w-4 h-4 justify-self-start text-foreground/50"
              aria-hidden
            />
            <span className="min-w-0 text-xs xl:text-sm text-left leading-tight whitespace-nowrap">
              {displayLabel}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 justify-self-end text-foreground/50 transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
              aria-hidden
            />
          </>
        ) : (
          <>
            {LeadIcon && (
              <LeadIcon className="w-4 h-4 shrink-0 text-foreground/50" aria-hidden />
            )}
            <span className="truncate min-w-0 flex-1">{displayLabel}</span>
            <ChevronDown
              className={cn(
                'absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 transition-transform duration-200',
                isOpen && 'rotate-180',
              )}
              aria-hidden
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-card rounded-3xl boty-shadow overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={cn(ZEHN_SELECT_LIST_SCROLL, ZEHN_SCROLL_EDGE)}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-5 py-3 text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                option.value === value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-primary/10 hover:text-primary'
              }`}
            >
              {option.label}
            </button>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
