import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      where: {
        isRejected: false,
      },
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
      // Check if business already exists
      const existing = await prisma.business.findUnique({
        where: { placeId },
      });
      
      if (existing) {
        // Update if it was rejected before
        if (existing.isRejected) {
          await prisma.business.update({
            where: { placeId },
            data: { isRejected: false },
          });
        }
        return NextResponse.json({ business: existing });
      }
      
      // Create new business
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
        },
      });
      
      // Create CRM status
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
          data: { isRejected: true },
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
          },
        });
      }
      
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