import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';

const providers: any[] = [
  CredentialsProvider({
    name: 'credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) return null;
      await connectToDatabase();
      const user = await User.findOne({
        email: credentials.email.toLowerCase(),
        provider: 'credentials',
      });
      if (!user?.password) return null;

      const isValid = await bcrypt.compare(credentials.password, user.password);
      if (!isValid) return null;

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name || undefined,
        image: user.image || undefined,
      };
    },
  }),
];

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret) {
  providers.unshift(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
  },
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') return true;
      if (!user?.email) return false;

      await connectToDatabase();
      const email = user.email.toLowerCase();
      const googleId = (profile as { sub?: string })?.sub;

      const existing = await User.findOne({ email });
      if (existing) {
        existing.provider = 'google';
        if (googleId) {
          existing.googleId = googleId;
        }
        if (!existing.name && user.name) {
          existing.name = user.name;
        }
        if (!existing.image && user.image) {
          existing.image = user.image;
        }
        await existing.save();
        user.id = existing._id.toString();
        return true;
      }

      const created = new User({
        email,
        name: user.name || undefined,
        image: user.image || undefined,
        provider: 'google',
        googleId: googleId || undefined,
      });
      await created.save();
      user.id = created._id.toString();
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id?: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
};
