import NextAuth from "next-auth";
import authConfig from "@/lib/auth.config";
import { NextResponse } from "next/server";

// ============================================================
// Middleware — Route Protection (Edge Runtime)
// ============================================================
// Uses the lightweight auth.config.js (no Prisma) so this
// module can run in the Edge Runtime.
// ============================================================
// Rules:
// 1. Public routes: /, /sign-in, /sign-up, /api/auth/*
// 2. Admin routes: /admin/* — require ADMIN role
// 3. Protected routes: everything else — require auth
// 4. Onboarding enforcement: non-admin users with incomplete
//    onboarding are redirected to /onboarding
// ============================================================

const publicPaths = ["/", "/sign-in", "/sign-up"];

function isPublicPath(pathname) {
  return (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/api/auth")
  );
}

function isAdminPath(pathname) {
  return pathname.startsWith("/admin");
}

function isOnboardingPath(pathname) {
  return pathname === "/onboarding";
}

function isApiPath(pathname) {
  return pathname.startsWith("/api");
}

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow public paths
  if (isPublicPath(pathname)) {
    // Redirect authenticated users away from auth pages
    if (session && (pathname === "/sign-in" || pathname === "/sign-up")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!session) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Admin route protection
  if (isAdminPath(pathname)) {
    if (session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Onboarding enforcement for non-admin users
  if (
    session.user.role === "USER" &&
    !session.user.onboardingCompleted &&
    !isOnboardingPath(pathname) &&
    !isApiPath(pathname)
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
