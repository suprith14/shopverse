import { afterAll } from 'vitest';
import { prisma } from '../../src/lib/prisma.js';

// Close the database connection after each test file, so the test process can exit.
afterAll(async () => {
  await prisma.$disconnect();
});
