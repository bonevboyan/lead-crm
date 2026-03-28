import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Restore all trashed leads back to CRM
export async function POST() {
  try {
    const rejected = await prisma.business.findMany({
      where: { isRejected: true, inQueue: false },
      select: { id: true },
    });

    await prisma.business.updateMany({
      where: { isRejected: true, inQueue: false },
      data: { isRejected: false },
    });

    const existingStatuses = new Set(
      (await prisma.cRMStatus.findMany({
        where: { businessId: { in: rejected.map((b) => b.id) } },
        select: { businessId: true },
      })).map((s) => s.businessId)
    );

    const toCreate = rejected
      .filter((b) => !existingStatuses.has(b.id))
      .map((b) => ({ businessId: b.id, status: 'PENDING' as const }));

    if (toCreate.length > 0) {
      await prisma.cRMStatus.createMany({ data: toCreate });
    }

    return NextResponse.json({ restored: rejected.length });
  } catch (error) {
    console.error('Restore all error:', error);
    return NextResponse.json({ error: 'Restore all failed' }, { status: 500 });
  }
}
