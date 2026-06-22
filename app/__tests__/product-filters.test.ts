import {describe, expect, it} from 'vitest';
import {
  formatPantSizeLabel,
  getProductOptionValues,
} from '~/lib/product-filters';

describe('formatPantSizeLabel', () => {
  it('formats waist + length as 28W / 30L', () => {
    expect(formatPantSizeLabel('28', '30')).toBe('28W / 30L');
    expect(formatPantSizeLabel('28W', '30L')).toBe('28W / 30L');
  });
});

describe('getProductOptionValues size', () => {
  it('keeps Shopify Size option labels like 28W / 30L', () => {
    const product = {
      options: [
        {
          name: 'Size',
          optionValues: [{name: '28W / 30L'}, {name: '30W / 32L'}],
        },
      ],
      variants: {
        nodes: [
          {
            selectedOptions: [
              {name: 'Size', value: '28W / 30L'},
              {name: 'Color', value: 'Schwarz'},
            ],
          },
        ],
      },
    };

    expect(getProductOptionValues(product, 'size')).toEqual([
      '28W / 30L',
      '30W / 32L',
    ]);
  });

  it('builds composite waist/length when Size option is absent', () => {
    const product = {
      options: [],
      variants: {
        nodes: [
          {
            selectedOptions: [
              {name: 'Waist', value: '28'},
              {name: 'Length', value: '30'},
            ],
          },
        ],
      },
    };

    expect(getProductOptionValues(product, 'size')).toEqual(['28W / 30L']);
  });
});
