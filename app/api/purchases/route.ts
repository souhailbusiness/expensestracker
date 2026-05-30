import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Purchase from '@/lib/models/Purchase';
import Merchandise from '@/lib/models/Merchandise';
import { attachSessionCookie } from '@/lib/anonymous-session';
import { getUserContext } from '@/lib/auth-helpers';
import { purchaseSchema } from '@/lib/schemas';

export async function GET(request: NextRequest) {
  let sessionToken: string | null = null;
  let isNewSession = false;
  let isAnonymous = false;

  try {
    const session = await getUserContext(request);
    const userId = session.userId;
    sessionToken = session.sessionToken;
    isNewSession = session.isNewSession;
    isAnonymous = session.isAnonymous;

    await connectToDatabase();

    const purchases = await Purchase.find({ userId })
      .populate('merchandiseId')
      .sort({ purchaseDate: -1 });

    const response = NextResponse.json({ purchases }, { status: 200 });
    if (isAnonymous && isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  } catch (error) {
    console.error('[v0] Get purchases error:', error);
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    if (isAnonymous && isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  }
}

export async function POST(request: NextRequest) {
  let sessionToken: string | null = null;
  let isNewSession = false;
  let isAnonymous = false;

  try {
    const session = await getUserContext(request);
    const userId = session.userId;
    sessionToken = session.sessionToken;
    isNewSession = session.isNewSession;
    isAnonymous = session.isAnonymous;

    const body = await request.json();
    const validatedData = purchaseSchema.parse(body);

    await connectToDatabase();

    // Get merchandise details
    const merchandise = await Merchandise.findById(validatedData.merchandiseId);
    if (!merchandise) {
      const response = NextResponse.json(
        { error: 'Merchandise not found' },
        { status: 404 }
      );
      if (isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    if (!merchandise.inStock) {
      const response = NextResponse.json(
        { error: 'Merchandise out of stock' },
        { status: 400 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    const totalPrice = merchandise.price * validatedData.quantity;

    const purchase = new Purchase({
      userId,
      merchandiseId: validatedData.merchandiseId,
      quantity: validatedData.quantity,
      totalPrice,
    });

    await purchase.save();

    const response = NextResponse.json({ purchase }, { status: 201 });
    if (isAnonymous && isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  } catch (error: any) {
    console.error('[v0] Create purchase error:', error);

    if (error.name === 'ZodError') {
      const response = NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
    if (isAnonymous && isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  }
}
