import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "";
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL;

  // Use libSQL adapter for Turso (production or libsql URLs)
  if (url.startsWith("libsql://") || url.startsWith("https://") || isProduction) {
    if (!url || url.startsWith("file:")) {
      throw new Error(
        "Production requires TURSO_DATABASE_URL or DATABASE_URL to be set to a libsql:// URL. " +
        `Current value: "${url}"`
      );
    }
    const adapter = new PrismaLibSQL({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    return new PrismaClient({ adapter } as any);
  }

  // Use regular SQLite for local development
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
