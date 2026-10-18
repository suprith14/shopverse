import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';
import { sendEmail } from '../../lib/email.js';
import { badRequest, forbidden } from '../../lib/http-error.js';
import { ACCOUNT_SUSPENDED } from '../../lib/account-status.js';

// "Forgot password" with a 6-digit code sent by email.
//
//  1. requestReset(email)   -> always the same answer, whether or not the account exists
//  2. resetWithCode(...)    -> code + new password -> new password, all sessions ended

const CODE_TTL_MS = 15 * 60 * 1000; // a code works for 15 minutes
const MAX_ATTEMPTS = 5; // wrong guesses before the code is burned
const RESEND_COOLDOWN_MS = 60 * 1000; // one email per address per minute (stops inbox flooding)

// HMAC with a server secret, not a plain hash: there are only 1,000,000 possible codes, so a
// plain SHA-256 of one could be reversed by trying them all in under a second. Without the
// secret (which lives in the server's env, not the database) a leaked table is useless.
const hashCode = (userId, code) =>
  createHmac('sha256', env.JWT_ACCESS_SECRET).update(`${userId}:${code}`).digest('hex');

// Compare in constant time, so response timing doesn't reveal how many characters matched.
const sameHash = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

// ------------------------------------------------------------------ 1. Request a code

export async function requestReset(email) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true } });
  // Unknown email: do nothing, but answer exactly as if it worked (no "account enumeration").
  if (!user) return;

  const recent = await prisma.passwordResetCode.findFirst({
    where: { userId: user.id, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
    select: { id: true },
  });
  if (recent) return; // asked less than a minute ago: the earlier email is still on its way

  // randomInt uses the operating system's secure random source (Math.random is predictable).
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await prisma.$transaction([
    prisma.passwordResetCode.deleteMany({ where: { userId: user.id } }), // only the newest code works
    prisma.passwordResetCode.create({
      data: { userId: user.id, codeHash: hashCode(user.id, code), expiresAt: new Date(Date.now() + CODE_TTL_MS) },
    }),
  ]);

  await sendEmail({
    to: user.email,
    // The code is only in the body, never the subject: subjects get written to server logs
    // (and show on lock screens), and anyone reading logs must not be able to reset passwords.
    subject: 'Your ShopVerse password reset code',
    text: [
      `Hi ${user.name},`,
      `Your code to reset your ShopVerse password is: ${code}`,
      'It works for 15 minutes and can be used once.',
      "Didn't ask for this? Ignore this email: your password stays the same.",
    ].join('\n\n'),
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

const INVALID = () =>
  badRequest('Validation failed', [
    { field: 'code', message: 'This code is wrong or has expired. Request a new one.' },
  ]);

export async function resetWithCode(email, code, newPassword) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw INVALID(); // same message as a wrong code: no hint whether the email exists

  const reset = await prisma.passwordResetCode.findFirst({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!reset) throw INVALID();

  if (!sameHash(reset.codeHash, hashCode(user.id, code))) {
    const attempts = reset.attempts + 1;
    await prisma.passwordResetCode.update({
      where: { id: reset.id },
      // 5th wrong guess burns the code: the chance of guessing 1 in 1,000,000 within 5 tries is 0.0005%.
      data: { attempts, ...(attempts >= MAX_ATTEMPTS && { usedAt: new Date() }) },
    });
    if (attempts >= MAX_ATTEMPTS) {
      throw badRequest('Validation failed', [{ field: 'code', message: 'Too many wrong tries. Request a new code.' }]);
    }
    throw INVALID();
  }

  // A blocked customer could otherwise get back in by resetting the password (which also logs in).
  // Checked after the code, so only the owner of the email address learns the account is blocked.
  if (user.blockedAt) throw forbidden(ACCOUNT_SUSPENDED);

  const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.passwordResetCode.update({ where: { id: reset.id }, data: { usedAt: new Date() } }), // one-time
    // Sign out everywhere (deleted, not revoked: see changePassword for why).
    prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
  ]);
  return user;
}
