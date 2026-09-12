/**
 * Review Model — Mongoose Schema
 * ────────────────────────────────────────────────────────────────────────────
 * Stores product ratings and customer feedback. Supervised & moderated by admin.
 */

import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    productId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    productSlug:      { type: String, required: true, index: true },
    productName:      { type: String, required: true },
    customerName:     { type: String, required: true, trim: true },
    customerEmail:    { type: String, required: true, trim: true, lowercase: true },
    rating:           { type: Number, required: true, min: 1, max: 5 },
    headline:         { type: String, required: true, trim: true },
    comment:          { type: String, required: true, trim: true },
    status:           { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved', index: true },
    verifiedPurchase: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
