/**
 * Custom Orders API — POST /api/custom-orders
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened custom order submission with NoSQL sanitization, rate limiting,
 * input validation, and gallery design snapshotting.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import CustomOrderRequest from '@/models/CustomOrderRequest';
import {
  sanitizeRequestData,
  validateCustomOrderInput,
  checkApiRateLimit,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
  requireAuth,
} from '@/lib/security';

export async function POST(request) {
  try {
    // 1. Rate limiting check (10 requests per hour per IP)
    const rateCheck = checkApiRateLimit(request, 'custom_order');
    if (!rateCheck.allowed) {
      const resp = NextResponse.json(
        { error: `Too many custom order requests. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.` },
        { status: 429 }
      );
      return applySecurityHeaders(resp, request);
    }

    // 2. Check if user is logged in (optional auth attach)
    let loggedInUserId = null;
    try {
      const auth = await requireAuth(request, 'customer');
      if (auth.authenticated && auth.user?.userId) {
        loggedInUserId = auth.user.userId;
      }
    } catch {
      /* Guest user submission */
    }

    // 3. Input sanitization (NoSQL injection protection)
    const { body } = await sanitizeRequestData(request);

    // 4. Validation
    const validation = validateCustomOrderInput(body);
    if (!validation.valid) {
      const resp = NextResponse.json({ message: validation.errors.join(' '), error: validation.errors.join(' ') }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const {
      name,
      customerName,
      email,
      phone,
      productType,
      ageGroup,
      customSize,
      size,
      preferredColor,
      preferredColors,
      occasion,
      desiredDate,
      neededByDate,
      requirements,
      customRequirements,
      referenceImageUrl,
      selectedGalleryImages = [],
      notes,
      additionalNotes,
    } = body;

    const finalName = (name || customerName || '').trim();
    const finalEmail = (email || '').trim().toLowerCase();
    const finalPhone = (phone || '').trim();
    const finalProductType = (productType || '').trim();
    const finalAgeGroup = (ageGroup || '').trim();
    const finalCustomSize = (customSize || size || '').trim();
    const finalPreferredColor = (preferredColor || preferredColors || '').trim();
    const finalOccasion = (occasion || '').trim();
    const finalDesiredDate = (desiredDate || neededByDate || 'Flexible / As soon as ready').toString().trim();
    const finalRequirements = (customRequirements || requirements || '').trim();
    const finalNotes = (additionalNotes || notes || '').trim();

    await connectDB();

    const customRequest = await CustomOrderRequest.create({
      userId: loggedInUserId,
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
      productType: finalProductType,
      ageGroup: finalAgeGroup,
      customSize: finalCustomSize,
      preferredColor: finalPreferredColor,
      occasion: finalOccasion,
      desiredDate: finalDesiredDate,
      customRequirements: finalRequirements,
      referenceImageUrl: referenceImageUrl || null,
      selectedGalleryImages: Array.isArray(selectedGalleryImages) ? selectedGalleryImages : [],
      additionalNotes: finalNotes,
      status: 'New',
    });

    logSecurityEvent({
      event: 'CUSTOM_ORDER_SUBMITTED',
      path: '/api/custom-orders',
      outcome: 'SUCCESS',
      details: { customRequestId: customRequest._id.toString(), email: finalEmail },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Custom order request received successfully! Divya will review your design vision and contact you within 24-48 hours.',
      id: customRequest._id.toString(),
      request: customRequest,
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
