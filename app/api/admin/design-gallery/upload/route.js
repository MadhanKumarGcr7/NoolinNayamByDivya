/**
 * Admin Gallery Image Upload API — POST /api/admin/design-gallery/upload
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened design gallery upload handler checking owner role authorization,
 * magic byte signatures, file extension allowlist, and 5MB size limit.
 */

import { NextResponse } from 'next/server';
import { saveGalleryImage } from '@/lib/image-upload';
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
    let files = formData.getAll('files');
    if (!files || files.length === 0) {
      const singleFile = formData.get('file');
      if (singleFile) files = [singleFile];
    }

    if (!files || files.length === 0) {
      const resp = NextResponse.json({ error: 'No image files uploaded.' }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const urls = [];

    for (const file of files) {
      if (file && typeof file === 'object' && file.name) {
        // 2. Validate magic bytes, extension, and file size
        const fileValidation = await validateUploadedImageFile(file);
        if (!fileValidation.valid) {
          logSecurityEvent({
            event: 'FILE_UPLOAD_BLOCKED',
            userId: auth.user.userId,
            role: 'owner',
            path: '/api/admin/design-gallery/upload',
            outcome: 'BLOCKED',
            details: { fileName: file.name, error: fileValidation.error },
          });
          continue;
        }

        const savedUrl = await saveGalleryImage(file);
        urls.push(savedUrl);
      }
    }

    if (urls.length === 0) {
      const resp = NextResponse.json(
        { error: 'No valid gallery images passed security inspection.' },
        { status: 400 }
      );
      return applySecurityHeaders(resp, request);
    }

    logSecurityEvent({
      event: 'GALLERY_IMAGE_UPLOADED',
      userId: auth.user.userId,
      role: 'owner',
      path: '/api/admin/design-gallery/upload',
      outcome: 'SUCCESS',
      details: { count: urls.length },
    });

    const response = NextResponse.json({
      success: true,
      urls,
      url: urls[0] || null,
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
