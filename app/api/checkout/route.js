/**
 * Checkout API Route — POST /api/checkout
 * ────────────────────────────────────────────────────────────────────────────
 * Hardened checkout processing with NoSQL sanitization, rate limiting,
 * Return Policy agreement gate validation, and order generation.
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import {
  sanitizeRequestData,
  validateCheckoutOrder,
  checkApiRateLimit,
  applySecurityHeaders,
  handleApiError,
  logSecurityEvent,
  parseRequestCookies,
  verifyAccessToken,
  CUSTOMER_ACCESS_COOKIE,
} from '@/lib/security';

export async function POST(request) {
  try {
    // 1. Rate limit check (10 orders per hour per IP)
    const rateCheck = checkApiRateLimit(request, 'checkout');
    if (!rateCheck.allowed) {
      const resp = NextResponse.json(
        { error: `Too many order attempts. Please wait ${rateCheck.retryAfterSeconds} seconds before submitting again.` },
        { status: 429 }
      );
      return applySecurityHeaders(resp, request);
    }

    // 2. Input sanitization (NoSQL injection protection)
    const { body } = await sanitizeRequestData(request);

    // 3. Schema validation including Return Policy gate
    const validation = validateCheckoutOrder(body);
    if (!validation.valid) {
      const resp = NextResponse.json({ error: validation.errors.join(' ') }, { status: 400 });
      return applySecurityHeaders(resp, request);
    }

    const { items, customer, deliveryAddress, paymentMethod = 'COD', notes = '' } = body;

    // Optional customer user authentication link
    let customerUserId = null;
    const cookies = parseRequestCookies(request);
    const customerToken = cookies[CUSTOMER_ACCESS_COOKIE];
    if (customerToken) {
      const decoded = verifyAccessToken(customerToken);
      if (decoded?.role === 'customer') {
        customerUserId = decoded.userId;
      }
    }

    await connectDB();

    // Generate readable order number e.g. ORD-202608-1001
    const orderCount = await Order.countDocuments();
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const serialNumber = String(orderCount + 1).padStart(4, '0');
    const orderNumber = `ORD-${yearMonth}-${serialNumber}`;

    // Verify item prices against DB to prevent client-side price tampering
    let calculatedSubtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const productId = item.product?.id || item.product?._id || item.product;
      const dbProduct = await Product.findById(productId);
      if (!dbProduct) {
        const resp = NextResponse.json({ error: `Product "${item.name || 'item'}" is no longer available.` }, { status: 400 });
        return applySecurityHeaders(resp, request);
      }

      const itemPrice = dbProduct.price;
      calculatedSubtotal += itemPrice * item.quantity;

      processedItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        price: itemPrice,
        size: item.size || 'Standard',
        color: typeof item.color === 'string' ? item.color : item.color?.name || '',
        quantity: item.quantity,
        image: dbProduct.images?.[0] || '',
      });
    }

    const shippingFee = calculatedSubtotal >= 2999 ? 0 : 150;
    const totalAmount = calculatedSubtotal + shippingFee;

    // Create Order with Return Policy Agreement timestamps
    const order = await Order.create({
      orderNumber,
      user: customerUserId,
      items: processedItems,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
      },
      deliveryAddress: {
        street: deliveryAddress.street.trim(),
        city: deliveryAddress.city.trim(),
        state: deliveryAddress.state.trim(),
        pincode: deliveryAddress.pincode.trim(),
      },
      paymentMethod,
      subtotal: calculatedSubtotal,
      shippingFee,
      totalAmount,
      notes: notes.trim(),
      returnPolicyAgreed: true,
      returnPolicyAgreedAt: new Date(),
    });

    logSecurityEvent({
      event: 'ORDER_CREATED',
      userId: customerUserId,
      path: '/api/checkout',
      outcome: 'SUCCESS',
      details: { orderNumber, totalAmount, returnPolicyAgreed: true },
    });

    const response = NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      },
    });

    return applySecurityHeaders(response, request);
  } catch (error) {
    return handleApiError(error, request);
  }
}
