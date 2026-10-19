// import = bring in code from another file or package
// createHmac = a hash with a secret key: proves the data came from us
// randomInt = a secure random whole number (for codes)
// timingSafeEqual = compare secrets in constant time (no timing leaks)
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
// import = bring in code from another file or package
// bcrypt = slow, salted password hashing (hard to brute-force)
import bcrypt from 'bcryptjs';
// import = bring in code from another file or package
import { prisma } from '../../lib/prisma.js';
// import = bring in code from another file or package
// env = the checked settings from .env (config/env.js)
import { env } from '../../config/env.js';
// import = bring in code from another file or package
import { sendEmail } from '../../lib/email.js';
// import = bring in code from another file or package
// badRequest = HttpError 400: the request is invalid
// forbidden = HttpError 403: logged in, but not allowed
import { badRequest, forbidden } from '../../lib/http-error.js';
// import = bring in code from another file or package
import { ACCOUNT_SUSPENDED, PROTECTED_PASSWORD, isProtectedAccount } from '../../lib/account-status.js';

// "Forgot password" with a 6-digit code sent by email.
//
//  1. requestReset(email)   -> always the same answer, whether or not the account exists
//  2. resetWithCode(...)    -> code + new password -> new password, all sessions ended

// const = a name for a value that is never reassigned
const CODE_TTL_MS = 15 * 60 * 1000; // a code works for 15 minutes
// const = a name for a value that is never reassigned
const MAX_ATTEMPTS = 5; // wrong guesses before the code is burned
// const = a name for a value that is never reassigned
const RESEND_COOLDOWN_MS = 60 * 1000; // one email per address per minute (stops inbox flooding)

// HMAC with a server secret, not a plain hash: there are only 1,000,000 possible codes, so a
// plain SHA-256 of one could be reversed by trying them all in under a second. Without the
// secret (which lives in the server's env, not the database) a leaked table is useless.
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const hashCode = (userId, code) =>
  // createHmac = a hash with a secret key: proves the data came from us
  // env = the checked settings from .env (config/env.js)
  // `text ${x}` = a template string: text with values inserted
  createHmac('sha256', env.JWT_ACCESS_SECRET).update(`${userId}:${code}`).digest('hex');

// Compare in constant time, so response timing doesn't reveal how many characters matched.
// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
// === = strictly equal (same value AND same type)
// a && b = AND; in JSX: show b only when a is true
// timingSafeEqual = compare secrets in constant time (no timing leaks)
// Buffer = raw bytes in Node (files, hashes, images)
const sameHash = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

