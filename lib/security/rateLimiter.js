/**
 * Multi-Bucket Rate Limiter & Brute-Force Throttling
 * ────────────────────────────────────────────────────────────────────────────
 * Prevents credential brute-forcing, spam submissions, and DoS attacks.
 * Tracks request counts per IP address and endpoint category.
 */

import { getClientIp } from './auth.middleware';
import { logSecurityEvent } from './logger';

// In-memory store for rate limit buckets (production can switch to Redis)
const rateLimitBuckets = new Map();

/**
 * Check if a request exceeds rate limit for a specific bucket
 */
export function checkRateLimitByKey(bucketKey, { max = 10, windowMs = 60 * 1000 } = {}) {
  const now = Date.now();
  const record = rateLimitBuckets.get(bucketKey);

  if (!record || now > record.resetAt) {
    rateLimitBuckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= max) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true };
}

/**
 * Helper to check rate limits for incoming Next.js API requests
 */
export function checkApiRateLimit(request, actionCategory = 'general') {
  const ip = getClientIp(request);
  const bucketKey = `${actionCategory}:${ip}`;

  const configs = {
    auth_login:    { max: 5,   windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 mins
    auth_signup:   { max: 5,   windowMs: 60 * 60 * 1000 }, // 5 signups per hour
    checkout:      { max: 10,  windowMs: 60 * 60 * 1000 }, // 10 orders per hour
    custom_order:  { max: 10,  windowMs: 60 * 60 * 1000 }, // 10 custom requests per hour
    community:     { max: 5,   windowMs: 60 * 60 * 1000 }, // 5 joins per hour
    general:       { max: 100, windowMs: 60 * 1000 },      // 100 requests per minute
  };

  const config = configs[actionCategory] || configs.general;
  const result = checkRateLimitByKey(bucketKey, config);

  if (!result.allowed) {
    logSecurityEvent({
      event: 'RATE_LIMIT_EXCEEDED',
      ip,
      path: request.nextUrl?.pathname || request.url,
      outcome: 'BLOCKED',
      details: { actionCategory, retryAfterSeconds: result.retryAfterSeconds },
    });
  }

  return result;
}

/**
 * Reset rate limit count for a key (on successful authentication)
 */
export function resetApiRateLimit(request, actionCategory = 'general') {
  const ip = getClientIp(request);
  const bucketKey = `${actionCategory}:${ip}`;
  rateLimitBuckets.delete(bucketKey);
}
