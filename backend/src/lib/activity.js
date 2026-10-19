// import = bring in code from another file or package
import { prisma } from './prisma.js';

// Remembers when each user was last active (User.lastSeenAt), for "active now / active today"
// on the admin dashboard.
//
// Writing to the database on EVERY request would be wasteful (50 clicks = 50 writes for one
// fact), so it's throttled: at most one write per user every 5 minutes. This process
// remembers in memory when it last wrote for each user.
//
// At much larger scale (tens of thousands of active users) this belongs in Redis instead:
// in-memory, built for constant writes, with keys that expire on their own.

// const = a name for a value that is never reassigned
const THROTTLE_MS = 5 * 60 * 1000;
// const = a name for a value that is never reassigned
// new = create an object from a class (e.g. new Date())
// Map = key -> value lookup table
const lastWrite = new Map();

// export = other files can import this
// function = a named, reusable block of code
export function recordActivity(userId) {
  // const = a name for a value that is never reassigned
  // Date = a point in time (Date.now() = milliseconds since 1970)
  const now = Date.now();
  // const = a name for a value that is never reassigned
  const previous = lastWrite.get(userId);
  // if (...) = run the next part only when the condition is true
  // a && b = AND; in JSX: show b only when a is true
  // return = give this value back and stop the function here
  if (previous && now - previous < THROTTLE_MS) return; // written recently: skip

  lastWrite.set(userId, now);
  // Fire and forget: never make the user's request wait for (or fail because of) this.
  // prisma.user = the User table (model in prisma/schema.prisma)
  // update = change one row found by a unique field (UPDATE)
  // where = Prisma filter: which rows
  // data = Prisma: the values to write
  // new = create an object from a class (e.g. new Date())
  // Date = a point in time (Date.now() = milliseconds since 1970)
  // => = an arrow function (a short function)
  prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date(now) } }).catch((err) => {
    lastWrite.delete(userId); // try again on the next request
    // console.log / warn / error = print to the server log
    console.error('[activity] could not save lastSeenAt', err);
  });

  // Keep the memory small: forget entries older than the throttle window.
  // if (...) = run the next part only when the condition is true
  if (lastWrite.size > 10_000) {
    // const = a name for a value that is never reassigned
    // [a, b] = destructuring: take the first and second items of an array
    // if (...) = run the next part only when the condition is true
    for (const [id, at] of lastWrite) if (now - at > THROTTLE_MS) lastWrite.delete(id);
  }
}
