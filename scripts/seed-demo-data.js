/**
 * Seed Demo Data Script
 * ────────────────────────────────────────────────────────────────────────────
 * Seeds sample customers, orders, and custom order requests for dev/testing.
 * All data is clearly labeled as demo — clear before going live.
 *
 * Usage: npm run seed:data
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in .env.local');
  process.exit(1);
}

async function seedDemoData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected');

    const db = mongoose.connection.db;

    // ── DEMO CUSTOMERS ────────────────────────────────────────────────────
    console.log('\n📦 Seeding demo customers...');

    const demoCustomers = [
      { name: 'Priya Sharma [DEMO]',    email: 'priya.demo@example.com',   phone: '+91 98765 43210' },
      { name: 'Anita Menon [DEMO]',     email: 'anita.demo@example.com',   phone: '+91 87654 32109' },
      { name: 'Lakshmi Iyer [DEMO]',    email: 'lakshmi.demo@example.com', phone: '+91 76543 21098' },
      { name: 'Meera Krishnan [DEMO]',  email: 'meera.demo@example.com',   phone: '+91 65432 10987' },
    ];

    const passwordHash = await bcrypt.hash('demo1234', 12);
    const customerIds = [];

    for (const cust of demoCustomers) {
      const result = await db.collection('users').updateOne(
        { email: cust.email },
        {
          $set: {
            ...cust,
            passwordHash,
            role: 'customer',
            addresses: [{
              label: 'Home',
              street: '123 Demo Street',
              city: 'Chennai',
              state: 'Tamil Nadu',
              pincode: '600001',
              country: 'India',
            }],
            wishlist: [],
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );

      const user = await db.collection('users').findOne({ email: cust.email });
      customerIds.push(user._id);
      console.log(`   ✅ ${cust.name}: ${cust.email}`);
    }

    // ── DEMO ORDERS ───────────────────────────────────────────────────────
    console.log('\n📦 Seeding demo orders...');

    const demoOrders = [
      {
        userId: customerIds[0],
        items: [
          { productId: 'prod-001', name: 'Ivory Bloom Crochet Dress', size: '12M', color: 'Ivory', quantity: 1, price: 2499 },
        ],
        subtotal: 2499, shipping: 0, total: 2499,
        status: 'Delivered',
        contactInfo: { name: 'Priya Sharma [DEMO]', email: 'priya.demo@example.com', phone: '+91 98765 43210' },
        shippingAddress: { street: '123 Demo Street', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', country: 'India' },
        paymentStatus: 'paid',
      },
      {
        userId: customerIds[1],
        items: [
          { productId: 'prod-005', name: 'Warm Brown Birthday Frock', size: '2Y', color: 'Warm Brown', quantity: 1, price: 3499 },
          { productId: 'prod-003', name: 'Blush Petal Baby Romper', size: '6M', color: 'Blush', quantity: 1, price: 1599 },
        ],
        subtotal: 5098, shipping: 0, total: 5098,
        status: 'Processing',
        contactInfo: { name: 'Anita Menon [DEMO]', email: 'anita.demo@example.com', phone: '+91 87654 32109' },
        shippingAddress: { street: '456 Demo Avenue', city: 'Kochi', state: 'Kerala', pincode: '682001', country: 'India' },
        paymentStatus: 'paid',
      },
      {
        userId: customerIds[2],
        items: [
          { productId: 'prod-002', name: 'Sandy Smock Kidswear Set', size: '3Y', color: 'Sand', quantity: 1, price: 1899 },
        ],
        subtotal: 1899, shipping: 0, total: 1899,
        status: 'Pending',
        contactInfo: { name: 'Lakshmi Iyer [DEMO]', email: 'lakshmi.demo@example.com', phone: '+91 76543 21098' },
        shippingAddress: { street: '789 Demo Road', city: 'Bangalore', state: 'Karnataka', pincode: '560001', country: 'India' },
        paymentStatus: 'pending',
      },
      {
        userId: null,
        guestInfo: { name: 'Guest Buyer [DEMO]', email: 'guest.demo@example.com', phone: '+91 54321 09876' },
        items: [
          { productId: 'prod-008', name: 'Sand & Blush Photoshoot Set', size: 'Newborn', color: 'Sand', quantity: 1, price: 2199 },
        ],
        subtotal: 2199, shipping: 0, total: 2199,
        status: 'Shipped',
        contactInfo: { name: 'Guest Buyer [DEMO]', email: 'guest.demo@example.com', phone: '+91 54321 09876' },
        shippingAddress: { street: '101 Guest Lane', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
        paymentStatus: 'paid',
      },
    ];

    // Remove old demo orders and insert fresh
    await db.collection('orders').deleteMany({ 'contactInfo.email': { $regex: /demo@example\.com/ } });

    for (const order of demoOrders) {
      await db.collection('orders').insertOne({
        ...order,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last 7 days
        updatedAt: new Date(),
      });
    }
    console.log(`   ✅ ${demoOrders.length} demo orders created`);

    // ── DEMO CUSTOM REQUESTS ──────────────────────────────────────────────
    console.log('\n📦 Seeding demo custom order requests...');

    const demoCustomRequests = [
      {
        userId: customerIds[3],
        name: 'Meera Krishnan [DEMO]',
        email: 'meera.demo@example.com',
        phone: '+91 65432 10987',
        productType: 'birthday-frock',
        ageGroup: '1y-2y',
        preferredColor: 'Dusty Rose & Ivory',
        occasion: '1st Birthday photoshoot',
        desiredDate: '2024-04-15',
        customRequirements: 'Looking for a layered crochet dress with tulle underskirt. Would love a matching flower headband if possible. She is a petite baby so please use 9-12M sizing.',
        additionalNotes: 'Happy to discuss on WhatsApp for reference images.',
        status: 'New',
      },
      {
        userId: null,
        name: 'Sneha Reddy [DEMO]',
        email: 'sneha.demo@example.com',
        phone: '+91 43210 98765',
        productType: 'sibling-set',
        ageGroup: '2y-4y',
        preferredColor: 'Sage green and cream',
        occasion: 'Family photoshoot',
        desiredDate: '2024-05-01',
        customRequirements: 'Need matching outfits for my two kids: boy (3Y) and girl (18M). Crochet top for the girl, simple kurta style for the boy in coordinating colors.',
        additionalNotes: '',
        status: 'Reviewed',
      },
    ];

    await db.collection('customorderrequests').deleteMany({ email: { $regex: /demo@example\.com/ } });

    for (const req of demoCustomRequests) {
      await db.collection('customorderrequests').insertOne({
        ...req,
        createdAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      });
    }
    console.log(`   ✅ ${demoCustomRequests.length} demo custom requests created`);

    console.log('\n✅ All demo data seeded successfully!');
    console.log('⚠️  This is DEMO data — clear it before going live.');
    console.log('   Demo customer password: demo1234');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

seedDemoData();
