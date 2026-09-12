/**
 * Input Sanitization & Anti-Injection Protection (NoSQL & XSS)
 * ────────────────────────────────────────────────────────────────────────────
 * Strips MongoDB query operators ($where, $gt, $ne, $regex, etc.) from incoming
 * request bodies, query parameters, and route arguments before database access.
 * Escapes HTML input to prevent Stored XSS attacks.
 */

// Forbidden MongoDB query operators
const MONGO_OPERATOR_REGEX = /^\$|^\.|\$where|\$gt|\$gte|\$ne|\$eq|\$in|\$nin|\$regex|\$or|\$and|\$nor|\$not|\$exists|\$expr|\$jsonSchema/i;

/**
 * Deeply sanitize an object or primitive by stripping Mongo operator keys
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
      // Reject keys starting with $ or matching Mongo query operators
      if (MONGO_OPERATOR_REGEX.test(key)) {
        console.warn(`[SECURITY] Stripped potential NoSQL injection key: "${key}"`);
        continue;
      }
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

    // Extract query parameters from URL
    const url = new URL(request.url);
    const query = {};
    url.searchParams.forEach((value, key) => {
      if (!MONGO_OPERATOR_REGEX.test(key)) {
        query[key] = sanitizeInput(value);
      }
    });

    return { body, query, url };
  } catch {
    return { body: {}, query: {}, url: new URL(request.url) };
  }
}
