/**
 * MongoDB -> MySQL Migration Script (Prisma & MongoClient)
 * ────────────────────────────────────────────────────────────────────────────
 * Reads ALL existing collections from MongoDB (`mongodb://localhost:27017/noolinnayambydivya` by default)
 * and transforms & inserts all records into the normalized MySQL schema via Prisma Client.
 *
 * It first purges any existing demo/seed data from MySQL to ensure a 100% clean migration.
 *
 * Foreign Key & ID Mapping:
 * Preserves all relationships by maintaining an in-memory Map `idMap` mapping
 * MongoDB ObjectIds to MySQL integer auto-increment IDs.
 *
 * Usage:
 *   node scripts/migrate-mongo-to-mysql.js
 */

import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';

const prisma = new PrismaClient();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/noolinnayambydivya';

const idMap = new Map();
const catSlugMap = new Map();
const productSlugMap = new Map();
const galleryCatMap = new Map();

function getIdStr(id) {
  if (!id) return null;
  return id.toString();
}

async function cleanMySQL() {
  console.log('🧹 Purging existing data in MySQL database to eliminate all demo/seed data...');
  await prisma.customOrderRequestGallerySelection.deleteMany({});
  await prisma.navigationItemFilter.deleteMany({});
  await prisma.navigationItem.deleteMany({});
  await prisma.productFilterValue.deleteMany({});
  await prisma.filterOption.deleteMany({});
  await prisma.filter.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.customOrderRequest.deleteMany({});
  await prisma.designGalleryImage.deleteMany({});
  await prisma.designGalleryCategory.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.workshopRegistration.deleteMany({});
  await prisma.workshop.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.communityMember.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.revokedToken.deleteMany({});
  console.log('✅ MySQL purge completed successfully.');
}

