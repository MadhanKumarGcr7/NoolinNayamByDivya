/**
 * DesignGalleryImage Model — Mongoose Schema
 * ────────────────────────────────────────────────────────────────────────────
 * Stores admin-uploaded reference/inspiration images for custom orders.
 */

import mongoose from 'mongoose';

const DesignGalleryImageSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    caption: {
      type: String,
      default: '',
      trim: true,
    },
    visible: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

DesignGalleryImageSchema.index({ category: 1, visible: 1, createdAt: -1 });

const DesignGalleryImage =
  mongoose.models.DesignGalleryImage ||
  mongoose.model('DesignGalleryImage', DesignGalleryImageSchema);

export default DesignGalleryImage;
