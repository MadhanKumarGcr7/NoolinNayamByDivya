/**
 * File Upload Security Inspector
 * ────────────────────────────────────────────────────────────────────────────
 * Validates uploaded files using magic byte buffer signature checks, extension allowlists,
 * max file size limits (5MB), and server-side randomized filename generation.
 */

import crypto from 'crypto';
import path from 'path';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit

/**
 * Inspect magic bytes of a file Buffer to verify genuine image type
 */
export function verifyImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 8) return false;

  const hex = buffer.toString('hex', 0, 8).toLowerCase();

  // JPEG magic bytes: ffd8ff
  if (hex.startsWith('ffd8ff')) return true;

  // PNG magic bytes: 89504e47
  if (hex.startsWith('89504e47')) return true;

  // WebP magic bytes: 52494646 (RIFF) ... 57454250 (WEBP)
  if (hex.startsWith('52494646') && buffer.toString('hex', 8, 12).toLowerCase() === '57454250') {
    return true;
  }

  // GIF magic bytes: 47494638
  if (hex.startsWith('47494638')) return true;

  return false;
}

/**
 * Validate an uploaded File object (from FormData)
 * @param {File} file
 * @returns {Promise<{ valid: boolean, error?: string, safeFileName?: string, extension?: string }>}
 */
export async function validateUploadedImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // 1. File size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds 5MB limit.' };
  }

  // 2. Extension check
  const ext = path.extname(file.name || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension "${ext}". Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // 3. Content magic bytes check
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isGenuineImage = verifyImageMagicBytes(buffer);
    if (!isGenuineImage) {
      return {
        valid: false,
        error: 'File content does not match a valid image format (magic byte check failed).',
      };
    }

    // 4. Generate safe randomized filename server-side
    const randomId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const safeFileName = `${randomId}${ext}`;

    return {
      valid: true,
      safeFileName,
      extension: ext,
      buffer,
    };
  } catch (err) {
    return { valid: false, error: 'Failed to inspect uploaded file buffer.' };
  }
}
