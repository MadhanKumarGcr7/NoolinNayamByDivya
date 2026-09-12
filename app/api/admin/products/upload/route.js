/**
 * Admin Product Image Upload API — POST /api/admin/products/upload
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened upload handler checking owner role authorization, magic byte
 * signatures, file extension allowlist, and 5MB size limit per image.
 */

import { NextResponse } from 'next/server';
import { saveProductImage } from '@/lib/image-upload';
import {
  requireAuth,
  validateUploadedImageFile,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
} from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // 1. Owner authorization check
    const auth = await requireAuth(request, 'owner');
    if (!auth.authenticated) {
      const resp = NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
      return applySecurityHeaders(resp, request);
    }

    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      const resp = NextResponse.json({ error: 'No image files uploaded.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const imageUrls = [];

    for (const file of files) {
      if (typeof file === 'object' && file.name) {
        // 2. Validate magic bytes, extension, and file size
        const fileValidation = await validateUploadedImageFile(file);
        if (!fileValidation.valid) {
          logSecurityEvent({
            event: 'FILE_UPLOAD_BLOCKED',
            userId: auth.user.userId,
            role: 'owner',
            path: '/api/admin/products/upload',
            outcome: 'BLOCKED',
            details: { fileName: file.name, error: fileValidation.error },
          });
          continue;
        }

        const url = await saveProductImage(file);
        imageUrls.push(url);
      }
    }

    if (imageUrls.length === 0) {
      const resp = NextResponse.json(
        { error: 'No valid image files passed security inspection.' },
        { status: 400 }
      );
      return applySecurityHeaders(resp, request);
    }

    logSecurityEvent({
      event: 'PRODUCT_IMAGE_UPLOADED',
      userId: auth.user.userId,
      role: 'owner',
      path: '/api/admin/products/upload',
      outcome: 'SUCCESS',
      details: { count: imageUrls.length },
    });

    const response = NextResponse.json({
      success: true,
      imageUrls,
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
