/**
 * Cart Store — Zustand
 * ────────────────────────────────────────────────────────────────────────────
 * Global cart state. Persisted to localStorage so cart survives page refresh.
 * Actions: addItem, removeItem, updateQuantity, clearCart, toggleDrawer.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],          // [{ id, productId, name, slug, image, price, size, color, quantity }]
      isDrawerOpen: false,
      itemCount: 0,
      subtotal: 0,

      // Computed helpers — call after any mutation
      _recompute: (items) => ({
        items,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal:  items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }),

      // ── ACTIONS ─────────────────────────────────────────────────────────

      /**
       * Add item to cart. If same product+size+color exists, increment quantity.
       */
      addItem: (product, { size, color, quantity = 1 } = {}) => {
        const { items, _recompute } = get();
        const cartId = `${product.id}-${size}-${color?.name || 'default'}`;

        const existing = items.find((i) => i.cartId === cartId);

        let newItems;
        if (existing) {
          newItems = items.map((i) =>
            i.cartId === cartId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          newItems = [
            ...items,
            {
              cartId,
              productId: product.id,
              name:      product.name,
              slug:      product.slug,
              image:     product.images?.[0] || null,
              price:     product.price,
              size:      size || null,
              color:     color || null,
              quantity,
            },
          ];
        }

        set({ ..._recompute(newItems), isDrawerOpen: true });
      },

      /**
       * Remove item by cartId
       */
      removeItem: (cartId) => {
        const { items, _recompute } = get();
        const newItems = items.filter((i) => i.cartId !== cartId);
        set(_recompute(newItems));
      },

      /**
       * Update quantity. If qty <= 0, remove item.
       */
      updateQuantity: (cartId, quantity) => {
        const { items, _recompute } = get();
        const newItems = quantity <= 0
          ? items.filter((i) => i.cartId !== cartId)
          : items.map((i) => i.cartId === cartId ? { ...i, quantity } : i);
        set(_recompute(newItems));
      },

      /**
       * Clear all items
       */
      clearCart: () => {
        set({ items: [], itemCount: 0, subtotal: 0 });
      },

      /**
       * Toggle cart drawer
       */
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
      openDrawer:   () => set({ isDrawerOpen: true }),
      closeDrawer:  () => set({ isDrawerOpen: false }),
    }),
    {
      name: 'noolinnayam-cart',   // localStorage key
      partialize: (state) => ({
        items:     state.items,
        itemCount: state.itemCount,
        subtotal:  state.subtotal,
      }),
    }
  )
);

export default useCartStore;
