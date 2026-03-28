import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const { count } = await prisma.business.updateMany({
      where: { inQueue: true, isRejected: false },
      data: { isRejected: true, inQueue: false },
    });

    return NextResponse.json({ rejected: count });
  } catch (error) {
    console.error('Reject all error:', error);
    return NextResponse.json({ error: 'Reject all failed' }, { status: 500 });
  }
}
