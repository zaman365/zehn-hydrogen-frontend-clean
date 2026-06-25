import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react"
import { CartForm, Money, useOptimisticCart } from "@shopify/hydrogen"
import {ZehnShopifyImage} from '~/components/zehn'
import { useRouteLoaderData, Await } from "react-router"
import { Suspense, useEffect } from "react"
import type { RootLoader } from "~/root"
import { fireInitiateCheckout } from "~/components/zehn/MetaPixelEvents"
import type { CartApiQueryFragment } from "storefrontapi.generated"
import {useScrollLock} from '~/hooks/useScrollLock'
import {useOverlayCloseAnimation} from '~/hooks/useOverlayCloseAnimation'
import {RippleButton} from '~/components/zehn/RippleButton'
import {cnHeaderNavIconHost, HEADER_NAV_COLOR, HEADER_NAV_TEXT_HOST} from '~/lib/header-nav-styles'
import {ZEHN_SCROLL_EDGE} from '~/lib/zehn-scrollbar-styles'
import {cn} from '~/lib/utils'

/** Full-width pill CTA — ripple clip boundary matches nav hosts (REQ-0008). */
const CART_CTA_PRIMARY =
  'block w-full bg-primary text-primary-foreground py-4 rounded-full font-medium ' +
  'hover:bg-primary/90 transition-colors mb-3 text-center font-sans tracking-wide';

const CART_CTA_SECONDARY =
  'w-full border border-foreground/20 text-foreground py-4 rounded-full font-medium ' +
  'hover:bg-foreground/5 transition-colors font-sans';

/** Empty-cart link — nav pill host + orange hover, no underline (REQ-0008). */
const CART_EMPTY_LINK = cn(
  HEADER_NAV_TEXT_HOST,
  HEADER_NAV_COLOR,
  'mt-4 text-body font-sans font-medium tracking-normal normal-case',
);

const CART_DRAWER_ANIMATION_MS = 300;

export interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * CartDrawer - Hydrogen-integrated cart drawer
 * 
 * This component displays the Shopify Hydrogen cart in a slide-out drawer.
 * It uses the cart data from the root loader and CartForm for all mutations.
 * 
 * Features:
 * - Real-time cart data from Hydrogen
 * - Optimistic UI updates
 * - CartForm for add/remove/update operations
 * - Direct checkout via Shopify checkoutUrl
 */
export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const data = useRouteLoaderData<RootLoader>('root')
  const cartPromise = data ? (data as any).cart : undefined
  const {mounted, closing} = useOverlayCloseAnimation(
    isOpen,
    CART_DRAWER_ANIMATION_MS,
  )

  useScrollLock(mounted)

  if (!mounted) return null

  return (
    <Suspense fallback={<CartDrawerSkeleton isOpen={mounted} closing={closing} onClose={onClose} />}>
      <Await resolve={cartPromise}>
        {(cart) => (
          <CartDrawerContent
            cart={cart ?? null}
            closing={closing}
            onClose={onClose}
          />
        )}
      </Await>
    </Suspense>
  )
}

