/**
 * Product Model — Mongoose Schema
 * ────────────────────────────────────────────────────────────────────────────
 * Powers the catalog in MongoDB. Supports full CRUD from the owner dashboard.
 * Includes variant-level stock & outOfStock overrides, status toggles (active,
 * draft, hidden, deleted), and multiple images.
 */

import mongoose from 'mongoose';

const ColorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex:  { type: String, required: true },
}, { _id: false });

// Per-variant stock tracking (size × color combinations)
const VariantSchema = new mongoose.Schema({
  size:       { type: String, default: null },
  color:      { type: String, default: null },
  stock:      { type: Number, default: 0, min: 0 },
  outOfStock: { type: Boolean, default: false }, // Manual out of stock override
}, { _id: true });

const ProductImageSchema = new mongoose.Schema({
  url:   { type: String, required: true },
  order: { type: Number, default: 0 },
}, { _id: false });

const ProductSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    slug:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    description:  { type: String, required: true },
    price:        { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, default: null },
    images:       [{ type: mongoose.Schema.Types.Mixed }], // Array of relative image URLs or { url, order } objects
    category:     { type: String, required: true, trim: true }, // e.g. 'crochet', 'kidswear', 'babywear', 'custom'
    subcategory:  { type: String, default: null },
    sizes:        [{ type: String }],
    colors:       [ColorSchema],
    material:     { type: String, default: '' },
    care:         { type: String, default: '' },
    featured:     { type: Boolean, default: false },
    newArrival:   { type: Boolean, default: false },
    customizable: { type: Boolean, default: false },
    status:       {
      type: String,
      enum: ['active', 'draft', 'hidden', 'deleted'],
      default: 'active',
    },
    stock:        { type: Number, default: 0, min: 0 },         // Aggregate stock (fallback/sum)
    variants:     [VariantSchema],                                // Per-variant stock & override
    lowStockThreshold: { type: Number, default: 5, min: 0 },    // Admin alert threshold
    soldCount:    { type: Number, default: 0, min: 0 },         // Total quantity sold
    wishlistCount: { type: Number, default: 0, min: 0 },        // Total wishlist additions
    averageRating: { type: Number, default: 5.0, min: 0, max: 5 }, // Average customer rating
    reviewCount:   { type: Number, default: 0, min: 0 },        // Total approved reviews
    badge:        { type: String, default: null },            // e.g. 'New Arrival', 'Bestseller', 'Made to Order', 'Out of Stock'
    tags:         [{ type: String }],
    filterValues: [
      {
        filterId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Filter', required: true },
        filterSlug: { type: String, required: true, trim: true },
        values:     [{ type: String, trim: true }],
      },
    ],
  },
  {
    timestamps: true,  // Adds createdAt, updatedAt
  }
);

// Indexes for fast lookups & filtering
ProductSchema.index({ status: 1, category: 1, featured: -1 });
ProductSchema.index({ status: 1, newArrival: -1, createdAt: -1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Prevent model recompilation in Next.js dev hot-reload
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;
