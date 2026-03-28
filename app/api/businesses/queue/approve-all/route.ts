import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const queued = await prisma.business.findMany({
      where: { inQueue: true, isRejected: false },
      select: { id: true },
    });

    await prisma.business.updateMany({
      where: { inQueue: true, isRejected: false },
      data: { isRejected: false, inQueue: false },
    });

    const existingStatuses = new Set(
      (await prisma.cRMStatus.findMany({
        where: { businessId: { in: queued.map((b) => b.id) } },
        select: { businessId: true },
      })).map((s) => s.businessId)
    );

    const toCreate = queued
      .filter((b) => !existingStatuses.has(b.id))
      .map((b) => ({ businessId: b.id, status: 'PENDING' as const }));

    if (toCreate.length > 0) {
      await prisma.cRMStatus.createMany({ data: toCreate });
    }

    return NextResponse.json({ approved: queued.length });
  } catch (error) {
    console.error('Approve all error:', error);
    return NextResponse.json({ error: 'Approve all failed' }, { status: 500 });
  }
}
