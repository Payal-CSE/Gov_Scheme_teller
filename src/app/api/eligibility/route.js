import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { findEligibleSchemes } from "@/lib/eligibility";

// GET /api/eligibility — Get eligible schemes for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.onboardingCompleted) {
      return NextResponse.json({
        eligible: false,
        message: "Please complete onboarding first.",
        matchedSchemes: [],
        vector: null,
      });
    }

    const { vector, matchedSchemes, matchedSchemeIds } =
      await findEligibleSchemes(user);

    // Persist matched scheme IDs to user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        eligibilityVector: { ...vector, matchedSchemeIds },
      },
    });

    // Get bookmark status for matched schemes
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id,
        schemeId: { in: matchedSchemeIds },
      },
      select: { schemeId: true },
    });
    const bookmarkedIds = new Set(bookmarks.map((b) => b.schemeId));

    const schemesWithBookmark = matchedSchemes.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      ministry: s.ministry,
      level: s.level,
      officialLink: s.officialLink,
      eligibilityRules: s.eligibilityRules,
      isBookmarked: bookmarkedIds.has(s.id),
    }));

    return NextResponse.json({
      eligible: true,
      matchedCount: matchedSchemeIds.length,
      matchedSchemes: schemesWithBookmark,
      vector,
    });
  } catch (error) {
    console.error("Eligibility error:", error);
    return NextResponse.json(
      { error: "Failed to compute eligibility." },
      { status: 500 }
    );
  }
}

// POST /api/eligibility — Force refresh eligibility
export async function POST() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.onboardingCompleted) {
      return NextResponse.json(
        { error: "Onboarding not completed." },
        { status: 400 }
      );
    }

    const { vector, matchedSchemeIds } = await findEligibleSchemes(user);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        eligibilityVector: { ...vector, matchedSchemeIds },
      },
    });

    return NextResponse.json({
      matchedCount: matchedSchemeIds.length,
      message: "Eligibility refreshed successfully.",
    });
  } catch (error) {
    console.error("Refresh eligibility error:", error);
    return NextResponse.json(
      { error: "Failed to refresh eligibility." },
      { status: 500 }
    );
  }
}
