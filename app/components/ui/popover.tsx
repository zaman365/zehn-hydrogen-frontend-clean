/**
 * Radix Popover — portaled overlay for filter/sort selects (ART-0046).
 * NavPopoverContent — desktop category hover menu with viewport collision (BL-0018).
 */
import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import {
  ZEHN_NAV_POPOVER_CONTENT,
  ZEHN_NAV_POPOVER_DATA_ATTR,
} from '~/lib/header-nav-dropdown-styles';
import {cn} from '~/lib/utils';

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  collisionPadding = 8,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          'outline-none data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export {Popover, PopoverTrigger, PopoverContent, PopoverAnchor};

/** Desktop nav hover dropdown — Radix flip/shift; no manual offset math (BL-0018). */
export function NavPopoverContent({
  className,
  side = 'bottom',
  align = 'center',
  sideOffset = 12,
  collisionPadding = 16,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverContent
      side={side}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      className={cn(ZEHN_NAV_POPOVER_CONTENT, className)}
      onOpenAutoFocus={(event) => event.preventDefault()}
      {...props}
      {...{[ZEHN_NAV_POPOVER_DATA_ATTR]: ''}}
    />
  );
}
