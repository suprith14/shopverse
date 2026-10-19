// import = bring in code from another file or package
// bcrypt = slow, salted password hashing (hard to brute-force)
import bcrypt from 'bcryptjs';
// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env } from '../../config/env.js';
// import = bring in code from another file or package
import { prisma } from '../../lib/prisma.js';
// import = bring in code from another file or package
// badRequest = HttpError 400: the request is invalid
// conflict = HttpError 409: clashes with existing data (e.g. email taken)
// forbidden = HttpError 403: logged in, but not allowed
// notFound = HttpError 404: doesn't exist
// unauthorized = HttpError 401: not logged in / bad token
import { badRequest, conflict, forbidden, notFound, unauthorized } from '../../lib/http-error.js';
// import = bring in code from another file or package
import { ACCOUNT_SUSPENDED, PROTECTED_PASSWORD, isProtectedAccount } from '../../lib/account-status.js';
// import = bring in code from another file or package
import { REFRESH_TOKEN_TTL_MS, generateRefreshToken, hashToken, signAccessToken } from './auth.tokens.js';

// Never send passwordHash to the client.
// export = other files can import this
// function = a named, reusable block of code
export function toPublicUser(user) {
  // return = give this value back and stop the function here
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// async = this function works with await and returns a Promise
// function = a named, reusable block of code
async function issueTokens(user) {
  // const = a name for a value that is never reassigned
  const refreshToken = generateRefreshToken();
  // await = wait for a Promise (async result) before continuing
  // prisma.refreshToken = the RefreshToken table (model in prisma/schema.prisma)
  // create = insert one new row (INSERT)
  await prisma.refreshToken.create({
    // data = Prisma: the values to write
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      // new = create an object from a class (e.g. new Date())
      // Date = a point in time (Date.now() = milliseconds since 1970)
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });
  // return = give this value back and stop the function here
  return { accessToken: signAccessToken(user.id, user.role), refreshToken };
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function register(input) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  // where = Prisma filter: which rows
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  // if (...) = run the next part only when the condition is true
  // throw = stop here with an error
  // conflict = HttpError 409: clashes with existing data (e.g. email taken)
  if (existing) throw conflict('An account with this email already exists');

  // bcrypt is deliberately slow (cost 12 by default, BCRYPT_ROUNDS) to make brute-forcing leaked hashes expensive.
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // bcrypt = slow, salted password hashing (hard to brute-force)
  // bcrypt.hash = turn the password into a salted hash (store this, never the password)
  // env = the checked settings from .env (config/env.js)
  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // create = insert one new row (INSERT)
  const user = await prisma.user.create({
    // data = Prisma: the values to write
    data: { name: input.name, email: input.email, passwordHash },
  });

  // return = give this value back and stop the function here
  // ...x = spread: copy all items/properties of x into here
  // await = wait for a Promise (async result) before continuing
  return { user: toPublicUser(user), ...(await issueTokens(user)) };
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function login(input) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  // where = Prisma filter: which rows
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // Same message for "no such user" and "wrong password", so attackers can't
  // discover which emails are registered.
  // const = a name for a value that is never reassigned
  // a && b = AND; in JSX: show b only when a is true
  // await = wait for a Promise (async result) before continuing
  // bcrypt = slow, salted password hashing (hard to brute-force)
  // bcrypt.compare = does this password match the stored hash?
  const valid = user && (await bcrypt.compare(input.password, user.passwordHash));
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // a || b = OR: a if it is truthy, else b
  // throw = stop here with an error
  // unauthorized = HttpError 401: not logged in / bad token
  if (!user || !valid) throw unauthorized('Invalid email or password');
  // Checked AFTER the password, so only someone who knows it learns that the account is blocked.
  // if (...) = run the next part only when the condition is true
  // throw = stop here with an error
  // forbidden = HttpError 403: logged in, but not allowed
  if (user.blockedAt) throw forbidden(ACCOUNT_SUSPENDED);

  // return = give this value back and stop the function here
  // ...x = spread: copy all items/properties of x into here
  // await = wait for a Promise (async result) before continuing
  return { user: toPublicUser(user), ...(await issueTokens(user)) };
}

// Refresh token rotation: each refresh token can be used exactly once.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function refresh(rawToken) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.refreshToken = the RefreshToken table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  const stored = await prisma.refreshToken.findUnique({
    // where = Prisma filter: which rows
    where: { tokenHash: hashToken(rawToken) },
    // include = Prisma: also load the related rows (a JOIN)
    include: { user: true },
  });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // unauthorized = HttpError 401: not logged in / bad token
  if (!stored) throw unauthorized('Invalid refresh token');

  // Reuse detection: a revoked token being used again means it was probably stolen.
  // Revoke every session of that user to force a fresh login.
  // if (...) = run the next part only when the condition is true
  if (stored.revokedAt) {
    // await = wait for a Promise (async result) before continuing
    // prisma.refreshToken = the RefreshToken table (model in prisma/schema.prisma)
    // updateMany = change every row that matches; returns { count }
    await prisma.refreshToken.updateMany({
      // where = Prisma filter: which rows
      where: { userId: stored.userId, revokedAt: null },
      // data = Prisma: the values to write
      // new = create an object from a class (e.g. new Date())
      // Date = a point in time (Date.now() = milliseconds since 1970)
      data: { revokedAt: new Date() },
    });
    // throw = stop here with an error
    // unauthorized = HttpError 401: not logged in / bad token
    throw unauthorized('Refresh token reused, all sessions revoked');
  }
  // if (...) = run the next part only when the condition is true
  // new = create an object from a class (e.g. new Date())
  // Date = a point in time (Date.now() = milliseconds since 1970)
  // throw = stop here with an error
  // unauthorized = HttpError 401: not logged in / bad token
  if (stored.expiresAt < new Date()) throw unauthorized('Refresh token expired');
  // Blocking deletes the sessions, so this is only a safety net.
  // if (...) = run the next part only when the condition is true
  // a || b = OR: a if it is truthy, else b
  // throw = stop here with an error
  // unauthorized = HttpError 401: not logged in / bad token
  if (stored.user.blockedAt || stored.user.deletedAt) throw unauthorized('Account suspended');

  // await = wait for a Promise (async result) before continuing
  // prisma.refreshToken = the RefreshToken table (model in prisma/schema.prisma)
  // update = change one row found by a unique field (UPDATE)
  // where = Prisma filter: which rows
  // data = Prisma: the values to write
  // new = create an object from a class (e.g. new Date())
  // Date = a point in time (Date.now() = milliseconds since 1970)
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  // return = give this value back and stop the function here
  // ...x = spread: copy all items/properties of x into here
  // await = wait for a Promise (async result) before continuing
  return { user: toPublicUser(stored.user), ...(await issueTokens(stored.user)) };
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function logout(rawToken) {
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // return = give this value back and stop the function here
  if (!rawToken) return;
  // await = wait for a Promise (async result) before continuing
  // prisma.refreshToken = the RefreshToken table (model in prisma/schema.prisma)
  // updateMany = change every row that matches; returns { count }
  await prisma.refreshToken.updateMany({
    // where = Prisma filter: which rows
    where: { tokenHash: hashToken(rawToken), revokedAt: null },
    // data = Prisma: the values to write
    // new = create an object from a class (e.g. new Date())
    // Date = a point in time (Date.now() = milliseconds since 1970)
    data: { revokedAt: new Date() },
  });
}

