import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import prisma from '../lib/prisma.js';

async function generateFullSqlDump() {
  console.log('Generating database schema DDL...');
  const ddlSql = execSync(
    'npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script',
    { encoding: 'utf-8' }
  );

  let fullSql = `-- Noolin Nayam by Divya - Complete Database Export
-- Generated: ${new Date().toISOString()}

SET FOREIGN_KEY_CHECKS = 0;

${ddlSql}

SET FOREIGN_KEY_CHECKS = 1;
`;

  const dumper = [];

  function formatVal(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    if (typeof val === 'boolean') return val ? 1 : 0;
    if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
    if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
    return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
  }

  async function exportTable(tableName, queryFn) {
    try {
      const rows = await queryFn();
      if (!rows || rows.length === 0) return;

      dumper.push(`\n-- Data for table \`${tableName}\``);
      for (const row of rows) {
        const keys = Object.keys(row);
        const colNames = keys.map((k) => `\`${k}\``).join(', ');
        const colValues = keys.map((k) => formatVal(row[k])).join(', ');
        dumper.push(`INSERT INTO \`${tableName}\` (${colNames}) VALUES (${colValues});`);
      }
    } catch (err) {
      console.warn(`Could not export table ${tableName}:`, err.message);
    }
  }

  await exportTable('users', () => prisma.user.findMany());
  await exportTable('addresses', () => prisma.address.findMany());
  await exportTable('product_categories', () => prisma.productCategory.findMany());
  await exportTable('products', () => prisma.product.findMany());
  await exportTable('product_images', () => prisma.productImage.findMany());
  await exportTable('product_variants', () => prisma.productVariant.findMany());
  await exportTable('filters', () => prisma.filter.findMany());
  await exportTable('filter_options', () => prisma.filterOption.findMany());
  await exportTable('product_filter_values', () => prisma.productFilterValue.findMany());
  await exportTable('navigation_items', () => prisma.navigationItem.findMany());
  await exportTable('navigation_item_filters', () => prisma.navigationItemFilter.findMany());
  await exportTable('design_gallery_categories', () => prisma.designGalleryCategory.findMany());
  await exportTable('design_gallery_images', () => prisma.designGalleryImage.findMany());
  await exportTable('workshops', () => prisma.workshop.findMany());
  await exportTable('workshop_registrations', () => prisma.workshopRegistration.findMany());
  await exportTable('community_members', () => prisma.communityMember.findMany());
  await exportTable('contact_messages', () => prisma.contactMessage.findMany());
  await exportTable('reviews', () => prisma.review.findMany());
  await exportTable('coupons', () => prisma.coupon.findMany());
  await exportTable('orders', () => prisma.order.findMany());
  await exportTable('order_items', () => prisma.orderItem.findMany());
  await exportTable('custom_order_requests', () => prisma.customOrderRequest.findMany());
  await exportTable('custom_order_request_gallery_selections', () => prisma.customOrderRequestGallerySelection.findMany());

  fullSql += '\n-- ─────────────────────────────────────────────────────────────\n';
  fullSql += '-- SEED DATA INSERTS\n';
  fullSql += '-- ─────────────────────────────────────────────────────────────\n';
  fullSql += 'SET FOREIGN_KEY_CHECKS = 0;\n';
  fullSql += dumper.join('\n');
  fullSql += '\nSET FOREIGN_KEY_CHECKS = 1;\n';

  const outputPath = path.join(process.cwd(), 'noolinnayam_database.sql');
  fs.writeFileSync(outputPath, fullSql, 'utf-8');
  console.log(`✅ Successfully exported complete SQL dump to: ${outputPath}`);
}

generateFullSqlDump()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Export failed:', err);
    process.exit(1);
  });
