/**
 * Revoked Token Schema — Mongoose Model
 * ────────────────────────────────────────────────────────────────────────────
 * Tracks revoked refresh tokens and invalidated user sessions (logout, password reset,
 * or security events) to prevent token replay attacks.
 */

import mongoose from 'mongoose';

const RevokedTokenSchema = new mongoose.Schema(
  {
    tokenId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['customer', 'owner'],
      required: true,
    },
    reason: {
      type: String,
      default: 'logout',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Automatic TTL cleanup when token naturally expires
    },
  },
  {
    timestamps: true,
  }
);

const RevokedToken =
  mongoose.models.RevokedToken || mongoose.model('RevokedToken', RevokedTokenSchema);

export default RevokedToken;
