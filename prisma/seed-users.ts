// ============================================================
// Seed Users — Gov Scheme Teller
// ============================================================
// Creates default users for the application:
// - 1 Admin user (admin@govscheme.in / admin123)
// - 1 Test user (user@govscheme.in / user123)
//
// Run this ONCE during initial setup.
// ============================================================

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const datasourceUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient({
  accelerateUrl: datasourceUrl,
});

async function main() {
  console.log("🌱 Seeding users...\n");

  // ─── Admin User ─────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@govscheme.in" },
    update: {},
    create: {
      email: "admin@govscheme.in",
      password: adminPassword,
      name: "Platform Admin",
      role: "ADMIN",
      onboardingCompleted: true,
    },
  });
  console.log(`✓ Admin created: ${admin.email}`);

  // ─── Test User ──────────────────────────────────────────
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { email: "user@govscheme.in" },
    update: {},
    create: {
      email: "user@govscheme.in",
      password: userPassword,
      name: "Test User",
      role: "USER",
      onboardingCompleted: false,
    },
  });
  console.log(`✓ Test user created: ${user.email}`);

  console.log("\n✅ User seeding completed successfully!");
  console.log("\n📝 Login Credentials:");
  console.log("   Admin: admin@govscheme.in / admin123");
  console.log("   User:  user@govscheme.in / user123\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
