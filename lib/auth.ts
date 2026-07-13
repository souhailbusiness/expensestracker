import type { NextAuthOptions } from 'next-auth';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [],
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Store sessions in memory (simple solution for demo)
// In production, store in database or Redis
const sessions = new Map<string, { userId: string; createdAt: number }>();
const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createSession(userId: string): Promise<string> {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  sessions.set(token, { userId, createdAt: Date.now() });
  return token;
}

export async function validateSession(token: string): Promise<string | null> {
  const session = sessions.get(token);
  if (!session) return null;

  // Check if session is expired
  if (Date.now() - session.createdAt > SESSION_TIMEOUT) {
    sessions.delete(token);
    return null;
  }

  return session.userId;
}

export async function destroySession(token: string): Promise<void> {
  sessions.delete(token);
}
