/**
 * DesignGalleryCategory Model — Mongoose Schema
 * ────────────────────────────────────────────────────────────────────────────
 * Dynamic categories for organizing design gallery inspiration images.
 */

import mongoose from 'mongoose';

const DesignGalleryCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const DesignGalleryCategory =
  mongoose.models.DesignGalleryCategory ||
  mongoose.model('DesignGalleryCategory', DesignGalleryCategorySchema);

export default DesignGalleryCategory;
