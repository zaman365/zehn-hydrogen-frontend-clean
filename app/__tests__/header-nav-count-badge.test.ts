import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');

function readFile(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8');
}

describe('header nav count badge', () => {
  it('exports medium badge tokens with ring and readable type', () => {
    const styles = readFile('app/lib/header-nav-styles.ts');
    expect(styles).toContain('HEADER_NAV_COUNT_BADGE');
    expect(styles).toContain('HEADER_NAV_COUNT_BADGE_RING');
    expect(styles).toContain('ring-white/40');
    expect(styles).toContain('HEADER_NAV_COUNT_BADGE_POSITION_MOBILE_ROW');
    expect(styles).toContain('grid place-items-center size-4');
    expect(styles).toContain('text-[10px]');
    expect(styles).toContain('cnHeaderNavCountBadge');
  });

  it('HeaderNavCountBadge supports icon and mobileRow position presets', () => {
    const badge = readFile('app/components/zehn/HeaderNavCountBadge.tsx');
    expect(badge).toContain("position = 'icon'");
    expect(badge).toContain('mobileRow');
    expect(badge).toContain('HEADER_NAV_COUNT_BADGE_POSITION_MOBILE_ROW');
  });

  it('HeaderNavCountBadge uses pulse hook and hides at zero', () => {
    const badge = readFile('app/components/zehn/HeaderNavCountBadge.tsx');
    expect(badge).toContain('useNavCountBadgePulse');
    expect(badge).toContain('if (count <= 0) return null');
  });

  it('Header uses HeaderNavCountBadge and optimistic cart count', () => {
    const header = readFile('app/components/zehn/Header.tsx');
    expect(header).toContain('HeaderNavCountBadge');
    expect(header).toContain('position="mobileRow"');
    expect(header).toContain('overflow-visible');
    expect(header).toContain('useHeaderCartCount');
    expect(header).not.toContain('function CountBadge');
  });

  it('useHeaderCartCount wraps useOptimisticCart inside Await', () => {
    const hook = readFile('app/hooks/useHeaderCartCount.ts');
    expect(hook).toContain('useOptimisticCart');
    expect(hook).toContain('useAsyncValue');
  });

  it('header-nav-badge.css defines single-play pulse keyframes', () => {
    const css = readFile('app/styles/header-nav-badge.css');
    expect(css).toContain('zehn-nav-badge-pulse');
    expect(css).toContain('prefers-reduced-motion');
  });

  it('zehn barrel exports HeaderNavCountBadge', () => {
    const barrel = readFile('app/components/zehn/index.ts');
    expect(barrel).toContain('HeaderNavCountBadge');
    expect(barrel).toContain('HeaderNavCountBadgeProps');
  });

  it('app.css imports header-nav-badge styles', () => {
    const app = readFile('app/styles/app.css');
    expect(app).toContain("header-nav-badge.css");
  });
});
