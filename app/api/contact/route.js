/**
 * Public Contact API Route — POST /api/contact (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Receives contact form submissions from /contact and saves them to MySQL.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  sanitizeRequestData,
  checkApiRateLimit,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
} from '@/lib/security';

export async function POST(request) {
  try {
    const rateCheck = checkApiRateLimit(request, 'contact_submission');
    if (!rateCheck.allowed) {
      const resp = NextResponse.json(
        { error: `Too many contact requests. Please wait ${rateCheck.retryAfterSeconds} seconds before sending another message.` },
        { status: 429 }
      );
      return applySecurityHeaders(resp, request);
    }

    const { body } = await sanitizeRequestData(request);
    const { name, email, phone, subject, message } = body;

    if (!name || !name.trim()) {
      const resp = NextResponse.json({ error: 'Name is required.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    if (!email || !email.trim()) {
      const resp = NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    if (!message || !message.trim()) {
      const resp = NextResponse.json({ error: 'Message content is required.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const contactMsg = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        subject: subject ? subject.trim() : 'General Inquiry',
        message: message.trim(),
        status: 'New',
      },
    });

    logSecurityEvent({
      event: 'CONTACT_MESSAGE_SUBMITTED',
      path: '/api/contact',
      outcome: 'SUCCESS',
      details: { messageId: String(contactMsg.id), email },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. We will get back to you shortly.',
      id: String(contactMsg.id),
    }, { status: 201 });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
