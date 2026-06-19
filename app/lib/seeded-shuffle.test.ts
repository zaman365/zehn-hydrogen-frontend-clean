import {describe, expect, it} from 'vitest';
import {shuffleWithSeed} from './seeded-shuffle';

describe('shuffleWithSeed', () => {
  it('keeps every item when using the cargo-shorts seed', () => {
    const products = Array.from({length: 8}, (_, index) => ({
      id: `product-${index}`,
    }));

    const shuffled = shuffleWithSeed(products, 'cargo-shorts');

    expect(shuffled).toHaveLength(products.length);
    expect(shuffled).not.toContain(undefined);
    expect(shuffled.map((product) => product.id).sort()).toEqual(
      products.map((product) => product.id).sort(),
    );
  });

  it('returns the same order for the same seed', () => {
    const products = ['one', 'two', 'three', 'four'];

    expect(shuffleWithSeed(products, 'cargo-shorts')).toEqual(
      shuffleWithSeed(products, 'cargo-shorts'),
    );
  });
});