// Change password from My account.
//  - The CURRENT password is required: a stolen session or an unlocked phone must not be
//    enough to lock the real owner out.
//  - Every session is signed out (all refresh tokens revoked), then a fresh session is
//    issued for THIS device only. If the change happened because someone else got in,
//    their session ends now. (Their short-lived access token can still work for up to its
//    15 minutes: the trade-off of stateless JWTs.)
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
// { a, b } = destructuring: take properties a and b out of an object
export async function changePassword(userId, { currentPassword, newPassword }) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  // where = Prisma filter: which rows
  const user = await prisma.user.findUnique({ where: { id: userId } });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!user) throw notFound('User not found');
  // if (...) = run the next part only when the condition is true
  // throw = stop here with an error
  // forbidden = HttpError 403: logged in, but not allowed
  if (isProtectedAccount(user.email)) throw forbidden(PROTECTED_PASSWORD);
  // 400, not 401: a 401 means "session expired" to the frontend, which would try to refresh it.
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // await = wait for a Promise (async result) before continuing
  // bcrypt = slow, salted password hashing (hard to brute-force)
  // bcrypt.compare = does this password match the stored hash?
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    // throw = stop here with an error
    // badRequest = HttpError 400: the request is invalid
    throw badRequest('Validation failed', [
      { field: 'currentPassword', message: 'Your current password is incorrect' },
    ]);
  }

  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // bcrypt = slow, salted password hashing (hard to brute-force)
  // bcrypt.hash = turn the password into a salted hash (store this, never the password)
  // env = the checked settings from .env (config/env.js)
  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  await prisma.$transaction([
    // prisma.user = the User table (model in prisma/schema.prisma)
    // update = change one row found by a unique field (UPDATE)
    // where = Prisma filter: which rows
    // data = Prisma: the values to write
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    // DELETE the old sessions rather than marking them revoked. A revoked token that gets used
    // again trips the theft alarm in refresh() ("reuse detected: sign out everywhere"), which
    // would also kill the fresh session issued below the moment an old device came online.
    // Deleted tokens are simply unknown: that device gets "please log in" and nothing else happens.
    // prisma.refreshToken = the RefreshToken table (model in prisma/schema.prisma)
    // deleteMany = remove every row that matches; no error if none
    // where = Prisma filter: which rows
    prisma.refreshToken.deleteMany({ where: { userId } }),
  ]);

  // return = give this value back and stop the function here
  // ...x = spread: copy all items/properties of x into here
  // await = wait for a Promise (async result) before continuing
  return { user: toPublicUser(user), ...(await issueTokens(user)) };
}

// After a successful reset: log the user straight in on this device (they just proved they
// own the email address), with a brand-new session.
// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function startSessionAfterReset(user) {
  // return = give this value back and stop the function here
  // ...x = spread: copy all items/properties of x into here
  // await = wait for a Promise (async result) before continuing
  return { user: toPublicUser(user), ...(await issueTokens(user)) };
}

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function getMe(userId) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  // where = Prisma filter: which rows
  const user = await prisma.user.findUnique({ where: { id: userId } });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  // notFound = HttpError 404: doesn't exist
  if (!user) throw notFound('User not found');
  // return = give this value back and stop the function here
  return toPublicUser(user);
}