// ------------------------------------------------------------------ 1. Request a code

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function requestReset(email) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  // where = Prisma filter: which rows
  // select = Prisma: return only these columns
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true } });
  // Unknown email: do nothing, but answer exactly as if it worked (no "account enumeration").
  // Demo accounts: same, no code is sent (their password can't be reset anyway).
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // a || b = OR: a if it is truthy, else b
  // return = give this value back and stop the function here
  if (!user || isProtectedAccount(user.email)) return;

  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.passwordResetCode = the PasswordResetCode table (model in prisma/schema.prisma)
  // findFirst = read the first row that matches (null if none)
  const recent = await prisma.passwordResetCode.findFirst({
    // where = Prisma filter: which rows
    // gt = greater than (>)
    // new = create an object from a class (e.g. new Date())
    // Date = a point in time (Date.now() = milliseconds since 1970)
    where: { userId: user.id, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
    // select = Prisma: return only these columns
    select: { id: true },
  });
  // if (...) = run the next part only when the condition is true
  // return = give this value back and stop the function here
  if (recent) return; // asked less than a minute ago: the earlier email is still on its way

  // randomInt uses the operating system's secure random source (Math.random is predictable).
  // const = a name for a value that is never reassigned
  // randomInt = a secure random whole number (for codes)
  // .padStart = pad a string at the start to a length
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  // await = wait for a Promise (async result) before continuing
  // prisma.$transaction = run several queries as ONE unit: all succeed or none are saved
  await prisma.$transaction([
    // prisma.passwordResetCode = the PasswordResetCode table (model in prisma/schema.prisma)
    // deleteMany = remove every row that matches; no error if none
    // where = Prisma filter: which rows
    prisma.passwordResetCode.deleteMany({ where: { userId: user.id } }), // only the newest code works
    // prisma.passwordResetCode = the PasswordResetCode table (model in prisma/schema.prisma)
    // create = insert one new row (INSERT)
    prisma.passwordResetCode.create({
      // data = Prisma: the values to write
      // new = create an object from a class (e.g. new Date())
      // Date = a point in time (Date.now() = milliseconds since 1970)
      data: { userId: user.id, codeHash: hashCode(user.id, code), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
    }),
  ]);

  // await = wait for a Promise (async result) before continuing
  await sendEmail({
    to: user.email,
    // The code is only in the body, never the subject: subjects get written to server logs
    // (and show on lock screens), and anyone reading logs must not be able to reset passwords.
    subject: 'Your ShopVerse password reset code',
    text: [
      // `text ${x}` = a template string: text with values inserted
      `Hi ${user.name},`,
      // `text ${x}` = a template string: text with values inserted
      `Your code to reset your ShopVerse password is: ${code}`,
      'It works for 15 minutes and can be used once.',
      "Didn't ask for this? Ignore this email: your password stays the same.",
    // .join = turn an array into one string with a separator
    ].join('\n\n'),
    // `text ${x}` = a template string: text with values inserted
    html: `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
      <h1 style="color:#4f46e5;font-size:22px">ShopVerse</h1>
      <p>Your code to reset your password:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;background:#eef2ff;padding:16px;text-align:center;border-radius:8px">${code}</p>
      <p>It works for <b>15 minutes</b> and can be used once.</p>
      <p style="color:#64748b">Didn't ask for this? Ignore this email: your password stays the same.</p>
    </div>`,
  });
}

// ------------------------------------------------------------------ 2. Use the code

// const = a name for a value that is never reassigned
// => = an arrow function (a short function)
const INVALID = () =>
  // badRequest = HttpError 400: the request is invalid
  badRequest('Validation failed', [
    { field: 'code', message: 'This code is wrong or has expired. Request a new one.' },
  ]);

// export = other files can import this
// async = this function works with await and returns a Promise
// function = a named, reusable block of code
export async function resetWithCode(email, code, newPassword) {
  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.user = the User table (model in prisma/schema.prisma)
  // findUnique = read one row by a unique field (id, email); null if missing
  // where = Prisma filter: which rows
  const user = await prisma.user.findUnique({ where: { email } });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  if (!user) throw INVALID(); // same message as a wrong code: no hint whether the email exists
  // if (...) = run the next part only when the condition is true
  // throw = stop here with an error
  // forbidden = HttpError 403: logged in, but not allowed
  if (isProtectedAccount(user.email)) throw forbidden(PROTECTED_PASSWORD);

  // const = a name for a value that is never reassigned
  // await = wait for a Promise (async result) before continuing
  // prisma.passwordResetCode = the PasswordResetCode table (model in prisma/schema.prisma)
  // findFirst = read the first row that matches (null if none)
  const reset = await prisma.passwordResetCode.findFirst({
    // where = Prisma filter: which rows
    // gt = greater than (>)
    // new = create an object from a class (e.g. new Date())
    // Date = a point in time (Date.now() = milliseconds since 1970)
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    // orderBy = Prisma: sort order (asc / desc)
    orderBy: { createdAt: 'desc' },
  });
  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  // throw = stop here with an error
  if (!reset) throw INVALID();

  // if (...) = run the next part only when the condition is true
  // ! = NOT: flips true/false
  if (!sameHash(reset.codeHash, hashCode(user.id, code))) {
    // const = a name for a value that is never reassigned
    const attempts = reset.attempts + 1;
    // await = wait for a Promise (async result) before continuing
    // prisma.passwordResetCode = the PasswordResetCode table (model in prisma/schema.prisma)
    // update = change one row found by a unique field (UPDATE)
    await prisma.passwordResetCode.update({
      // where = Prisma filter: which rows
      where: { id: reset.id },
      // 5th wrong guess burns the code: the chance of guessing 1 in 1,000,000 within 5 tries is 0.0005%.
      // data = Prisma: the values to write
      // ...x = spread: copy all items/properties of x into here
      // a && b = AND; in JSX: show b only when a is true
      // new = create an object from a class (e.g. new Date())
      // Date = a point in time (Date.now() = milliseconds since 1970)
      data: { attempts, ...(attempts >= MAX_ATTEMPTS && { usedAt: new Date() }) },
    });
    // if (...) = run the next part only when the condition is true
    if (attempts >= MAX_ATTEMPTS) {
      // throw = stop here with an error
      // badRequest = HttpError 400: the request is invalid
      throw badRequest('Validation failed', [{ field: 'code', message: 'Too many wrong tries. Request a new code.' }]);
    }
    // throw = stop here with an error
    throw INVALID();
  }

  // A blocked customer could otherwise get back in by resetting the password (which also logs in).
  // Checked after the code, so only the owner of the email address learns the account is blocked.
  // if (...) = run the next part only when the condition is true
  // throw = stop here with an error
  // forbidden = HttpError 403: logged in, but not allowed
  if (user.blockedAt) throw forbidden(ACCOUNT_SUSPENDED);

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
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    // prisma.passwordResetCode = the PasswordResetCode table (model in prisma/schema.prisma)
    // update = change one row found by a unique field (UPDATE)
    // where = Prisma filter: which rows
    // data = Prisma: the values to write
    // new = create an object from a class (e.g. new Date())
    // Date = a point in time (Date.now() = milliseconds since 1970)
    prisma.passwordResetCode.update({ where: { id: reset.id }, data: { usedAt: new Date() } }), // one-time
    // Sign out everywhere (deleted, not revoked: see changePassword for why).
    // prisma.refreshToken = the RefreshToken table (model in prisma/schema.prisma)
    // deleteMany = remove every row that matches; no error if none
    // where = Prisma filter: which rows
    prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
  ]);
  // return = give this value back and stop the function here
  return user;
}
