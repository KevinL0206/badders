import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "";

  // Use libSQL adapter for Turso (production)
  if (tursoUrl.startsWith("libsql://") || tursoUrl.startsWith("https://")) {
    console.log("Using Turso adapter");
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter } as any);
  }

  // Use regular SQLite for local development
  console.log("Using local SQLite");
  return new PrismaClient();
}

const prisma = createPrismaClient();

const users = [
  "Kevin",
  "Alex",
  "Yassin",
  "Wee Lee",
  "Pang",
  "Hana",
  "Nicole",
];

async function main() {
  console.log("Seeding database...");

  for (const name of users) {
    await prisma.user.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(`Seeded ${users.length} users successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
