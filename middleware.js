/**
 * Next.js Middleware — Route Protection
 * ────────────────────────────────────────────────────────────────────────────
 * Runs on the Edge Runtime (not Node.js) for every matched request.
 * Uses `jose` for JWT verification (Edge-compatible, unlike `jsonwebtoken`).
 *
 * SECURITY:
 * - /admin/* requires a valid owner JWT
 * - /account/* and /checkout/* require a valid customer JWT
 * - All other routes pass through unmodified
 */

import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const CUSTOMER_COOKIE = 'noolinnayam-token';
const OWNER_COOKIE    = 'noolinnayam-owner-token';

/**
 * Get the JWT secret as a Uint8Array (required by jose)
 */
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

/**
 * Verify a JWT token using jose (Edge Runtime compatible)
 */
async function verifyJWT(token) {
  const secret = getSecret();
  if (!secret || !token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── ADMIN ROUTE PROTECTION ──────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(OWNER_COOKIE)?.value;
    const payload = await verifyJWT(token);

    if (!payload || payload.role !== 'owner') {
      // Not authenticated as owner → redirect to owner login
      const loginUrl = new URL('/owner-login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ── CUSTOMER ROUTE PROTECTION (/account, /checkout) ────────────────────
  if (pathname.startsWith('/account') || pathname.startsWith('/checkout')) {
    const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
    const payload = await verifyJWT(token);

    if (!payload || payload.role !== 'customer') {
      // Not authenticated as customer → redirect to login with return redirect
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ── ALL OTHER ROUTES (Public browsing for /shop, /workshops, etc.) ──────
  return NextResponse.next();
}

// Only run middleware on protected routes
export const config = {
  matcher: ['/admin/:path*', '/account/:path*', '/checkout/:path*'],
};
