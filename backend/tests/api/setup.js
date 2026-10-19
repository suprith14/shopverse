// import = bring in code from another file or package
// afterAll = run once after all tests in this file
import { afterAll } from 'vitest';
// import = bring in code from another file or package
import { prisma } from '../../src/lib/prisma.js';

// Close the database connection after each test file, so the test process can exit.
// afterAll = run once after all tests in this file
// => = an arrow function (a short function)
// async = this function works with await and returns a Promise
afterAll(async () => {
  // await = wait for a Promise (async result) before continuing
  // prisma.$disconnect = close the database connections
  await prisma.$disconnect();
});
