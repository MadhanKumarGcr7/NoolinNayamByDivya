/**
 * Database Singleton (MySQL via Prisma Client)
 * ────────────────────────────────────────────────────────────────────────────
 * Formerly MongoDB Mongoose connector, now exports Prisma Client.
 */

import prisma from './prisma';

export async function connectDB() {
  return prisma;
}

export default prisma;
