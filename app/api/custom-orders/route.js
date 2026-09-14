/**
 * Custom Orders API — POST /api/custom-orders (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened custom order submission with input sanitization, rate limiting,
 * input validation, and gallery design snapshotting.
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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
    const rateCheck = checkApiRateLimit(request, 'custom_order');
    if (!rateCheck.allowed) {
      const resp = NextResponse.json(
        { error: `Too many custom order requests. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.` },
        { status: 429 }
      );
      return applySecurityHeaders(resp, request);
    }

    let loggedInUserId = null;
    try {
      const auth = await requireAuth(request, 'customer');
      if (auth.authenticated && auth.user?.userId) {
        const numId = Number(auth.user.userId);
        if (!isNaN(numId)) loggedInUserId = numId;
      }
    } catch {
      /* Guest user */
    }

    const { body } = await sanitizeRequestData(request);

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

    const finalBaseProductId = body.baseProductId ? Number(body.baseProductId) : null;
    const finalBaseProductNameSnapshot = (body.baseProductNameSnapshot || body.baseProductName || '').trim() || null;

    const customRequest = await prisma.customOrderRequest.create({
      data: {
        user_id: loggedInUserId,
        base_product_id: finalBaseProductId && !isNaN(finalBaseProductId) ? finalBaseProductId : null,
        base_product_name_snapshot: finalBaseProductNameSnapshot,
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        product_type: finalProductType,
        age: finalAgeGroup,
        size: finalCustomSize,
        preferred_color: finalPreferredColor,
        occasion: finalOccasion,
        desired_date: finalDesiredDate,
        custom_requirements: finalRequirements,
        reference_image_url: referenceImageUrl || null,
        additional_notes: finalNotes,
        status: 'New',
        gallery_selections: {
          create: (Array.isArray(selectedGalleryImages) ? selectedGalleryImages : []).map((img) => ({
            image_url_snapshot: typeof img === 'string' ? img : img.imageUrl || img.url || '',
            caption_snapshot: typeof img === 'object' ? img.caption || null : null,
            note: typeof img === 'object' ? img.note || null : null,
          })),
        },
      },
    });

    logSecurityEvent({
      event: 'CUSTOM_ORDER_SUBMITTED',
      path: '/api/custom-orders',
      outcome: 'SUCCESS',
      details: { customRequestId: String(customRequest.id), email: finalEmail },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Custom order request received successfully! Divya will review your design vision and contact you within 24-48 hours.',
      id: String(customRequest.id),
      request: {
        id: String(customRequest.id),
        ...customRequest,
      },
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
