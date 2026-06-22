import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  acquireScrollLock,
  getScrollLockCountForTests,
  resetScrollLockForTests,
} from '~/lib/scroll-lock';

function createDocumentElement() {
  const attrs = new Map<string, string>();
  return {
    setAttribute: (name: string, value: string) => attrs.set(name, value),
    removeAttribute: (name: string) => attrs.delete(name),
    getAttribute: (name: string) => attrs.get(name) ?? null,
    hasAttribute: (name: string) => attrs.has(name),
  };
}

describe('acquireScrollLock', () => {
  beforeEach(() => {
    const html = createDocumentElement();
    vi.stubGlobal('document', {documentElement: html});
    resetScrollLockForTests();
  });

  afterEach(() => {
    resetScrollLockForTests();
    vi.unstubAllGlobals();
  });

  it('increments ref-count and sets data attribute', () => {
    const release = acquireScrollLock();
    expect(getScrollLockCountForTests()).toBe(1);
    expect(document.documentElement.getAttribute('data-zehn-scroll-lock')).toBe(
      'true',
    );
    release();
  });

  it('nested acquire requires matching releases', () => {
    const releaseA = acquireScrollLock();
    const releaseB = acquireScrollLock();
    expect(getScrollLockCountForTests()).toBe(2);
    releaseA();
    expect(getScrollLockCountForTests()).toBe(1);
    expect(document.documentElement.getAttribute('data-zehn-scroll-lock')).toBe(
      'true',
    );
    releaseB();
    expect(getScrollLockCountForTests()).toBe(0);
    expect(
      document.documentElement.hasAttribute('data-zehn-scroll-lock'),
    ).toBe(false);
  });

  it('release is idempotent', () => {
    const release = acquireScrollLock();
    release();
    release();
    expect(getScrollLockCountForTests()).toBe(0);
  });
});
