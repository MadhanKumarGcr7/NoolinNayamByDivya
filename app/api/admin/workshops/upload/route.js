/**
 * Admin Workshop Cover Upload API — POST /api/admin/workshops/upload
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened workshop cover image upload handler checking owner role authorization,
 * magic byte signatures, file extension allowlist, and 5MB size limit.
 */

import { NextResponse } from 'next/server';
import { saveWorkshopImage } from '@/lib/image-upload';
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
    const file = formData.get('file');

    if (!file) {
      const resp = NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    // 2. Validate magic bytes, extension, and size
    const fileValidation = await validateUploadedImageFile(file);
    if (!fileValidation.valid) {
      logSecurityEvent({
        event: 'FILE_UPLOAD_BLOCKED',
        userId: auth.user.userId,
        role: 'owner',
        path: '/api/admin/workshops/upload',
        outcome: 'BLOCKED',
        details: { fileName: file.name, error: fileValidation.error },
      });
      const resp = NextResponse.json({ error: fileValidation.error }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const imageUrl = await saveWorkshopImage(file);

    logSecurityEvent({
      event: 'WORKSHOP_IMAGE_UPLOADED',
      userId: auth.user.userId,
      role: 'owner',
      path: '/api/admin/workshops/upload',
      outcome: 'SUCCESS',
    });

    const response = NextResponse.json({
      success: true,
      url: imageUrl,
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
