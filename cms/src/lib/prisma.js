import { PrismaClient } from '@prisma/client';

// One shared database client for the whole app (it holds a connection pool).
export const prisma = new PrismaClient();
