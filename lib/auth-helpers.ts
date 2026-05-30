import { getServerSession } from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getOrCreateAnonymousSession } from '@/lib/anonymous-session';

export async function getUserContext(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const sessionUserId = (session?.user as { id?: string })?.id;

  if (sessionUserId) {
    return {
      userId: sessionUserId,
      isAnonymous: false,
      sessionToken: null as string | null,
      isNewSession: false,
    };
  }

  const anonymousSession = await getOrCreateAnonymousSession(request);
  return {
    userId: anonymousSession.userId,
    isAnonymous: true,
    sessionToken: anonymousSession.sessionToken,
    isNewSession: anonymousSession.isNew,
  };
}
