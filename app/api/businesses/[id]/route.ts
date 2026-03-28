import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Soft delete (move to recycle bin)
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.cRMStatus.deleteMany({
      where: { businessId: params.id },
    });

    await prisma.business.update({
      where: { id: params.id },
      data: { isRejected: true, inQueue: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

// Update status / notes
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status, notes } = await request.json();

    const updated = await prisma.cRMStatus.update({
      where: { businessId: params.id },
      data: { status, notes },
    });

    return NextResponse.json({ status: updated });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
