import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  deriveIncomeBracket,
  generateAndStoreEligibility,
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

    // Basic validation — require at least date of birth and gender
    if (!dateOfBirth || !gender) {
      return NextResponse.json(
        { error: "Date of birth and gender are required." },
        { status: 400 }
      );
    }

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

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    // Run full eligibility engine — builds vector AND matches schemes
    const { matchedSchemeIds } = await generateAndStoreEligibility(
      session.user.id
    );

    return NextResponse.json(
      {
        message: "Onboarding completed successfully.",
        matchedSchemes: matchedSchemeIds.length,
      },
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
