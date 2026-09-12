/**
 * Auth Input Validators
 * ────────────────────────────────────────────────────────────────────────────
 * Validates request bodies for login, signup, owner login, and profile updates.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;

export function validateLogin(data) {
  const errors = [];
  const { email, password } = data || {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Please enter a valid email address.');
  }

  if (!password || typeof password !== 'string' || password.length < 1) {
    errors.push('Password is required.');
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      email: email?.trim().toLowerCase(),
      password,
    },
  };
}

export function validateSignup(data) {
  const errors = [];
  const { name, email, password, phone } = data || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Please enter your full name (at least 2 characters).');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Please enter a valid email address.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (phone && (typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim()))) {
    errors.push('Please enter a valid phone number.');
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      name: name?.trim(),
      email: email?.trim().toLowerCase(),
      password,
      phone: phone?.trim() || '',
    },
  };
}

export function validateOwnerLogin(data) {
  const errors = [];
  const { email, password } = data || {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Please enter a valid owner email address.');
  }

  if (!password || typeof password !== 'string' || password.length < 1) {
    errors.push('Password is required.');
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      email: email?.trim().toLowerCase(),
      password,
    },
  };
}
