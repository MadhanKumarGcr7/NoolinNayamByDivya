/**
 * Product Input Validators
 * ────────────────────────────────────────────────────────────────────────────
 * Validates admin product creation and updates.
 */

export function validateProductInput(data) {
  const errors = [];
  const { name, price, category, sizes, stock } = data || {};

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    errors.push('Product name is required (at least 3 characters).');
  }

  if (typeof price !== 'number' || price <= 0) {
    errors.push('Product price must be a positive number.');
  }

  if (!category || typeof category !== 'string') {
    errors.push('Product category is required.');
  }

  if (sizes && !Array.isArray(sizes)) {
    errors.push('Sizes must be an array of size strings.');
  }

  if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
    errors.push('Stock count must be a non-negative number.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
