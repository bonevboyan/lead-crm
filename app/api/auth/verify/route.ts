import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { valid: false },
        { status: 400 }
      );
    }
    
    const isValid = await verifyToken(token);
    
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { valid: false },
      { status: 500 }
    );
  }
}
