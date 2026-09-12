import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Filter from '@/models/Filter';
import { getAuthFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(request) {
  const auth = getAuthFromRequest(request, 'owner');
  if (!auth) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ message: 'Invalid payload, items array required' }, { status: 400 });
    }

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    if (bulkOps.length > 0) {
      await Filter.bulkWrite(bulkOps);
    }

    const updatedList = await Filter.find({}).sort({ order: 1 }).lean();

    return NextResponse.json({ success: true, filters: updatedList });
  } catch (error) {
    console.error('[API/Admin/Filters/Reorder PATCH Error]:', error);
    return NextResponse.json({ message: 'Server error reordering filters' }, { status: 500 });
  }
}
