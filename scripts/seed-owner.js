/**
 * Owner Account Seed Script
 * ────────────────────────────────────────────────────────────────────────────
 * Creates (or updates) the owner/admin account in MongoDB.
 * Reads credentials from environment variables: OWNER_EMAIL, OWNER_PASSWORD
 *
 * Usage: npm run seed:owner
 *
 * WARNING: Change the default OWNER_PASSWORD before going live.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI    = process.env.MONGODB_URI;
const OWNER_EMAIL    = process.env.OWNER_EMAIL;
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env.local');
  process.exit(1);
}
if (!OWNER_EMAIL || !OWNER_PASSWORD) {
  console.error('❌ OWNER_EMAIL and OWNER_PASSWORD must be set in .env.local');
  process.exit(1);
}

async function seedOwner() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 12);

    const result = await usersCollection.updateOne(
      { email: OWNER_EMAIL.toLowerCase().trim() },
      {
        $set: {
          name: 'Divya (Owner)',
          email: OWNER_EMAIL.toLowerCase().trim(),
          phone: '+91 00000 00000',
          passwordHash,
          role: 'owner',
          addresses: [],
          wishlist: [],
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      console.log(`✅ Owner account CREATED: ${OWNER_EMAIL}`);
    } else {
      console.log(`✅ Owner account UPDATED: ${OWNER_EMAIL}`);
    }

    console.log('   Role: owner');
    console.log('   Login at: /owner-login');
    console.log('');
    console.log('⚠️  Remember to change the password before going live!');

  } catch (error) {
    console.error('❌ Error seeding owner account:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

seedOwner();
