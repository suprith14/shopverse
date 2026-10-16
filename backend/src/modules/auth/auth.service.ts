import bcrypt from 'bcryptjs';
import type { User } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { conflict, notFound, unauthorized } from '../../lib/http-error.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';
import {
  REFRESH_TOKEN_TTL_MS,
  generateRefreshToken,
  hashToken,
  signAccessToken,
} from './auth.tokens.js';

// Never send passwordHash to the client.
export function toPublicUser(user: User) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

async function issueTokens(user: User) {
  const refreshToken = generateRefreshToken();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    },
  });
  return { accessToken: signAccessToken(user.id, user.role), refreshToken };
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw conflict('An account with this email already exists');

  // bcrypt is deliberately slow (cost 12) to make brute-forcing leaked hashes expensive.
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash },
  });

  return { user: toPublicUser(user), ...(await issueTokens(user)) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // Same message for "no such user" and "wrong password", so attackers can't
  // discover which emails are registered.
  const valid = user && (await bcrypt.compare(input.password, user.passwordHash));
  if (!user || !valid) throw unauthorized('Invalid email or password');

  return { user: toPublicUser(user), ...(await issueTokens(user)) };
}

// Refresh token rotation: each refresh token can be used exactly once.
export async function refresh(rawToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { user: true },
  });
  if (!stored) throw unauthorized('Invalid refresh token');

  // Reuse detection: a revoked token being used again means it was probably stolen.
  // Revoke every session of that user to force a fresh login.
  if (stored.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw unauthorized('Refresh token reused, all sessions revoked');
  }
  if (stored.expiresAt < new Date()) throw unauthorized('Refresh token expired');

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  return { user: toPublicUser(stored.user), ...(await issueTokens(stored.user)) };
}

export async function logout(rawToken: string | undefined) {
  if (!rawToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound('User not found');
  return toPublicUser(user);
}
