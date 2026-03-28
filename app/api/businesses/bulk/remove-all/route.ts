import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Soft delete all CRM leads (move to recycle bin)
export async function POST() {
  try {
    await prisma.cRMStatus.deleteMany({
      where: { business: { isRejected: false, inQueue: false } },
    });

    const { count } = await prisma.business.updateMany({
      where: { isRejected: false, inQueue: false },
      data: { isRejected: true },
    });

    return NextResponse.json({ removed: count });
  } catch (error) {
    console.error('Remove all error:', error);
    return NextResponse.json({ error: 'Remove all failed' }, { status: 500 });
  }
}
