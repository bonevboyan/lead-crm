import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Permanently delete all trashed leads
export async function POST() {
  try {
    await prisma.cRMStatus.deleteMany({
      where: { business: { isRejected: true } },
    });

    const { count } = await prisma.business.deleteMany({
      where: { isRejected: true, inQueue: false },
    });

    return NextResponse.json({ deleted: count });
  } catch (error) {
    console.error('Empty trash error:', error);
    return NextResponse.json({ error: 'Empty trash failed' }, { status: 500 });
  }
}
