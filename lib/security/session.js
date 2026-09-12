/**
 * Session & Cookie Lifecycle Management
 * ────────────────────────────────────────────────────────────────────────────
 * Manages httpOnly, Secure, SameSite=Strict cookies for access and refresh tokens.
 * Separates customer and owner sessions to ensure strict role segregation.
 */

export const CUSTOMER_ACCESS_COOKIE  = 'noolinnayam-token';
export const CUSTOMER_REFRESH_COOKIE = 'noolinnayam-refresh-token';

export const OWNER_ACCESS_COOKIE     = 'noolinnayam-owner-token';
export const OWNER_REFRESH_COOKIE    = 'noolinnayam-owner-refresh-token';

// 8h for Owner Access Token cookie, 1h for Customer, 7 days for Refresh Token
const OWNER_ACCESS_COOKIE_MAX_AGE    = 8 * 60 * 60;
const CUSTOMER_ACCESS_COOKIE_MAX_AGE = 60 * 60;
const REFRESH_COOKIE_MAX_AGE         = 7 * 24 * 60 * 60;

/**
 * Format a Set-Cookie header string with strict security flags
 */
export function formatCookie(name, value, maxAgeSeconds) {
  const isProduction = process.env.NODE_ENV === 'production';
  const parts = [
    `${name}=${value}`,
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
    'HttpOnly',
    'SameSite=Strict', // Strict protection against CSRF
  ];
  if (isProduction) parts.push('Secure');
  return parts.join('; ');
}

/**
 * Attach access & refresh token httpOnly cookies to a NextResponse
 */
export function setSessionCookies(response, { accessToken, refreshToken, role = 'customer' }) {
  const isOwner = role === 'owner';
  const accessCookieName  = isOwner ? OWNER_ACCESS_COOKIE : CUSTOMER_ACCESS_COOKIE;
  const refreshCookieName = isOwner ? OWNER_REFRESH_COOKIE : CUSTOMER_REFRESH_COOKIE;

  const cookieHeaders = [
    formatCookie(accessCookieName, accessToken, isOwner ? OWNER_ACCESS_COOKIE_MAX_AGE : CUSTOMER_ACCESS_COOKIE_MAX_AGE),
    formatCookie(refreshCookieName, refreshToken, REFRESH_COOKIE_MAX_AGE),
  ];

  cookieHeaders.forEach((header) => {
    response.headers.append('Set-Cookie', header);
  });

  return response;
}

/**
 * Clear access & refresh token cookies on logout or session revocation
 */
export function clearSessionCookies(response, role = 'customer') {
  const isOwner = role === 'owner';
  const accessCookieName  = isOwner ? OWNER_ACCESS_COOKIE : CUSTOMER_ACCESS_COOKIE;
  const refreshCookieName = isOwner ? OWNER_REFRESH_COOKIE : CUSTOMER_REFRESH_COOKIE;

  const expiredAccess  = `${accessCookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`;
  const expiredRefresh = `${refreshCookieName}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict`;

  response.headers.append('Set-Cookie', expiredAccess);
  response.headers.append('Set-Cookie', expiredRefresh);

  return response;
}

/**
 * Parse cookies from NextRequest Cookie header
 */
export function parseRequestCookies(request) {
  const header = request.headers.get('cookie') || '';
  const cookies = {};
  header.split(';').forEach((pair) => {
    const [key, ...vals] = pair.trim().split('=');
    if (key) cookies[key] = vals.join('=');
  });
  return cookies;
}
