import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/schemes — List approved schemes (authenticated users)
export async function GET(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";
    const ministry = searchParams.get("ministry") || "";
    const state = searchParams.get("state") || "";

    const where = { status: "APPROVED" };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { ministry: { contains: search, mode: "insensitive" } },
      ];
    }
    if (level) {
      where.level = level;
    }
    if (ministry) {
      where.ministry = { contains: ministry, mode: "insensitive" };
    }

    const [schemes, total, ministries] = await Promise.all([
      prisma.scheme.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          description: true,
          ministry: true,
          level: true,
          eligibilityRules: true,
          applicableStates: true,
          officialLink: true,
          createdAt: true,
          _count: { select: { bookmarks: true } },
        },
      }),
      prisma.scheme.count({ where }),
      prisma.scheme.findMany({
        where: { status: "APPROVED" },
        select: { ministry: true },
        distinct: ["ministry"],
        orderBy: { ministry: "asc" },
      }),
    ]);

    // If state filter, apply client-side (applicableStates is JSON)
    let filtered = schemes;
    if (state) {
      filtered = schemes.filter((s) => {
        if (!s.applicableStates || s.applicableStates.length === 0) return true;
        return s.applicableStates.includes(state);
      });
    }

    return NextResponse.json({
      schemes: filtered,
      ministries: ministries.map((m) => m.ministry),
      pagination: {
        page,
        limit,
        total: state ? filtered.length : total,
        totalPages: state ? Math.ceil(filtered.length / limit) : Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Schemes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schemes." },
      { status: 500 }
    );
  }
}
