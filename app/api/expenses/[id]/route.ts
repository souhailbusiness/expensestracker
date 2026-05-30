import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Expense from '@/lib/models/Expense';
import { attachSessionCookie } from '@/lib/anonymous-session';
import { getUserContext } from '@/lib/auth-helpers';
import { expenseSchema } from '@/lib/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const expense = await Expense.findOne({
      _id: params.id,
      userId,
    });

    if (!expense) {
      const response = NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    const response = NextResponse.json({ expense }, { status: 200 });
    if (isAnonymous && isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  } catch (error) {
    console.error('[v0] Get expense error:', error);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const expense = await Expense.findOneAndUpdate(
      { _id: params.id, userId },
      {
        amount: validatedData.amount,
        currency: validatedData.currency,
        category: validatedData.category,
        item: validatedData.item,
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        date: new Date(validatedData.date),
        notes: validatedData.notes,
      },
      { new: true }
    );

    if (!expense) {
      const response = NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    const response = NextResponse.json({ expense }, { status: 200 });
    if (isAnonymous && isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  } catch (error: any) {
    console.error('[v0] Update expense error:', error);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const expense = await Expense.findOneAndDelete({
      _id: params.id,
      userId,
    });

    if (!expense) {
      const response = NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    const response = NextResponse.json(
      { message: 'Expense deleted successfully' },
      { status: 200 }
    );
    if (isAnonymous && isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  } catch (error) {
    console.error('[v0] Delete expense error:', error);
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
