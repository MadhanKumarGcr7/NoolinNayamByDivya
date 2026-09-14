/**
 * JWT Token Management — Centralized Sign, Verify & Revocation (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Role-based Access Tokens: Owner = 8h, Customer = 1h. Refresh Tokens = 7 days.
 * Payload contains only { userId, role } — NO password hashes, email, or PII.
 */

import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { logSecurityEvent } from './logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-noolinnayam-change-in-production-2024';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}-refresh-key-2024`;

const OWNER_ACCESS_TOKEN_EXPIRY    = '8h';
const CUSTOMER_ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

export function generateTokenId() {
  try {
    return globalThis.crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

export function signAccessToken({ userId, role }) {
  if (!userId || !role) {
    throw new Error('JWT access token requires userId and role');
  }
  const expiry = role === 'owner' ? OWNER_ACCESS_TOKEN_EXPIRY : CUSTOMER_ACCESS_TOKEN_EXPIRY;
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: expiry });
}

export function signRefreshToken({ userId, role, tokenId = generateTokenId() }) {
  if (!userId || !role) {
    throw new Error('JWT refresh token requires userId and role');
  }
  return {
    token: jwt.sign({ userId, role, tokenId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY }),
    tokenId,
  };
}

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

export async function isTokenRevoked(tokenId) {
  if (!tokenId) return true;
  try {
    const revoked = await prisma.revokedToken.findUnique({ where: { token_id: tokenId } });
    return !!revoked;
  } catch (err) {
    console.error('Error checking token revocation:', err);
    return false;
  }
}

export async function revokeRefreshToken({ tokenId, userId, role, reason = 'logout', expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }) {
  if (!tokenId || !userId) return;
  try {
    await prisma.revokedToken.upsert({
      where: { token_id: tokenId },
      update: { reason, expires_at: expiresAt },
      create: {
        token_id: tokenId,
        user_id: String(userId),
        role,
        reason,
        expires_at: expiresAt,
      },
    });
    logSecurityEvent({
      event: 'TOKEN_REVOKED',
      userId,
      role,
      outcome: 'SUCCESS',
      details: { tokenId, reason },
    });
  } catch (err) {
    console.error('Error revoking token:', err);
  }
}
