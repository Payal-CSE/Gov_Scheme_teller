import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/bookmarks — List user's bookmarks
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.user.id },
      include: {
        scheme: {
          select: {
            id: true,
            name: true,
            description: true,
            ministry: true,
            level: true,
            status: true,
            officialLink: true,
            eligibilityRules: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      bookmarks: bookmarks
        .filter((b) => b.scheme.status === "APPROVED")
        .map((b) => ({
          id: b.id,
          schemeId: b.schemeId,
          createdAt: b.createdAt,
          scheme: b.scheme,
        })),
    });
  } catch (error) {
    console.error("Bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks." },
      { status: 500 }
    );
  }
}

// POST /api/bookmarks — Create a bookmark
export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { schemeId } = await req.json();

    if (!schemeId) {
      return NextResponse.json(
        { error: "Scheme ID is required." },
        { status: 400 }
      );
    }

    // Verify scheme exists and is approved
    const scheme = await prisma.scheme.findUnique({
      where: { id: schemeId },
    });

    if (!scheme || scheme.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Scheme not found." },
        { status: 404 }
      );
    }

    // Check for existing bookmark
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_schemeId: {
          userId: session.user.id,
          schemeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already bookmarked.", bookmarkId: existing.id },
        { status: 409 }
      );
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: session.user.id,
        schemeId,
      },
    });

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error("Create bookmark error:", error);
    return NextResponse.json(
      { error: "Failed to bookmark scheme." },
      { status: 500 }
    );
  }
}
