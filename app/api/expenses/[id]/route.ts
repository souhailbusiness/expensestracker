import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Expense from '@/lib/models/Expense';
import { attachSessionCookie } from '@/lib/anonymous-session';
import { getUserContext } from '@/lib/auth-helpers';
import { expenseSchema } from '@/lib/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let sessionToken: string | null = null;
  let isNewSession = false;
  let isAnonymous = false;

  try {
    const { id } = await params;
    const session = await getUserContext(request);
    const userId = session.userId;
    sessionToken = session.sessionToken;
    isNewSession = session.isNewSession;
    isAnonymous = session.isAnonymous;

    await connectToDatabase();

    const expense = await Expense.findOne({
      _id: id,
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
  { params }: { params: Promise<{ id: string }> }
) {
  let sessionToken: string | null = null;
  let isNewSession = false;
  let isAnonymous = false;
  let userId: string | undefined;

  try {
    const { id } = await params;
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

    console.log('[v0] PUT expense:', id, 'for userId:', userId);

    // Verify the expense exists first
    const existingExpense = await Expense.findOne({
      _id: id,
      userId,
    });

    if (!existingExpense) {
      console.log('[v0] PUT: Expense not found:', id, 'userId:', userId);
      const response = NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    // Update the expense
    const updateData = {
      amount: validatedData.amount,
      currency: validatedData.currency,
      category: validatedData.category,
      item: validatedData.item,
      quantity: validatedData.quantity,
      unit: validatedData.unit,
      date: new Date(validatedData.date),
      notes: validatedData.notes,
    };

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!expense) {
      console.log('[v0] PUT: Failed to update expense:', id);
      const response = NextResponse.json(
        { error: 'Failed to update expense' },
        { status: 500 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    console.log('[v0] PUT: Expense successfully updated:', id, 'new values:', updateData);
    const response = NextResponse.json({ expense }, { status: 200 });
    if (isAnonymous && isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  } catch (error: any) {
    console.error('[v0] Update expense error:', error);
    console.error('[v0] Update error - userId:', userId);

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
  { params }: { params: Promise<{ id: string }> }
) {
  let sessionToken: string | null = null;
  let isNewSession = false;
  let isAnonymous = false;
  let userId: string | undefined;

  try {
    const { id } = await params;
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

    console.log('[v0] DELETE expense:', id, 'for userId:', userId);

    // Verify expense exists before deleting
    const expenseToDelete = await Expense.findOne({
      _id: id,
      userId,
    });

    if (!expenseToDelete) {
      console.log('[v0] DELETE: Expense not found:', id, 'userId:', userId);
      const response = NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    // Delete the expense and ensure it completes
    const result = await Expense.deleteOne({
      _id: id,
      userId,
    });

    if (result.deletedCount === 0) {
      console.log('[v0] DELETE: Failed to delete expense:', id);
      const response = NextResponse.json(
        { error: 'Failed to delete expense' },
        { status: 500 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    console.log('[v0] DELETE: Expense successfully deleted:', id, 'deletedCount:', result.deletedCount);
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
    console.error('[v0] Delete error - userId:', userId);
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
