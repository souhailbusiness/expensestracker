import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Expense from '@/lib/models/Expense';
import Purchase from '@/lib/models/Purchase';
import Session from '@/lib/models/Session';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const expenses = Array.isArray(body?.expenses) ? body.expenses : [];

    await connectToDatabase();

    let mergedCount = 0;

    const anonymousToken = request.cookies.get('session')?.value;
    if (anonymousToken) {
      const anonymousSession = await Session.findOne({
        token: anonymousToken,
        expiresAt: { $gt: new Date() },
      });
      if (anonymousSession && anonymousSession.userId.toString() !== userId) {
        await Expense.updateMany(
          { userId: anonymousSession.userId },
          { $set: { userId } }
        );
        await Purchase.updateMany(
          { userId: anonymousSession.userId },
          { $set: { userId } }
        );
        await Session.deleteOne({ _id: anonymousSession._id });
      }
    }

    if (!expenses.length) {
      return NextResponse.json({ merged: mergedCount }, { status: 200 });
    }

    for (const expense of expenses) {
      if (!expense || !expense.item || !expense.amount || !expense.category) {
        continue;
      }

      const dateValue = expense.date ? new Date(expense.date) : new Date();
      const exists = await Expense.findOne({
        userId,
        amount: expense.amount,
        currency: expense.currency || 'MAD',
        category: expense.category,
        item: expense.item,
        quantity: expense.quantity ?? 1,
        unit: expense.unit || 'item',
        date: dateValue,
        notes: expense.notes || undefined,
      });

      if (exists) continue;

      const created = new Expense({
        userId,
        amount: expense.amount,
        currency: expense.currency || 'MAD',
        category: expense.category,
        item: expense.item,
        quantity: expense.quantity ?? 1,
        unit: expense.unit || 'item',
        date: dateValue,
        notes: expense.notes || undefined,
      });

      await created.save();
      mergedCount += 1;
    }

    return NextResponse.json({ merged: mergedCount }, { status: 200 });
  } catch (error) {
    console.error('[v0] Merge expenses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
