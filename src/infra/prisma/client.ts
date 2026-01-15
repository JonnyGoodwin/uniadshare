import { PrismaClient } from '@prisma/client';

// Prisma client is instantiated once per process for simplicity; adjust to your runtime model as needed.
export const prisma = new PrismaClient();
