/**
 * Auth Utilities
 * ────────────────────────────────────────────────────────────────────────────
 * Password hashing (bcrypt), JWT sign/verify, and cookie helpers.
 * All auth logic is centralized here — never duplicated in route handlers.
 *
 * SECURITY:
 * - Passwords are ALWAYS hashed with bcrypt (12 rounds) — never stored plain
 * - JWTs are signed with a secret from env — never hardcoded
 * - Cookies are httpOnly + SameSite — never accessible via client JS
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const BCRYPT_ROUNDS = 12;

// Cookie names — separate cookies for customer and owner sessions
export const CUSTOMER_COOKIE = 'noolinnayam-token';
export const OWNER_COOKIE    = 'noolinnayam-owner-token';

// ─── PASSWORD HASHING ──────────────────────────────────────────────────────

/**
 * Hash a plain-text password with bcrypt
 */
export async function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/**
 * Verify a plain-text password against a bcrypt hash
 */
export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// ─── JWT ────────────────────────────────────────────────────────────────────

/**
 * Sign a JWT token
 * @param {{ userId: string, role: string }} payload
 * @returns {string} Signed JWT string
 */
export function signToken({ userId, role }) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables');
  }
  const expiresIn = role === 'owner' ? '8h' : '24h';
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn });
}

/**
 * Verify and decode a JWT token
 * @returns {{ userId: string, role: string } | null}
 */
export function verifyToken(token) {
  if (!JWT_SECRET || !token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// ─── COOKIE HELPERS ─────────────────────────────────────────────────────────

/**
 * Build the Set-Cookie header value for auth tokens
 */
function buildCookieValue(name, token, maxAgeSeconds) {
  const isProduction = process.env.NODE_ENV === 'production';
  const parts = [
    `${name}=${token}`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (isProduction) parts.push('Secure');
  return parts.join('; ');
}

/**
 * Set the auth cookie on a NextResponse
 */
export function setAuthCookie(response, token, role = 'customer') {
  const cookieName = role === 'owner' ? OWNER_COOKIE : CUSTOMER_COOKIE;
  const maxAge = role === 'owner' ? 8 * 60 * 60 : 24 * 60 * 60;
  response.headers.set('Set-Cookie', buildCookieValue(cookieName, token, maxAge));
  return response;
}

/**
 * Clear the auth cookie on a NextResponse
 */
export function clearAuthCookie(response, role = 'customer') {
  const cookieName = role === 'owner' ? OWNER_COOKIE : CUSTOMER_COOKIE;
  response.headers.set(
    'Set-Cookie',
    `${cookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
  );
  return response;
}

// ─── REQUEST HELPERS ────────────────────────────────────────────────────────

/**
 * Parse cookies from a request's Cookie header
 */
function parseCookies(request) {
  const header = request.headers.get('cookie') || '';
  const cookies = {};
  header.split(';').forEach((pair) => {
    const [key, ...vals] = pair.trim().split('=');
    if (key) cookies[key] = vals.join('=');
  });
  return cookies;
}

/**
 * Get authenticated user info from request cookies
 * @returns {{ userId: string, role: string } | null}
 */
export function getAuthFromRequest(request, expectedRole = 'customer') {
  const cookies = parseCookies(request);
  const cookieName = expectedRole === 'owner' ? OWNER_COOKIE : CUSTOMER_COOKIE;
  const token = cookies[cookieName];
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  // Verify the role matches what's expected
  if (decoded.role !== expectedRole) return null;

  return decoded;
}

// ─── RATE LIMITING (In-Memory) ──────────────────────────────────────────────
// NOTE: This is suitable for dev/staging. For production, use Redis or a
// proper rate-limiting service. Counts reset on server restart.

const loginAttempts = new Map(); // key: IP, value: { count, resetAt }

/**
 * Check if an IP is rate-limited for login attempts
 * @returns {{ allowed: boolean, retryAfterSeconds?: number }}
 */
export function checkRateLimit(ip, { maxAttempts = 5, windowMs = 15 * 60 * 1000 } = {}) {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    // First attempt or window expired — reset
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true };
}

/**
 * Reset rate limit for an IP (call after successful login)
 */
export function resetRateLimit(ip) {
  loginAttempts.delete(ip);
}
