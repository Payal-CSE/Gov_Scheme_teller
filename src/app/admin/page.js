import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [userCount, schemeCount, approvedCount, bookmarkCount] =
    await Promise.all([
      prisma.user.count(),
      prisma.scheme.count(),
      prisma.scheme.count({ where: { status: "APPROVED" } }),
      prisma.bookmark.count(),
    ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Platform analytics overview.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Users
            </h3>
            <p className="mt-2 text-3xl font-bold text-card-foreground">
              {userCount}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Schemes
            </h3>
            <p className="mt-2 text-3xl font-bold text-card-foreground">
              {schemeCount}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Approved Schemes
            </h3>
            <p className="mt-2 text-3xl font-bold text-card-foreground">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Bookmarks
            </h3>
            <p className="mt-2 text-3xl font-bold text-card-foreground">
              {bookmarkCount}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
