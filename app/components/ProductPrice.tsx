import {Money} from '@shopify/hydrogen';
import type {MoneyV2} from '@shopify/hydrogen/storefront-api-types';

export function ProductPrice({
  price,
  compareAtPrice,
}: {
  price?: MoneyV2;
  compareAtPrice?: MoneyV2 | null;
}) {
  const priceNum = parseFloat(price?.amount ?? '0');
  const compareAtNum = parseFloat(compareAtPrice?.amount ?? '0');
  const isOnSale = Boolean(compareAtPrice && compareAtNum > 0 && compareAtNum > priceNum);
  const saleCompareAtPrice = isOnSale ? compareAtPrice : null;

  return (
    <div className="product-price">
      {saleCompareAtPrice ? (
        <div className="product-price-on-sale flex items-center gap-2">
          {price ? <span className="text-accent"><Money data={price} /></span> : null}
          <s className="text-foreground/55 decoration-foreground/40">
            <Money data={saleCompareAtPrice} />
          </s>
        </div>
      ) : price ? (
        <Money data={price} />
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
