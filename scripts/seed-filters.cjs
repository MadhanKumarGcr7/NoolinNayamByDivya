/**
 * Seed Script: Configurable Shop Filters
 * ────────────────────────────────────────────────────────────────────────────
 * Seeds default filters (Size, Color, Age Group, Occasion, Material) and links
 * them with category navigation items and existing products in MongoDB.
 * Run with: node scripts/seed-filters.cjs
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

const FilterOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    hex:   { type: String, trim: true, default: '' },
  },
  { _id: true }
);

const FilterSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    slug:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    type:      { type: String, required: true },
    options:   [FilterOptionSchema],
    rangeMin:  { type: Number, default: 0 },
    rangeMax:  { type: Number, default: 10000 },
    rangeUnit: { type: String, default: '₹' },
    rangeStep: { type: Number, default: 100 },
    active:    { type: Boolean, default: true },
    order:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

const AssignedFilterSchema = new mongoose.Schema(
  {
    filterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Filter', required: true },
    order:    { type: Number, default: 0 },
  },
  { _id: false }
);

const NavigationItemSchema = new mongoose.Schema(
  {
    label:           { type: String, required: true },
    linkType:        { type: String, required: true },
    categorySlug:    { type: String, default: '' },
    pageSlug:        { type: String, default: '' },
    externalUrl:     { type: String, default: '' },
    order:           { type: Number, default: 0 },
    visible:         { type: Boolean, default: true },
    isFixed:         { type: Boolean, default: false },
    assignedFilters: [AssignedFilterSchema],
  },
  { timestamps: true }
);

const FilterValueSchema = new mongoose.Schema(
  {
    filterId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Filter', required: true },
    filterSlug: { type: String, required: true },
    values:     [{ type: String }],
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    category:     { type: String, required: true },
    filterValues: [FilterValueSchema],
  },
  { strict: false }
);

const Filter = mongoose.models.Filter || mongoose.model('Filter', FilterSchema);
const NavigationItem = mongoose.models.NavigationItem || mongoose.model('NavigationItem', NavigationItemSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const sampleFilters = [
  {
    name: 'Size',
    slug: 'size',
    type: 'multi-select',
    order: 0,
    active: true,
    options: [
      { label: '1Y', value: '1Y' },
      { label: '2Y', value: '2Y' },
      { label: '3Y', value: '3Y' },
      { label: '4Y', value: '4Y' },
      { label: '5Y', value: '5Y' },
      { label: '6Y', value: '6Y' },
      { label: '7Y', value: '7Y' },
      { label: '8Y', value: '8Y' },
    ],
  },
  {
    name: 'Color Tone',
    slug: 'color',
    type: 'color-swatch',
    order: 1,
    active: true,
    options: [
      { label: 'Ivory', value: 'Ivory', hex: '#FAF7F2' },
      { label: 'Cream', value: 'Cream', hex: '#F5EFE4' },
      { label: 'Oatmeal', value: 'Oatmeal', hex: '#E8DDD0' },
      { label: 'Sand', value: 'Sand', hex: '#D4C4B0' },
      { label: 'Blush', value: 'Blush', hex: '#E8C4B8' },
      { label: 'Sage', value: 'Sage', hex: '#B8C4B0' },
      { label: 'Warm Brown', value: 'Warm Brown', hex: '#6B4F3A' },
    ],
  },
  {
    name: 'Age Group',
    slug: 'age-group',
    type: 'multi-select',
    order: 2,
    active: true,
    options: [
      { label: 'Toddler (1-3Y)', value: 'Toddler (1-3Y)' },
      { label: 'Little Kids (4-6Y)', value: 'Little Kids (4-6Y)' },
      { label: 'Big Kids (7-8Y)', value: 'Big Kids (7-8Y)' },
    ],
  },
  {
    name: 'Occasion',
    slug: 'occasion',
    type: 'multi-select',
    order: 3,
    active: true,
    options: [
      { label: 'Birthday', value: 'Birthday' },
      { label: 'Festive', value: 'Festive' },
      { label: 'Everyday', value: 'Everyday' },
      { label: 'Photoshoot', value: 'Photoshoot' },
    ],
  },
  {
    name: 'Material',
    slug: 'material',
    type: 'single-select',
    order: 4,
    active: true,
    options: [
      { label: '100% Organic Cotton Yarn', value: '100% Organic Cotton Yarn' },
      { label: 'Bamboo Cotton Blend', value: 'Bamboo Cotton Blend' },
      { label: 'Soft Linen Yarn', value: 'Soft Linen Yarn' },
    ],
  },
];

async function seed() {
  try {
    console.log('[Seed Filters] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed Filters] Connected.');

    const createdFilters = [];
    for (const f of sampleFilters) {
      const updated = await Filter.findOneAndUpdate({ slug: f.slug }, f, {
        upsert: true,
        new: true,
      });
      createdFilters.push(updated);
    }
    console.log('[Seed Filters] Filters created/updated.');

    // Map filter slugs to IDs
    const filterMap = {};
    createdFilters.forEach((f) => {
      filterMap[f.slug] = f._id;
    });

    // Assign filters to Kidswear category nav item
    const kidswearNav = await NavigationItem.findOne({ categorySlug: 'kidswear' });
    if (kidswearNav) {
      const assigned = [
        { filterId: filterMap['size'], order: 0 },
        { filterId: filterMap['color'], order: 1 },
        { filterId: filterMap['age-group'], order: 2 },
        { filterId: filterMap['occasion'], order: 3 },
      ];
      await NavigationItem.updateOne({ _id: kidswearNav._id }, { assignedFilters: assigned });
      console.log('[Seed Filters] Assigned filters to Kidswear nav item.');
    }

    // Assign filters to Crochet category nav item
    const crochetNav = await NavigationItem.findOne({ categorySlug: 'crochet' });
    if (crochetNav) {
      const assigned = [
        { filterId: filterMap['size'], order: 0 },
        { filterId: filterMap['color'], order: 1 },
        { filterId: filterMap['material'], order: 2 },
        { filterId: filterMap['occasion'], order: 3 },
      ];
      await NavigationItem.updateOne({ _id: crochetNav._id }, { assignedFilters: assigned });
      console.log('[Seed Filters] Assigned filters to Crochet nav item.');
    }

    // Seed sample filterValues on existing products
    const products = await Product.find({ status: { $ne: 'deleted' } });
    for (const p of products) {
      const fVals = [
        {
          filterId: filterMap['occasion'],
          filterSlug: 'occasion',
          values: p.category === 'kidswear' ? ['Birthday', 'Festive'] : ['Everyday', 'Photoshoot'],
        },
        {
          filterId: filterMap['age-group'],
          filterSlug: 'age-group',
          values: ['Toddler (1-3Y)', 'Little Kids (4-6Y)'],
        },
      ];
      await Product.updateOne({ _id: p._id }, { filterValues: fVals });
    }
    console.log(`[Seed Filters] Seeded filterValues on ${products.length} products.`);

    process.exit(0);
  } catch (err) {
    console.error('[Seed Filters Error]:', err);
    process.exit(1);
  }
}

seed();
