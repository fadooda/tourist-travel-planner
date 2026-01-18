import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaAuth?: PrismaClient;
  pgPool?: Pool;
};

export function getPrismaAuth() {
  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  if (!globalForPrisma.prismaAuth) {
    const adapter = new PrismaPg(globalForPrisma.pgPool);
    globalForPrisma.prismaAuth = new PrismaClient({ adapter });
  }

  return globalForPrisma.prismaAuth;
}
