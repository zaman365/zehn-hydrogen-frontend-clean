import {describe, expect, it} from 'vitest';
import {
  getProductImagesForColor,
  imageMatchesColor,
  sortProductImagesByFilenameOrder,
} from './product-media';

const image = (fileName: string) => ({
  url: `https://cdn.shopify.com/s/files/1/products/${fileName}`,
  altText: null,
});

describe('product media color matching', () => {
  it('matches compound indigo colors exactly', () => {
    expect(
      imageMatchesColor(
        image('JEANS-HOSE-RIVET-INDIGO-DARK-1.jpg'),
        'Indigo Dark',
      ),
    ).toBe(true);

    expect(
      imageMatchesColor(
        image('JEANS-HOSE-RIVET-INDIGO-MEDIUM-1.jpg'),
        'Indigo Dark',
      ),
    ).toBe(false);

    expect(
      imageMatchesColor(
        image('JEANS-HOSE-RIVET-INDIGO-OD-1.jpg'),
        'Indigo Dark',
      ),
    ).toBe(false);
  });

  it('does not let a plain color token match compound color variants', () => {
    expect(
      imageMatchesColor(
        image('JEANS-HOSE-RIVET-INDIGO-DARK-1.jpg'),
        'Indigo',
      ),
    ).toBe(false);
  });

  it('does not let khaki match american khaki images', () => {
    expect(
      imageMatchesColor(
        image('SHORTS-CARGO-SHORTS-TRAVERSE-AMERICAN-KHAKI-1.jpg'),
        'Khaki',
      ),
    ).toBe(false);

    expect(
      imageMatchesColor(
        image('SHORTS-CARGO-SHORTS-TRAVERSE-KHAKI-1.jpg'),
        'Khaki',
      ),
    ).toBe(true);
  });

  it('sorts numbered images before the base filename', () => {
    const sorted = sortProductImagesByFilenameOrder([
      image('JEANS-HOSE-RIVET-INDIGO-DARK.jpg'),
      image('JEANS-HOSE-RIVET-INDIGO-DARK-3.jpg'),
      image('JEANS-HOSE-RIVET-INDIGO-DARK-1.jpg'),
      image('JEANS-HOSE-RIVET-INDIGO-DARK-2.jpg'),
    ]);

    expect(sorted.map((item) => item.url.split('/').pop())).toEqual([
      'JEANS-HOSE-RIVET-INDIGO-DARK-1.jpg',
      'JEANS-HOSE-RIVET-INDIGO-DARK-2.jpg',
      'JEANS-HOSE-RIVET-INDIGO-DARK-3.jpg',
      'JEANS-HOSE-RIVET-INDIGO-DARK.jpg',
    ]);
  });

  it('groups generic numbered media by nearest color variant image', () => {
    const product = {
      featuredImage: image('RivetJeans252.jpg'),
      media: {
        nodes: [
          {image: image('RivetJeans252.jpg')},
          {image: image('RivetJeans242.jpg')},
          {image: image('RivetJeans243.jpg')},
          {image: image('RivetJeans263.jpg')},
          {image: image('RivetJeans268.jpg')},
          {image: image('RivetJeans208.jpg')},
          {image: image('RivetJeans217.jpg')},
          {image: image('RivetJeans230.jpg')},
          {image: image('RivetJeans206.jpg')},
          {image: image('RivetJeans271.jpg')},
          {image: image('RivetJeans273.jpg')},
          {image: image('RivetJeans304.jpg')},
        ],
      },
      options: [
        {
          name: 'Color',
          optionValues: [
            {name: 'Indigo Dark'},
            {name: 'Indigo Medium'},
            {name: 'Indigo OD'},
          ],
        },
      ],
      variants: {
        nodes: [
          {
            selectedOptions: [{name: 'Color', value: 'Indigo Dark'}],
            image: image('RivetJeans208.jpg'),
          },
          {
            selectedOptions: [{name: 'Color', value: 'Indigo Medium'}],
            image: image('RivetJeans273.jpg'),
          },
          {
            selectedOptions: [{name: 'Color', value: 'Indigo OD'}],
            image: image('RivetJeans242.jpg'),
          },
        ],
      },
    };

    expect(
      getProductImagesForColor({
        product,
        colorValue: 'Indigo Dark',
        selectedVariant: product.variants.nodes[0],
      }).map((item) => item.url.split('/').pop()),
    ).toEqual([
      'RivetJeans208.jpg',
      'RivetJeans217.jpg',
      'RivetJeans230.jpg',
      'RivetJeans206.jpg',
    ]);

    expect(
      getProductImagesForColor({
        product,
        colorValue: 'Indigo Medium',
        selectedVariant: product.variants.nodes[1],
      }).map((item) => item.url.split('/').pop()),
    ).toEqual([
      'RivetJeans273.jpg',
      'RivetJeans271.jpg',
      'RivetJeans304.jpg',
    ]);

    expect(
      getProductImagesForColor({
        product,
        colorValue: 'Indigo OD',
        selectedVariant: product.variants.nodes[2],
      }).map((item) => item.url.split('/').pop()),
    ).toEqual([
      'RivetJeans242.jpg',
      'RivetJeans252.jpg',
      'RivetJeans243.jpg',
      'RivetJeans263.jpg',
      'RivetJeans268.jpg',
    ]);
  });
});
