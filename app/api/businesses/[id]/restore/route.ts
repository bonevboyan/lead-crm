import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.business.update({
      where: { id: params.id },
      data: { isRejected: false, inQueue: false },
    });

    const existing = await prisma.cRMStatus.findUnique({
      where: { businessId: params.id },
    });

    if (!existing) {
      await prisma.cRMStatus.create({
        data: { businessId: params.id, status: 'PENDING' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Restore error:', error);
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
  }
}
