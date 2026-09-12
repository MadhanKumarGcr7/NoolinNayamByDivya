/**
 * Order & Checkout Input Validators
 * ────────────────────────────────────────────────────────────────────────────
 * Validates checkout submissions, customer details, return policy agreement gate,
 * and admin order status updates.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,15}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;

export function validateCheckoutOrder(data) {
  const errors = [];
  const { items, customer, deliveryAddress, returnPolicyAgreed } = data || {};

  // Check items
  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Your cart is empty. Please add items before checking out.');
  } else {
    items.forEach((item, index) => {
      if (!item.product || (!item.product.id && !item.product._id)) {
        errors.push(`Item #${index + 1} has an invalid product ID.`);
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
        errors.push(`Item #${index + 1} must have a quantity of at least 1.`);
      }
      if (typeof item.price !== 'number' || item.price < 0) {
        errors.push(`Item #${index + 1} has an invalid price.`);
      }
    });
  }

  // Customer info
  if (!customer?.name || typeof customer.name !== 'string' || customer.name.trim().length < 2) {
    errors.push('Customer full name is required (at least 2 characters).');
  }

  if (!customer?.email || typeof customer.email !== 'string' || !EMAIL_REGEX.test(customer.email.trim())) {
    errors.push('Valid customer email address is required.');
  }

  if (!customer?.phone || typeof customer.phone !== 'string' || !PHONE_REGEX.test(customer.phone.trim())) {
    errors.push('Valid 10-digit phone number is required for shipping updates.');
  }

  // Shipping address
  if (!deliveryAddress?.street || typeof deliveryAddress.street !== 'string' || deliveryAddress.street.trim().length < 5) {
    errors.push('Street address is required (at least 5 characters).');
  }

  if (!deliveryAddress?.city || typeof deliveryAddress.city !== 'string' || deliveryAddress.city.trim().length < 2) {
    errors.push('City is required.');
  }

  if (!deliveryAddress?.state || typeof deliveryAddress.state !== 'string' || deliveryAddress.state.trim().length < 2) {
    errors.push('State is required.');
  }

  if (!deliveryAddress?.pincode || typeof deliveryAddress.pincode !== 'string' || !PINCODE_REGEX.test(deliveryAddress.pincode.trim())) {
    errors.push('Valid 6-digit Indian PIN Code is required.');
  }

  // Return Policy agreement gate requirement
  if (returnPolicyAgreed !== true) {
    errors.push('You must explicitly agree to the Return Policy before completing your order.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateUpdateOrderStatus(data) {
  const errors = [];
  const { status, trackingNumber } = data || {};
  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    errors.push(`Invalid order status. Allowed: ${validStatuses.join(', ')}`);
  }

  if (trackingNumber && typeof trackingNumber !== 'string') {
    errors.push('Tracking number must be a valid string.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
