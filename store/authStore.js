/**
 * Auth Store — Zustand
 * ────────────────────────────────────────────────────────────────────────────
 * Client-side auth state. NOT persisted to localStorage — the httpOnly
 * cookie is the source of truth. This store hydrates by calling /api/auth/me.
 */

import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,

  /**
   * Fetch current user from /api/auth/me (cookie-based)
   */
  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      const data = await res.json();

      if (data.user) {
        set({ user: data.user, isLoggedIn: true, isLoading: false });
      } else {
        set({ user: null, isLoggedIn: false, isLoading: false });
      }
    } catch {
      set({ user: null, isLoggedIn: false, isLoading: false });
    }
  },

  /**
   * Login with email + password
   */
  login: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    set({ user: data.user, isLoggedIn: true });
    return data;
  },

  /**
   * Signup with full form data
   */
  signup: async ({ name, email, phone, password, confirmPassword }) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, confirmPassword }),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    set({ user: data.user, isLoggedIn: true });
    return data;
  },

  /**
   * Logout — clear cookie via API
   */
  logout: async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'customer' }),
        credentials: 'include',
      });
    } catch {
      // Still clear local state even if API call fails
    }
    set({ user: null, isLoggedIn: false });
  },

  /**
   * Update profile
   */
  updateProfile: async (updates) => {
    const res = await fetch('/api/auth/update-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Update failed');
    }

    set({ user: data.user });
    return data;
  },
}));

export default useAuthStore;
