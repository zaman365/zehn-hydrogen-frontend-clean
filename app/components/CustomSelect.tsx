import {useState} from 'react';
import {ChevronDown, type LucideIcon} from 'lucide-react';
import {Popover, PopoverContent, PopoverTrigger} from '~/components/ui/popover';
import {cn} from '~/lib/utils';
import {
  FILTER_SELECT_TRIGGER,
  ZEHN_SELECT_CONTENT,
  type FilterSelectMenuAlign,
  type FilterSelectOption,
} from '~/lib/product-filter-ui';
import {ZEHN_SCROLL_EDGE, ZEHN_SELECT_LIST_SCROLL} from '~/lib/zehn-scrollbar-styles';

export type CustomSelectLayout = 'default' | 'filter';

export type CustomSelectDropdownWidth = 'trigger' | 'content';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  placeholder?: string;
  className?: string;
  /** Optional lead icon — collection filters or sort trigger. */
  icon?: LucideIcon;
  /** filter = centered 3-col trigger; default = sort/legacy left-align. */
  layout?: CustomSelectLayout;
  /** trigger = match trigger width; content = fit option labels (sort). */
  dropdownWidth?: CustomSelectDropdownWidth;
  /** Popover horizontal align — sort uses end (right-edge triggers). */
  menuAlign?: FilterSelectMenuAlign;
}

/** Shared pill trigger — matches Preis/Größe/Farbe facets (ART-0047). */
const SELECT_TRIGGER_BASE =
  'w-full appearance-none bg-card text-foreground rounded-3xl boty-shadow ' +
  'cursor-pointer font-sans transition-colors duration-200 hover:bg-card/90';

const TRIGGER_FOCUS =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/20';

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  icon: LeadIcon,
  layout = 'default',
  dropdownWidth = 'trigger',
  menuAlign = 'start',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isFilterLayout = layout === 'filter' && Boolean(LeadIcon);
  const isContentWidth = dropdownWidth === 'content';

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;
  const TriggerIcon = LeadIcon ?? selectedOption?.icon;

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className={cn('relative min-w-0', className)}>
        <PopoverTrigger asChild>
          <button
            type="button"
            title={displayLabel}
            aria-expanded={isOpen}
            className={cn(
              SELECT_TRIGGER_BASE,
              TRIGGER_FOCUS,
              isFilterLayout
                ? FILTER_SELECT_TRIGGER
                : cn(
                    'h-[40px] text-sm text-left flex items-center pl-5 pr-10 relative',
                    TriggerIcon && 'pl-4 pr-10 gap-2.5',
                  ),
            )}
          >
            {isFilterLayout && LeadIcon ? (
              <>
                <LeadIcon
                  className="w-4 h-4 justify-self-start text-foreground/50"
                  aria-hidden
                />
                <span className="min-w-0 text-xs xl:text-sm text-center leading-tight truncate">
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
                {TriggerIcon && (
                  <TriggerIcon
                    className="w-4 h-4 shrink-0 text-foreground/50"
                    aria-hidden
                  />
                )}
                <span className="min-w-0 flex-1 whitespace-nowrap">
                  {displayLabel}
                </span>
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
        </PopoverTrigger>

        <PopoverContent
          align={menuAlign}
          side="bottom"
          collisionPadding={8}
          className={cn(
            ZEHN_SELECT_CONTENT,
            'overflow-x-hidden',
            isContentWidth
              ? 'min-w-[var(--radix-popover-trigger-width)] w-max max-w-[min(calc(100vw-1rem),22rem)]'
              : 'w-[var(--radix-popover-trigger-width)] p-0',
          )}
        >
          <div className={cn(ZEHN_SELECT_LIST_SCROLL, ZEHN_SCROLL_EDGE)}>
            {options.map((option) => {
              const OptionIcon = option.icon;
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full text-left px-4 py-3 text-sm font-medium transition-all duration-150',
                    'whitespace-normal leading-snug flex items-start gap-2.5',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-primary/10 hover:text-primary',
                  )}
                >
                  {OptionIcon && (
                    <OptionIcon
                      className={cn(
                        'w-4 h-4 shrink-0 mt-0.5',
                        isSelected
                          ? 'text-primary-foreground'
                          : 'text-foreground/50',
                      )}
                      aria-hidden
                    />
                  )}
                  <span className="min-w-0">{option.label}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
}
