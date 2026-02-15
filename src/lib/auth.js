import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import authConfig from "@/lib/auth.config";

// ============================================================
// Auth — Full Configuration (Server-Side Only)
// ============================================================
// This file extends the Edge-safe auth.config.js with the
// Credentials provider (which needs Prisma for user lookup).
// Import this for server-side usage (API routes, server
// components). The proxy uses auth.config.js directly.
//
// NOTE: PrismaAdapter is NOT used because:
// 1. We only use the Credentials provider (no OAuth)
// 2. JWT strategy handles session management
// 3. The schema doesn't include Account/Session/VerificationToken
//    tables required by the adapter
// ============================================================

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          onboardingCompleted: user.onboardingCompleted,
        };
      },
    }),
  ],
});
