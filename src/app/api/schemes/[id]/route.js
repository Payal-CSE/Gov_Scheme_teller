import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/schemes/[id] — Get single scheme detail
export async function GET(req, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    const [scheme, bookmark] = await Promise.all([
      prisma.scheme.findUnique({
        where: { id, status: "APPROVED" },
      }),
      prisma.bookmark.findUnique({
        where: {
          userId_schemeId: {
            userId: session.user.id,
            schemeId: id,
          },
        },
      }),
    ]);

    if (!scheme) {
      return NextResponse.json(
        { error: "Scheme not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...scheme,
      isBookmarked: !!bookmark,
      bookmarkId: bookmark?.id || null,
    });
  } catch (error) {
    console.error("Scheme detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheme." },
      { status: 500 }
    );
  }
}
