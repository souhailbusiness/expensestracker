import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Expense from '@/lib/models/Expense';
import { attachSessionCookie } from '@/lib/anonymous-session';
import { getUserContext } from '@/lib/auth-helpers';
import { expenseSchema } from '@/lib/schemas';

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filter: any = { userId };

    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });

    const response = NextResponse.json({ expenses }, { status: 200 });
    if (isAnonymous && isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  } catch (error) {
    console.error('[v0] Get expenses error:', error);
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
    const validatedData = expenseSchema.parse(body);

    await connectToDatabase();

    const expense = new Expense({
      userId,
      amount: validatedData.amount,
      currency: validatedData.currency,
      category: validatedData.category,
      item: validatedData.item,
      quantity: validatedData.quantity,
      unit: validatedData.unit,
      date: new Date(validatedData.date),
      notes: validatedData.notes,
    });

    await expense.save();

    const response = NextResponse.json({ expense }, { status: 201 });
    if (isAnonymous && isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  } catch (error: any) {
    console.error('[v0] Create expense error:', error);

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
