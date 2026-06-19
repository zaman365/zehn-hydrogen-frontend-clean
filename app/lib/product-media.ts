type ProductImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type ProductImageInput = Omit<ProductImage, 'url'> & {
  url?: string | null;
};

const colorFilenameAliases: Record<string, string[]> = {
  'american-khaki': ['american-khaki'],
  beige: ['beige'],
  blau: ['blau', 'blue', 'navy', 'marineblau', 'nightwatch-blue'],
  blue: ['blue', 'blau', 'navy', 'marineblau', 'nightwatch-blue'],
  braun: ['braun', 'brown', 'otter', 'coffee'],
  brown: ['brown', 'braun', 'otter', 'coffee'],
  coffee: ['coffee', 'brown', 'braun'],
  grau: ['grau', 'gray', 'grey', 'slate', 'slade'],
  gray: ['gray', 'grey', 'grau', 'slate', 'slade'],
  grey: ['grey', 'gray', 'grau', 'slate', 'slade'],
  gruen: ['gruen', 'green', 'olive'],
  green: ['green', 'gruen', 'olive'],
  'indigo-dark': ['indigo-dark'],
  'indigo-medium': ['indigo-medium'],
  'indigo-od': ['indigo-od'],
  khaki: ['khaki'],
  marineblau: [
    'marineblau',
    'marine-blue',
    'navy',
    'navy-blue',
    'nightwatch-blue',
    'nightwatch',
  ],
  'marine-blue': [
    'marine-blue',
    'marineblau',
    'navy',
    'nightwatch-blue',
    'nightwatch',
  ],
  navy: ['navy', 'navy-blue', 'marineblau', 'nightwatch-blue', 'nightwatch'],
  'nightwatch-blue': [
    'nightwatch-blue',
    'nightwatch',
    'marineblau',
    'navy',
    'blue',
  ],
  olivgruen: ['olivgruen', 'olivgrun', 'olive', 'green'],
  olivgrun: ['olivgruen', 'olivgrun', 'olive', 'green'],
  olive: ['olive', 'green', 'gruen', 'olivgruen', 'olivgrun'],
  otter: ['otter', 'brown', 'braun'],
  schwarz: ['schwarz', 'black', 'slade'],
  black: ['black', 'schwarz', 'slade'],
  'shadow-olive': ['shadow-olive', 'olive'],
  slade: ['slade', 'slate', 'black', 'schwarz', 'grau'],
  slate: ['slate', 'slade', 'gray', 'grey', 'grau'],
  weiss: ['weiss', 'wei', 'white'],
  white: ['white', 'weiss', 'wei'],
};

const decodeProductMediaToken = (value?: string | null) => {
  try {
    return decodeURIComponent(value || '');
  } catch {
    return value || '';
  }
};

export const normalizeProductMediaToken = (value?: string | null) =>
  decodeProductMediaToken(value)
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\.[a-z0-9]+(?:\?.*)?$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

export const isColorOptionName = (name?: string | null) => {
  const optionName = normalizeProductMediaToken(name);
  return optionName === 'color' || optionName === 'colour' || optionName === 'farbe';
};

export const getVariantColorValue = (variant: any) =>
  variant?.selectedOptions?.find((option: any) =>
    isColorOptionName(option?.name),
  )?.value;

export const colorValuesMatch = (
  left?: string | null,
  right?: string | null,
) => normalizeProductMediaToken(left) === normalizeProductMediaToken(right);

const getImageSearchTokens = (image: ProductImageInput) => {
  const url = image?.url || '';
  const fileName = url.split('/').pop()?.split('?')[0] || url;

  return [
    normalizeProductMediaToken(fileName),
    ...url.split('/').map((part) => normalizeProductMediaToken(part)),
    normalizeProductMediaToken(image?.altText || ''),
  ].filter(Boolean);
};

const getColorSearchTerms = (colorValue: string) => {
  const normalizedColor = normalizeProductMediaToken(colorValue);
  const compactColor = normalizedColor.replace(/-/g, '');
  const aliases = colorFilenameAliases[normalizedColor] || [];

  return Array.from(
    new Set(
      [normalizedColor, compactColor, ...aliases]
        .map((term) => normalizeProductMediaToken(term))
        .filter(Boolean),
    ),
  );
};

const tokenContainsWholeColor = (imageToken: string, colorToken: string) => {
  if (!imageToken || !colorToken) return false;

  if (colorToken === 'khaki' && imageToken.includes('american-khaki')) {
    return false;
  }

  if (colorToken === 'indigo') {
    const pattern = new RegExp(
      `(^|-)${colorToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:-\\d+)?$`,
    );

    return pattern.test(imageToken);
  }

  const pattern = new RegExp(
    `(^|-)${colorToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:-|$)`,
  );

  return pattern.test(imageToken);
};

