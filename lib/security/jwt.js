/**
 * JWT Token Management — Centralized Sign, Verify & Revocation
 * ────────────────────────────────────────────────────────────────────────────
 * Role-based Access Tokens: Owner = 8h, Customer = 1h. Refresh Tokens = 7 days.
 * Payload contains only { userId, role } — NO password hashes, email, or PII.
 */

import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import RevokedToken from '@/models/RevokedToken';
import { logSecurityEvent } from './logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-noolinnayam-change-in-production-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}-refresh-key-2024`;

// Role-based access token expiry: owners stay logged in for 8h, customers 1h
const OWNER_ACCESS_TOKEN_EXPIRY    = '8h';
const CUSTOMER_ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d'; // 7-day refresh token

/**
 * Generate a random unique token ID for refresh token tracking
 */
export function generateTokenId() {
  // crypto.randomUUID is available as a Node.js global in Node 15+
  try {
    return globalThis.crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

/**
 * Sign a role-based access token (owner = 8h, customer = 1h)
 * @param {{ userId: string, role: string }} payload
 */
export function signAccessToken({ userId, role }) {
  if (!userId || !role) {
    throw new Error('JWT access token requires userId and role');
  }
  const expiry = role === 'owner' ? OWNER_ACCESS_TOKEN_EXPIRY : CUSTOMER_ACCESS_TOKEN_EXPIRY;
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: expiry });
}

/**
 * Sign a long-lived refresh token (7 days)
 * @param {{ userId: string, role: string, tokenId?: string }} payload
 */
export function signRefreshToken({ userId, role, tokenId = generateTokenId() }) {
  if (!userId || !role) {
    throw new Error('JWT refresh token requires userId and role');
  }
  return {
    token: jwt.sign({ userId, role, tokenId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY }),
    tokenId,
  };
}

/**
 * Verify access token
 * @returns {{ userId: string, role: string } | null}
 */
export function verifyAccessToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.userId || !decoded.role) return null;
    return { userId: decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
}

/**
 * Verify refresh token
 * @returns {{ userId: string, role: string, tokenId: string } | null}
 */
export function verifyRefreshToken(token) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    if (!decoded.userId || !decoded.role || !decoded.tokenId) return null;
    return { userId: decoded.userId, role: decoded.role, tokenId: decoded.tokenId };
  } catch {
    return null;
  }
}

/**
 * Check if a token ID is present in the server-side revocation list
 */
export async function isTokenRevoked(tokenId) {
  if (!tokenId) return true;
  try {
    await connectDB();
    const revoked = await RevokedToken.findOne({ tokenId }).lean();
    return !!revoked;
  } catch (err) {
    console.error('Error checking token revocation:', err);
    return false; // Fallback gracefully if database fails
  }
}

/**
 * Revoke a refresh token (on logout, password change, or security alert)
 */
export async function revokeRefreshToken({ tokenId, userId, role, reason = 'logout', expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }) {
  if (!tokenId || !userId) return;
  try {
    await connectDB();
    await RevokedToken.create({
      tokenId,
      userId,
      role,
      reason,
      expiresAt,
    });
    logSecurityEvent({
      event: 'TOKEN_REVOKED',
      userId,
      role,
      outcome: 'SUCCESS',
      details: { tokenId, reason },
    });
  } catch (err) {
    // If duplicate token ID, ignore
    if (err.code !== 11000) {
      console.error('Error revoking token:', err);
    }
  }
}
