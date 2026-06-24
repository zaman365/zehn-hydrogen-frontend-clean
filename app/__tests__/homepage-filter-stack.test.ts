import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

describe('useHomepageFilterStackOpen', () => {
  it('defaults filter stack to open', () => {
    const hook = readFile('app/hooks/useHomepageFilterStackOpen.ts');
    expect(hook).toMatch(/useState\(initialOpen\)/);
    expect(hook).toMatch(/initialOpen = true/);
  });

  it('exposes toggle and setOpen', () => {
    const hook = readFile('app/hooks/useHomepageFilterStackOpen.ts');
    expect(hook).toContain('toggle');
    expect(hook).toContain('setOpen');
    expect(hook).toMatch(/return \{open, setOpen, toggle\}/);
  });

  it('ProductFilterToolbar wires hook with default open', () => {
    const toolbar = readFile('app/components/zehn/ProductFilterToolbar.tsx');
    expect(toolbar).toContain('useProductFilterStackOpen(true)');
  });

  it('mobile filter panel uses HeaderNavIconButton ripple toggle', () => {
    const panel = readFile('app/components/zehn/HomepageMobileFilterPanel.tsx');
    expect(panel).toContain('HeaderNavIconButton');
    expect(panel).toContain('HEADER_NAV_ICON_SIZE');
  });
});
