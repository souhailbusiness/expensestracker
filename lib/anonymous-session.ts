import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from './mongodb';
import Session from './models/Session';
import User from './models/User';

const SESSION_COOKIE_NAME = 'session';
const SESSION_TTL_DAYS = 365;

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function generateAnonymousEmail(token: string): string {
  return `anon_${token.slice(0, 16)}@example.local`;
}

function generateAnonymousPassword(): string {
  return randomBytes(16).toString('hex');
}

export async function getOrCreateAnonymousSession(
  request: NextRequest
): Promise<{ userId: string; sessionToken: string; isNew: boolean }> {
  await connectToDatabase();

  const existingToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (existingToken) {
    const session = await Session.findOne({
      token: existingToken,
      expiresAt: { $gt: new Date() },
    });

    if (session) {
      return {
        userId: session.userId.toString(),
        sessionToken: existingToken,
        isNew: false,
      };
    }
  }

  const sessionToken = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);

  const rawPassword = generateAnonymousPassword();
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const user = new User({
    email: generateAnonymousEmail(sessionToken),
    password: hashedPassword,
    provider: 'credentials',
  });
  await user.save();

  const session = new Session({
    userId: user._id,
    token: sessionToken,
    expiresAt,
  });
  await session.save();

  return { userId: user._id.toString(), sessionToken, isNew: true };
}

export function attachSessionCookie(
  response: NextResponse,
  sessionToken: string
): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * SESSION_TTL_DAYS,
  });

  return response;
}