export const imageMatchesColor = (
  image: ProductImageInput | null | undefined,
  colorValue: string,
) => {
  if (!colorValue || !image) return false;

  const imageTokens = getImageSearchTokens(image);
  const searchTerms = getColorSearchTerms(colorValue);

  return searchTerms.some((term) =>
    imageTokens.some((imageToken) => tokenContainsWholeColor(imageToken, term)),
  );
};

export const pushUniqueImage = (
  images: ProductImage[],
  image?: ProductImageInput | null,
) => {
  if (!image?.url) return;
  if (!images.some((existing) => existing.url === image.url)) {
    images.push({...image, url: image.url});
  }
};

const getProductImageSortValue = (image: ProductImageInput) => {
  const url = image?.url || '';
  const fileName = normalizeProductMediaToken(
    url.split('/').pop()?.split('?')[0] || url,
  );
  const match = fileName.match(/-(\d+)$/);

  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const getProductImageFilename = (image: ProductImageInput) => {
  const url = image?.url || '';
  return url.split('/').pop()?.split('?')[0] || url;
};

const getTrailingFilenameNumber = (image: ProductImageInput) => {
  const fileName = normalizeProductMediaToken(getProductImageFilename(image));
  const match = fileName.match(/(\d+)$/);

  return match ? Number(match[1]) : null;
};

const getNormalizedFilenamePrefix = (image: ProductImageInput) => {
  const fileName = normalizeProductMediaToken(getProductImageFilename(image));
  const tokens = fileName.split('-').filter(Boolean);

  while (
    tokens.length > 1 &&
    (/^[a-f0-9]{8,}$/i.test(tokens[tokens.length - 1]) ||
      /^\d+$/.test(tokens[tokens.length - 1]) ||
      /^r\d+$/i.test(tokens[tokens.length - 1]))
  ) {
    tokens.pop();
  }

  if (tokens.length) {
    tokens[tokens.length - 1] = tokens[tokens.length - 1].replace(/\d+$/g, '');
  }

  return tokens.join('-').replace(/^-+|-+$/g, '');
};

const getColorOptionValues = (product: any) =>
  product?.options
    ?.find((option: any) => isColorOptionName(option?.name))
    ?.optionValues?.map((value: any) => value?.name)
    .filter(Boolean) || [];

const getVariantImagesForColor = (product: any, colorValue: string) => {
  const images: ProductImage[] = [];

  product?.variants?.nodes
    ?.filter((variant: any) =>
      colorValuesMatch(getVariantColorValue(variant), colorValue),
    )
    .forEach((variant: any) => pushUniqueImage(images, variant?.image));

  product?.adjacentVariants
    ?.filter((variant: any) =>
      colorValuesMatch(getVariantColorValue(variant), colorValue),
    )
    .forEach((variant: any) => pushUniqueImage(images, variant?.image));

  product?.options
    ?.filter((option: any) => isColorOptionName(option?.name))
    .forEach((option: any) => {
      option?.optionValues
        ?.filter((value: any) => colorValuesMatch(value?.name, colorValue))
        .forEach((value: any) =>
          pushUniqueImage(images, value?.firstSelectableVariant?.image),
        );
    });

  return images;
};

const getImagesByVariantFilenamePrefix = ({
  product,
  colorValue,
  selectedVariant,
  allImages,
}: {
  product: any;
  colorValue: string;
  selectedVariant?: any;
  allImages: ProductImage[];
}) => {
  const [anchorImage] = getVariantImagesForColor(product, colorValue);
  const selectedImage = selectedVariant?.image || anchorImage;
  const selectedPrefix = selectedImage
    ? getNormalizedFilenamePrefix(selectedImage)
    : '';

  if (!selectedPrefix || selectedPrefix.length < 4) return [];

  const colorValues = getColorOptionValues(product);
  const siblingPrefixes = new Set(
    colorValues
      .filter((value: string) => !colorValuesMatch(value, colorValue))
      .map((value: string) => {
        const [image] = getVariantImagesForColor(product, value);
        return image ? getNormalizedFilenamePrefix(image) : '';
      })
      .filter(Boolean),
  );

  if (siblingPrefixes.has(selectedPrefix)) return [];

  const images: ProductImage[] = [];
  allImages
    .filter((image) => getNormalizedFilenamePrefix(image) === selectedPrefix)
    .forEach((image) => pushUniqueImage(images, image));

  return images;
};

const getImagesByVariantNumberProximity = ({
  product,
  colorValue,
  selectedVariant,
  allImages,
}: {
  product: any;
  colorValue: string;
  selectedVariant?: any;
  allImages: ProductImage[];
}) => {
  const colorValues = getColorOptionValues(product);
  const anchors = colorValues
    .map((value: string) => {
      const [image] = getVariantImagesForColor(product, value);
      const number = image ? getTrailingFilenameNumber(image) : null;
      const index = image
        ? allImages.findIndex((candidate) => candidate.url === image.url)
        : -1;

      return image?.url && number !== null && index >= 0
        ? {colorValue: value, image, number, index}
        : null;
    })
    .filter(Boolean) as Array<{
    colorValue: string;
    image: ProductImage;
    number: number;
    index: number;
  }>;

  const uniqueAnchorNumbers = new Set(anchors.map((anchor) => anchor.number));
  if (anchors.length < 2 || uniqueAnchorNumbers.size !== anchors.length) {
    return [];
  }
  anchors.sort((left, right) => left.index - right.index);

  const selectedAnchor = anchors.find((anchor) =>
    colorValuesMatch(anchor.colorValue, colorValue),
  );
  if (!selectedAnchor) return [];

  const images = allImages
    .map((image, index) => ({
      image,
      index,
      number: getTrailingFilenameNumber(image),
    }))
    .filter(
      (entry): entry is {image: ProductImage; index: number; number: number} =>
        entry.number !== null,
    )
    .filter((entry) => {
      const previousAnchors = anchors.filter((anchor) => anchor.index <= entry.index);
      const nextAnchors = anchors.filter((anchor) => anchor.index >= entry.index);
      const previousAnchor = previousAnchors.at(-1);
      const nextAnchor = nextAnchors[0];

      const closestAnchor =
        previousAnchor && nextAnchor
          ? Math.abs(entry.number - previousAnchor.number) <=
            Math.abs(entry.number - nextAnchor.number)
            ? previousAnchor
            : nextAnchor
          : previousAnchor || nextAnchor;

      return closestAnchor
        ? colorValuesMatch(closestAnchor.colorValue, colorValue)
        : false;
    })
    .sort((left, right) => {
      const selectedImageUrl = selectedVariant?.image?.url || selectedAnchor.image.url;
      if (left.image.url === selectedImageUrl) return -1;
      if (right.image.url === selectedImageUrl) return 1;

      return left.index - right.index;
    })
    .map((entry) => entry.image);

  const uniqueImages: ProductImage[] = [];
  images.forEach((image) => pushUniqueImage(uniqueImages, image));

  return uniqueImages;
};

export const sortProductImagesByFilenameOrder = <T extends ProductImageInput>(
  images: T[],
) =>
  [...images].sort((left, right) => {
    const sortDiff = getProductImageSortValue(left) - getProductImageSortValue(right);
    if (sortDiff !== 0) return sortDiff;

    return String(left?.url || '').localeCompare(String(right?.url || ''), 'de', {
      numeric: true,
      sensitivity: 'base',
    });
  });

export const getProductMediaImages = (product: any) => {
  const images: ProductImage[] = [];

  ((product as any)?.media?.nodes || []).forEach((mediaNode: any) =>
    pushUniqueImage(images, mediaNode?.image),
  );

  return images;
};

export const getAllProductImages = (product: any, selectedVariant?: any) => {
  const images: ProductImage[] = [];

  pushUniqueImage(images, product?.featuredImage);
  getProductMediaImages(product).forEach((image: ProductImage) =>
    pushUniqueImage(images, image),
  );
  pushUniqueImage(images, selectedVariant?.image);
  product?.adjacentVariants?.forEach((variant: any) =>
    pushUniqueImage(images, variant?.image),
  );
  product?.variants?.nodes?.forEach((variant: any) =>
    pushUniqueImage(images, variant?.image),
  );
  product?.options?.forEach((option: any) => {
    option?.optionValues?.forEach((value: any) =>
      pushUniqueImage(images, value?.firstSelectableVariant?.image),
    );
  });

  return images;
};

export const getProductImagesForColor = ({
  product,
  colorValue,
  selectedVariant,
}: {
  product: any;
  colorValue?: string | null;
  selectedVariant?: any;
}) => {
  if (!colorValue) return getAllProductImages(product, selectedVariant);

  const images: ProductImage[] = [];
  const allImages = getAllProductImages(product, selectedVariant);
  const taggedImages = sortProductImagesByFilenameOrder(
    allImages.filter((image) => imageMatchesColor(image, colorValue)),
  );

  taggedImages.forEach((image) => pushUniqueImage(images, image));
  if (images.length > 0) return images;

  getImagesByVariantFilenamePrefix({
    product,
    colorValue,
    selectedVariant,
    allImages,
  }).forEach((image) => pushUniqueImage(images, image));
  if (images.length > 0) return images;

  getImagesByVariantNumberProximity({
    product,
    colorValue,
    selectedVariant,
    allImages,
  }).forEach((image) => pushUniqueImage(images, image));
  if (images.length > 0) return images;

  getVariantImagesForColor(product, colorValue).forEach((image) =>
    pushUniqueImage(images, image),
  );
  if (images.length > 0) return images;

  const fallbackImages: ProductImage[] = [];
  pushUniqueImage(fallbackImages, selectedVariant?.image);
  pushUniqueImage(fallbackImages, product?.featuredImage);

  return fallbackImages.length > 0 ? fallbackImages : allImages;
};
