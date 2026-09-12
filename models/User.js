/**
 * User Model — Mongoose Schema
 * ────────────────────────────────────────────────────────────────────────────
 * Supports both customer and owner roles.
 * Passwords are always hashed with bcrypt — never stored in plain text.
 */

import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema(
  {
    label:   { type: String, default: 'Home' },       // e.g. 'Home', 'Work', 'Mom's Place'
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' },
  },
  { _id: true }
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'owner'],
      default: 'customer',
    },
    addresses: [AddressSchema],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    // Forgot password support
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  {
    timestamps: true, // Adds createdAt, updatedAt
  }
);

// Index for role-based queries (admin dashboard: list customers)
UserSchema.index({ role: 1, createdAt: -1 });

// Prevent model recompilation in Next.js dev hot-reload
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
