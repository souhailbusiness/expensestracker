import { NextRequest, NextResponse } from 'next/server';

const ANONYMOUS_SESSION_COOKIE = 'anonymous-session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export async function getOrCreateAnonymousSession(request: NextRequest) {
  let sessionToken = request.cookies.get(ANONYMOUS_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    sessionToken = `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  return {
    userId: sessionToken,
    sessionToken,
    isNew: !request.cookies.get(ANONYMOUS_SESSION_COOKIE)?.value,
  };
}

export function attachSessionCookie(response: NextResponse, sessionToken: string) {
  response.cookies.set(ANONYMOUS_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  });
}
