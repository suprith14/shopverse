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

const THROTTLE_MS = 5 * 60 * 1000;
const lastWrite = new Map<string, number>();

export function recordActivity(userId: string) {
  const now = Date.now();
  const previous = lastWrite.get(userId);
  if (previous && now - previous < THROTTLE_MS) return; // written recently: skip

  lastWrite.set(userId, now);
  // Fire and forget: never make the user's request wait for (or fail because of) this.
  prisma.user.update({ where: { id: userId }, data: { lastSeenAt: new Date(now) } }).catch((err) => {
    lastWrite.delete(userId); // try again on the next request
    console.error('[activity] could not save lastSeenAt', err);
  });

  // Keep the memory small: forget entries older than the throttle window.
  if (lastWrite.size > 10_000) {
    for (const [id, at] of lastWrite) if (now - at > THROTTLE_MS) lastWrite.delete(id);
  }
}
