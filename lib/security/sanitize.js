/**
 * Input Sanitization & Anti-Injection Protection (MySQL & XSS)
 * ────────────────────────────────────────────────────────────────────────────
 * Standard input sanitization for MySQL and Prisma ORM.
 * Prisma automatically uses parameterized queries to protect against SQL Injection.
 * Escapes HTML input to prevent Cross-Site Scripting (XSS).
 */

/**
 * Deeply sanitize an object or primitive string
 */
export function sanitizeInput(input) {
  if (input === null || input === undefined) return input;

  if (typeof input === 'string') {
    return input.trim();
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object') {
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(input)) {
      sanitizedObj[key] = sanitizeInput(value);
    }
    return sanitizedObj;
  }

  return input;
}

/**
 * HTML Escaping helper to mitigate Cross-Site Scripting (XSS)
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Global middleware sanitizer for Request objects
 */
export async function sanitizeRequestData(request) {
  try {
    let body = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const clone = request.clone();
      const rawBody = await clone.json();
      body = sanitizeInput(rawBody);
    }

    const url = new URL(request.url);
    const query = {};
    url.searchParams.forEach((value, key) => {
      query[key] = sanitizeInput(value);
    });

    return { body, query, url };
  } catch {
    return { body: {}, query: {}, url: new URL(request.url) };
  }
}
