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
      include: { crmStatus: true },
    });

    if (existing) {
      await prisma.business.update({
        where: { placeId },
        data: { isRejected: false, inQueue: false },
      });

      if (!existing.crmStatus) {
        await prisma.cRMStatus.create({
          data: { businessId: existing.id, status: 'PENDING' },
        });
      }

      return NextResponse.json({ business: existing });
    }

    const newBusiness = await prisma.business.create({
      data: {
        placeId: business.placeId,
        name: business.name,
        category: business.category,
        phone: business.phone,
        website: business.website,
        mapsUrl: business.mapsUrl,
        reviewCount: business.reviewCount || 0,
        isWeakWebsite: business.isWeakWebsite || false,
        isRejected: false,
        inQueue: false,
      },
    });

    await prisma.cRMStatus.create({
      data: { businessId: newBusiness.id, status: 'PENDING' },
    });

    return NextResponse.json({ business: newBusiness });
  } catch (error) {
    console.error('Approve error:', error);
    return NextResponse.json({ error: 'Approve failed' }, { status: 500 });
  }
}
