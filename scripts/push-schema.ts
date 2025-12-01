import { createClient } from "@libsql/client";

console.log("DATABASE_URL set:", !!process.env.DATABASE_URL);
console.log("TURSO_AUTH_TOKEN set:", !!process.env.TURSO_AUTH_TOKEN);

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Schema matching prisma/schema.prisma
const schema = `
CREATE TABLE IF NOT EXISTS "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_name_key" ON "User"("name");

CREATE TABLE IF NOT EXISTS "Unavailability" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Unavailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Unavailability_userId_date_key" ON "Unavailability"("userId", "date");

CREATE INDEX IF NOT EXISTS "Unavailability_date_idx" ON "Unavailability"("date");
`;

async function main() {
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Found ${statements.length} statements to execute`);

  for (const statement of statements) {
    try {
      await client.execute(statement);
      console.log("✓ Executed:", statement.substring(0, 60));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("✗ Error:", message);
      console.error("  Statement:", statement);
    }
  }

  console.log("Schema push complete!");
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
