import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  buildEligibilityVector,
  deriveIncomeBracket,
} from "@/lib/eligibility";

export async function POST(req) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();

    const {
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

    const updateData = {
      onboardingCompleted: true,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      category: category || null,
      state: state || null,
      district: district || null,
      isRural: isRural != null ? isRural : null,
      annualIncome: annualIncome != null ? parseFloat(annualIncome) : null,
      occupation: occupation || null,
      isBPL: isBPL || false,
      isDisabled: isDisabled || false,
      isMinority: isMinority || false,
      incomeBracket: deriveIncomeBracket(
        annualIncome != null ? parseFloat(annualIncome) : null
      ),
    };

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    // Build and store eligibility vector
    const vector = buildEligibilityVector(updatedUser);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { eligibilityVector: vector },
    });

    return NextResponse.json(
      { message: "Onboarding completed successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
