import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  deriveIncomeBracket,
  generateAndStoreEligibility,
} from "@/lib/eligibility";

// GET /api/profile — Get current user's profile
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        onboardingCompleted: true,
        dateOfBirth: true,
        gender: true,
        category: true,
        state: true,
        district: true,
        isRural: true,
        annualIncome: true,
        incomeBracket: true,
        occupation: true,
        isBPL: true,
        isDisabled: true,
        isMinority: true,
        eligibilityVector: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { bookmarks: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile." },
      { status: 500 }
    );
  }
}

// PATCH /api/profile — Update current user's profile
export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();

    const {
      name,
      dateOfBirth,
      gender,
      category,
      state,
      district,
      isRural,
      annualIncome,
      occupation,
      isBPL,
      isDisabled,
      isMinority,
    } = body;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (dateOfBirth !== undefined)
      updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (category !== undefined) updateData.category = category || null;
    if (state !== undefined) updateData.state = state || null;
    if (district !== undefined) updateData.district = district || null;
    if (isRural !== undefined) updateData.isRural = isRural;
    if (annualIncome !== undefined) {
      updateData.annualIncome =
        annualIncome != null ? parseFloat(annualIncome) : null;
      updateData.incomeBracket = deriveIncomeBracket(
        annualIncome != null ? parseFloat(annualIncome) : null
      );
    }
    if (occupation !== undefined) updateData.occupation = occupation || null;
    if (isBPL !== undefined) updateData.isBPL = isBPL || false;
    if (isDisabled !== undefined) updateData.isDisabled = isDisabled || false;
    if (isMinority !== undefined) updateData.isMinority = isMinority || false;

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    // Re-run eligibility if onboarding is complete
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user.onboardingCompleted) {
      await generateAndStoreEligibility(session.user.id);
    }

    return NextResponse.json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
