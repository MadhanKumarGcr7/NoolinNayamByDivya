/**
 * Public Customer Design Gallery API
 * GET /api/design-gallery — Returns visible design gallery images & categories for custom order form
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import DesignGalleryImage from '@/models/DesignGalleryImage';
import DesignGalleryCategory from '@/models/DesignGalleryCategory';

export const dynamic = 'force-dynamic';

const DEFAULT_CATEGORIES = [
  { name: 'Necklines', order: 1 },
  { name: 'Sleeves', order: 2 },
  { name: 'Patterns & Motifs', order: 3 },
  { name: 'Color Palettes', order: 4 },
  { name: 'Finished Garments', order: 5 },
  { name: 'Yarn Textures', order: 6 },
];

export async function GET() {
  try {
    await connectDB();

    let categories = await DesignGalleryCategory.find().sort({ order: 1, createdAt: 1 });

    if (categories.length === 0) {
      try {
        await DesignGalleryCategory.insertMany(DEFAULT_CATEGORIES);
        categories = await DesignGalleryCategory.find().sort({ order: 1, createdAt: 1 });
      } catch {
        categories = await DesignGalleryCategory.find().sort({ order: 1, createdAt: 1 });
      }
    }

    const images = await DesignGalleryImage.find({ visible: true }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      categories: categories.map((c) => c.name),
      images,
    });
  } catch (error) {
    console.error('[Public Gallery GET Error]:', error);
    return NextResponse.json({ message: 'Failed to load gallery.' }, { status: 500 });
  }
}
