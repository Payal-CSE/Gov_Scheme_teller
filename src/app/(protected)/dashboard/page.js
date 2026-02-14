import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {session.user.name}.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Your Profile
            </h3>
            <p className="mt-2 text-2xl font-bold text-card-foreground">
              {session.user.onboardingCompleted ? "Complete" : "Incomplete"}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Matched Schemes
            </h3>
            <p className="mt-2 text-2xl font-bold text-card-foreground">--</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Bookmarked
            </h3>
            <p className="mt-2 text-2xl font-bold text-card-foreground">--</p>
          </div>
        </div>
      </div>
    </div>
  );
}
