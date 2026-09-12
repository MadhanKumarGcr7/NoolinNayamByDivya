/**
 * Owner Login Layout
 * ────────────────────────────────────────────────────────────────────────────
 * Completely separate from the storefront — no Navbar, no Footer.
 * noindex — this page should never be crawled.
 */

export const metadata = {
  title: 'Owner Access — Noolinnayam',
  robots: 'noindex, nofollow',
};

export default function OwnerLoginLayout({ children }) {
  return children;
}
