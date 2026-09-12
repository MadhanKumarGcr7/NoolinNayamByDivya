/**
 * MongoDB Connection Singleton
 * ────────────────────────────────────────────────────────────────────────────
 * Set MONGODB_URI in your .env.local to connect to real MongoDB.
 * Without it, the app uses in-memory seed data (safe for development preview).
 *
 * INTEGRATION POINT: Wire in real MONGODB_URI before production.
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Cache connection across hot reloads in dev
let cached = global.mongooseCache;
if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (!MONGODB_URI) {
    // No URI provided — running in seed-data mode (development only)
    console.warn('[DB] MONGODB_URI not set. Using in-memory seed data.');
    return null;
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
