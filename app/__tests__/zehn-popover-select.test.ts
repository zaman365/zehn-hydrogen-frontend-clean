import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

describe('zehn popover select', () => {
  it('exports Radix Popover primitive with portal and collision padding', () => {
    const popover = readFile('app/components/ui/popover.tsx');
    expect(popover).toContain('@radix-ui/react-popover');
    expect(popover).toContain('PopoverPrimitive.Portal');
    expect(popover).toContain('collisionPadding');
  });

  it('CustomSelect uses Popover portal with menuAlign and inset focus ring', () => {
    const select = readFile('app/components/CustomSelect.tsx');
    expect(select).toContain('~/components/ui/popover');
    expect(select).toContain('Popover');
    expect(select).toContain('PopoverContent');
    expect(select).toContain('menuAlign');
    expect(select).toContain('focus-visible:ring-inset');
    expect(select).toContain('ZEHN_SELECT_CONTENT');
    expect(select).toContain('collisionPadding={8}');
    expect(select).not.toContain('handleClickOutside');
    expect(select).not.toContain('hover:scale');
  });

  it('defines ZEHN_SELECT_CONTENT and FilterSelectMenuAlign tokens', () => {
    const ui = readFile('app/lib/product-filter-ui.ts');
    expect(ui).toContain('FilterSelectMenuAlign');
    expect(ui).toContain('ZEHN_SELECT_CONTENT');
  });

  it('NavPopoverContent uses viewport collision for desktop nav dropdown (BL-0018)', () => {
    const popover = readFile('app/components/ui/popover.tsx');
    expect(popover).toContain('NavPopoverContent');
    expect(popover).toContain('collisionPadding = 16');
    expect(popover).toContain('onOpenAutoFocus');
    expect(popover).toContain('event.preventDefault()');
    expect(popover).toContain('ZEHN_NAV_POPOVER_CONTENT');
  });

  it('Header uses Radix nav popover instead of manual dropdown offset (BL-0018)', () => {
    const header = readFile('app/components/zehn/Header.tsx');
    expect(header).toContain('DesktopCategoryNavPopover');
    expect(header).toContain('isNavPopoverPointerTarget');
    expect(header).not.toContain('dropdownCenterOffset');
    expect(header).not.toContain('translateX(-50%)');
  });
});
