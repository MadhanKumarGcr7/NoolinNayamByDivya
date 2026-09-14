/**
 * Community Join API — POST /api/community/join (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened community registration with input sanitization, rate limiting,
 * and official WhatsApp group URL response.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { brandConfig } from '@/lib/config';
import {
  sanitizeRequestData,
  checkApiRateLimit,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
} from '@/lib/security';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const rateCheck = checkApiRateLimit(request, 'community');
    if (!rateCheck.allowed) {
      const resp = NextResponse.json(
        { error: `Too many community registration attempts. Please wait ${rateCheck.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
      return applySecurityHeaders(resp, request);
    }

    const { body } = await sanitizeRequestData(request);
    const { email, name, phone, source = 'website' } = body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      const resp = NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const normalizedEmail = email.trim().toLowerCase();

    await prisma.communityMember.upsert({
      where: { email: normalizedEmail },
      update: {
        name: name ? name.trim() : 'Member',
        phone: phone ? phone.trim() : null,
      },
      create: {
        email: normalizedEmail,
        name: name ? name.trim() : 'Member',
        phone: phone ? phone.trim() : null,
        source: source || 'website',
        status: 'Active',
      },
    });

    logSecurityEvent({
      event: 'COMMUNITY_MEMBER_JOINED',
      path: '/api/community/join',
      outcome: 'SUCCESS',
      details: { email: normalizedEmail, source },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Welcome to our community!',
      inviteUrl: brandConfig.community.whatsappGroupInviteUrl,
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
