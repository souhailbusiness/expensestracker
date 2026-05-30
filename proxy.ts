import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function handler(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect authenticated users away from auth pages
  if (token && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/login', '/auth/register'],
};
