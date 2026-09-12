/**
 * CustomOrderRequest Model — Mongoose Schema
 * ────────────────────────────────────────────────────────────────────────────
 * Stores custom order inquiries submitted via the Custom Order form.
 * Supports both logged-in users and guest submissions.
 */

import mongoose from 'mongoose';

const CustomOrderRequestSchema = new mongoose.Schema(
  {
    // Optional — linked to user if they were logged in when submitting
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Contact info (always stored, regardless of login status)
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    // Custom order details
    productType: {
      type: String,
      required: true,
      trim: true,
    },
    ageGroup: {
      type: String,
      default: '',
    },
    customSize: {
      type: String,
      default: '',
    },
    preferredColor: {
      type: String,
      default: '',
    },
    occasion: {
      type: String,
      default: '',
    },
    desiredDate: {
      type: String,
      required: true,
    },
    customRequirements: {
      type: String,
      default: '',
    },
    referenceImageUrl: {
      type: String,
      default: null,
    },
    // Selected design gallery inspiration items (snapshot)
    selectedGalleryImages: [
      {
        imageId: { type: String, default: null },
        imageUrl: { type: String, required: true },
        caption: { type: String, default: '' },
        category: { type: String, default: '' },
        note: { type: String, default: '' },
      },
    ],
    additionalNotes: {
      type: String,
      default: '',
    },
    // Owner tracking status & pricing feedback
    status: {
      type: String,
      enum: ['New', 'Reviewed', 'In Progress', 'Completed', 'Declined'],
      default: 'New',
    },
    quotedPrice: {
      type: Number,
      default: 0,
    },
    ownerResponse: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Indexes for dashboard queries
CustomOrderRequestSchema.index({ status: 1, createdAt: -1 });
CustomOrderRequestSchema.index({ email: 1, createdAt: -1 });
CustomOrderRequestSchema.index({ userId: 1, createdAt: -1 });
CustomOrderRequestSchema.index({ createdAt: -1 });

// Prevent model recompilation in Next.js dev hot-reload
const CustomOrderRequest =
  mongoose.models.CustomOrderRequest ||
  mongoose.model('CustomOrderRequest', CustomOrderRequestSchema);

export default CustomOrderRequest;
