import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// DELETE /api/bookmarks/[id] — Remove a bookmark
export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    // id can be a bookmark ID or a scheme ID — try both
    let bookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    // If not found by bookmark ID, try by scheme ID
    if (!bookmark) {
      bookmark = await prisma.bookmark.findUnique({
        where: {
          userId_schemeId: {
            userId: session.user.id,
            schemeId: id,
          },
        },
      });
    }

    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found." },
        { status: 404 }
      );
    }

    await prisma.bookmark.delete({ where: { id: bookmark.id } });

    return NextResponse.json({ message: "Bookmark removed." });
  } catch (error) {
    console.error("Delete bookmark error:", error);
    return NextResponse.json(
      { error: "Failed to remove bookmark." },
      { status: 500 }
    );
  }
}
