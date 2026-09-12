/**
 * Wishlist Store — Zustand
 * ────────────────────────────────────────────────────────────────────────────
 * Global wishlist state. Persisted to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],  // [{ id, name, slug, image, price }]

      /**
       * Toggle item in/out of wishlist
       */
      toggleItem: (product) => {
        const { items } = get();
        const exists = items.some((i) => i.id === product.id);
        if (exists) {
          set({ items: items.filter((i) => i.id !== product.id) });
        } else {
          set({
            items: [
              ...items,
              {
                id:    product.id,
                name:  product.name,
                slug:  product.slug,
                image: product.images?.[0] || null,
                price: product.price,
              },
            ],
          });
        }
      },

      isWishlisted: (productId) => {
        return get().items.some((i) => i.id === productId);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'noolinnayam-wishlist',
    }
  )
);

export default useWishlistStore;
