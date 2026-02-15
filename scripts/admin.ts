// ============================================================
// Admin CLI — Gov Scheme Teller
// ============================================================
// Usage:
//   npm run admin:list
//   npm run admin:add -- --email admin@test.com --name "New Admin" --password secret123
//   npm run admin:delete -- --email admin@test.com
//   npm run admin:update -- --email admin@test.com --name "Updated Name"
// ============================================================

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const datasourceUrl = process.env.PRISMA_DATABASE_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient({
  accelerateUrl: datasourceUrl,
});

function parseArgs(args: string[]) {
  const parsed: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].slice(2);
      parsed[key] = args[i + 1] || true;
      i++;
    }
  }
  return parsed;
}

async function listAdmins() {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (admins.length === 0) {
    console.log("No admin users found.");
    return;
  }

  console.log("\nAdmin Users:");
  console.log("-".repeat(60));
  for (const admin of admins) {
    console.log(`  ID:      ${admin.id}`);
    console.log(`  Email:   ${admin.email}`);
    console.log(`  Name:    ${admin.name}`);
    console.log(`  Created: ${admin.createdAt.toISOString()}`);
    console.log("-".repeat(60));
  }
  console.log(`Total: ${admins.length} admin(s)\n`);
}

async function addAdmin(args: Record<string, string | boolean>) {
  const { email, name, password } = args;

  if (!email || !name || !password) {
    console.error("Error: --email, --name, and --password are required.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({
    where: { email: email as string },
  });
  if (existing) {
    console.error(`Error: User with email ${email} already exists.`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password as string, 12);

  const admin = await prisma.user.create({
    data: {
      email: email as string,
      name: name as string,
      password: hashedPassword,
      role: "ADMIN",
      onboardingCompleted: true,
    },
  });

  console.log(`Admin created successfully: ${admin.email}`);
}

async function deleteAdmin(args: Record<string, string | boolean>) {
  const { email } = args;

  if (!email) {
    console.error("Error: --email is required.");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email: email as string },
  });

  if (!user) {
    console.error(`Error: User with email ${email} not found.`);
    process.exit(1);
  }

  if (user.role !== "ADMIN") {
    console.error(`Error: User ${email} is not an admin.`);
    process.exit(1);
  }

  await prisma.user.delete({ where: { email: email as string } });
  console.log(`Admin ${email} deleted successfully.`);
}

async function updateAdmin(args: Record<string, string | boolean>) {
  const { email, name, password } = args;

  if (!email) {
    console.error("Error: --email is required.");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email: email as string },
  });

  if (!user) {
    console.error(`Error: User with email ${email} not found.`);
    process.exit(1);
  }

  if (user.role !== "ADMIN") {
    console.error(`Error: User ${email} is not an admin.`);
    process.exit(1);
  }

  const updateData: Record<string, string> = {};
  if (name) updateData.name = name as string;
  if (password) updateData.password = await bcrypt.hash(password as string, 12);

  if (Object.keys(updateData).length === 0) {
    console.log("Nothing to update. Provide --name or --password.");
    return;
  }

  await prisma.user.update({
    where: { email: email as string },
    data: updateData,
  });
  console.log(`Admin ${email} updated successfully.`);
}

async function main() {
  const command = process.argv[2];
  const args = parseArgs(process.argv.slice(3));

  switch (command) {
    case "list":
      await listAdmins();
      break;
    case "add":
      await addAdmin(args);
      break;
    case "delete":
      await deleteAdmin(args);
      break;
    case "update":
      await updateAdmin(args);
      break;
    default:
      console.log("Admin CLI - Gov Scheme Teller");
      console.log("-".repeat(40));
      console.log("Commands:");
      console.log("  list                        List all admins");
      console.log(
        "  add --email --name --password  Add an admin"
      );
      console.log("  delete --email              Delete an admin");
      console.log(
        "  update --email [--name] [--password]  Update an admin"
      );
      break;
  }
}

main()
  .catch((e) => {
    console.error("CLI error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
