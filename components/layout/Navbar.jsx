'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import useCartStore from '@/store/cartStore';
import useWishlistStore from '@/store/wishlistStore';
import useAuthStore from '@/store/authStore';
import { brandConfig } from '@/lib/config';
import MobileMenu from './MobileMenu';
import SearchModal from '@/components/shop/SearchModal';


const FALLBACK_NAV = [
  { href: '/',                       label: 'Home'          },
  { href: '/shop',                   label: 'Shop'          },
  { href: '/shop?category=crochet',  label: 'Crochet'       },
  { href: '/shop?category=kidswear', label: 'Kidswear'      },
  { href: '/custom-orders',          label: 'Custom Orders' },
  { href: '/workshops',             label: 'Workshops'     },
  { href: '/our-story',             label: 'Our Story'     },
  { href: '/contact',               label: 'Contact'       },
];

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [navItems, setNavItems]         = useState(FALLBACK_NAV);
  const { itemCount, toggleDrawer }     = useCartStore();
  const wishlistItems                   = useWishlistStore((state) => state.items);
  const { user, isLoggedIn, fetchUser } = useAuthStore();

  // Hydrate auth state on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Fetch dynamic navigation links from API
  useEffect(() => {
    let isMounted = true;
    async function loadNavigation() {
      try {
        const res = await fetch('/api/navigation');
        const data = await res.json();
        if (isMounted && data?.items && data.items.length > 0) {
          setNavItems(data.items);
        }
      } catch {
        /* use fallback nav items */
      }
    }
    loadNavigation();
    return () => { isMounted = false; };
  }, []);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 40);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu or search is open
  useEffect(() => {
    document.body.style.overflow = (mobileOpen || searchOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  const mid = Math.ceil(navItems.length / 2);
  const navLinksLeft = navItems.slice(0, mid);
  const navLinksRight = navItems.slice(mid);
  const allNavLinks = navItems;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex flex-col transition-all duration-500"
        role="banner"
      >
        {/* ── 1. ANNOUNCEMENT BAR ── */}
        {brandConfig.announcementEnabled && (
          <div
            className="w-full bg-charcoal text-ivory/90 py-2 px-4 text-center border-b border-white/10 relative z-20"
            role="region"
            aria-label="Announcement"
          >
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.18em] font-sans font-medium leading-none text-ivory/95">
              {brandConfig.announcementText}
            </p>
          </div>
        )}

        {/* ── 2. MAIN NAVBAR ── */}
        <div
          className={`
            w-full transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
            ${scrolled
              ? 'bg-ivory/95 backdrop-blur-md shadow-warm-sm border-b border-sand/40 py-3'
              : 'bg-gradient-to-b from-charcoal/85 via-charcoal/45 to-transparent backdrop-blur-[1px] py-4'}
          `}
        >
          <div className="site-container">
            {/* ── DESKTOP LAYOUT (12-Column Grid — Guarantees Zero Overlap) ── */}
            <nav
              className="hidden lg:grid grid-cols-12 items-center w-full"
              aria-label="Main desktop navigation"
            >
              {/* Left Column: Nav Links */}
              <ul className="col-span-6 flex items-center gap-4 xl:gap-6 justify-start whitespace-nowrap" role="list">
                {navLinksLeft.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`
                        text-[11px] xl:text-xs uppercase tracking-nav font-sans font-medium transition-colors duration-300 relative py-1
                        ${scrolled
                          ? 'text-charcoal hover:text-warmBrown'
                          : 'text-ivory hover:text-cream drop-shadow-sm'}
                      `}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Right Column: Secondary Nav + Icons */}
              <div className="col-span-6 flex items-center justify-end gap-4 xl:gap-6 whitespace-nowrap">
                <ul className="flex items-center gap-4 xl:gap-6" role="list">
                  {navLinksRight.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`
                          text-[11px] xl:text-xs uppercase tracking-nav font-sans font-medium transition-colors duration-300 relative py-1
                          ${scrolled
                            ? 'text-charcoal hover:text-warmBrown'
                            : 'text-ivory hover:text-cream drop-shadow-sm'}
                        `}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Divider Line */}
                <div
                  className={`h-4 w-px transition-colors duration-300 ${
                    scrolled ? 'bg-charcoal/20' : 'bg-ivory/30'
                  }`}
                  aria-hidden="true"
                />

                {/* Action Icons */}
                <div className="flex items-center gap-4">
                  {/* Search Trigger */}
                  <button
                    onClick={() => setSearchOpen(true)}
                    aria-label="Search products"
                    className={`
                      p-1.5 rounded-full transition-colors duration-300 hover:bg-black/10
                      ${scrolled ? 'text-charcoal' : 'text-ivory drop-shadow-sm'}
                    `}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                    </svg>
                  </button>

                  {/* Wishlist Icon */}
                  <Link
                    href="/wishlist"
                    aria-label="Wishlist"
                    className={`
                      relative p-1.5 rounded-full transition-colors duration-300 hover:bg-black/10
                      ${scrolled ? 'text-charcoal' : 'text-ivory drop-shadow-sm'}
                    `}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                    {wishlistItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-warmBrown text-ivory rounded-full flex items-center justify-center text-[9px] font-sans font-bold leading-none">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>

                  {/* Account Icon */}
                  <Link
                    href={isLoggedIn ? '/account' : '/login'}
                    aria-label={isLoggedIn ? 'My Account' : 'Sign In'}
                    className={`
                      relative p-1.5 rounded-full transition-colors duration-300 hover:bg-black/10
                      ${scrolled ? 'text-charcoal' : 'text-ivory drop-shadow-sm'}
                    `}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    {isLoggedIn && user?.name && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-warmBrown text-ivory rounded-full flex items-center justify-center text-[9px] font-sans font-bold leading-none">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </Link>

                  {/* Cart Drawer Trigger */}
                  <button
                    onClick={toggleDrawer}
                    aria-label={`Shopping cart containing ${itemCount} items`}
                    className={`
                      relative p-1.5 rounded-full transition-colors duration-300 hover:bg-black/10
                      ${scrolled ? 'text-charcoal' : 'text-ivory drop-shadow-sm'}
                    `}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                    </svg>
                    {itemCount > 0 && (
                      <span
                        className={`
                          absolute -top-1 -right-1 w-4 h-4 rounded-full
                          flex items-center justify-center
                          text-[9px] font-sans font-bold leading-none
                          transition-all duration-300
                          ${scrolled ? 'bg-warmBrown text-ivory' : 'bg-ivory text-charcoal shadow-sm'}
                        `}
                      >
                        {itemCount > 9 ? '9+' : itemCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </nav>

            {/* ── MOBILE & TABLET LAYOUT (< lg) ── */}
            <div className="lg:hidden flex items-center justify-between py-1">
              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                className={`p-2 transition-colors ${scrolled ? 'text-charcoal' : 'text-ivory drop-shadow-sm'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>

              {/* Mobile Brand Name */}
              <Link
                href="/"
                className="flex items-center text-center px-2"
                aria-label="Noolin Nayam by Divya — home"
              >
                <span
                  className={`
                    font-serif font-light tracking-[0.06em] text-base sm:text-lg transition-colors
                    ${scrolled ? 'text-charcoal' : 'text-ivory drop-shadow-md'}
                  `}
                >
                  Noolin Nayam by Divya
                </span>
              </Link>

              {/* Mobile Action Icons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search products"
                  className={`p-2 transition-colors ${scrolled ? 'text-charcoal' : 'text-ivory drop-shadow-sm'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                  </svg>
                </button>
                <button
                  onClick={toggleDrawer}
                  aria-label={`Shopping cart with ${itemCount} items`}
                  className={`relative p-2 transition-colors ${scrolled ? 'text-charcoal' : 'text-ivory drop-shadow-sm'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-warmBrown text-ivory rounded-full flex items-center justify-center text-[9px] font-sans font-bold">
                      {itemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fullscreen Menu */}
      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navLinks={allNavLinks}
        isLoggedIn={isLoggedIn}
        user={user}
      />

      {/* Site-wide Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
