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
  let userId: string | undefined;

  try {
    const session = await getUserContext(request);
    userId = session.userId;
    sessionToken = session.sessionToken;
    isNewSession = session.isNewSession;
    isAnonymous = session.isAnonymous;

    if (!userId) {
      console.error('[v0] PUT: No userId found in session');
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    const body = await request.json();
    const validatedData = expenseSchema.parse(body);

    await connectToDatabase();

    console.log('[v0] PUT expense:', params.id, 'for userId:', userId);

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
      console.log('[v0] PUT: Expense not found:', params.id, 'userId:', userId);
      const response = NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    console.log('[v0] PUT: Expense successfully updated:', params.id);
    const response = NextResponse.json({ expense }, { status: 200 });
    if (isAnonymous && isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  } catch (error: any) {
    console.error('[v0] Update expense error:', error);
    console.error('[v0] Update error - userId:', userId, 'id:', params.id);

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
  let userId: string | undefined;

  try {
    const session = await getUserContext(request);
    userId = session.userId;
    sessionToken = session.sessionToken;
    isNewSession = session.isNewSession;
    isAnonymous = session.isAnonymous;

    if (!userId) {
      console.error('[v0] DELETE: No userId found in session');
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    await connectToDatabase();

    console.log('[v0] DELETE expense:', params.id, 'for userId:', userId);

    const expense = await Expense.findOneAndDelete({
      _id: params.id,
      userId,
    });

    if (!expense) {
      console.log('[v0] DELETE: Expense not found:', params.id, 'userId:', userId);
      const response = NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    console.log('[v0] DELETE: Expense successfully deleted:', params.id);
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
    console.error('[v0] Delete error - userId:', userId, 'id:', params.id);
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
