import {useOptimisticCart} from '@shopify/hydrogen';
import {useAsyncValue} from 'react-router';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

/**
 * Optimistic cart quantity for header badge — call only inside `<Await resolve={cart}>`.
 * Matches CartDrawer / skeleton Header CartBanner pattern for instant add-to-cart feedback.
 */
export function useHeaderCartCount(): number {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  return cart?.totalQuantity ?? 0;
}