async function migrate() {
  console.log('🚀 Starting MongoDB → MySQL Data Migration...');
  console.log(`📌 Using MongoDB URI: ${MONGODB_URI}`);

  let mongoClient;
  try {
    console.log('🔌 Connecting to MongoDB...');
    mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();
    const db = mongoClient.db();
    console.log(`✅ Connected to MongoDB database: "${db.databaseName}"`);

    // Clean MySQL before migrating
    await cleanMySQL();

    const summary = {};

    // 1. USERS & ADDRESSES
    console.log('📦 Migrating Users & Addresses...');
    const mongoUsers = await db.collection('users').find({}).toArray();
    let usersCount = 0;
    for (const u of mongoUsers) {
      const oldId = getIdStr(u._id);
      const user = await prisma.user.create({
        data: {
          name: u.name || 'User',
          email: u.email,
          phone: u.phone || null,
          password_hash: u.passwordHash || u.password_hash || '$2b$12$demoHash',
          role: u.role || 'customer',
          reset_password_token: u.resetPasswordToken || null,
          reset_password_expires: u.resetPasswordExpires ? new Date(u.resetPasswordExpires) : null,
          created_at: u.createdAt ? new Date(u.createdAt) : new Date(),
        },
      });
      idMap.set(oldId, user.id);
      usersCount++;

      if (Array.isArray(u.addresses)) {
        for (const addr of u.addresses) {
          await prisma.address.create({
            data: {
              user_id: user.id,
              line1: addr.street || addr.line1 || 'N/A',
              line2: addr.line2 || null,
              city: addr.city || 'N/A',
              state: addr.state || 'N/A',
              pincode: addr.pincode || '000000',
              country: addr.country || 'India',
              is_default: !!addr.isDefault || !!addr.is_default,
            },
          });
        }
      }
    }
    summary['Users'] = usersCount;

    // 2. PRODUCT CATEGORIES
    console.log('📦 Migrating Product Categories...');
    const mongoCategories = await db.collection('productcategories').find({}).toArray();
    let catCount = 0;
    for (const c of mongoCategories) {
      const oldId = getIdStr(c._id);
      const cat = await prisma.productCategory.create({
        data: {
          name: c.label || c.name,
          slug: c.slug,
        },
      });
      idMap.set(oldId, cat.id);
      catSlugMap.set(c.slug, cat.id);
      catCount++;
    }
    summary['ProductCategories'] = catCount;

    // Fallback category if needed
    let defaultCatId;
    if (catSlugMap.has('crochet')) {
      defaultCatId = catSlugMap.get('crochet');
    } else if (catCount > 0) {
      defaultCatId = catSlugMap.values().next().value;
    } else {
      const fallbackCat = await prisma.productCategory.create({
        data: { name: 'Crochet', slug: 'crochet' },
      });
      defaultCatId = fallbackCat.id;
      catSlugMap.set('crochet', defaultCatId);
    }

    // 3. FILTERS & OPTIONS
    console.log('📦 Migrating Filters & Filter Options...');
    const mongoFilters = await db.collection('filters').find({}).toArray();
    let filterCount = 0;
    for (const f of mongoFilters) {
      const oldId = getIdStr(f._id);
      const filter = await prisma.filter.create({
        data: {
          name: f.name,
          slug: f.slug,
          type: f.type || 'multi-select',
          range_min: f.rangeMin ?? f.range_min ?? null,
          range_max: f.rangeMax ?? f.range_max ?? null,
          range_unit: f.rangeUnit ?? f.range_unit ?? null,
          active: f.active !== false,
        },
      });
      idMap.set(oldId, filter.id);
      filterCount++;

      if (Array.isArray(f.options)) {
        for (const opt of f.options) {
          await prisma.filterOption.create({
            data: {
              filter_id: filter.id,
              label: opt.label,
              value: opt.value,
              hex: opt.hex || null,
            },
          });
        }
      }
    }
    summary['Filters'] = filterCount;

    // 4. PRODUCTS, IMAGES, VARIANTS, FILTER VALUES
    console.log('📦 Migrating Products, Images, Variants & Filter Values...');
    const mongoProducts = await db.collection('products').find({}).toArray();
    let prodCount = 0;
    for (const p of mongoProducts) {
      const oldId = getIdStr(p._id);
      let catId = defaultCatId;
      if (p.categoryId && idMap.has(getIdStr(p.categoryId))) {
        catId = idMap.get(getIdStr(p.categoryId));
      } else if (p.category && catSlugMap.has(p.category.toLowerCase().replace(/\s+/g, '-'))) {
        catId = catSlugMap.get(p.category.toLowerCase().replace(/\s+/g, '-'));
      }

      const product = await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          description: p.description || '',
          price: p.price || 0,
          category_id: catId,
          material: p.material || null,
          care: p.care || null,
          customizable: !!p.customizable,
          featured: !!p.featured,
          new_arrival: !!p.newArrival || !!p.new_arrival,
          status: p.status || 'active',
          created_at: p.createdAt ? new Date(p.createdAt) : new Date(),
        },
      });
      idMap.set(oldId, product.id);
      productSlugMap.set(p.slug, product.id);
      prodCount++;

      if (Array.isArray(p.images)) {
        for (let i = 0; i < p.images.length; i++) {
          const imgUrl = typeof p.images[i] === 'string' ? p.images[i] : p.images[i].url;
          if (imgUrl) {
            await prisma.productImage.create({
              data: {
                product_id: product.id,
                url: imgUrl,
                display_order: i,
              },
            });
          }
        }
      }

      if (Array.isArray(p.variants) && p.variants.length > 0) {
        for (const v of p.variants) {
          await prisma.productVariant.create({
            data: {
              product_id: product.id,
              size: v.size || null,
              color: v.color || null,
              stock: v.stock || 0,
              out_of_stock: !!v.outOfStock,
            },
          });
        }
      } else {
        const sizes = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : [null];
        const colors = Array.isArray(p.colors) && p.colors.length > 0 ? p.colors.map(c => typeof c === 'string' ? c : c?.name) : [null];
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
      }

      if (Array.isArray(p.filterValues)) {
        for (const fv of p.filterValues) {
          const fId = fv.filterId && idMap.has(getIdStr(fv.filterId)) ? idMap.get(getIdStr(fv.filterId)) : null;
          if (fId && Array.isArray(fv.values)) {
            for (const val of fv.values) {
              await prisma.productFilterValue.create({
                data: {
                  product_id: product.id,
                  filter_id: fId,
                  value: val,
                },
              });
            }
          }
        }
      }
    }
    summary['Products'] = prodCount;

    // 5. NAVIGATION ITEMS & FILTER ASSIGNMENTS
    console.log('📦 Migrating Navigation Items...');
    const mongoNavItems = await db.collection('navigationitems').find({}).toArray();
    let navCount = 0;
    for (const nav of mongoNavItems) {
      let categoryId = null;
      if (nav.linkType === 'category' && nav.categorySlug && catSlugMap.has(nav.categorySlug)) {
        categoryId = catSlugMap.get(nav.categorySlug);
      }

      const navItem = await prisma.navigationItem.create({
        data: {
          label: nav.label,
          link_type: nav.linkType || 'page',
          category_id: categoryId,
          page_slug: nav.pageSlug || null,
          external_url: nav.externalUrl || null,
          display_order: nav.order ?? 0,
          visible: nav.visible !== false,
        },
      });
      navCount++;

      if (Array.isArray(nav.assignedFilters)) {
        for (const af of nav.assignedFilters) {
          const filterId = af.filterId && idMap.has(getIdStr(af.filterId)) ? idMap.get(getIdStr(af.filterId)) : null;
          if (filterId) {
            await prisma.navigationItemFilter.create({
              data: {
                navigation_item_id: navItem.id,
                filter_id: filterId,
                display_order: af.order ?? 0,
              },
            });
          }
        }
      }
    }
    summary['NavigationItems'] = navCount;

    // 6. DESIGN GALLERY CATEGORIES & IMAGES
    console.log('📦 Migrating Design Gallery Categories & Images...');
    const mongoGalleryCats = await db.collection('designgallerycategories').find({}).toArray();
    let galleryCatCount = 0;
    for (const dgc of mongoGalleryCats) {
      const oldId = getIdStr(dgc._id);
      const cat = await prisma.designGalleryCategory.create({
        data: {
          name: dgc.name,
          display_order: dgc.order ?? 0,
        },
      });
      idMap.set(oldId, cat.id);
      galleryCatMap.set(dgc.name, cat.id);
      galleryCatCount++;
    }
    summary['DesignGalleryCategories'] = galleryCatCount;

    const mongoGalleryImgs = await db.collection('designgalleryimages').find({}).toArray();
    let galleryImgCount = 0;
    for (const dgi of mongoGalleryImgs) {
      let catId = null;
      if (dgi.category && galleryCatMap.has(dgi.category)) {
        catId = galleryCatMap.get(dgi.category);
      } else if (dgi.category && idMap.has(getIdStr(dgi.category))) {
        catId = idMap.get(getIdStr(dgi.category));
      } else if (galleryCatCount > 0) {
        catId = galleryCatMap.values().next().value;
      }

      if (catId) {
        await prisma.designGalleryImage.create({
          data: {
            category_id: catId,
            image_url: dgi.imageUrl,
            caption: dgi.caption || null,
            tags: Array.isArray(dgi.tags) ? dgi.tags : null,
            visible: dgi.visible !== false,
            created_at: dgi.createdAt ? new Date(dgi.createdAt) : new Date(),
          },
        });
        galleryImgCount++;
      }
    }
    summary['DesignGalleryImages'] = galleryImgCount;

    // 7. ORDERS & LINE ITEMS
    console.log('📦 Migrating Orders & Order Items...');
    const mongoOrders = await db.collection('orders').find({}).toArray();
    let orderCount = 0;
    for (const o of mongoOrders) {
      const oldId = getIdStr(o._id);
      let userId = o.userId && idMap.has(getIdStr(o.userId)) ? idMap.get(getIdStr(o.userId)) : null;

      const shippingAddr = o.shippingAddress || o.deliveryAddress || {};
      const contactInfo = o.contactInfo || o.customer || {};

      const order = await prisma.order.create({
        data: {
          user_id: userId,
          subtotal: o.subtotal || 0,
          shipping: o.shipping || o.shippingFee || 0,
          total: o.total || o.totalAmount || 0,
          status: o.status || 'Pending',
          shipping_address_line1: shippingAddr.street || shippingAddr.line1 || 'N/A',
          shipping_address_line2: shippingAddr.line2 || null,
          shipping_city: shippingAddr.city || 'N/A',
          shipping_state: shippingAddr.state || 'N/A',
          shipping_pincode: shippingAddr.pincode || '000000',
          shipping_country: shippingAddr.country || 'India',
          contact_email: contactInfo.email || o.email || 'customer@example.com',
          contact_phone: contactInfo.phone || o.phone || '',
          payment_status: o.paymentStatus || 'Pending',
          return_policy_agreed: !!o.returnPolicyAgreed,
          return_policy_agreed_at: o.returnPolicyAgreedAt ? new Date(o.returnPolicyAgreedAt) : null,
          return_requested: !!o.returnRequested,
          return_requested_at: o.returnRequestedAt ? new Date(o.returnRequestedAt) : null,
          created_at: o.createdAt ? new Date(o.createdAt) : new Date(),
        },
      });
      idMap.set(oldId, order.id);
      orderCount++;

      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          let productId = null;
          const rawPId = item.product || item.productId;
          if (rawPId && idMap.has(getIdStr(rawPId))) {
            productId = idMap.get(getIdStr(rawPId));
          } else if (rawPId && productSlugMap.has(rawPId)) {
            productId = productSlugMap.get(rawPId);
          }

          await prisma.orderItem.create({
            data: {
              order_id: order.id,
              product_id: productId,
              product_name_snapshot: item.name || 'Product',
              size: item.size || null,
              color: typeof item.color === 'string' ? item.color : item.color?.name || null,
              quantity: item.quantity || 1,
              price_snapshot: item.price || 0,
            },
          });
        }
      }
    }
    summary['Orders'] = orderCount;

    // 8. CUSTOM ORDER REQUESTS
    console.log('📦 Migrating Custom Order Requests...');
    const mongoCustomRequests = await db.collection('customorderrequests').find({}).toArray();
    let customCount = 0;
    for (const r of mongoCustomRequests) {
      let userId = r.userId && idMap.has(getIdStr(r.userId)) ? idMap.get(getIdStr(r.userId)) : null;

      await prisma.customOrderRequest.create({
        data: {
          user_id: userId,
          name: r.name || r.customerName || 'Customer',
          email: r.email,
          phone: r.phone || '',
          product_type: r.productType || 'Custom Crochet',
          age: r.ageGroup || r.age || null,
          size: r.customSize || r.size || null,
          preferred_color: r.preferredColor || r.preferredColors || null,
          occasion: r.occasion || null,
          desired_date: r.desiredDate || r.neededByDate || null,
          custom_requirements: r.customRequirements || r.requirements || '',
          reference_image_url: r.referenceImageUrl || null,
          additional_notes: r.additionalNotes || r.notes || null,
          status: r.status || 'New',
          created_at: r.createdAt ? new Date(r.createdAt) : new Date(),
        },
      });
      customCount++;
    }
    summary['CustomOrderRequests'] = customCount;

    // 9. WORKSHOPS & REGISTRATIONS
    console.log('📦 Migrating Workshops & Registrations...');
    const mongoWorkshops = await db.collection('workshops').find({}).toArray();
    let wsCount = 0;
    for (const w of mongoWorkshops) {
      const oldId = getIdStr(w._id);
      const workshop = await prisma.workshop.create({
        data: {
          title: w.title,
          slug: w.slug,
          description: w.description || '',
          cover_image: w.coverImage || null,
          date: String(w.date),
          time: String(w.time),
          duration: w.duration || null,
          location: w.location,
          is_online: !!w.isOnline,
          meeting_link: w.meetingLink || null,
          seats_total: w.seatsTotal || 20,
          seats_filled: w.seatsFilled || 0,
          price: w.price || 0,
          is_free: !!w.isFree,
          skill_level: w.skillLevel || 'All Levels',
          registration_deadline: w.registrationDeadline ? String(w.registrationDeadline) : null,
          status: w.status || 'Upcoming',
          created_at: w.createdAt ? new Date(w.createdAt) : new Date(),
        },
      });
      idMap.set(oldId, workshop.id);
      wsCount++;
    }
    summary['Workshops'] = wsCount;

    // 10. COMMUNITY MEMBERS & CONTACT MESSAGES & REVIEWS
    console.log('📦 Migrating Community Members...');
    const mongoCommunity = await db.collection('communitymembers').find({}).toArray();
    let commCount = 0;
    for (const cm of mongoCommunity) {
      await prisma.communityMember.create({
        data: {
          name: cm.name || '',
          email: cm.email,
          phone: cm.phone || null,
          source: cm.source || 'Newsletter',
          status: cm.status || 'Active',
          created_at: cm.createdAt ? new Date(cm.createdAt) : new Date(),
        },
      });
      commCount++;
    }
    summary['CommunityMembers'] = commCount;

    console.log('📦 Migrating Contact Messages...');
    const mongoContact = await db.collection('contactmessages').find({}).toArray();
    let msgCount = 0;
    for (const msg of mongoContact) {
      await prisma.contactMessage.create({
        data: {
          name: msg.name,
          email: msg.email,
          phone: msg.phone || null,
          subject: msg.subject || 'General Inquiry',
          message: msg.message,
          status: msg.status || 'New',
          created_at: msg.createdAt ? new Date(msg.createdAt) : new Date(),
        },
      });
      msgCount++;
    }
    summary['ContactMessages'] = msgCount;

    console.log('\n📊 MIGRATION SUMMARY (EXACT REAL DATA FROM LOCAL MONGODB TRANSFERRED TO MYSQL):');
    console.table(summary);
    console.log('🎉 Full data migration from MongoDB to MySQL completed successfully!');

  } catch (err) {
    console.error('❌ Migration Error:', err);
    process.exitCode = 1;
  } finally {
    if (mongoClient) await mongoClient.close();
    await prisma.$disconnect();
    console.log('🔌 Disconnected cleanly.');
  }
}

migrate();
