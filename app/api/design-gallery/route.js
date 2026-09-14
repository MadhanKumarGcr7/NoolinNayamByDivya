/**
 * Public Customer Design Gallery API (MySQL / Prisma)
 * GET /api/design-gallery
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DEFAULT_CATEGORIES = [
  { name: 'Necklines', display_order: 1 },
  { name: 'Sleeves', display_order: 2 },
  { name: 'Patterns & Motifs', display_order: 3 },
  { name: 'Color Palettes', display_order: 4 },
  { name: 'Finished Garments', display_order: 5 },
  { name: 'Yarn Textures', display_order: 6 },
];

export async function GET() {
  try {
    let categories = await prisma.designGalleryCategory.findMany({
      orderBy: { display_order: 'asc' },
    });

    if (categories.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await prisma.designGalleryCategory.create({ data: cat });
      }
      categories = await prisma.designGalleryCategory.findMany({
        orderBy: { display_order: 'asc' },
      });
    }

    const rawImages = await prisma.designGalleryImage.findMany({
      where: { visible: true },
      include: { category: true },
      orderBy: { created_at: 'desc' },
    });

    const uploadedImages = rawImages.map(img => ({
      _id: String(img.id),
      id: String(img.id),
      category: img.category.name,
      categoryId: String(img.category_id),
      imageUrl: img.image_url,
      caption: img.caption || '',
      tags: Array.isArray(img.tags) ? img.tags : [],
      visible: img.visible,
      createdAt: img.created_at,
    }));

    // Fetch catalog products marked to display in Design Gallery
    const rawProducts = await prisma.product.findMany({
      where: {
        show_in_design_gallery: true,
        status: 'active',
      },
      include: {
        images: {
          orderBy: { display_order: 'asc' },
          take: 1,
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const productImages = rawProducts.map(p => ({
      _id: `prod_${p.id}`,
      id: `prod_${p.id}`,
      productId: p.id,
      isProduct: true,
      category: p.design_gallery_category || 'Finished Garments',
      imageUrl: p.images[0]?.url || '/placeholder.png',
      caption: p.name,
      tags: [p.name, p.design_gallery_category || 'Garment'],
      visible: true,
      createdAt: p.created_at,
    }));

    const allImages = [...uploadedImages, ...productImages];

    const categoryNames = Array.from(
      new Set([
        ...categories.map((c) => c.name),
        ...productImages.map((p) => p.category),
      ])
    ).filter(Boolean);

    return NextResponse.json({
      success: true,
      categories: categoryNames,
      images: allImages,
    });
  } catch (error) {
    console.error('[Public Gallery GET Error]:', error);
    return NextResponse.json({ message: 'Failed to load gallery.' }, { status: 500 });
  }
}
