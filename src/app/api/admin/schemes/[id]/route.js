import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/admin/schemes/[id]
export async function GET(req, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const scheme = await prisma.scheme.findUnique({ where: { id } });

    if (!scheme) {
      return NextResponse.json(
        { error: "Scheme not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(scheme);
  } catch (error) {
    console.error("Get scheme error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheme." },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/schemes/[id] — Update a scheme
export async function PATCH(req, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const scheme = await prisma.scheme.findUnique({ where: { id } });
    if (!scheme) {
      return NextResponse.json(
        { error: "Scheme not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.scheme.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description && { description: body.description }),
        ...(body.ministry && { ministry: body.ministry }),
        ...(body.level && { level: body.level }),
        ...(body.status && { status: body.status }),
        ...(body.eligibilityRules && {
          eligibilityRules: body.eligibilityRules,
        }),
        ...(body.applicableStates !== undefined && {
          applicableStates: body.applicableStates,
        }),
        ...(body.officialLink !== undefined && {
          officialLink: body.officialLink,
        }),
        ...(body.documentLink !== undefined && {
          documentLink: body.documentLink,
        }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update scheme error:", error);
    return NextResponse.json(
      { error: "Failed to update scheme." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/schemes/[id] — Delete a scheme
export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    const scheme = await prisma.scheme.findUnique({ where: { id } });
    if (!scheme) {
      return NextResponse.json(
        { error: "Scheme not found." },
        { status: 404 }
      );
    }

    await prisma.scheme.delete({ where: { id } });

    return NextResponse.json({ message: "Scheme deleted successfully." });
  } catch (error) {
    console.error("Delete scheme error:", error);
    return NextResponse.json(
      { error: "Failed to delete scheme." },
      { status: 500 }
    );
  }
}
