/**
 * ⚠️ DEPRECATED - This custom cart context is deprecated in favor of Hydrogen's built-in cart
 * 
 * MIGRATION GUIDE:
 * ================
 * 
 * This cart context has been replaced with Shopify Hydrogen's native cart system.
 * The Hydrogen cart is available from the root loader and provides real server-side cart data.
 * 
 * ## Why Migrate?
 * - Real cart persistence across sessions
 * - Server-side cart management
 * - Optimistic UI updates
 * - Built-in checkout integration
 * - No client-side state synchronization needed
 * 
 * ## Migration Steps:
 * 
 * ### 1. Remove CartProvider from your app
 * 
 * BEFORE:
 * ```tsx
 * import { CartProvider } from '~/components/zehn/cart-context'
 * 
 * export default function App() {
 *   return (
 *     <CartProvider>
 *       <YourApp />
 *     </CartProvider>
 *   )
 * }
 * ```
 * 
 * AFTER:
 * ```tsx
 * // No CartProvider needed - cart is in root loader
 * export default function App() {
 *   return <YourApp />
 * }
 * ```
 * 
 * ### 2. Update cart access in components
 * 
 * BEFORE:
 * ```tsx
 * import { useCart } from '~/components/zehn/cart-context'
 * 
 * function MyComponent() {
 *   const { items, addItem, itemCount } = useCart()
 *   // ...
 * }
 * ```
 * 
 * AFTER:
 * ```tsx
 * import { useRouteLoaderData } from 'react-router'
 * import type { RootLoader } from '~/root'
 * 
 * function MyComponent() {
 *   const data = useRouteLoaderData<RootLoader>('root')
 *   const cart = data?.cart
 *   const itemCount = cart?.totalQuantity ?? 0
 *   // Access cart.lines.nodes for items
 * }
 * ```
 * 
 * ### 3. Use CartForm for mutations
 * 
 * BEFORE:
 * ```tsx
 * const { addItem } = useCart()
 * 
 * <button onClick={() => addItem({
 *   id: productId,
 *   name: productName,
 *   price: productPrice,
 *   image: productImage
 * })}>
 *   Add to Cart
 * </button>
 * ```
 * 
 * AFTER:
 * ```tsx
 * import { CartForm } from '@shopify/hydrogen'
 * 
 * <CartForm
 *   route="/cart"
 *   action={CartForm.ACTIONS.LinesAdd}
 *   inputs={{
 *     lines: [{
 *       merchandiseId: variantId,
 *       quantity: 1
 *     }]
 *   }}
 * >
 *   <button type="submit">Add to Cart</button>
 * </CartForm>
 * ```
 * 
 * ### 4. Update CartDrawer usage
 * 
 * BEFORE:
 * ```tsx
 * import { CartDrawer } from '~/components/zehn/cart-drawer'
 * import { useCart } from '~/components/zehn/cart-context'
 * 
 * function Header() {
 *   const { setIsOpen, itemCount } = useCart()
 *   return (
 *     <>
 *       <button onClick={() => setIsOpen(true)}>
 *         Cart ({itemCount})
 *       </button>
 *       <CartDrawer />
 *     </>
 *   )
 * }
 * ```
 * 
 * AFTER:
 * ```tsx
 * import { CartDrawer, useCartCount } from '~/components/zehn/CartDrawer'
 * import { useState } from 'react'
 * 
 * function Header() {
 *   const [isCartOpen, setIsCartOpen] = useState(false)
 *   const itemCount = useCartCount()
 *   
 *   return (
 *     <>
 *       <button onClick={() => setIsCartOpen(true)}>
 *         Cart ({itemCount})
 *       </button>
 *       <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
 *     </>
 *   )
 * }
 * ```
 * 
 * ## Data Structure Mapping:
 * 
 * | Old (Custom Context) | New (Hydrogen) |
 * |---------------------|----------------|
 * | `items` | `cart.lines.nodes` |
 * | `itemCount` | `cart.totalQuantity` |
 * | `subtotal` | `cart.cost.subtotalAmount` |
 * | `item.id` | `line.id` |
 * | `item.name` | `line.merchandise.product.title` |
 * | `item.price` | `line.cost.totalAmount` |
 * | `item.quantity` | `line.quantity` |
 * | `item.image` | `line.merchandise.image` |
 * 
 * ## Checkout Integration:
 * 
 * The Hydrogen cart provides a direct `checkoutUrl`:
 * ```tsx
 * <a href={cart.checkoutUrl}>Proceed to Checkout</a>
 * ```
 * 
 * ## Timeline:
 * This deprecated context will be removed in a future update.
 * Please migrate to the Hydrogen cart system as soon as possible.
 */

import { createContext, useContext, useState, type ReactNode } from "react"
import type { ShopifyImage } from "~/data/mock-products"

export interface CartItem {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  image: ShopifyImage | string | null
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

/**
 * @deprecated Use Hydrogen cart from root loader instead
 * See migration guide at the top of this file
 */
export function CartProvider({ children }: { children: ReactNode }) {
  console.warn(
    '⚠️ CartProvider is deprecated. Please migrate to Hydrogen cart system. ' +
    'See app/components/zehn/cart-context.deprecated.tsx for migration guide.'
  )

  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === newItem.id)
      if (existingItem) {
        return currentItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...currentItems, { ...newItem, quantity: 1 }]
    })
    setIsOpen(true)
  }

  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id)
      return
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
        itemCount,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

/**
 * @deprecated Use useRouteLoaderData<RootLoader>('root')?.cart instead
 * See migration guide at the top of this file
 */
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
