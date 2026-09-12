/**
 * Centralized API Error Handler
 * ────────────────────────────────────────────────────────────────────────────
 * Catches unhandled server errors across API routes, logs full diagnostics server-side,
 * and returns clean, sanitized generic responses to clients without exposing internal
 * stack traces, file paths, or raw database error strings.
 */

import { NextResponse } from 'next/server';
import { applySecurityHeaders } from './headers';
import { logSecurityEvent } from './logger';
import { getClientIp } from './auth.middleware';

/**
 * Handle API error and produce clean JSON response
 */
export function handleApiError(error, request = null, defaultMessage = 'An unexpected server error occurred. Please try again later.') {
  const ip = request ? getClientIp(request) : 'unknown';
  const path = request ? (request.nextUrl?.pathname || request.url) : 'unknown';

  // Log full error details server-side
  logSecurityEvent({
    event: 'UNHANDLED_API_ERROR',
    ip,
    path,
    outcome: 'FAILURE',
    details: {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      stack: error?.stack,
    },
  });

  // Determine user-facing message (sanitized)
  let userMessage = defaultMessage;
  let statusCode = 500;

  if (error?.name === 'ValidationError') {
    statusCode = 400;
    userMessage = 'Validation failed. Please check your inputs.';
  } else if (error?.code === 11000) {
    statusCode = 409;
    userMessage = 'A record with these details already exists.';
  } else if (error?.name === 'CastError') {
    statusCode = 400;
    userMessage = 'Invalid identifier format.';
  }

  const response = NextResponse.json(
    {
      error: userMessage,
      success: false,
    },
    { status: statusCode }
  );

  return applySecurityHeaders(response, request);
}

/**
 * Wrapper higher-order function for Next.js API Route Handlers
 */
export function withSecurity(handler, { category = 'general', role = null } = {}) {
  return async function (request, params) {
    try {
      return await handler(request, params);
    } catch (error) {
      return handleApiError(error, request);
    }
  };
}
