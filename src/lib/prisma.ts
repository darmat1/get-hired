import { PrismaClient } from "../generated/client";

const globalForPrisma = globalThis as unknown as {
  prismaCustom: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prismaCustom ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prismaCustom = prisma;
