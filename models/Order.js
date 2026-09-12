/**
 * Order Model — Mongoose Schema
 * ────────────────────────────────────────────────────────────────────────────
 * Stores completed checkout orders. Supports both logged-in and guest orders.
 * Guest orders store contact info directly; logged-in orders reference a User.
 */

import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name:      { type: String, required: true },
    size:      { type: String, default: null },
    color:     { type: String, default: null },
    quantity:  { type: Number, required: true, min: 1 },
    price:     { type: Number, required: true, min: 0 },
    image:     { type: String, default: null },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    // Order Number (e.g. NY-202608-0001)
    orderNumber: {
      type: String,
      trim: true,
      index: true,
    },
    // Reference to logged-in user (null for guest orders)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Guest info (populated when no userId)
    guestInfo: {
      name:  { type: String },
      email: { type: String },
      phone: { type: String },
    },
    // Order items
    items: [OrderItemSchema],
    // Pricing
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, default: 0 },
    total:    { type: Number, required: true, min: 0 },
    // Status
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    // Shipping address
    shippingAddress: {
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    // Contact info (always stored on order for shipping reference)
    contactInfo: {
      name:  { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    // Payment
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    // Return Policy Agreement Gate
    returnPolicyAgreed: {
      type: Boolean,
      default: false,
    },
    returnPolicyAgreedAt: {
      type: Date,
      default: null,
    },
    // WhatsApp Return Request Tracking
    returnRequested: {
      type: Boolean,
      default: false,
      index: true,
    },
    returnRequestedAt: {
      type: Date,
      default: null,
    },
    // Optional notes
    notes: { type: String, default: '' },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Indexes for dashboard queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

// Prevent model recompilation in Next.js dev hot-reload
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;
