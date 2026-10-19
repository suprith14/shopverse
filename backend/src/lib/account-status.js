import { prisma } from './prisma.js';
import { forbidden } from './http-error.js';
import { env } from '../config/env.js';

// What a blocked customer sees. Deliberately vague: the reason is for admins only.
export const ACCOUNT_SUSPENDED = 'This account has been suspended. Please contact support.';

// Shared demo accounts (PROTECTED_ACCOUNTS): their logins are public, so changes that would lock the
// next visitor out (password, block, delete) are refused. Normal use (shopping, addresses) still works.
export const isProtectedAccount = (email) => env.PROTECTED_ACCOUNTS.includes(String(email).toLowerCase());

export const PROTECTED_PASSWORD = "This is a shared demo account: its password can't be changed.";
export const PROTECTED_ACCOUNT = "This is a shared demo account: it can't be blocked or deleted.";

// For actions that matter (paying, placing an order): checks the database, not just the token.
//
// Why not check on EVERY request? Access tokens are stateless: requireAuth trusts a valid token
// without asking the database, which keeps every request fast. Blocking deletes the customer's
// refresh tokens, so their session ends when the current access token expires (15 minutes at
// most). For money-related actions those 15 minutes are too long, so they check here.
export async function assertCanShop(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { blockedAt: true, deletedAt: true } });
  if (!user || user.blockedAt || user.deletedAt) throw forbidden(ACCOUNT_SUSPENDED);
}
