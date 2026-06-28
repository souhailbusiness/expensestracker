import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Expense from '@/lib/models/Expense';
import { validateSession } from '@/lib/auth';

export const dynamic = 'error';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = await validateSession(sessionToken);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await connectToDatabase();

    // Verify expense belongs to user
    const expense = await Expense.findOne({ _id: params.id, userId });
    if (!expense) {
      return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
    }

    // Update fields
    if (body.amount !== undefined) expense.amount = body.amount;
    if (body.currency !== undefined) expense.currency = body.currency;
    if (body.category !== undefined) expense.category = body.category;
    if (body.item !== undefined) expense.item = body.item;
    if (body.quantity !== undefined) expense.quantity = body.quantity;
    if (body.unit !== undefined) expense.unit = body.unit;
    if (body.date !== undefined) expense.date = body.date;
    if (body.notes !== undefined) expense.notes = body.notes;

    await expense.save();

    return NextResponse.json({ expense });
  } catch (error) {
    console.error('Update expense error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    if (!sessionToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = await validateSession(sessionToken);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Verify expense belongs to user before deleting
    const expense = await Expense.findOne({ _id: params.id, userId });
    if (!expense) {
      return NextResponse.json({ message: 'Expense not found' }, { status: 404 });
    }

    await Expense.deleteOne({ _id: params.id, userId });

    return NextResponse.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Delete expense error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
