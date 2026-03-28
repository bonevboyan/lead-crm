import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { placeId, business } = await request.json();

    if (!placeId || !business?.name) {
      return NextResponse.json({ error: 'placeId and business data required' }, { status: 400 });
    }

    const existing = await prisma.business.findUnique({
      where: { placeId },
    });

    if (existing) {
      await prisma.business.update({
        where: { placeId },
        data: { isRejected: true, inQueue: false },
      });
    } else {
      await prisma.business.create({
        data: {
          placeId,
          name: business.name,
          category: business.category,
          phone: business.phone || null,
          website: business.website || null,
          mapsUrl: business.mapsUrl,
          reviewCount: business.reviewCount || 0,
          isWeakWebsite: business.isWeakWebsite || false,
          isRejected: true,
          inQueue: false,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reject error:', error);
    return NextResponse.json({ error: 'Reject failed' }, { status: 500 });
  }
}
