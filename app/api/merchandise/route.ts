import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Merchandise from '@/lib/models/Merchandise';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const merchandise = await Merchandise.find({ inStock: true }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ merchandise }, { status: 200 });
  } catch (error) {
    console.error('[v0] Get merchandise error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
