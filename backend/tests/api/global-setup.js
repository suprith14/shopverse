// import = bring in code from another file or package
// execSync = run a terminal command and wait for it
import { execSync } from 'node:child_process';
// import = bring in code from another file or package
// readFileSync = read a whole file from disk (blocks until done; fine at startup)
import { existsSync, readFileSync } from 'node:fs';
// import = bring in code from another file or package
import { parse } from 'dotenv';
// import = bring in code from another file or package
import { PrismaClient } from '@prisma/client';

// Runs ONCE before the API tests. These tests create and delete data, so the most important
// job here is making sure they can never run against a database that matters.

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const hostAndDb = (url) => {
  // const = a name for a value that is never reassigned
  // new = create an object from a class (e.g. new Date())
  const u = new URL(url);
  // return = give this value back and stop the function here
  // `text ${x}` = a template string: text with values inserted
  return `${u.hostname}${u.pathname}`;
};

// export default = the file's main export
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
// { a, b } = destructuring: take properties a and b out of an object
export default async function setup({ config }) {
  // const = a name for a value that is never reassigned
  // ?. = optional chaining: stop (undefined) instead of crashing if the left side is null/undefined
  // a ?? b = a, unless a is null/undefined, then b
  const url = config.env?.DATABASE_URL ?? '';

  // 1. Safety checks
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  if (!url) {
    // throw = stop here with an error
    // new = create an object from a class (e.g. new Date())
    // Error = an error object with a message (and a stack trace)
    throw new Error(
      'API tests need a separate, empty test database.\n' +
        '  Add TEST_DATABASE_URL=... to backend/.env (see docs/features/19-testing.md).\n' +
        '  Or run only the unit tests: npm run test:unit',
    );
  }
  // const = a name for a value that is never reassigned
  // a ? b : c = ternary: if a then b else c
  // readFileSync = read a whole file from disk (blocks until done; fine at startup)
  const devUrl = existsSync('.env') ? parse(readFileSync('.env')).DATABASE_URL : undefined;
  // if (...) = run the next part only when the condition is true
  // a && b = AND; in JSX: show b only when a is true
  // === = strictly equal (same value AND same type)
  if (devUrl && hostAndDb(devUrl) === hostAndDb(url)) {
    // throw = stop here with an error
    // new = create an object from a class (e.g. new Date())
    // Error = an error object with a message (and a stack trace)
    throw new Error('TEST_DATABASE_URL points at the same database as DATABASE_URL. Refusing: tests delete data.');
  }

  // 2. Wake the database. Neon suspends it after 5 idle minutes, and the first connection
  //    after that sometimes fails (P1001). Retry a few times before giving up.
  // const = a name for a value that is never reassigned
  // new = create an object from a class (e.g. new Date())
  const prisma = new PrismaClient({ datasourceUrl: url });
  // let = a name whose value can be changed later
  for (let attempt = 1; ; attempt++) {
    // try / catch = if the code inside fails, run the catch part instead of crashing
    try {
      // await = wait for a Promise (async result) before continuing
      // prisma.$queryRaw = run hand-written SQL (values are escaped safely)
      // `text ${x}` = a template string: text with values inserted
      await prisma.$queryRaw`SELECT 1`;
      break;
    } catch (err) {
      // if (...) = run the next part only when the condition is true
      // === = strictly equal (same value AND same type)
      // throw = stop here with an error
      if (attempt === 4) throw err;
      // console.log / warn / error = print to the server log
      // `text ${x}` = a template string: text with values inserted
      console.warn(`[test db] not reachable yet (attempt ${attempt}/4), retrying in 5 s...`);
      // await = wait for a Promise (async result) before continuing
      // new = create an object from a class (e.g. new Date())
      // Promise = a value that arrives later; Promise.all waits for several at once
      // => = an arrow function (a short function)
      // setTimeout = run a function once after a delay (ms)
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // 3. Bring the test database's tables up to date. `migrate deploy` only APPLIES migrations;
  //    it never resets anything (unlike `migrate dev` / `migrate reset`).
  // execSync = run a terminal command and wait for it
  // ...x = spread: copy all items/properties of x into here
  // process = the running Node program (process.env = settings, process.exit = stop)
  // process.env = settings from the environment (.env locally, the dashboard on Render)
  execSync('npx prisma migrate deploy', { env: { ...process.env, DATABASE_URL: url }, stdio: 'inherit' });

  // 4. Start from empty tables, so leftovers from a previous run can't change the results.
  //    Everything except Prisma's migration history and the invoice counter row (reset to 0).
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.$queryRaw = run hand-written SQL (values are escaped safely)
  // `text ${x}` = a template string: text with values inserted
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename NOT IN ('_prisma_migrations', 'InvoiceCounter')`;
  // if (...) = run the next part only when the condition is true
  if (tables.length) {
    // await = wait for a Promise (async result) before continuing
    // prisma.$executeRawUnsafe = run SQL text as-is (only with trusted text!)
    await prisma.$executeRawUnsafe(
      // `text ${x}` = a template string: text with values inserted
      // .map = make a new array by transforming each item
      // => = an arrow function (a short function)
      // .join = turn an array into one string with a separator
      `TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(', ')} RESTART IDENTITY CASCADE`,
    );
  }
  // await = wait for a Promise (async result) before continuing
  // prisma.$executeRaw = run a hand-written SQL command
  // `text ${x}` = a template string: text with values inserted
  await prisma.$executeRaw`UPDATE "InvoiceCounter" SET value = 0`;
  // await = wait for a Promise (async result) before continuing
  // prisma.$disconnect = close the database connections
  await prisma.$disconnect();
}
