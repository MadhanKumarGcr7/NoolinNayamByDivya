/**
 * Community Member Model — Mongoose Schema
 * ────────────────────────────────────────────────────────────────────────────
 * Logs users who expressed interest in or clicked to join the WhatsApp community.
 */

import mongoose from 'mongoose';

const CommunityMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: '',
      trim: true,
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    source: {
      type: String,
      enum: ['shop_page', 'workshop_page', 'homepage', 'other'],
      default: 'shop_page',
    },
    status: {
      type: String,
      enum: ['requested', 'added_to_group'],
      default: 'requested',
    },
  },
  {
    timestamps: true,
  }
);

CommunityMemberSchema.index({ createdAt: -1 });

const CommunityMember =
  mongoose.models.CommunityMember || mongoose.model('CommunityMember', CommunityMemberSchema);

export default CommunityMember;
