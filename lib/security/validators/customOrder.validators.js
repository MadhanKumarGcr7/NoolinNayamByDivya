/**
 * Custom Order Input Validators
 * ────────────────────────────────────────────────────────────────────────────
 * Validates bespoke custom order inquiry form submissions.
 * Accepts both `name` / `customerName` and flexible requirement formats
 * (written requirements, selected gallery inspiration images, or reference photo).
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;

export function validateCustomOrderInput(data) {
  const errors = [];
  const name = data?.name || data?.customerName;
  const email = data?.email;
  const phone = data?.phone;
  const productType = data?.productType;
  const requirements = data?.requirements || data?.customRequirements || '';
  const selectedGallery = data?.selectedGalleryImages;
  const refImage = data?.referenceImageUrl;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Your name is required (at least 2 characters).');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Valid email address is required.');
  }

  if (!phone || typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim())) {
    errors.push('Valid phone number is required.');
  }

  if (!productType || typeof productType !== 'string' || !productType.trim()) {
    errors.push('Product type selection is required.');
  }

  // Ensure user provides at least written requirements, selected gallery inspiration, or reference image
  const hasText = typeof requirements === 'string' && requirements.trim().length >= 3;
  const hasGallery = Array.isArray(selectedGallery) && selectedGallery.length > 0;
  const hasRef = Boolean(refImage);

  if (!hasText && !hasGallery && !hasRef) {
    errors.push('Please describe your requirements or select gallery inspiration images.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
