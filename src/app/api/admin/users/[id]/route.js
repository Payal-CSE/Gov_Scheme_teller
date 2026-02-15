import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/users/[id] — Get user detail
export async function GET(req, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
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
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] — Delete a user
export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    // Don't allow deleting yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user." },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] — Update user role
export async function PATCH(req, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const { role } = await req.json();

    if (!["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot change your own role." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user." },
      { status: 500 }
    );
  }
}
