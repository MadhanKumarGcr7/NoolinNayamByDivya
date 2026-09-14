/**
 * Owner Account Seed Script (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Creates (or updates) the owner/admin account in MySQL via Prisma.
 * Reads credentials from environment variables: OWNER_EMAIL, OWNER_PASSWORD
 *
 * Usage: npm run seed:owner
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const OWNER_EMAIL = process.env.OWNER_EMAIL || 'admin@noolinnayam.com';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'OwnerPass123!';

async function seedOwner() {
  try {
    console.log('🔄 Seeding Owner account in MySQL via Prisma...');

    const email = OWNER_EMAIL.toLowerCase().trim();
    const password_hash = await bcrypt.hash(OWNER_PASSWORD, 12);

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: 'Divya (Owner)',
        password_hash,
        role: 'owner',
      },
      create: {
        name: 'Divya (Owner)',
        email,
        phone: '+91 99999 99999',
        password_hash,
        role: 'owner',
      },
    });

    console.log(`✅ Owner account configured cleanly (ID: ${user.id})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log('   Login at: /owner-login');
  } catch (error) {
    console.error('❌ Error seeding owner account:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedOwner();
