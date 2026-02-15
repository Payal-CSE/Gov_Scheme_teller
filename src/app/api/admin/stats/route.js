import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/stats — Dashboard stats
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const [
      totalUsers,
      totalSchemes,
      approvedSchemes,
      draftSchemes,
      archivedSchemes,
      totalBookmarks,
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

    return NextResponse.json({
      stats: {
        totalUsers,
        totalSchemes,
        approvedSchemes,
        draftSchemes,
        archivedSchemes,
        totalBookmarks,
      },
      recentUsers,
      recentSchemes,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats." },
      { status: 500 }
    );
  }
}
