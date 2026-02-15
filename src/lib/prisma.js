import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis;

// Use PRISMA_DATABASE_URL (Accelerate) if available, otherwise fall back to DATABASE_URL
const datasourceUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    accelerateUrl: datasourceUrl,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
