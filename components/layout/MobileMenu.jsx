'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import useAuthStore from '@/store/authStore';
import { brandConfig } from '@/lib/config';

export default function MobileMenu({ isOpen, onClose, navLinks, isLoggedIn, user }) {
  const { logout } = useAuthStore();
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-[60] bg-charcoal/30 backdrop-blur-sm
          transition-opacity duration-400
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu panel — full screen from right */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`
          fixed top-0 right-0 bottom-0 z-[70]
          w-full max-w-sm bg-ivory
          flex flex-col
          transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-6 border-b border-border">
          <Link
            href="/"
            onClick={onClose}
            className="font-serif font-light text-charcoal text-lg tracking-[0.06em]"
          >
            Noolin Nayam by Divya
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 text-charcoal-600 hover:text-charcoal transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-7 py-8" aria-label="Mobile navigation">
          <ul className="flex flex-col gap-1" role="list">
            {navLinks.map((link, i) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={`
                    block py-4 font-serif font-light text-charcoal
                    text-2xl tracking-[-0.01em]
                    border-b border-border/50
                    hover:text-warmBrown transition-colors duration-200
                    transition-all
                  `}
                  style={{ transitionDelay: isOpen ? `${i * 40}ms` : '0ms' }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Account Link */}
        <div className="px-7 py-4 border-t border-border">
          {isLoggedIn ? (
            <div className="flex flex-col gap-3">
              <Link
                href="/account"
                onClick={onClose}
                className="block py-3 font-serif font-light text-charcoal text-xl tracking-[-0.01em] hover:text-warmBrown transition-colors"
              >
                My Account
              </Link>
              <button
                onClick={async () => { await logout(); onClose(); window.location.href = '/'; }}
                className="text-left py-3 font-serif font-light text-charcoal-400 text-xl tracking-[-0.01em] hover:text-warmBrown transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="block py-3 font-serif font-light text-warmBrown text-xl tracking-[-0.01em] hover:text-charcoal transition-colors"
            >
              Sign In / Create Account
            </Link>
          )}
        </div>

        {/* Footer — social + tagline */}
        <div className="px-7 py-6 border-t border-border">
          <p className="text-label-md uppercase tracking-[0.18em] text-charcoal-400 font-sans mb-4">
            Follow us
          </p>
          <div className="flex gap-4">
            <a
              href={brandConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-charcoal-400 hover:text-charcoal transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>
          </div>
          <p className="mt-6 text-body-xs text-charcoal-400 font-sans font-light italic">
            &quot;Made slowly. Stitched with love.&quot;
          </p>
        </div>
      </div>
    </>
  );
}
