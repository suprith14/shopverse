import { PrismaClient } from '@prisma/client';

// One shared database client for the whole app (each client holds a connection pool).
export const prisma = new PrismaClient();
