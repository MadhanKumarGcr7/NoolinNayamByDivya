/**
 * Seed Demo Data Script (MySQL / Prisma)
 * ────────────────────────────────────────────────────────────────────────────
 * Seeds sample categories, products, filters, navigation, customers, orders,
 * workshops, and custom requests into MySQL database.
 *
 * Usage: npm run seed:data
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedProducts, seedCategories } from '../lib/seed-data.js';

const prisma = new PrismaClient();

async function seedDemoData() {
  try {
    console.log('🔄 Seeding demo data into MySQL via Prisma...');

    // 1. SEED CATEGORIES
    console.log('\n📦 Seeding categories...');
    const catIdMap = {};
    for (const cat of seedCategories) {
      if (cat.slug === 'all') continue;
      const created = await prisma.productCategory.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name },
        create: { name: cat.name, slug: cat.slug },
      });
      catIdMap[cat.slug] = created.id;
      console.log(`   ✅ Category: ${created.name}`);
    }

    const defaultCat = await prisma.productCategory.upsert({
      where: { slug: 'crochet' },
      update: {},
      create: { name: 'Crochet', slug: 'crochet' },
    });

    // 2. SEED PRODUCTS
    console.log('\n📦 Seeding products...');
    for (const p of seedProducts) {
      const categoryId = catIdMap[p.category] || defaultCat.id;

      const product = await prisma.product.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          description: p.description,
          price: p.price,
          category_id: categoryId,
          material: p.material || null,
          care: p.care || null,
          customizable: !!p.customizable,
          featured: !!p.featured,
          new_arrival: !!p.newArrival,
          status: 'active',
        },
        create: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          category_id: categoryId,
          material: p.material || null,
          care: p.care || null,
          customizable: !!p.customizable,
          featured: !!p.featured,
          new_arrival: !!p.newArrival,
          status: 'active',
        },
      });

      // Images
      await prisma.productImage.deleteMany({ where: { product_id: product.id } });
      for (let i = 0; i < p.images.length; i++) {
        await prisma.productImage.create({
          data: {
            product_id: product.id,
            url: p.images[i],
            display_order: i,
          },
        });
      }

      // Variants
      await prisma.productVariant.deleteMany({ where: { product_id: product.id } });
      const sizes = p.sizes || ['Standard'];
      const colors = (p.colors || [{ name: 'Default' }]).map(c => c.name);

      for (const size of sizes) {
        for (const color of colors) {
          await prisma.productVariant.create({
            data: {
              product_id: product.id,
              size,
              color,
              stock: p.stock || 10,
              out_of_stock: (p.stock || 10) === 0,
            },
          });
        }
      }

      console.log(`   ✅ Product: ${product.name}`);
    }

    // 3. SEED DEMO CUSTOMERS & ORDERS
    console.log('\n📦 Seeding demo customers & orders...');
    const password_hash = await bcrypt.hash('demo1234', 12);
    const demoCustomers = [
      { name: 'Priya Sharma [DEMO]', email: 'priya.demo@example.com', phone: '+91 98765 43210' },
      { name: 'Anita Menon [DEMO]', email: 'anita.demo@example.com', phone: '+91 87654 32109' },
    ];

    const customerIds = [];
    for (const cust of demoCustomers) {
      const user = await prisma.user.upsert({
        where: { email: cust.email },
        update: { name: cust.name, phone: cust.phone, password_hash, role: 'customer' },
        create: { name: cust.name, email: cust.email, phone: cust.phone, password_hash, role: 'customer' },
      });
      customerIds.push(user.id);
    }

    const firstProduct = await prisma.product.findFirst();
    if (firstProduct) {
      await prisma.order.create({
        data: {
          user_id: customerIds[0],
          subtotal: firstProduct.price,
          shipping: 0,
          total: firstProduct.price,
          status: 'Delivered',
          shipping_address_line1: '123 Demo Street',
          shipping_city: 'Chennai',
          shipping_state: 'Tamil Nadu',
          shipping_pincode: '600001',
          contact_email: 'priya.demo@example.com',
          contact_phone: '+91 98765 43210',
          payment_status: 'Paid',
          items: {
            create: [
              {
                product_id: firstProduct.id,
                product_name_snapshot: firstProduct.name,
                size: '1Y',
                color: 'Ivory',
                quantity: 1,
                price_snapshot: firstProduct.price,
              },
            ],
          },
        },
      });
      console.log('   ✅ Demo order created');
    }

    console.log('\n✅ Demo data seeded successfully into MySQL!');

  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDemoData();
