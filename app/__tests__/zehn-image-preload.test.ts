/**
 * UNIT TESTS — zehn-image-preload.ts (BL-0020).
 */
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {scopedImagePreload} from '~/lib/zehn-image-preload';
import {markImageCached} from '~/lib/zehn-image-cache';

type MockLink = {
  tagName: string;
  rel: string;
  as: string;
  href: string;
  attrs: Map<string, string>;
  parentNode: {removeChild: (node: MockLink) => void} | null;
  setAttribute: (name: string, value: string) => void;
  getAttribute: (name: string) => string | null;
};

function createMockDocument() {
  const headLinks: MockLink[] = [];

  const head = {
    appendChild(link: MockLink) {
      headLinks.push(link);
      link.parentNode = {
        removeChild(node: MockLink) {
          const idx = headLinks.indexOf(node);
          if (idx >= 0) headLinks.splice(idx, 1);
          node.parentNode = null;
        },
      };
    },
    links: headLinks,
  };

  const document = {
    head,
    /** Minimal querySelector — supports `link[rel="preload"][href="..."]` used by dedup check. */
    querySelector(selector: string): MockLink | null {
      const hrefMatch = selector.match(/\[href="([^"]+)"\]/);
      const relMatch = selector.match(/\[rel="([^"]+)"\]/);
      const href = hrefMatch?.[1];
      const rel = relMatch?.[1];
      return (
        headLinks.find(
          (l) => (!rel || l.rel === rel) && (!href || l.href === href),
        ) ?? null
      );
    },
    createElement(tag: string): MockLink {
      const attrs = new Map<string, string>();
      const link: MockLink = {
        tagName: tag.toUpperCase(),
        rel: '',
        as: '',
        href: '',
        attrs,
        parentNode: null,
        setAttribute(name: string, value: string) {
          attrs.set(name, value);
        },
        getAttribute(name: string) {
          return attrs.get(name) ?? null;
        },
      };
      return link;
    },
  };

  return {document, headLinks};
}

describe('scopedImagePreload', () => {
  let headLinks: MockLink[];

  beforeEach(() => {
    const mock = createMockDocument();
    headLinks = mock.headLinks;
    vi.stubGlobal('document', mock.document);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('injects link preload with lowercase fetchpriority', () => {
    const url = 'https://cdn.shopify.com/s/files/1/1/files/shirt.jpg?width=800';
    scopedImagePreload(url, {fetchPriority: 'high'});

    expect(headLinks).toHaveLength(1);
    const link = headLinks[0];
    expect(link.rel).toBe('preload');
    expect(link.as).toBe('image');
    expect(link.href).toBe(url);
    expect(link.getAttribute('fetchpriority')).toBe('high');
    expect(link.getAttribute('data-zehn-scoped-preload')).toBe('true');
  });

  it('cleanup removes the preload link from head', () => {
    const url = 'https://cdn.shopify.com/s/files/1/1/files/pants.jpg?width=400';
    const cleanup = scopedImagePreload(url);
    expect(headLinks).toHaveLength(1);

    cleanup();
    expect(headLinks).toHaveLength(0);
  });

  it('skips inject when URL is already cached', () => {
    const url = 'https://cdn.shopify.com/s/files/1/1/files/cached.jpg?width=600';
    markImageCached(url);

    const cleanup = scopedImagePreload(url);
    expect(headLinks).toHaveLength(0);
    expect(cleanup).toBeTypeOf('function');
    cleanup();
  });

  it('returns no-op cleanup for empty url', () => {
    const cleanup = scopedImagePreload('');
    expect(headLinks).toHaveLength(0);
    expect(() => cleanup()).not.toThrow();
  });
});
