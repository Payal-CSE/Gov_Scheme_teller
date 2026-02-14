// ============================================================
// Seed Script — Gov Scheme Teller
// ============================================================
// Creates:
// - 1 Admin user (admin@govscheme.in / admin123)
// - 1 Test user (user@govscheme.in / user123)
// - 3 Central schemes (APPROVED)
// - 3 State schemes (APPROVED)
// ============================================================

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  accelerateUrl: process.env.PRISMA_DATABASE_URL,
});

async function main() {
  console.log("Seeding database...\n");

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
  console.log(`Admin created: ${admin.email}`);

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
  console.log(`User created: ${user.email}`);

  // ─── Central Schemes ───────────────────────────────────
  const centralSchemes = [
    {
      name: "PM Kisan Samman Nidhi",
      description:
        "Income support of Rs 6,000 per year to all land-holding farmer families across the country in three equal installments.",
      ministry: "Ministry of Agriculture and Farmers Welfare",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        occupations: ["FARMER"],
        maxIncome: 500000,
      },
      applicableStates: null,
      officialLink: "https://pmkisan.gov.in/",
    },
    {
      name: "Ayushman Bharat - PMJAY",
      description:
        "Health insurance cover of Rs 5 lakh per family per year for secondary and tertiary care hospitalization to economically vulnerable families.",
      ministry: "Ministry of Health and Family Welfare",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        maxIncome: 250000,
        bplOnly: true,
      },
      applicableStates: null,
      officialLink: "https://pmjay.gov.in/",
    },
    {
      name: "PM Awas Yojana - Gramin",
      description:
        "Financial assistance for construction of pucca houses with basic amenities to all houseless and those living in kutcha/dilapidated houses in rural areas.",
      ministry: "Ministry of Rural Development",
      level: "CENTRAL" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        maxIncome: 300000,
        ruralOnly: true,
        bplOnly: true,
      },
      applicableStates: null,
      officialLink: "https://pmayg.nic.in/",
    },
  ];

  for (const scheme of centralSchemes) {
    const created = await prisma.scheme.create({ data: scheme });
    console.log(`Central scheme created: ${created.name}`);
  }

  // ─── State Schemes ─────────────────────────────────────
  const stateSchemes = [
    {
      name: "Kalia Yojana",
      description:
        "Financial assistance to small and marginal farmers, landless agricultural households, and vulnerable agricultural households in Odisha.",
      ministry: "Department of Agriculture, Odisha",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        occupations: ["FARMER"],
        maxIncome: 200000,
        categories: ["GENERAL", "OBC", "SC", "ST"],
      },
      applicableStates: ["ODISHA"],
      officialLink: "https://kalia.odisha.gov.in/",
    },
    {
      name: "Mukhyamantri Ladli Behna Yojana",
      description:
        "Monthly financial assistance of Rs 1,250 to women aged 23-60 years from economically weaker families in Madhya Pradesh.",
      ministry: "Department of Women and Child Development, Madhya Pradesh",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        genders: ["FEMALE"],
        minAge: 23,
        maxAge: 60,
        maxIncome: 250000,
      },
      applicableStates: ["MADHYA_PRADESH"],
      officialLink: "https://ladlibahna.mp.gov.in/",
    },
    {
      name: "YSR Rythu Bharosa",
      description:
        "Input assistance of Rs 13,500 per year to all farmer families in Andhra Pradesh for crop investment support.",
      ministry: "Department of Agriculture, Andhra Pradesh",
      level: "STATE" as const,
      status: "APPROVED" as const,
      eligibilityRules: {
        occupations: ["FARMER"],
        categories: ["GENERAL", "OBC", "SC", "ST", "EWS"],
      },
      applicableStates: ["ANDHRA_PRADESH"],
      officialLink: "https://ysrrythubharosa.ap.gov.in/",
    },
  ];

  for (const scheme of stateSchemes) {
    const created = await prisma.scheme.create({ data: scheme });
    console.log(`State scheme created: ${created.name}`);
  }

  console.log("\nSeeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
