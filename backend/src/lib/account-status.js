// import = bring in code from another file or package
import { prisma } from './prisma.js';
// import = bring in code from another file or package
// forbidden = HttpError 403: logged in, but not allowed
import { forbidden } from './http-error.js';
// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env } from '../config/env.js';

// What a blocked customer sees. Deliberately vague: the reason is for admins only.
// export = other files can import this
// const = a name for a value that is never reassigned
export const ACCOUNT_SUSPENDED = 'This account has been suspended. Please contact support.';

// Shared demo accounts (PROTECTED_ACCOUNTS): their logins are public, so changes that would lock the
// next visitor out (password, block, delete) are refused. Normal use (shopping, addresses) still works.
// export = other files can import this
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// env = the checked settings from .env (config/env.js)
// .includes = true if the array/string contains the value
// .toLowerCase = the text in small letters
export const isProtectedAccount = (email) => env.PROTECTED_ACCOUNTS.includes(String(email).toLowerCase());

// export = other files can import this
// const = a name for a value that is never reassigned
export const PROTECTED_PASSWORD = "This is a shared demo account: its password can't be changed.";
// export = other files can import this
// const = a name for a value that is never reassigned
export const PROTECTED_ACCOUNT = "This is a shared demo account: it can't be blocked or deleted.";

// For actions that matter (paying, placing an order): checks the database, not just the token.
//
// Why not check on EVERY request? Access tokens are stateless: requireAuth trusts a valid token
// without asking the database, which keeps every request fast. Blocking deletes the customer's
// refresh tokens, so their session ends when the current access token expires (15 minutes at
// most). For money-related actions those 15 minutes are too long, so they check here.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function assertCanShop(userId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  // where = Prisma filter: which rows
  // select = Prisma: return only these columns
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { blockedAt: true, deletedAt: true } });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // a || b = OR: a if it is truthy, else b
  // throw = stop here with an error
  // forbidden = HttpError 403: logged in, but not allowed
  if (!user || user.blockedAt || user.deletedAt) throw forbidden(ACCOUNT_SUSPENDED);
}
