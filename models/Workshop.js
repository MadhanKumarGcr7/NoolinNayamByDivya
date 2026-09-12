/**
 * Workshop Model — Mongoose Schema
 * ────────────────────────────────────────────────────────────────────────────
 * Stores crochet workshops hosted by the brand owner (online or physical).
 */

import mongoose from 'mongoose';

const WorkshopSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Workshop title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    coverImage: {
      type: String,
      default: '/assets/workshops/placeholder-workshop.jpg',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time slot is required'], // e.g. "10:30 AM - 1:30 PM"
      trim: true,
    },
    duration: {
      type: String,
      default: '3 Hours', // e.g. "3 Hours", "Full Day"
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location or Online details required'], // Physical address or "Online"
      trim: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
      default: '',
    },
    seatsTotal: {
      type: Number,
      required: [true, 'Total seats capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      default: 10,
    },
    seatsFilled: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    skillLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'All Levels',
    },
    registrationDeadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'full', 'cancelled', 'completed'],
      default: 'published',
    },
  },
  {
    timestamps: true,
  }
);

WorkshopSchema.index({ status: 1, date: 1 });

const Workshop = mongoose.models.Workshop || mongoose.model('Workshop', WorkshopSchema);

export default Workshop;