function CartDrawerContent({ 
  cart: originalCart, 
  closing,
  onClose 
}: { 
  cart: CartApiQueryFragment | null
  closing: boolean
  onClose: () => void
}) {
  // useOptimisticCart provides optimistic updates for immediate UI feedback
  const cart = useOptimisticCart(originalCart)

  const itemCount = cart?.totalQuantity ?? 0
  const hasItems = itemCount > 0

  // ESC key handler for accessibility
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <>
      {/* Backdrop Overlay with blur */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] ${
          closing ? 'animate-fade-out' : 'animate-fade-in'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer - slide in from right, slide out on close */}
      <div
        className={`fixed right-0 top-0 h-screen w-full max-w-md bg-card shadow-2xl z-[200] flex flex-col ${
          closing ? 'animate-slide-out-right' : 'animate-slide-in-right'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        {/* Header */}
        <div className="border-b border-border/50 p-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="cart-drawer-title" className="font-sans text-h3 text-foreground tracking-tight-2">Warenkorb</h2>
              <p className="text-sm text-foreground/60 font-sans">
                {itemCount} {itemCount === 1 ? 'Artikel' : 'Artikel'}
              </p>
            </div>
            <RippleButton
              type="button"
              onClick={onClose}
              className={cnHeaderNavIconHost()}
              aria-label="Warenkorb schließen"
            >
              <X className="w-6 h-6" />
            </RippleButton>
          </div>
        </div>

        {/* Cart Items */}
        <div className={cn('flex-1 overflow-y-auto p-6', ZEHN_SCROLL_EDGE)}>
          {!hasItems ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-12 h-12 text-foreground/30 mb-4" />
              <p className="text-foreground/60 font-sans text-body">Ihr Warenkorb ist leer</p>
              <RippleButton
                type="button"
                onClick={onClose}
                className={CART_EMPTY_LINK}
              >
                Weiter einkaufen
              </RippleButton>
            </div>
          ) : (
            <div className="space-y-6">
              {cart?.lines?.nodes?.map((line) => {
                // Skip child lines (bundles/components)
                if ('parentRelationship' in line && line.parentRelationship?.parent) {
                  return null
                }

                const { id, quantity, merchandise } = line
                const { product, title, image, selectedOptions } = merchandise
                const lineTotal = line.cost?.totalAmount
                const unitPrice = line.cost?.amountPerQuantity
                const unitCompareAtPrice = line.cost?.compareAtAmountPerQuantity
                const unitPriceNum = parseFloat(unitPrice?.amount ?? '0')
                const unitCompareAtNum = parseFloat(unitCompareAtPrice?.amount ?? '0')
                const isOnSale = Boolean(
                  unitCompareAtPrice &&
                    unitCompareAtNum > 0 &&
                    unitCompareAtNum > unitPriceNum,
                )
                const compareAtTotal = isOnSale
                  ? {
                      amount: (unitCompareAtNum * quantity).toFixed(2),
                      currencyCode: unitCompareAtPrice!.currencyCode,
                    }
                  : null
                const isOptimistic = 'isOptimistic' in line && line.isOptimistic

                return (
                  <div key={id} className="flex gap-4">
                    {/* Product Image — 96×96 container is the frame (relative overflow-hidden).
                        priority=true: always in viewport when drawer opens, eager load, no opacity gate. */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      {image ? (
                        <ZehnShopifyImage
                          data={image}
                          sizes="96px"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-sans text-body text-foreground mb-1 font-medium">
                        {product.title}
                      </h3>
                      {selectedOptions.length > 0 && (
                        <p className="text-foreground/60 mb-3 text-body font-sans">
                          {selectedOptions
                            .filter((option) => option.value !== 'Default Title')
                            .map((option) => option.value)
                            .join(' / ')}
                        </p>
                      )}
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-foreground/20 rounded-full">
                          <CartForm
                            route="/cart"
                            action={CartForm.ACTIONS.LinesUpdate}
                            inputs={{
                              lines: [{
                                id,
                                quantity: Math.max(0, quantity - 1)
                              }]
                            }}
                          >
                            <button
                              type="submit"
                              disabled={quantity <= 1 || isOptimistic}
                              className="p-1.5 hover:bg-foreground/5 transition-colors rounded-l-full disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                              aria-label="Menge verringern"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                          </CartForm>
                          
                          <span className="px-3 text-body font-medium font-sans text-foreground">{quantity}</span>
                          
                          <CartForm
                            route="/cart"
                            action={CartForm.ACTIONS.LinesUpdate}
                            inputs={{
                              lines: [{
                                id,
                                quantity: quantity + 1
                              }]
                            }}
                          >
                            <button
                              type="submit"
                              disabled={isOptimistic}
                              className="p-1.5 hover:bg-foreground/5 transition-colors rounded-r-full disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                              aria-label="Menge erhöhen"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </CartForm>
                        </div>

                        <CartForm
                          route="/cart"
                          action={CartForm.ACTIONS.LinesRemove}
                          inputs={{ lineIds: [id] }}
                        >
                          <button
                            type="submit"
                            disabled={isOptimistic}
                            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-foreground/60 hover:text-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Artikel entfernen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </CartForm>
                      </div>
                    </div>

                    {/* Price — span not p: Money renders a div, div-in-p is invalid HTML */}
                    <div className="text-right">
                      {lineTotal && (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className={`font-sans font-medium ${isOnSale ? 'text-accent' : 'text-foreground'}`}>
                            <Money data={lineTotal} />
                          </span>
                          {compareAtTotal && (
                            <span className="block font-sans text-xs text-foreground/55 line-through decoration-foreground/40">
                              <Money data={compareAtTotal as any} />
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer with Summary and Checkout */}
        {hasItems && cart && (
          <div className="border-t border-border/50 p-6 gap-4">
            {/* Summary */}
            <div className="space-y-2 text-body mb-4 font-sans">
              <div className="flex justify-between text-foreground/70">
                <span>Zwischensumme</span>
                <span className="text-foreground">
                  {cart.cost?.subtotalAmount && (
                    <Money data={cart.cost.subtotalAmount} />
                  )}
                </span>
              </div>
              <div className="flex justify-between text-foreground/70">
                <span>Versand</span>
                <span className="text-foreground/70">Wird an der Kasse berechnet</span>
              </div>
              {cart.cost?.totalTaxAmount && (
                <div className="flex justify-between text-foreground/70">
                  <span>MwSt.</span>
                  <span className="text-foreground">
                    <Money data={cart.cost.totalTaxAmount} />
                  </span>
                </div>
              )}
              <div className="flex justify-between text-body-lg font-semibold text-foreground pt-2 border-t border-border/50 font-sans">
                <span>Gesamt</span>
                <span>
                  {cart.cost?.totalAmount && (
                    <Money data={cart.cost.totalAmount} />
                  )}
                </span>
              </div>
            </div>

            {/* Checkout Button */}
            {cart.checkoutUrl && (
              <RippleButton
                as="anchor"
                href={cart.checkoutUrl}
                onClick={() => fireInitiateCheckout(cart as any)}
                className={CART_CTA_PRIMARY}
              >
                Zur Kasse
              </RippleButton>
            )}

            <RippleButton
              type="button"
              onClick={onClose}
              className={CART_CTA_SECONDARY}
            >
              Weiter einkaufen
            </RippleButton>
          </div>
        )}
      </div>
    </>
  )
}

/**
 * CartDrawer loading skeleton
 */
function CartDrawerSkeleton({
  isOpen,
  closing = false,
  onClose,
}: CartDrawerProps & {closing?: boolean}) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null
  
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] ${
          closing ? 'animate-fade-out' : 'animate-fade-in'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed right-0 top-0 h-screen w-full max-w-md bg-card shadow-2xl z-[200] flex flex-col ${
          closing ? 'animate-slide-out-right' : 'animate-slide-in-right'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-skeleton-title"
      >
        <div className="border-b border-border/50 p-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="cart-drawer-skeleton-title" className="font-sans text-2xl font-semibold text-foreground tracking-tight-2">Warenkorb</h2>
              <p className="text-sm text-foreground/60 font-sans">Laden...</p>
            </div>
            <RippleButton
              type="button"
              onClick={onClose}
              className={cnHeaderNavIconHost()}
              aria-label="Warenkorb schließen"
            >
              <X className="w-6 h-6" />
            </RippleButton>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">
            <ShoppingBag className="w-12 h-12 text-foreground/30" />
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * Hook to get cart count for header badge
 * Returns a React element that handles the async cart data
 * @returns JSX Element displaying the cart count
 */
export function CartCount() {
  const data = useRouteLoaderData<RootLoader>('root')
  const cartPromise = data ? (data as any).cart : undefined

  return (
    <Suspense fallback={<>0</>}>
      <Await resolve={cartPromise}>
        {(cart) => <>{cart?.totalQuantity ?? 0}</>}
      </Await>
    </Suspense>
  )
}

