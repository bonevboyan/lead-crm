import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Permanent delete
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.business.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Permanent delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
