/**
 * ContactMessage Model — Mongoose Schema
 * ────────────────────────────────────────────────────────────────────────────
 * Stores general inquiries and contact messages submitted via the /contact form.
 */

import mongoose from 'mongoose';

const ContactMessageSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    phone:   { type: String, trim: true, default: '' },
    subject: { type: String, trim: true, default: 'General Inquiry' },
    message: { type: String, required: true, trim: true },
    status:  {
      type: String,
      enum: ['New', 'Read', 'Replied', 'Archived'],
      default: 'New',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({ createdAt: -1 });

const ContactMessage =
  mongoose.models.ContactMessage ||
  mongoose.model('ContactMessage', ContactMessageSchema);

export default ContactMessage;
