/**
 * Seed Script: Design Inspiration Gallery (CommonJS)
 * ────────────────────────────────────────────────────────────────────────────
 * Seeds initial design gallery categories and sample inspiration images into MongoDB.
 * Run with: node scripts/seed-design-gallery.cjs
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

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/noolinnayam';

// Schemas
const DesignGalleryCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const DesignGalleryImageSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    tags: [{ type: String, trim: true }],
    caption: { type: String, default: '', trim: true },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = mongoose.models.DesignGalleryCategory || mongoose.model('DesignGalleryCategory', DesignGalleryCategorySchema);
const Image = mongoose.models.DesignGalleryImage || mongoose.model('DesignGalleryImage', DesignGalleryImageSchema);

const sampleCategories = [
  { name: 'Necklines', order: 1 },
  { name: 'Sleeves', order: 2 },
  { name: 'Patterns & Motifs', order: 3 },
  { name: 'Color Palettes', order: 4 },
  { name: 'Finished Garments', order: 5 },
  { name: 'Yarn Textures', order: 6 },
];

const sampleImages = [
  {
    imageUrl: '/assets/products/ivory-bloom-crochet-dress/1.jpg',
    category: 'Necklines',
    tags: ['scalloped', 'floral', 'blooms'],
    caption: 'Scalloped Bloom Neckline',
    visible: true,
  },
  {
    imageUrl: '/assets/products/sage-garden-crochet-top/1.jpg',
    category: 'Necklines',
    tags: ['square', 'open-stitch', 'minimal'],
    caption: 'Square Open-Stitch Neckline',
    visible: true,
  },
  {
    imageUrl: '/assets/products/sandy-smock-kidswear-set/1.jpg',
    category: 'Sleeves',
    tags: ['puff sleeve', 'smocked', 'frill'],
    caption: 'Puff Sleeve with Delicate Frill',
    visible: true,
  },
  {
    imageUrl: '/assets/products/blush-petal-baby-romper/1.jpg',
    category: 'Sleeves',
    tags: ['sleeveless', 'petal-trim', 'straps'],
    caption: 'Petal-Trim Shoulder Straps',
    visible: true,
  },
  {
    imageUrl: '/assets/products/cream-lace-crochet-dress/1.jpg',
    category: 'Patterns & Motifs',
    tags: ['heirloom', 'lace', 'floral-mesh'],
    caption: 'Heirloom Lace Mesh Motif',
    visible: true,
  },
  {
    imageUrl: '/assets/products/warm-brown-birthday-frock/1.jpg',
    category: 'Color Palettes',
    tags: ['warm brown', 'ivory', 'sash'],
    caption: 'Warm Brown & Ivory Palette',
    visible: true,
  },
  {
    imageUrl: '/assets/products/sand-blush-photoshoot-set/1.jpg',
    category: 'Color Palettes',
    tags: ['sand', 'blush', 'pastels'],
    caption: 'Sand & Blush Pastel Palette',
    visible: true,
  },
  {
    imageUrl: '/assets/products/oatmeal-sibling-matching-set/1.jpg',
    category: 'Finished Garments',
    tags: ['sibling', 'matching set', 'smock'],
    caption: 'Matching Sibling Co-ord',
    visible: true,
  },
];

async function seed() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected.');

    for (const cat of sampleCategories) {
      await Category.updateOne({ name: cat.name }, cat, { upsert: true });
    }
    console.log('[Seed] Categories seeded.');

    const count = await Image.countDocuments();
    if (count === 0) {
      await Image.insertMany(sampleImages);
      console.log('[Seed] Sample gallery images seeded.');
    } else {
      console.log(`[Seed] ${count} gallery images already exist.`);
    }

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
}

seed();
