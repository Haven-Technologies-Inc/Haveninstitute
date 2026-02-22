import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      allowDangerousEmailAccountLinking: false,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Invalid email or password');
        }

        if (!user.isActive) {
          throw new Error('Account is disabled');
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          image: user.avatarUrl,
          role: user.role,
          subscriptionTier: user.subscriptionTier,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              fullName: user.name ?? 'User',
              avatarUrl: user.image,
              googleId: account.providerAccountId,
              authProvider: 'google',
              emailVerified: true,
            },
          });
        } else if (!existingUser.googleId) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              googleId: account.providerAccountId,
              avatarUrl: existingUser.avatarUrl ?? user.image,
              lastLogin: new Date(),
            },
          });
        } else {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: { lastLogin: new Date() },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.subscriptionTier = dbUser.subscriptionTier;
          token.hasCompletedOnboarding = dbUser.hasCompletedOnboarding;
        }
      }

      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).subscriptionTier = token.subscriptionTier;
        (session.user as any).hasCompletedOnboarding = token.hasCompletedOnboarding;
      }
      return session;
    },
  },
};

// Type extensions for next-auth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: string;
      subscriptionTier: string;
      hasCompletedOnboarding: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    subscriptionTier: string;
    hasCompletedOnboarding: boolean;
  }
}
