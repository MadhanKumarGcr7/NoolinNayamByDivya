/**
 * Seed Script: Navigation Items & Product Categories
 * ────────────────────────────────────────────────────────────────────────────
 * Seeds initial navigation links and product categories into MongoDB.
 * Run with: node scripts/seed-nav-items.cjs
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local if present
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/noolinnayambydivya';

const ProductCategorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    label: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const NavigationItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    linkType: {
      type: String,
      enum: ['category', 'page', 'external'],
      required: true,
      default: 'page',
    },
    categorySlug: { type: String, trim: true, default: '' },
    pageSlug: { type: String, trim: true, default: '' },
    externalUrl: { type: String, trim: true, default: '' },
    order: { type: Number, default: 0, index: true },
    visible: { type: Boolean, default: true },
    isFixed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ProductCategory = mongoose.models.ProductCategory || mongoose.model('ProductCategory', ProductCategorySchema);
const NavigationItem = mongoose.models.NavigationItem || mongoose.model('NavigationItem', NavigationItemSchema);

const sampleCategories = [
  { slug: 'crochet', label: 'Crochet', order: 0 },
  { slug: 'kidswear', label: 'Kidswear', order: 1 },
];

const sampleNavItems = [
  { order: 0, label: 'Home', linkType: 'page', pageSlug: '/', isFixed: true, visible: true },
  { order: 1, label: 'Shop', linkType: 'page', pageSlug: '/shop', isFixed: false, visible: true },
  { order: 2, label: 'Crochet', linkType: 'category', categorySlug: 'crochet', isFixed: false, visible: true },
  { order: 3, label: 'Kidswear', linkType: 'category', categorySlug: 'kidswear', isFixed: false, visible: true },
  { order: 4, label: 'Custom Orders', linkType: 'page', pageSlug: '/custom-orders', isFixed: false, visible: true },
  { order: 5, label: 'Workshops', linkType: 'page', pageSlug: '/workshops', isFixed: false, visible: true },
  { order: 6, label: 'Our Story', linkType: 'page', pageSlug: '/our-story', isFixed: false, visible: true },
  { order: 7, label: 'Contact', linkType: 'page', pageSlug: '/contact', isFixed: false, visible: true },
];

async function seed() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected.');

    for (const cat of sampleCategories) {
      await ProductCategory.updateOne({ slug: cat.slug }, cat, { upsert: true });
    }
    console.log('[Seed] Product categories seeded.');

    const count = await NavigationItem.countDocuments();
    if (count === 0) {
      await NavigationItem.insertMany(sampleNavItems);
      console.log('[Seed] Navigation items seeded.');
    } else {
      console.log(`[Seed] ${count} navigation items already exist in database.`);
    }

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

seed();
