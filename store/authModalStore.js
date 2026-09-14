/**
 * Auth Modal Store — Zustand
 * ────────────────────────────────────────────────────────────────────────────
 * Global state for the guest Login / Signup Prompt Modal.
 * Triggers when a guest user clicks "Add to Cart", "Wishlist", or "Buy Now".
 * Remembers the pending action and automatically resumes it upon successful login/signup.
 */

import { create } from 'zustand';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';

const useAuthModalStore = create((set, get) => ({
  isOpen: false,
  mode: 'login', // 'login' | 'signup'
  title: 'Log in to continue',
  subtitle: 'Create an account or log in to add items to your cart.',
  pendingAction: null, // { actionType: 'cart' | 'wishlist' | 'buynow', product, options }

  /**
   * Open the Auth Prompt Modal with contextual titles & pending action
   */
  openAuthModal: ({ actionType = 'cart', product, options = {}, mode = 'login' }) => {
    let title = 'Log in to continue';
    let subtitle = 'Create an account or log in to continue.';

    if (actionType === 'cart') {
      title = 'Log in to add to cart';
      subtitle = 'Create an account or log in to save items to your cart.';
    } else if (actionType === 'wishlist') {
      title = 'Log in to save this piece';
      subtitle = 'Create an account or log in to save your favorite items.';
    } else if (actionType === 'buynow') {
      title = 'Log in to checkout';
      subtitle = 'Log in or sign up to proceed directly to checkout.';
    }

    set({
      isOpen: true,
      mode,
      title,
      subtitle,
      pendingAction: { actionType, product, options },
    });
  },

  /**
   * Close modal and cancel pending action
   */
  closeAuthModal: () => set({ isOpen: false, pendingAction: null }),

  /**
   * Toggle modal mode between 'login' and 'signup'
   */
  setMode: (mode) => set({ mode }),

  /**
   * Execute the pending action after successful authentication
   */
  executePendingAction: () => {
    const { pendingAction } = get();
    if (!pendingAction) return null;

    const { actionType, product, options } = pendingAction;

    if (actionType === 'cart') {
      useCartStore.getState().addItem(product, options);
    } else if (actionType === 'wishlist') {
      useWishlistStore.getState().toggleItem(product);
    } else if (actionType === 'buynow') {
      useCartStore.getState().addItem(product, options);
    }

    set({ isOpen: false, pendingAction: null });
    return actionType;
  },
}));

export default useAuthModalStore;
