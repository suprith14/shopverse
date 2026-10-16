import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { badRequest, notFound } from '../../lib/http-error.js';
import { MAX_ADDRESSES, type CreateAddressInput, type UpdateAddressInput, type UpdateProfileInput } from './profile.schema.js';

// Everything here works on "my" profile: the user id always comes from the access token,
// never from the URL or body, so one customer can never read or change another's details.

const profileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  dateOfBirth: true,
  avatarUrl: true,
  defaultAddressId: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

// DATE column -> "1998-04-21" (no time, no time zone shift).
const toDateString = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

export async function getProfile(userId: string) {
  const [user, addresses] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: profileSelect }),
    prisma.address.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
  ]);
  return {
    ...user,
    dateOfBirth: toDateString(user.dateOfBirth),
    // The default address first, then newest first.
    addresses: addresses
      .map((a) => ({ ...a, isDefault: a.id === user.defaultAddressId }))
      .sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
  };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      phone: input.phone,
      // "1998-04-21" -> a Date at midnight UTC; the DATE column keeps only the day.
      dateOfBirth: input.dateOfBirth === undefined ? undefined : input.dateOfBirth && new Date(`${input.dateOfBirth}T00:00:00Z`),
    },
  });
  return getProfile(userId);
}

// ------------------------------------------------------------------ Address book

// Finds one of MY addresses. Filtering by userId too means guessing another customer's
// address id gives "not found", not their address.
async function findMyAddress(userId: string, id: string) {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw notFound('Address not found');
  return address;
}

export async function addAddress(userId: string, { makeDefault, ...fields }: CreateAddressInput) {
  const count = await prisma.address.count({ where: { userId } });
  if (count >= MAX_ADDRESSES) throw badRequest(`You can save up to ${MAX_ADDRESSES} addresses`);

  await prisma.$transaction(async (tx) => {
    const address = await tx.address.create({ data: { ...fields, userId } });
    // The first address is always the default; later ones only if asked.
    if (makeDefault || count === 0) {
      await tx.user.update({ where: { id: userId }, data: { defaultAddressId: address.id } });
    }
  });
  return getProfile(userId);
}

export async function updateAddress(userId: string, id: string, input: UpdateAddressInput) {
  await findMyAddress(userId, id);
  // Past orders are NOT affected: they keep the copy made at checkout.
  await prisma.address.update({ where: { id }, data: input });
  return getProfile(userId);
}

export async function setDefaultAddress(userId: string, id: string) {
  await findMyAddress(userId, id); // the database can't check ownership of the default slot, so we do
  await prisma.user.update({ where: { id: userId }, data: { defaultAddressId: id } });
  return getProfile(userId);
}

export async function deleteAddress(userId: string, id: string) {
  await findMyAddress(userId, id);
  await prisma.$transaction(async (tx) => {
    // If it was the default, the database clears the slot by itself (onDelete: SetNull)...
    await tx.address.delete({ where: { id } });
    // ...and we promote the newest remaining address, so there's always a default when any exist.
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { defaultAddressId: true } });
    if (!user.defaultAddressId) {
      const next = await tx.address.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' }, select: { id: true } });
      if (next) await tx.user.update({ where: { id: userId }, data: { defaultAddressId: next.id } });
    }
  });
  return getProfile(userId);
}
