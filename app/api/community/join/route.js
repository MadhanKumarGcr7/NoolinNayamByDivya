/**
 * Community Join API — POST /api/community/join
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened community registration with NoSQL sanitization, rate limiting,
 * and official WhatsApp group URL response.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CommunityMember from '@/models/CommunityMember';
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
    // 1. Rate limiting check
    const rateCheck = checkApiRateLimit(request, 'community');
    if (!rateCheck.allowed) {
      const resp = NextResponse.json(
        { error: `Too many community registration attempts. Please wait ${rateCheck.retryAfterSeconds} seconds.` },
        { status: 429 }
      );
      return applySecurityHeaders(resp, request);
    }

    // 2. Input sanitization (NoSQL injection protection)
    const { body } = await sanitizeRequestData(request);
    const { email, name, phone, source = 'website' } = body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      const resp = NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing or create record
    const existing = await CommunityMember.findOne({ email: normalizedEmail });
    if (!existing) {
      await CommunityMember.create({
        email: normalizedEmail,
        name: name ? name.trim() : '',
        phone: phone ? phone.trim() : '',
        source,
        status: 'requested',
      });
    }

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
