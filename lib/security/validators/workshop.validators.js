/**
 * Workshop Input Validators
 * ────────────────────────────────────────────────────────────────────────────
 * Validates workshop registration and admin workshop management inputs.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;

export function validateWorkshopRegistration(data) {
  const errors = [];
  const { name, email, phone, participants } = data || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name is required.');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Valid email address is required.');
  }

  if (!phone || typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim())) {
    errors.push('Valid phone number is required.');
  }

  if (participants && (typeof participants !== 'number' || participants < 1)) {
    errors.push('Participants count must be at least 1.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateWorkshopInput(data) {
  const errors = [];
  const { title, price, capacity, date } = data || {};

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Workshop title is required (at least 3 characters).');
  }

  if (typeof price !== 'number' || price < 0) {
    errors.push('Workshop price must be a non-negative number.');
  }

  if (typeof capacity !== 'number' || capacity < 1) {
    errors.push('Workshop capacity must be at least 1.');
  }

  if (!date) {
    errors.push('Workshop date is required.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
