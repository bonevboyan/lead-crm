import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queue = searchParams.get('queue') === 'true';

    const rejected = searchParams.get('rejected') === 'true';

    const businesses = await prisma.business.findMany({
      where: queue
        ? { inQueue: true, isRejected: false }
        : rejected
          ? { isRejected: true, inQueue: false }
          : { isRejected: false, inQueue: false },
      include: {
        crmStatus: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { businessId } = await request.json();

    if (!businessId) {
      return NextResponse.json({ error: 'businessId required' }, { status: 400 });
    }

    // Soft delete: mark as rejected and remove CRM status
    await prisma.cRMStatus.deleteMany({
      where: { businessId },
    });

    await prisma.business.update({
      where: { id: businessId },
      data: { isRejected: true, inQueue: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, placeId, business, status, notes, businessId } = body;
    
    // Validate required fields
    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 });
    }
    
    if (action === 'approve' || action === 'reject') {
      if (!placeId) {
        return NextResponse.json({ error: 'placeId required' }, { status: 400 });
      }
      if (!business || !business.name) {
        return NextResponse.json({ error: 'Business data required' }, { status: 400 });
      }
    }
    
    if (action === 'approve') {
      const existing = await prisma.business.findUnique({
        where: { placeId },
        include: { crmStatus: true },
      });

      if (existing) {
        // Move out of queue and un-reject
        await prisma.business.update({
          where: { placeId },
          data: { isRejected: false, inQueue: false },
        });

        // Create CRM status if it doesn't exist yet
        if (!existing.crmStatus) {
          await prisma.cRMStatus.create({
            data: {
              businessId: existing.id,
              status: 'PENDING',
            },
          });
        }

        return NextResponse.json({ business: existing });
      }

      // Create new business (shouldn't happen with queue flow, but just in case)
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
        data: {
          businessId: newBusiness.id,
          status: 'PENDING',
        },
      });

      return NextResponse.json({ business: newBusiness });
    }
    
    if (action === 'reject') {
      // Mark as rejected (upsert if doesn't exist)
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
    }
    
    if (action === 'reject-all') {
      const { count } = await prisma.business.updateMany({
        where: { inQueue: true, isRejected: false },
        data: { isRejected: true, inQueue: false },
      });

      return NextResponse.json({ rejected: count });
    }

    if (action === 'restore') {
      if (!businessId) {
        return NextResponse.json({ error: 'businessId required' }, { status: 400 });
      }

      await prisma.business.update({
        where: { id: businessId },
        data: { isRejected: false, inQueue: false },
      });

      // Create CRM status if missing
      const existing = await prisma.cRMStatus.findUnique({
        where: { businessId },
      });
      if (!existing) {
        await prisma.cRMStatus.create({
          data: { businessId, status: 'PENDING' },
        });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'permanent-delete') {
      if (!businessId) {
        return NextResponse.json({ error: 'businessId required' }, { status: 400 });
      }

      await prisma.business.delete({
        where: { id: businessId },
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'update-status') {
      if (!businessId) {
        return NextResponse.json({ error: 'businessId required' }, { status: 400 });
      }
      
      const updated = await prisma.cRMStatus.update({
        where: { businessId },
        data: {
          status,
          notes,
        },
      });
      
      return NextResponse.json({ status: updated });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Business action error:', error);
    return NextResponse.json(
      { error: 'Action failed' },
      { status: 500 }
    );
  }
}