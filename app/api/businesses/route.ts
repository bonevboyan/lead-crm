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
      include: { crmStatus: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
  }
}
