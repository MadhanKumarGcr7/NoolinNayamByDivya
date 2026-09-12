'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import useScrollReveal from '@/hooks/useScrollReveal';

/**
 * ConditionalChrome
 * ────────────────────────────────────────────────────────────────────────────
 * Wraps the page content and conditionally renders the storefront Navbar,
 * Footer, and CartDrawer based on the current route.
 * Also initializes the site-wide scroll reveal IntersectionObserver so that
 * `.reveal` elements animate correctly on every page (not just the homepage).
 *
 * Admin routes and owner-login get a completely clean layout — no store chrome.
 */

// Routes that should NOT show storefront Navbar/Footer/CartDrawer
const CHROME_EXCLUDED_PREFIXES = ['/admin', '/owner-login'];

export default function ConditionalChrome({ children }) {
  const pathname = usePathname();

  // Initialize scroll reveal on every page navigation site-wide
  useScrollReveal();

  const showChrome = !CHROME_EXCLUDED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!showChrome) {
    // Admin / owner-login — render raw content only
    return <>{children}</>;
  }

  // Normal storefront pages — include Navbar, Footer, CartDrawer
  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  );
}
