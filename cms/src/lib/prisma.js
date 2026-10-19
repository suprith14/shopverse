import { Prisma, PrismaClient } from '@prisma/client';

// One shared database client for the whole app (it holds a connection pool).
//
// Neon (free) suspends the database after 5 idle minutes. The first connection after that
// sometimes fails with "Can't reach database server" (P1001) and works a few seconds later.
// So every query retries up to 3 more times when it couldn't CONNECT, waiting 1 s, 2 s, 4 s.
//
// Retrying is safe here only because of WHICH errors are retried: when the connection failed,
// the query never reached the database, so it can't run twice. Any other error (a bad query,
// a unique-constraint violation...) is thrown straight away, as before.

const CONNECTION_ERRORS = new Set(['P1001', 'P1002', 'P1017']); // can't reach / timed out / connection closed
const RETRIES = 3;

const isConnectionError = (err) =>
  err instanceof Prisma.PrismaClientInitializationError ||
  (err instanceof Prisma.PrismaClientKnownRequestError && CONNECTION_ERRORS.has(err.code));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const prisma = new PrismaClient().$extends({
  query: {
    async $allOperations({ args, query, operation }) {
      for (let attempt = 0; ; attempt++) {
        try {
          return await query(args);
        } catch (err) {
          if (!isConnectionError(err) || attempt === RETRIES) throw err;
          const wait = 1000 * 2 ** attempt; // exponential backoff: 1 s, 2 s, 4 s
          console.warn(`[db] ${operation}: database not reachable, retry ${attempt + 1}/${RETRIES} in ${wait / 1000} s`);
          await sleep(wait);
        }
      }
    },
  },
});

export { isConnectionError };
