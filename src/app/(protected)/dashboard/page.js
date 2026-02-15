import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  User,
  Search,
  Bookmark,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  const [bookmarkCount, user] = await Promise.all([
    prisma.bookmark.count({ where: { userId: session.user.id } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        onboardingCompleted: true,
        state: true,
        category: true,
        occupation: true,
        eligibilityVector: true,
      },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, {session.user.name}.
        </p>
      </div>

      {/* Onboarding CTA */}
      {!user?.onboardingCompleted && (
        <Link
          href="/onboarding"
          className="mb-6 flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4 transition-colors hover:bg-warning/10 cursor-pointer"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-warning" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              Complete your profile
            </p>
            <p className="text-xs text-muted-foreground">
              Fill in your details to get matched with eligible government schemes.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-warning" />
        </Link>
      )}

      {/* Stat Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2.5">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Your Profile
              </h3>
              <div className="mt-1 flex items-center gap-1.5">
                {user?.onboardingCompleted ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-lg font-bold text-success">Complete</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <span className="text-lg font-bold text-warning">Incomplete</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2.5">
              <Search className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Matched Schemes
              </h3>
              <p className="mt-1 text-lg font-bold text-card-foreground">
                {user?.onboardingCompleted
                  ? (user?.eligibilityVector?.matchedSchemeIds?.length ?? 0)
                  : "--"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-warning/10 p-2.5">
              <Bookmark className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Bookmarked
              </h3>
              <p className="mt-1 text-lg font-bold text-card-foreground">
                {bookmarkCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/schemes"
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 cursor-pointer"
        >
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Browse Schemes</h3>
            <p className="text-xs text-muted-foreground">
              Discover government schemes you may be eligible for
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          href="/bookmarks"
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 cursor-pointer"
        >
          <div className="rounded-lg bg-warning/10 p-2.5">
            <Bookmark className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">My Bookmarks</h3>
            <p className="text-xs text-muted-foreground">
              View schemes you&apos;ve saved for later
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 cursor-pointer"
        >
          <div className="rounded-lg bg-success/10 p-2.5">
            <User className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">My Profile</h3>
            <p className="text-xs text-muted-foreground">
              View and update your personal details
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      {/* Profile Summary */}
      {user?.onboardingCompleted && (
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Profile Summary</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {user.state && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  State
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {user.state.replace(/_/g, " ")}
                </p>
              </div>
            )}
            {user.category && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Category
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {user.category}
                </p>
              </div>
            )}
            {user.occupation && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Occupation
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {user.occupation.replace(/_/g, " ")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
