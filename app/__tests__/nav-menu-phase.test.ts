import {describe, expect, it} from 'vitest';
import {
  isMenuAriaExpanded,
  isMenuShellMounted,
  menuPhaseToStagger,
  shouldFreezeMobileAccordion,
  type NavMenuPhase,
} from '~/lib/nav-menu-phase';

const PHASES: NavMenuPhase[] = ['idle', 'open', 'closing'];

describe('menuPhaseToStagger — desktop', () => {
  it.each([
    ['idle', 'idle'],
    ['open', 'enter'],
    ['closing', 'exit'],
  ] as const)('%s → %s', (phase, expected) => {
    expect(menuPhaseToStagger(phase, 'desktop')).toBe(expected);
  });
});

describe('menuPhaseToStagger — mobile', () => {
  it.each([
    ['idle', 'idle'],
    ['open', 'enter'],
    ['closing', 'idle'],
  ] as const)('%s → %s', (phase, expected) => {
    expect(menuPhaseToStagger(phase, 'mobile')).toBe(expected);
  });
});

describe('isMenuShellMounted', () => {
  it.each([
    ['idle', false],
    ['open', true],
    ['closing', true],
  ] as const)('%s → %s', (phase, expected) => {
    expect(isMenuShellMounted(phase)).toBe(expected);
  });
});

describe('isMenuAriaExpanded', () => {
  it.each([
    ['idle', false],
    ['open', true],
    ['closing', true],
  ] as const)('%s → %s', (phase, expected) => {
    expect(isMenuAriaExpanded(phase)).toBe(expected);
  });
});

describe('shouldFreezeMobileAccordion', () => {
  it.each(PHASES)('only closing freezes — %s', (phase) => {
    expect(shouldFreezeMobileAccordion(phase)).toBe(phase === 'closing');
  });
});
