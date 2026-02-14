import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/schemes — List all schemes
export async function GET(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { ministry: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [schemes, total] = await Promise.all([
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
          status: true,
          officialLink: true,
          createdAt: true,
          _count: { select: { bookmarks: true } },
        },
      }),
      prisma.scheme.count({ where }),
    ]);

    return NextResponse.json({
      schemes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin schemes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch schemes." },
      { status: 500 }
    );
  }
}

// POST /api/admin/schemes — Create a new scheme
export async function POST(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      ministry,
      level,
      status,
      eligibilityRules,
      applicableStates,
      officialLink,
      documentLink,
    } = body;

    if (!name || !description || !ministry || !level) {
      return NextResponse.json(
        { error: "Name, description, ministry, and level are required." },
        { status: 400 }
      );
    }

    const scheme = await prisma.scheme.create({
      data: {
        name,
        description,
        ministry,
        level,
        status: status || "DRAFT",
        eligibilityRules: eligibilityRules || {},
        applicableStates: applicableStates || null,
        officialLink: officialLink || null,
        documentLink: documentLink || null,
      },
    });

    return NextResponse.json(scheme, { status: 201 });
  } catch (error) {
    console.error("Create scheme error:", error);
    return NextResponse.json(
      { error: "Failed to create scheme." },
      { status: 500 }
    );
  }
}
