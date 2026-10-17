import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Runs ONCE before the API tests. These tests create and delete data, so the most important
// job here is making sure they can never run against a database that matters.

const hostAndDb = (url) => {
  const u = new URL(url);
  return `${u.hostname}${u.pathname}`;
};

export default async function setup({ config }) {
  const url = config.env?.DATABASE_URL ?? '';

  // 1. Safety checks
  if (!url) {
    throw new Error(
      'API tests need a separate, empty test database.\n' +
        '  Add TEST_DATABASE_URL=... to backend/.env (see docs/features/19-testing.md).\n' +
        '  Or run only the unit tests: npm run test:unit',
    );
  }
  const devUrl = existsSync('.env') ? parse(readFileSync('.env')).DATABASE_URL : undefined;
  if (devUrl && hostAndDb(devUrl) === hostAndDb(url)) {
    throw new Error('TEST_DATABASE_URL points at the same database as DATABASE_URL. Refusing: tests delete data.');
  }

  // 2. Bring the test database's tables up to date. `migrate deploy` only APPLIES migrations;
  //    it never resets anything (unlike `migrate dev` / `migrate reset`).
  execSync('npx prisma migrate deploy', { env: { ...process.env, DATABASE_URL: url }, stdio: 'inherit' });

  // 3. Start from empty tables, so leftovers from a previous run can't change the results.
  //    Everything except Prisma's migration history and the invoice counter row (reset to 0).
  const prisma = new PrismaClient({ datasourceUrl: url });
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename NOT IN ('_prisma_migrations', 'InvoiceCounter')`;
  if (tables.length) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`,
    );
  }
  await prisma.$executeRaw`UPDATE "InvoiceCounter" SET value = 0`;
  await prisma.$disconnect();
}
