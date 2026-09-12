/**
 * Workshop Registration Model — Mongoose Schema
 * ────────────────────────────────────────────────────────────────────────────
 * Stores attendee seat reservations for workshops.
 */

import mongoose from 'mongoose';

const WorkshopRegistrationSchema = new mongoose.Schema(
  {
    workshopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workshop',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    seatsBooked: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    notes: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'waived', 'refunded'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'waitlisted'],
      default: 'confirmed',
    },
  },
  {
    timestamps: true,
  }
);

WorkshopRegistrationSchema.index({ workshopId: 1, createdAt: -1 });
WorkshopRegistrationSchema.index({ email: 1 });

const WorkshopRegistration =
  mongoose.models.WorkshopRegistration ||
  mongoose.model('WorkshopRegistration', WorkshopRegistrationSchema);

export default WorkshopRegistration;
