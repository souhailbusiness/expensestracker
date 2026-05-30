import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Category from '@/lib/models/Category';
import { attachSessionCookie } from '@/lib/anonymous-session';
import { getUserContext } from '@/lib/auth-helpers';
import { categorySchema } from '@/lib/schemas';

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
    const validatedData = categorySchema.parse(body);

    await connectToDatabase();

    const category = await Category.findOneAndUpdate(
      { _id: params.id, userId },
      {
        name: validatedData.name,
        budget: validatedData.budget,
        color: validatedData.color,
      },
      { new: true }
    );

    if (!category) {
      const response = NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    const response = NextResponse.json({ category }, { status: 200 });
    if (isAnonymous && isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  } catch (error: any) {
    console.error('[v0] Update category error:', error);

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

    const category = await Category.findOneAndDelete({
      _id: params.id,
      userId,
    });

    if (!category) {
      const response = NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
      if (isAnonymous && isNewSession && sessionToken) {
        attachSessionCookie(response, sessionToken);
      }
      return response;
    }

    const response = NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
    if (isAnonymous && isNewSession && sessionToken) {
      attachSessionCookie(response, sessionToken);
    }
    return response;
  } catch (error) {
    console.error('[v0] Delete category error:', error);
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
