import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  FileText,
  CheckCircle,
  BookmarkCheck,
  Clock,
  Archive,
  ArrowRight,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [
    userCount,
    schemeCount,
    approvedCount,
    draftCount,
    archivedCount,
    bookmarkCount,
    recentUsers,
    recentSchemes,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.scheme.count(),
    prisma.scheme.count({ where: { status: "APPROVED" } }),
    prisma.scheme.count({ where: { status: "DRAFT" } }),
    prisma.scheme.count({ where: { status: "ARCHIVED" } }),
    prisma.bookmark.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        onboardingCompleted: true,
        createdAt: true,
      },
    }),
    prisma.scheme.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        level: true,
        ministry: true,
        createdAt: true,
      },
    }),
  ]);

  const statCards = [
    {
      label: "Total Users",
      value: userCount,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/admin/users",
    },
    {
      label: "Total Schemes",
      value: schemeCount,
      icon: FileText,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      href: "/admin/schemes",
    },
    {
      label: "Approved",
      value: approvedCount,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
      href: "/admin/schemes?status=APPROVED",
    },
    {
      label: "Drafts",
      value: draftCount,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
      href: "/admin/schemes?status=DRAFT",
    },
    {
      label: "Archived",
      value: archivedCount,
      icon: Archive,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      href: "/admin/schemes?status=ARCHIVED",
    },
    {
      label: "Bookmarks",
      value: bookmarkCount,
      icon: BookmarkCheck,
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: null,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, {session.user.name}. Here&apos;s your platform overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-card-foreground">
                    {card.value}
                  </p>
                </div>
                <div className={`rounded-lg ${card.bgColor} p-2.5`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </div>
          );

          return card.href ? (
            <Link key={card.label} href={card.href} className="cursor-pointer">
              {content}
            </Link>
          ) : (
            <div key={card.label}>{content}</div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/schemes"
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 cursor-pointer"
        >
          <div className="rounded-lg bg-primary/10 p-2.5">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Manage Schemes</h3>
            <p className="text-xs text-muted-foreground">Create, edit & approve schemes</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          href="/admin/users"
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 cursor-pointer"
        >
          <div className="rounded-lg bg-success/10 p-2.5">
            <Users className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Manage Users</h3>
            <p className="text-xs text-muted-foreground">View, search & manage users</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <Link
          href="/admin/schemes"
          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/30 cursor-pointer"
        >
          <div className="rounded-lg bg-warning/10 p-2.5">
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Review Drafts</h3>
            <p className="text-xs text-muted-foreground">
              {draftCount} schemes pending approval
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Users</h2>
            <Link
              href="/admin/users"
              className="text-xs font-medium text-primary hover:underline cursor-pointer"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentUsers.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No users yet.
              </p>
            ) : (
              recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.role}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Schemes */}
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Schemes</h2>
            <Link
              href="/admin/schemes"
              className="text-xs font-medium text-primary hover:underline cursor-pointer"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentSchemes.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                No schemes yet. Create your first scheme.
              </p>
            ) : (
              recentSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {scheme.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {scheme.ministry} · {scheme.level}
                    </p>
                  </div>
                  <span
                    className={`ml-3 inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      scheme.status === "APPROVED"
                        ? "bg-success/10 text-success"
                        : scheme.status === "DRAFT"
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {scheme.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
