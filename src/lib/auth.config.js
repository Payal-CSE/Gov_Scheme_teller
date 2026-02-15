// ============================================================
// Auth Configuration — Edge-Compatible
// ============================================================
// This file contains the Auth.js configuration WITHOUT the
// Prisma adapter or any Node.js-only imports, making it safe
// to import in Edge Runtime (middleware).
//
// The full configuration with PrismaAdapter and the Credentials
// authorize function lives in auth.js (server-side only).
// ============================================================

const authConfig = {
  session: { strategy: "jwt" },

  providers: [],  // Populated in auth.js with full Credentials provider

  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      // This callback is used by the middleware
      return true; // Let middleware handle its own logic
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.onboardingCompleted = user.onboardingCompleted;
      }
      // Allow client-side session update (e.g., after onboarding)
      if (trigger === "update" && session) {
        if (session.onboardingCompleted !== undefined) {
          token.onboardingCompleted = session.onboardingCompleted;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
  },
};

export default authConfig;
