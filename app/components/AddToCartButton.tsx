import {useEffect, useRef} from 'react';
import {type FetcherWithComponents} from 'react-router';
import {CartForm, type OptimisticCartLineInput} from '@shopify/hydrogen';
import {
  fireMetaAddToCart,
  type MetaProductEvent,
} from '~/components/zehn/MetaPixelEvents';

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  metaProduct,
  className,
  wrapperClassName = 'w-full',
}: {
  analytics?: unknown;
  children: React.ReactNode;
  disabled?: boolean;
  lines: Array<OptimisticCartLineInput>;
  onClick?: () => void;
  metaProduct?: MetaProductEvent;
  className?: string;
  wrapperClassName?: string;
}) {
  return (
    <div className={wrapperClassName}>
      <CartForm
        route="/cart"
        inputs={{lines}}
        action={CartForm.ACTIONS.LinesAdd}
      >
        {(fetcher: FetcherWithComponents<any>) => (
          <>
            <MetaCartAddTracker fetcher={fetcher} product={metaProduct} />
            <div className="w-full">
              <input
                name="analytics"
                type="hidden"
                value={JSON.stringify(analytics)}
              />
              <button
                type="submit"
                onClick={onClick}
                disabled={Boolean(disabled) || fetcher.state !== 'idle'}
                className={className}
              >
                {children}
              </button>
            </div>
          </>
        )}
    </CartForm>
    </div>
  );
}

function MetaCartAddTracker({
  fetcher,
  product,
}: {
  fetcher: FetcherWithComponents<any>;
  product?: MetaProductEvent;
}) {
  const previousStateRef = useRef(fetcher.state);

  useEffect(() => {
    const completed =
      previousStateRef.current !== 'idle' &&
      fetcher.state === 'idle' &&
      fetcher.data &&
      !fetcher.data.errors?.length;

    if (completed && product) {
      fireMetaAddToCart(product);
    }

    previousStateRef.current = fetcher.state;
  }, [fetcher.data, fetcher.state, product]);

  return null;
}
