/**
 * useScrollReveal
 * ────────────────────────────────────────────────────────────────────────────
 * IntersectionObserver hook that adds 'is-visible' class to elements with
 * the 'reveal' class when they enter the viewport.
 * Used site-wide via ConditionalChrome for all pages.
 *
 * Includes a safety fallback: if elements haven't become visible after 2s,
 * force-reveal them so content is never stuck invisible.
 *
 * Re-runs on pathname change so SPA navigation between pages re-triggers
 * the animation for newly rendered content.
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function useScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    // Small delay to ensure DOM is fully painted after hydration/navigation
    const initTimer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.05,
          rootMargin: '0px 0px -20px 0px',
        }
      );

      const elements = document.querySelectorAll('.reveal');
      elements.forEach((el) => observer.observe(el));

      // Safety fallback: force-reveal all elements after 2 seconds
      // so content is never permanently hidden
      const fallbackTimer = setTimeout(() => {
        document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
          el.classList.add('is-visible');
        });
      }, 2000);

      return () => {
        observer.disconnect();
        clearTimeout(fallbackTimer);
      };
    }, 100);

    return () => {
      clearTimeout(initTimer);
    };
  }, [pathname]); // Re-run when the route changes
}
