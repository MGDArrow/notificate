// server/utils/prisma.ts
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Путь к сгенерированному клиенту (корень проекта /generated)
const prismaClientPath = resolve(__dirname, '../../generated');
const { PrismaClient } = require(prismaClientPath);

const prismaClientSingleton = () => {
  const { PrismaPg } = require('@prisma/adapter-pg');
  const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter: pool });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;
const globalForPrisma = globalThis as unknown as { prisma: PrismaClientSingleton | undefined };
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;