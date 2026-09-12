/**
 * Public Contact API Route — POST /api/contact
 * ────────────────────────────────────────────────────────────────────────────
 * Receives contact form submissions from /contact and saves them to MongoDB.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ContactMessage from '@/models/ContactMessage';
import {
  sanitizeRequestData,
  checkApiRateLimit,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
} from '@/lib/security';

export async function POST(request) {
  try {
    // 1. Rate limiting check (10 requests per hour per IP)
    const rateCheck = checkApiRateLimit(request, 'contact_submission');
    if (!rateCheck.allowed) {
      const resp = NextResponse.json(
        { error: `Too many contact requests. Please wait ${rateCheck.retryAfterSeconds} seconds before sending another message.` },
        { status: 429 }
      );
      return applySecurityHeaders(resp, request);
    }

    // 2. Input sanitization
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

    await connectDB();

    const contactMsg = await ContactMessage.create({
      name:    name.trim(),
      email:   email.trim().toLowerCase(),
      phone:   phone ? phone.trim() : '',
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
      status:  'New',
    });

    logSecurityEvent({
      event: 'CONTACT_MESSAGE_SUBMITTED',
      path: '/api/contact',
      outcome: 'SUCCESS',
      details: { messageId: contactMsg._id.toString(), email },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. We will get back to you shortly.',
      id: contactMsg._id.toString(),
    }, { status: 201 });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
