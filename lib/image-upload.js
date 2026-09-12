/**
 * Image Upload Helper & Integration Point
 * ────────────────────────────────────────────────────────────────────────────
 * Local storage handler for product, workshop, and gallery image uploads.
 */

import path from 'path';
import fs from 'fs/promises';

const PRODUCT_UPLOAD_DIR = path.join(process.cwd(), 'public', 'assets', 'uploads', 'products');
const WORKSHOP_UPLOAD_DIR = path.join(process.cwd(), 'public', 'assets', 'uploads', 'workshops');
const GALLERY_UPLOAD_DIR = path.join(process.cwd(), 'public', 'assets', 'uploads', 'gallery');

async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error('[Upload] Error creating upload directory:', dirPath, error);
  }
}

/**
 * Saves a Product File buffer to local disk
 * @param {File} file
 * @returns {Promise<string>} Public relative URL path
 */
export async function saveProductImage(file) {
  await ensureDir(PRODUCT_UPLOAD_DIR);
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
  const filename = `${Date.now()}-${safeName}`;
  const filepath = path.join(PRODUCT_UPLOAD_DIR, filename);

  await fs.writeFile(filepath, buffer);
  return `/assets/uploads/products/${filename}`;
}

/**
 * Saves a Workshop File buffer to local disk
 * @param {File} file
 * @returns {Promise<string>} Public relative URL path
 */
export async function saveWorkshopImage(file) {
  await ensureDir(WORKSHOP_UPLOAD_DIR);
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
  const filename = `${Date.now()}-${safeName}`;
  const filepath = path.join(WORKSHOP_UPLOAD_DIR, filename);

  await fs.writeFile(filepath, buffer);
  return `/assets/uploads/workshops/${filename}`;
}

/**
 * Saves a Gallery Design Inspiration image file buffer to local disk
 * @param {File} file
 * @returns {Promise<string>} Public relative URL path
 */
export async function saveGalleryImage(file) {
  await ensureDir(GALLERY_UPLOAD_DIR);
  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
  const filename = `${Date.now()}-${safeName}`;
  const filepath = path.join(GALLERY_UPLOAD_DIR, filename);

  await fs.writeFile(filepath, buffer);
  return `/assets/uploads/gallery/${filename}`;
}

export default saveProductImage;
