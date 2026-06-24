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
    expect(styles).toContain('HEADER_NAV_COUNT_BADGE_DIGIT');
    expect(styles).toContain('flex items-center justify-center');
    expect(styles).toContain('tracking-normal');
    expect(styles).toContain('normal-case');
    expect(styles).toContain('leading-none');
    expect(styles).toContain('HEADER_NAV_MOBILE_LABELED_ROW_LABEL');
    expect(styles).toContain('gap-2');
    expect(styles).not.toContain('HEADER_NAV_MOBILE_ROW_WITH_TRAILING');
    expect(styles).not.toContain('HEADER_NAV_COUNT_BADGE_TRAILING_SLOT');
  });

  it('HeaderNavCountBadge supports icon, mobileRow, and trailing presets', () => {
    const badge = readFile('app/components/zehn/HeaderNavCountBadge.tsx');
    expect(badge).toContain("position = 'icon'");
    expect(badge).toContain('mobileRow');
    expect(badge).toContain('trailing');
    expect(badge).toContain('cnHeaderNavCountBadgeInline');
  });

  it('HeaderNavCountBadge uses pulse hook and hides at zero', () => {
    const badge = readFile('app/components/zehn/HeaderNavCountBadge.tsx');
    expect(badge).toContain('useNavCountBadgePulse');
    expect(badge).toContain('if (count <= 0) return null');
  });

  it('Header uses labeled drawer rows and accordion hint ref', () => {
    const header = readFile('app/components/zehn/Header.tsx');
    const labeledRow = readFile('app/components/zehn/HeaderNavMobileLabeledRow.tsx');
    expect(header).toContain('HeaderNavMobileLabeledRow');
    expect(labeledRow).toContain('position="trailing"');
    expect(header).toContain('mobileAccordionHintRef');
    expect(header).toContain('isMobileCatalogAccordionLabelActive');
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
    expect(css).toContain('transform-origin: center');
  });

  it('zehn barrel exports HeaderNavCountBadge and labeled row', () => {
    const barrel = readFile('app/components/zehn/index.ts');
    expect(barrel).toContain('HeaderNavCountBadge');
    expect(barrel).toContain('HeaderNavMobileLabeledRow');
  });

  it('app.css imports header-nav-badge styles', () => {
    const app = readFile('app/styles/app.css');
    expect(app).toContain("header-nav-badge.css");
  });
});
